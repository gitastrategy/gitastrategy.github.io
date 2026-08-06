import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Loader2, Mic, MicOff, Send, Volume2, VolumeX } from "lucide-react";
import { withBase } from "../../lib/site-url";

// Minimal structural types for the Web Speech API (not in TS DOM lib).
type SpeechResult = { 0: { transcript: string }; isFinal: boolean };
type SpeechEvent = { resultIndex: number; results: ArrayLike<SpeechResult> };
type Recognition = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechEvent) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

export type ChatMessage = { role: "user" | "assistant"; content: string };

const GREETING: ChatMessage = {
  role: "assistant",
  content:
    "I am here as your counsel on the battlefield of work. Describe the decision, the team or the doubt in front of you, and we will look at it through the Gita — then translate it into an action you can take this week.",
};

const SUGGESTIONS = [
  "My team is burnt out before a launch. What does the Gita say?",
  "How do I decide between two strategies with incomplete data?",
  "A profitable deal feels ethically wrong. How should I weigh it?",
  "How do I lead when I have lost confidence in myself?",
];

function endpoint(): string {
  const override = import.meta.env["VITE_KRISHNA_WEBHOOK_URL"] as string | undefined;
  return override && override.length > 0 ? override : withBase("/api/krishna");
}

export function KrishnaAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);

  const recognitionRef = useRef<Recognition | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const [voiceSupported, setVoiceSupported] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    const w = window as unknown as Record<string, unknown>;
    setVoiceSupported(Boolean(w["SpeechRecognition"] || w["webkitSpeechRecognition"]));
    setSpeechSupported(typeof window.speechSynthesis !== "undefined");
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    transcriptRef.current?.scrollTo({ top: transcriptRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy]);

  useEffect(
    () => () => {
      abortRef.current?.abort();
      recognitionRef.current?.abort();
      if (typeof window !== "undefined" && window.speechSynthesis) window.speechSynthesis.cancel();
    },
    [],
  );

  const speak = useCallback((text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 0.9;
    utterance.lang = "en-IN";
    window.speechSynthesis.speak(utterance);
  }, []);

  const send = useCallback(
    async (text: string) => {
      const question = text.trim();
      if (!question || busy) return;

      const history = [...messages.filter((m) => m !== GREETING), { role: "user" as const, content: question }];
      setMessages((m) => [...m, { role: "user", content: question }]);
      setInput("");
      setError(null);
      setBusy(true);

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const timer = setTimeout(() => controller.abort(), 45_000);

      try {
        const response = await fetch(endpoint(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history }),
          signal: controller.signal,
        });

        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) {
          throw new Error(
            "The assistant is not available on this deployment yet. Please use the contact form and we will answer personally.",
          );
        }

        const data = (await response.json()) as { reply?: string; error?: string };
        if (!response.ok || !data.reply) {
          throw new Error(data.error ?? "The assistant could not answer just now.");
        }

        setMessages((m) => [...m, { role: "assistant", content: data.reply as string }]);
        if (speakReplies) speak(data.reply);
      } catch (err) {
        if (controller.signal.aborted) {
          setError("That took too long. Please ask again.");
        } else {
          setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        }
      } finally {
        clearTimeout(timer);
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy, messages, speak, speakReplies],
  );

  const toggleListening = useCallback(() => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const w = window as unknown as Record<string, unknown>;
    const Ctor = (w["SpeechRecognition"] ?? w["webkitSpeechRecognition"]) as
      | (new () => Recognition)
      | undefined;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.lang = "en-IN";
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i]![0].transcript;
      }
      setInput(transcript);
    };
    recognition.onerror = () => {
      setListening(false);
      setError("I could not hear that. Check microphone permissions and try again.");
    };
    recognition.onend = () => setListening(false);

    recognitionRef.current = recognition;
    setError(null);
    setListening(true);
    recognition.start();
  }, [listening]);

  const canSend = useMemo(() => input.trim().length > 0 && !busy, [input, busy]);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-elegant">
      <div
        ref={transcriptRef}
        className="max-h-[28rem] min-h-[18rem] space-y-5 overflow-y-auto p-6"
        role="log"
        aria-live="polite"
        aria-label="Conversation with AI Krishna"
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            {message.role === "user" ? (
              <p className="max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-3 text-sm leading-relaxed text-primary-foreground">
                {message.content}
              </p>
            ) : (
              <div className="max-w-[92%]">
                <p className="eyebrow mb-1.5 text-accent">AI Krishna</p>
                <p className="text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                  {message.content}
                </p>
              </div>
            )}
          </div>
        ))}

        {busy ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Reflecting on your
            question…
          </p>
        ) : null}

        {error ? (
          <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </p>
        ) : null}
      </div>

      {messages.length === 1 ? (
        <div className="flex flex-wrap gap-2 border-t border-border px-6 py-4">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => void send(s)}
              className="rounded-full border border-border px-3.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="border-t border-border bg-background/60 p-4"
      >
        <label htmlFor="krishna-input" className="sr-only">
          Ask AI Krishna
        </label>
        <textarea
          id="krishna-input"
          ref={inputRef}
          rows={2}
          value={input}
          maxLength={1500}
          disabled={busy}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send(input);
            }
          }}
          placeholder={listening ? "Listening…" : "Describe your situation, or ask about a verse…"}
          className="w-full resize-none rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
        />

        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {voiceSupported ? (
              <button
                type="button"
                onClick={toggleListening}
                aria-pressed={listening}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  listening
                    ? "border-transparent bg-destructive text-white"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {listening ? (
                  <MicOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Mic className="h-4 w-4" aria-hidden="true" />
                )}
                {listening ? "Stop" : "Speak"}
              </button>
            ) : null}

            {speechSupported ? (
              <button
                type="button"
                onClick={() => {
                  const next = !speakReplies;
                  setSpeakReplies(next);
                  if (!next) window.speechSynthesis.cancel();
                }}
                aria-pressed={speakReplies}
                className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                  speakReplies
                    ? "border-transparent bg-accent/20 text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {speakReplies ? (
                  <Volume2 className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <VolumeX className="h-4 w-4" aria-hidden="true" />
                )}
                {speakReplies ? "Voice on" : "Voice off"}
              </button>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={!canSend}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-[image:var(--gradient-gold)] px-5 py-2.5 text-sm font-semibold text-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            Ask
          </button>
        </div>
      </form>
    </div>
  );
}
