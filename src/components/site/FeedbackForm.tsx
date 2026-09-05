import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { sendWebhook, WebhookError } from "../../lib/webhook";
import { checkSubmission, honeypotProps, recordSubmission } from "../../lib/spam";
import { track } from "../../lib/analytics";
import { WEBHOOKS } from "../../lib/webhooks";

const WEBHOOK = WEBHOOKS.feedback;

/** Seconds the success panel stays on screen before the form closes itself. */
const AUTO_CLOSE_SECONDS = 4;
const FEEDBACK_LIMIT = 1500;

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  phone: z
    .string()
    .trim()
    .min(7, "Enter a valid phone number")
    .max(20, "Phone number is too long")
    .regex(/^[+()\-\s0-9]+$/, "Use digits, spaces, +, - or () only"),
  email: z.string().trim().email("Enter a valid email address").max(255),
  feedback: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters")
    .max(FEEDBACK_LIMIT, "Please keep it under 1500 characters"),
});

type Values = z.infer<typeof schema>;
type FieldName = keyof Values;

const EMPTY: Values = { name: "", phone: "", email: "", feedback: "" };

export function FeedbackForm({
  idPrefix = "feedback",
  source = "gitastrategy.in/feedback",
  onSuccess,
  showHostedFormLink = true,
}: {
  idPrefix?: string;
  source?: string;
  /** Called after the success confirmation auto-closes (used by the modal). */
  onSuccess?: () => void;
  showHostedFormLink?: boolean;
}) {
  const [values, setValues] = useState<Values>(EMPTY);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");
  const [countdown, setCountdown] = useState(AUTO_CLOSE_SECONDS);
  const abortRef = useRef<AbortController | null>(null);
  const startedAtRef = useRef(Date.now());
  const successRef = useRef(onSuccess);
  successRef.current = onSuccess;

  useEffect(() => () => abortRef.current?.abort(), []);

  // After a successful submission the confirmation closes itself.
  useEffect(() => {
    if (status !== "success") return;
    setCountdown(AUTO_CLOSE_SECONDS);
    const tick = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    const close = setTimeout(() => {
      setStatus("idle");
      startedAtRef.current = Date.now();
      successRef.current?.();
    }, AUTO_CLOSE_SECONDS * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(close);
    };
  }, [status]);

  function update(field: FieldName, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function closeNow() {
    setStatus("idle");
    startedAtRef.current = Date.now();
    successRef.current?.();
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "loading") return;

    const parsed = schema.safeParse(values);
    if (!parsed.success) {
      const next: Partial<Record<FieldName, string>> = {};
      for (const issue of parsed.error.issues) {
        const field = issue.path[0] as FieldName;
        if (!next[field]) next[field] = issue.message;
      }
      setErrors(next);
      const first = Object.keys(next)[0];
      if (first) document.getElementById(`${idPrefix}-${first}`)?.focus();
      return;
    }

    const verdict = checkSubmission("feedback", { honeypot, startedAt: startedAtRef.current });
    if (!verdict.ok) {
      setErrorText(verdict.reason);
      setStatus("error");
      track("feedback_blocked", { reason: verdict.reason });
      return;
    }

    setErrors({});
    setErrorText("");
    setStatus("loading");
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await sendWebhook({
        url: WEBHOOK,
        method: "POST",
        signal: controller.signal,
        body: {
          name: parsed.data.name,
          phone: parsed.data.phone,
          email: parsed.data.email,
          feedback: parsed.data.feedback,
          source,
          submittedAt: new Date().toISOString(),
        },
      });
      recordSubmission("feedback");
      track("feedback_submitted", { source });
      setValues(EMPTY);
      setStatus("success");
      toast.success("Feedback received", { description: "Thank you — this genuinely helps." });
    } catch (error) {
      if (
        controller.signal.aborted &&
        !(error instanceof WebhookError && error.kind === "timeout")
      ) {
        return;
      }
      const text =
        error instanceof WebhookError
          ? `${error.message} Please try again in a moment.`
          : "Something went wrong. Please try again in a moment.";
      setErrorText(text);
      setStatus("error");
      track("feedback_failed", { source });
      toast.error("Could not send feedback", { description: text });
    }
  }

  const busy = status === "loading";

  if (status === "success") {
    return (
      <div aria-live="polite">
        <div className="rise-in rounded-xl border border-accent/40 bg-accent/10 p-8 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-accent" aria-hidden="true" />
          <h2 className="mt-4 font-display text-2xl font-semibold">Thank you for your feedback</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Your response has been recorded. This closes automatically in {countdown}s.
          </p>
          <button
            type="button"
            onClick={closeNow}
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-6 py-2.5 text-sm font-semibold"
          >
            Close now
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-busy={busy}>
      <input
        {...honeypotProps}
        value={honeypot}
        onChange={(e) => setHoneypot(e.target.value)}
        aria-label="Leave this field empty"
      />

      <Field
        id={`${idPrefix}-name`}
        label="Your full name"
        value={values.name}
        error={errors.name}
        onChange={(v) => update("name", v)}
        disabled={busy}
        autoComplete="name"
        placeholder="Arjun Sharma"
      />
      <Field
        id={`${idPrefix}-phone`}
        label="Your phone / mobile number"
        value={values.phone}
        error={errors.phone}
        onChange={(v) => update("phone", v)}
        disabled={busy}
        type="tel"
        autoComplete="tel"
        placeholder="+91 86520 74439"
      />
      <Field
        id={`${idPrefix}-email`}
        label="Your email address"
        value={values.email}
        error={errors.email}
        onChange={(v) => update("email", v)}
        disabled={busy}
        type="email"
        autoComplete="email"
        placeholder="you@company.com"
      />

      <label htmlFor={`${idPrefix}-feedback`} className="mt-5 mb-1.5 block text-sm font-medium">
        What&rsquo;s your feedback?
      </label>
      <textarea
        id={`${idPrefix}-feedback`}
        rows={5}
        value={values.feedback}
        maxLength={FEEDBACK_LIMIT}
        disabled={busy}
        onChange={(e) => update("feedback", e.target.value)}
        aria-invalid={Boolean(errors.feedback)}
        aria-describedby={errors.feedback ? `${idPrefix}-feedback-error` : undefined}
        placeholder="What helped, what confused you, what should we add next?"
        className={`w-full resize-y rounded-md border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 disabled:opacity-60 ${
          errors.feedback
            ? "border-destructive focus:border-destructive focus:ring-destructive/30"
            : "border-input focus:border-accent focus:ring-accent/30"
        }`}
      />
      <div className="mt-1.5 flex items-start justify-between gap-3">
        <p id={`${idPrefix}-feedback-error`} className="text-xs text-destructive">
          {errors.feedback ?? ""}
        </p>
        <p className="shrink-0 text-xs text-muted-foreground">
          {values.feedback.length}/{FEEDBACK_LIMIT}
        </p>
      </div>

      {status === "error" ? (
        <p
          role="alert"
          className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive"
        >
          {errorText}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-[image:var(--gradient-gold)] px-6 py-3 text-sm font-semibold text-primary transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {busy ? "Sending…" : "Send feedback"}
      </button>

      {showHostedFormLink ? (
        <p className="mt-5 text-center text-xs text-muted-foreground">
          Prefer the standalone form?{" "}
          <a
            href={HOSTED_FORM}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1 font-semibold text-accent hover:underline"
          >
            Open it here <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </p>
      ) : null}
    </form>
  );
}

function Field({
  id,
  label,
  value,
  error,
  onChange,
  disabled,
  type = "text",
  autoComplete,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  error?: string | undefined;
  onChange: (v: string) => void;
  disabled: boolean;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
}) {
  return (
    <div className="mt-5 first:mt-0">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        disabled={disabled}
        autoComplete={autoComplete}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 disabled:opacity-60 ${
          error
            ? "border-destructive focus:border-destructive focus:ring-destructive/30"
            : "border-input focus:border-accent focus:ring-accent/30"
        }`}
      />
      <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive">
        {error ?? ""}
      </p>
    </div>
  );
}
