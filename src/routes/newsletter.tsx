import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeader, Section } from "../components/site/PageHeader";
import { sendWebhook, WebhookError } from "../lib/webhook";
import { newsletterUrl } from "../lib/webhooks";

export const Route = createFileRoute("/newsletter")({
  head: () => ({
    meta: [
      { title: "Newsletter — Gita Strategy" },
      {
        name: "description",
        content:
          "Subscribe or unsubscribe from the Bhagavad Gita Strategy newsletter: one verse, one framework, one takeaway.",
      },
      { property: "og:title", content: "Newsletter — Gita Strategy" },
      {
        property: "og:description",
        content: "Manage your subscription to the Gita Strategy newsletter.",
      },
      { property: "og:url", content: "/newsletter" },
    ],
    links: [{ rel: "canonical", href: "/newsletter" }],
  }),
  component: NewsletterPage,
});

const emailSchema = z.string().trim().email("Enter a valid email address").max(255);

type Action = "subscribe" | "unsubscribe";

function NewsletterPage() {
  const [pending, setPending] = useState<Action | null>(null);
  const [emails, setEmails] = useState<Record<Action, string>>({ subscribe: "", unsubscribe: "" });
  const [feedback, setFeedback] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  const [fieldError, setFieldError] = useState<Partial<Record<Action, string>>>({});
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  async function run(action: Action) {
    if (pending) return;

    const parsed = emailSchema.safeParse(emails[action]);
    if (!parsed.success) {
      const message = parsed.error.issues[0]!.message;
      setFieldError({ [action]: message });
      setFeedback(null);
      document.getElementById(`newsletter-${action}`)?.focus();
      return;
    }

    setFieldError({});
    setFeedback(null);
    setPending(action);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const url = newsletterUrl(parsed.data, action);

    try {
      await sendWebhook({ url, method: "GET", signal: controller.signal });
      const text =
        action === "subscribe"
          ? "Successfully subscribed to the Bhagavad Gita Strategy newsletter."
          : "You have been unsubscribed. Sorry to see you go.";
      setFeedback({ tone: "ok", text });
      setEmails((e) => ({ ...e, [action]: "" }));
      toast.success(action === "subscribe" ? "Subscribed" : "Unsubscribed", { description: text });
    } catch (error) {
      if (controller.signal.aborted && !(error instanceof WebhookError && error.kind === "timeout")) {
        return;
      }
      const text =
        error instanceof WebhookError
          ? `${error.message} Please try again in a moment.`
          : "Something went wrong. Please try again in a moment.";
      setFeedback({ tone: "bad", text });
      toast.error("Request failed", { description: text });
    } finally {
      if (!controller.signal.aborted) setPending(null);
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Newsletter"
        title="One verse. One framework. One takeaway."
        intro="A short weekly note connecting the Gita to a live management problem. Manage your subscription below."
      />
      <Section className="max-w-4xl">
        <div className="grid gap-6 md:grid-cols-2">
          <Card
            id="newsletter-subscribe"
            title="Subscribe"
            description="Join students, founders and managers reading the weekly note."
            cta="Subscribe"
            value={emails.subscribe}
            error={fieldError.subscribe}
            onChange={(v) => setEmails((e) => ({ ...e, subscribe: v }))}
            onSubmit={() => run("subscribe")}
            loading={pending === "subscribe"}
            disabled={pending !== null}
            primary
          />
          <Card
            id="newsletter-unsubscribe"
            title="Unsubscribe"
            description="Leave any time. No questions, no retention emails."
            cta="Unsubscribe"
            value={emails.unsubscribe}
            error={fieldError.unsubscribe}
            onChange={(v) => setEmails((e) => ({ ...e, unsubscribe: v }))}
            onSubmit={() => run("unsubscribe")}
            loading={pending === "unsubscribe"}
            disabled={pending !== null}
          />
        </div>

        <div aria-live="polite" role="status">
          {feedback ? (
            <p
              className={`rise-in mt-8 rounded-lg p-4 text-center text-sm font-medium ${
                feedback.tone === "ok" ? "bg-accent/12" : "bg-destructive/10 text-destructive"
              }`}
            >
              {feedback.text}
            </p>
          ) : null}
        </div>

        <p className="mt-8 text-center text-xs text-muted-foreground">
          We only use your email to send this newsletter. No sharing, no selling — unsubscribe any time.
        </p>
      </Section>
    </>
  );
}

function Card({
  id,
  title,
  description,
  cta,
  value,
  error,
  onChange,
  onSubmit,
  loading,
  disabled,
  primary,
}: {
  id: string;
  title: string;
  description: string;
  cta: string;
  value: string;
  error?: string | undefined;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  disabled: boolean;
  primary?: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      noValidate
      aria-busy={loading}
      className="rounded-xl border border-border bg-card p-6 shadow-elegant sm:p-8"
    >
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <label htmlFor={id} className="mt-5 mb-1.5 block text-sm font-medium">
        Email address
      </label>
      <input
        id={id}
        type="email"
        inputMode="email"
        autoComplete="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        maxLength={255}
        placeholder="you@company.com"
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
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
      <button
        type="submit"
        disabled={disabled}
        className={`mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 ${
          primary
            ? "bg-[image:var(--gradient-gold)] text-primary"
            : "border border-border bg-background text-foreground"
        }`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
        {loading ? "Working…" : cta}
      </button>
    </form>
  );
}
