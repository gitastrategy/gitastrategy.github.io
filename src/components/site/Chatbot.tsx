import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Mic, RotateCcw, Send, Square, Trash2, Volume2, VolumeX } from "lucide-react";
import {
  chatEndpoint,
  clearConversation,
  formatTime,
  loadConversation,
  newMessage,
  saveConversation,
  type ChatMessage,
} from "../../lib/chat-store";
import { track } from "../../lib/analytics";

// Minimal structural types for the Web Speech API (not in the TS DOM lib).
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

const GREETING =
  "Namaste. Tell me the decision, the team or the doubt in front of you — I will read it through the Gita and give you one action for this week. Type it, or tap the mic and speak.";

const SUGGESTIONS = [
  "My team is burnt out before a launch.",
  "How do I choose between two strategies with incomplete data?",
  "A profitable deal feels ethically wrong.",
  "I have lost confidence in myself as a leader.",
];

export function Chatbot({ compact = false }: { compact?: boolean }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [listening, setListening] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  const recognitionRef = useRef<Recognition | null>(null);
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastQuestionRef = useRef<string>("");

  // Restore the single saved conversation once, on the client.
  useEffect(() => {
    setMessages(loadConversation());
    const w = window as unknown as Record<string, unknown>;
    setVoiceSupported(Boolean(w["SpeechRecognition"] || w["webkitSpeechRecognition"]));
    setSpeechSupported(typeof window.speechSynthesis !== "undefined");
  }, []);

  useEffect(() => {
    if (messages.length > 0) saveConversation(messages);
  }, [messages]);

  useEffect(() => {
    transcriptRef.current?.scrollTo({
      top: transcriptRef.current.scrollHeight,
      behavior: "smooth",
    });
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
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98;
    utterance.pitch = 0.9;
    utterance.lang = "en-IN";
    window.speechSynthesis.speak(utterance);
  }, []);

  const send = useCallback(
    async (text: string, opts: { retryOf?: string } = {}) => {
      const question = text.trim();
      if (!question || busy) return;
      lastQuestionRef.current = question;

      const history = [
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        ...(opts.retryOf ? [] : [{ role: "user" as const, content: question }]),
      ];

      if (!opts.retryOf) setMessages((m) => [...m, newMessage("user", question)]);
      setInput("");
      setError(null);
      setBusy(true);
      track("chat_message_sent", { retry: Boolean(opts.retryOf) });

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const timer = setTimeout(() => controller.abort(), 45_000);

      try {
        const response = await fetch(chatEndpoint(), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ messages: history.slice(-12) }),
          signal: controller.signal,
        });

        const contentType = response.headers.get("content-type") ?? "";
        if (!contentType.includes("application/json")) {
          throw new Error("The assistant could not be reached. Please try again.");
        }
        const data = (await response.json()) as { reply?: string; error?: string };
        if (!response.ok || !data.reply) {
          throw new Error(data.error ?? "The assistant could not answer just now.");
        }

        setMessages((m) => [...m, newMessage("assistant", data.reply as string)]);
        if (speakReplies) speak(data.reply);
        track("chat_reply_received", {});
      } catch (err) {
        if (controller.signal.aborted) {
          setError("That took too long. Please try again.");
        } else {
          setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
        }
        track("chat_error", {});
      } finally {
        clearTimeout(timer);
        setBusy(false);
        inputRef.current?.focus();
      }
    },
    [busy, messages, speak, speakReplies],
  );

  function toggleListening() {
    if (listening) {
      recognitionRef.current?.stop();
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
      let text = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result) text += result[0].transcript;
      }
      setInput(text);
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
    track("chat_voice_started", {});
  }

  function reset() {
    abortRef.current?.abort();
    clearConversation();
    setMessages([]);
    setError(null);
    if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    track("chat_cleared", {});
  }

  const showGreeting = messages.length === 0;

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-elegant">
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-2.5">
          <span
            aria-hidden="true"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-gold)] font-display text-base text-primary"
          >
            ॐ
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">Gita Strategy Assistant</p>
            <p className="truncate text-xs text-muted-foreground">
              {busy ? "Thinking…" : "Text or voice · answers grounded in the Gita"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {speechSupported ? (
            <button
              type="button"
              onClick={() => {
                setSpeakReplies((s) => !s);
                if (speakReplies) window.speechSynthesis?.cancel();
              }}
              aria-pressed={speakReplies}
              title={speakReplies ? "Turn voice replies off" : "Read replies aloud"}
              className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
            >
              {speakReplies ? (
                <Volume2 className="h-4 w-4 text-accent" aria-hidden="true" />
              ) : (
                <VolumeX className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="sr-only">Toggle spoken replies</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={reset}
            title="Clear conversation"
            className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Clear conversation</span>
          </button>
        </div>
      </div>

      <div
        ref={transcriptRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation"
        className={`flex-1 space-y-4 overflow-y-auto px-4 py-5 ${compact ? "min-h-[18rem]" : "min-h-[24rem]"}`}
      >
        {showGreeting ? (
          <Bubble role="assistant" content={GREETING} />
        ) : (
          messages.map((m) => (
            <Bubble key={m.id} role={m.role} content={m.content} time={formatTime(m.at)} />
          ))
        )}

        {busy ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            Reflecting on your question…
          </div>
        ) : null}

        {error ? (
          <div
            role="alert"
            className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
          >
            <p>{error}</p>
            <button
              type="button"
              onClick={() => void send(lastQuestionRef.current, { retryOf: lastQuestionRef.current })}
              className="mt-2 inline-flex items-center gap-1.5 rounded-full border border-destructive/40 px-3 py-1.5 text-xs font-semibold"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Retry
            </button>
          </div>
        ) : null}

        {showGreeting ? (
          <div className="flex flex-wrap gap-2 pt-2">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => void send(s)}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
              >
                {s}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="border-t border-border p-3"
      >
        <div className="flex items-end gap-2">
          {voiceSupported ? (
            <button
              type="button"
              onClick={toggleListening}
              aria-pressed={listening}
              title={listening ? "Stop listening" : "Speak your question"}
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-colors ${
                listening
                  ? "border-transparent bg-destructive text-white"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {listening ? (
                <Square className="h-4 w-4" aria-hidden="true" />
              ) : (
                <Mic className="h-4 w-4" aria-hidden="true" />
              )}
              <span className="sr-only">{listening ? "Stop listening" : "Start voice input"}</span>
            </button>
          ) : null}

          <label htmlFor="chat-input" className="sr-only">
            Your message
          </label>
          <textarea
            id="chat-input"
            ref={inputRef}
            rows={1}
            value={input}
            disabled={busy}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void send(input);
              }
            }}
            placeholder={listening ? "Listening…" : "Ask about a decision, a team or a dilemma"}
            className="max-h-32 min-h-11 flex-1 resize-y rounded-2xl border border-input bg-background px-4 py-2.5 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={busy || input.trim().length === 0}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-gold)] text-primary disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            <span className="sr-only">Send message</span>
          </button>
        </div>
        <p className="mt-2 text-center text-[0.7rem] text-muted-foreground">
          A study aid, not spiritual, legal, medical or financial advice. History stays in this
          browser.
        </p>
      </form>
    </div>
  );
}

function Bubble({
  role,
  content,
  time,
}: {
  role: "user" | "assistant";
  content: string;
  time?: string;
}) {
  const isUser = role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`max-w-[85%] ${isUser ? "text-right" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? "bg-primary text-primary-foreground"
              : "border border-border bg-background text-foreground"
          }`}
        >
          {content}
        </div>
        {time ? <p className="mt-1 text-[0.7rem] text-muted-foreground">{time}</p> : null}
      </div>
    </div>
  );
}
