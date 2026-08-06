import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeader, Section } from "../components/site/PageHeader";
import { sendWebhook, WebhookError } from "../lib/webhook";
import { seoUrls } from "../lib/site-url";

const WEBHOOK = "https://jawepah.app.n8n.cloud/webhook/feedback";
const HOSTED_FORM = "https://jawepah.app.n8n.cloud/form/f7f83134-926f-4be1-8fcd-ed25877114ed";

/** Seconds the success panel stays on screen before the form closes itself. */
const AUTO_CLOSE_SECONDS = 6;

export const Route = createFileRoute("/feedback")({
  head: () => {
    const urls = seoUrls("/feedback");
    return {
      meta: [
        { title: "Share Your Feedback — Gita Strategy" },
        {
          name: "description",
          content:
            "Tell us what is working and what is missing on Gita Strategy. Share feedback on verses, frameworks, case studies and the newsletter.",
        },
        { property: "og:title", content: "Share Your Feedback — Gita Strategy" },
        {
          property: "og:description",
          content: "A two-minute feedback form for readers, students and managers.",
        },
        ...urls.meta,
      ],
      links: urls.links,
    };
  },
  component: FeedbackPage,
});

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
    .max(1500, "Please keep it under 1500 characters"),
});

type Values = z.infer<typeof schema>;
type FieldName = keyof Values;

const EMPTY: Values = { name: "", phone: "", email: "", feedback: "" };
const FEEDBACK_LIMIT = 1500;

function FeedbackPage() {
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");
  const [countdown, setCountdown] = useState(AUTO_CLOSE_SECONDS);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  // After a successful submission the confirmation closes itself and the
  // pristine form comes back, so the next visitor can submit straight away.
  useEffect(() => {
    if (status !== "success") return;
    setCountdown(AUTO_CLOSE_SECONDS);
    const tick = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    const close = setTimeout(() => setStatus("idle"), AUTO_CLOSE_SECONDS * 1000);
    return () => {
      clearInterval(tick);
      clearTimeout(close);
    };
  }, [status]);

  function update(field: FieldName, value: string) {
    setValues((v) => ({ ...v, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
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
      if (first) document.getElementById(`feedback-${first}`)?.focus();
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
          source: "gitastrategy.in/feedback",
          submittedAt: new Date().toISOString(),
        },
      });
      setValues(EMPTY);
      setStatus("success");
      toast.success("Feedback received", { description: "Thank you — this genuinely helps." });
    } catch (error) {
      if (controller.signal.aborted && !(error instanceof WebhookError && error.kind === "timeout")) {
        return;
      }
      const text =
        error instanceof WebhookError
          ? `${error.message} Please try again in a moment.`
          : "Something went wrong. Please try again in a moment.";
      setErrorText(text);
      setStatus("error");
      toast.error("Could not send feedback", { description: text });
    }
  }

  const busy = status === "loading";

  return (
    <>
      <PageHeader
        eyebrow="Feedback"
        title="Tell us what to improve"
        intro="Two minutes of your time shapes the next verse mapping, framework and case study. Every message is read."
      />
      <Section className="max-w-3xl">
        <div aria-live="polite">
          {status === "success" ? (
            <div className="rise-in rounded-xl border border-accent/40 bg-accent/10 p-8 text-center shadow-elegant">
              <CheckCircle2 className="mx-auto h-10 w-10 text-accent" aria-hidden="true" />
              <h2 className="mt-4 font-display text-2xl font-semibold">Thank you for your feedback</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Your response has been recorded. This confirmation closes automatically in{" "}
                {countdown}s.
              </p>
              <button
                type="button"
                onClick={() => setStatus("idle")}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-background px-6 py-2.5 text-sm font-semibold"
              >
                Close now
              </button>
            </div>
          ) : null}
        </div>

        {status !== "success" ? (
          <form
            onSubmit={onSubmit}
            noValidate
            aria-busy={busy}
            className="rounded-xl border border-border bg-card p-6 shadow-elegant sm:p-8"
          >
            <Field
              id="feedback-name"
              label="Your full name"
              value={values.name}
              error={errors.name}
              onChange={(v) => update("name", v)}
              disabled={busy}
              autoComplete="name"
              placeholder="Arjun Sharma"
            />
            <Field
              id="feedback-phone"
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
              id="feedback-email"
              label="Your email address"
              value={values.email}
              error={errors.email}
              onChange={(v) => update("email", v)}
              disabled={busy}
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
            />

            <label htmlFor="feedback-feedback" className="mt-5 mb-1.5 block text-sm font-medium">
              What&rsquo;s your feedback?
            </label>
            <textarea
              id="feedback-feedback"
              rows={6}
              value={values.feedback}
              maxLength={FEEDBACK_LIMIT}
              disabled={busy}
              onChange={(e) => update("feedback", e.target.value)}
              aria-invalid={Boolean(errors.feedback)}
              aria-describedby={errors.feedback ? "feedback-feedback-error" : undefined}
              placeholder="What helped, what confused you, what should we add next?"
              className={`w-full resize-y rounded-md border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 disabled:opacity-60 ${
                errors.feedback
                  ? "border-destructive focus:border-destructive focus:ring-destructive/30"
                  : "border-input focus:border-accent focus:ring-accent/30"
              }`}
            />
            <div className="mt-1.5 flex items-start justify-between gap-3">
              <p id="feedback-feedback-error" className="text-xs text-destructive">
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
          </form>
        ) : null}
      </Section>
    </>
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
      {error ? (
        <p id={`${id}-error`} className="mt-1.5 text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
