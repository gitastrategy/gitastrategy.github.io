// Unified voice session manager for the Gita Strategy assistant.
//
// One object owns BOTH the microphone (SpeechRecognition + the underlying
// MediaStream) and the speaker (SpeechSynthesis), so only one audio path is
// ever active:
//
//   idle → listening → processing → speaking → listening (hands-free) / idle
//
// This removes the classic failure modes: the assistant hearing itself,
// duplicate replies from one utterance, orphaned microphone tracks, and the UI
// getting stuck on "Listening" after an error.

export type VoicePhase = "idle" | "listening" | "processing" | "speaking";

type SpeechAlt = { transcript: string };
type SpeechResult = { 0: SpeechAlt; isFinal: boolean; length: number };
type SpeechEvent = { resultIndex: number; results: ArrayLike<SpeechResult> };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: ((event: { error?: string }) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
};

type Handlers = {
  onPhase?: (phase: VoicePhase) => void;
  /** Partial transcript, for live feedback in the composer. */
  onInterim?: (text: string) => void;
  /** Exactly one call per completed utterance. */
  onFinal?: (text: string) => void;
  onError?: (message: string) => void;
};

function recognitionCtor(): (new () => Recognition) | undefined {
  if (typeof window === "undefined") return undefined;
  const w = window as unknown as Record<string, unknown>;
  return (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as
    | (new () => Recognition)
    | undefined;
}

export const micSupported = () => Boolean(recognitionCtor());
export const speakerSupported = () =>
  typeof window !== "undefined" && typeof window.speechSynthesis !== "undefined";

const ERRORS: Record<string, string> = {
  "not-allowed": "Microphone access was blocked. Allow it in your browser settings and try again.",
  "service-not-allowed":
    "Microphone access was blocked. Allow it in your browser settings and try again.",
  "audio-capture": "No microphone was found. Check your device or headset connection.",
  network: "Speech recognition lost the network. Please try again.",
  aborted: "",
  "no-speech": "",
};

export class VoiceSession {
  private phaseValue: VoicePhase = "idle";
  private recognition: Recognition | null = null;
  private stream: MediaStream | null = null;
  private handlers: Handlers;
  /** Hands-free mode: listen again automatically after the reply is spoken. */
  private continuous = false;
  /** Guards against one utterance producing two sends. */
  private delivered = false;
  private finalText = "";
  private turn = 0;

  constructor(handlers: Handlers = {}) {
    this.handlers = handlers;
  }

  get phase(): VoicePhase {
    return this.phaseValue;
  }

  get handsFree(): boolean {
    return this.continuous;
  }

  private setPhase(phase: VoicePhase) {
    if (this.phaseValue === phase) return;
    this.phaseValue = phase;
    this.handlers.onPhase?.(phase);
  }

  /** Starts (or restarts) listening. Always stops any speech first. */
  async listen(opts: { handsFree?: boolean } = {}): Promise<void> {
    if (opts.handsFree !== undefined) this.continuous = opts.handsFree;
    this.stopSpeaking();
    this.teardownRecognition();

    const Ctor = recognitionCtor();
    if (!Ctor) {
      this.handlers.onError?.("Voice input is not supported in this browser.");
      return;
    }

    // Explicit permission + echo cancellation. Some mobile browsers also need a
    // live stream for reliable capture after a Bluetooth/headset switch.
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        this.stream = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
        });
        for (const track of this.stream.getAudioTracks()) {
          track.onended = () => {
            this.handlers.onError?.("The microphone was disconnected.");
            this.stop();
          };
        }
      }
    } catch {
      this.releaseStream();
      this.setPhase("idle");
      this.handlers.onError?.(ERRORS["not-allowed"] as string);
      return;
    }

    const turn = ++this.turn;
    const recognition = new Ctor();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    this.delivered = false;
    this.finalText = "";

    recognition.onstart = () => {
      if (turn === this.turn) this.setPhase("listening");
    };

    recognition.onresult = (event) => {
      if (turn !== this.turn) return;
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (!result) continue;
        const text = result[0].transcript;
        if (result.isFinal) this.finalText += text;
        else interim += text;
      }
      this.handlers.onInterim?.((this.finalText + interim).trim());
    };

    recognition.onerror = (event) => {
      if (turn !== this.turn) return;
      const message = ERRORS[event?.error ?? ""] ?? "Voice input failed. Please try again.";
      if (message) this.handlers.onError?.(message);
    };

    recognition.onend = () => {
      if (turn !== this.turn) return;
      this.releaseStream();
      const text = this.finalText.trim();
      if (text && !this.delivered) {
        this.delivered = true;
        this.setPhase("processing");
        this.handlers.onFinal?.(text);
      } else if (this.phaseValue === "listening") {
        this.setPhase("idle");
      }
    };

    this.recognition = recognition;
    try {
      recognition.start();
      this.setPhase("listening");
    } catch {
      this.releaseStream();
      this.setPhase("idle");
    }
  }

  /** Ends capture; a completed utterance is delivered from `onend`. */
  finishListening() {
    if (this.phaseValue !== "listening") return;
    this.recognition?.stop();
  }

  /** Marks the network round-trip, e.g. when a typed message is sent. */
  processing() {
    this.teardownRecognition();
    this.setPhase("processing");
  }

  /** Speaks a reply once, then resumes listening in hands-free mode. */
  speak(text: string) {
    if (!speakerSupported() || !text.trim()) {
      this.afterSpeaking();
      return;
    }
    // Never listen while speaking — that is what causes self-triggering.
    this.teardownRecognition();
    window.speechSynthesis.cancel();

    const turn = ++this.turn;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98;
    utterance.pitch = 0.9;
    utterance.lang = "en-IN";
    utterance.onend = () => {
      if (turn === this.turn) this.afterSpeaking();
    };
    utterance.onerror = () => {
      if (turn === this.turn) this.afterSpeaking();
    };
    this.setPhase("speaking");
    window.speechSynthesis.speak(utterance);
  }

  /** Barge-in: cut the assistant off and capture the user immediately. */
  interrupt() {
    this.stopSpeaking();
    void this.listen();
  }

  private afterSpeaking() {
    if (this.continuous) void this.listen();
    else this.setPhase("idle");
  }

  /** Reply arrived but voice output is off. */
  finishTurn() {
    if (this.continuous) void this.listen();
    else this.setPhase("idle");
  }

  /** Network/assistant failure: never leave the UI stuck mid-flow. */
  fail() {
    this.stopSpeaking();
    this.teardownRecognition();
    this.setPhase("idle");
  }

  stopSpeaking() {
    this.turn++;
    if (speakerSupported()) window.speechSynthesis.cancel();
  }

  /** Full teardown: recognition, speech and every audio track. */
  stop() {
    this.continuous = false;
    this.turn++;
    this.teardownRecognition();
    if (speakerSupported()) window.speechSynthesis.cancel();
    this.setPhase("idle");
  }

  private teardownRecognition() {
    const recognition = this.recognition;
    this.recognition = null;
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.onstart = null;
      try {
        recognition.abort();
      } catch {
        /* already stopped */
      }
    }
    this.releaseStream();
  }

  private releaseStream() {
    if (!this.stream) return;
    for (const track of this.stream.getTracks()) {
      track.onended = null;
      track.stop();
    }
    this.stream = null;
  }
}
