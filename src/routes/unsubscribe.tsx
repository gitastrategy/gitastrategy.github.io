import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle2, Loader2, MailX } from "lucide-react";
import { z } from "zod";
import { PageHeader, Section } from "../components/site/PageHeader";
import { sendWebhook, WebhookError } from "../lib/webhook";
import { seoUrls } from "../lib/site-url";
import { newsletterUrl } from "../lib/webhooks";
import { track } from "../lib/analytics";

const emailSchema = z.string().trim().email("Enter a valid email address").max(255);

type Search = { email?: string | undefined };

export const Route = createFileRoute("/unsubscribe")({
  // Supports the one-click link format: /unsubscribe?email=someone%40example.com
  validateSearch: (search: Record<string, unknown>): Search => ({
    email: typeof search["email"] === "string" ? search["email"] : undefined,
  }),
  head: () => {
    const urls = seoUrls("/unsubscribe");
    return {
      meta: [
        { title: "Unsubscribe — Gita Strategy Newsletter" },
        {
          name: "description",
          content:
            "Unsubscribe from the Gita Strategy newsletter in one click. No questions asked, no retention emails.",
        },
        { property: "og:title", content: "Unsubscribe — Gita Strategy Newsletter" },
        {
          property: "og:description",
          content: "Remove your email from the Gita Strategy newsletter list.",
        },
        { name: "robots", content: "noindex, follow" },
        ...urls.meta,
      ],
      links: urls.links,
    };
  },
  component: UnsubscribePage,
});

type State = "idle" | "loading" | "done" | "error";

function UnsubscribePage() {
  const { email: emailFromLink } = Route.useSearch();
  const [email, setEmail] = useState(emailFromLink ?? "");
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const autoRan = useRef(false);

  useEffect(() => () => abortRef.current?.abort(), []);

  const unsubscribe = useCallback(async (raw: string) => {
    const parsed = emailSchema.safeParse(raw);
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]!.message);
      setState("idle");
      return;
    }

    setFieldError(null);
    setState("loading");
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const url = newsletterUrl(parsed.data, "unsubscribe");

    try {
      await sendWebhook({ url, method: "GET", signal: controller.signal });
      setMessage(`${parsed.data} has been removed from the Gita Strategy newsletter.`);
      track("newsletter_unsubscribed", { outcome: "success" });
      setState("done");
    } catch (error) {
      if (controller.signal.aborted && !(error instanceof WebhookError && error.kind === "timeout")) {
        return;
      }
      setMessage(
        error instanceof WebhookError
          ? `${error.message} Please try again in a moment.`
          : "Something went wrong. Please try again in a moment.",
      );
      track("newsletter_unsubscribed", { outcome: "error" });
      setState("error");
    }
  }, []);

  // A valid ?email= in the link unsubscribes immediately — one click, no form.
  useEffect(() => {
    if (autoRan.current) return;
    if (!emailFromLink) return;
    if (!emailSchema.safeParse(emailFromLink).success) return;
    autoRan.current = true;
    void unsubscribe(emailFromLink);
  }, [emailFromLink, unsubscribe]);

  return (
    <>
      <PageHeader
        eyebrow="Newsletter"
        title="Unsubscribe"
        intro="Confirm the email address below and you will be removed from the weekly note immediately."
      />
      <Section className="max-w-xl">
        <div
          aria-live="polite"
          className="rounded-xl border border-border bg-card p-6 shadow-elegant sm:p-8"
        >
          {state === "done" ? (
            <div className="text-center">
              <CheckCircle2 className="mx-auto h-10 w-10 text-accent" aria-hidden="true" />
              <h2 className="mt-4 font-display text-2xl font-semibold">You are unsubscribed</h2>
              <p className="mt-2 text-sm text-muted-foreground">{message}</p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  to="/"
                  className="inline-flex min-h-11 items-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold"
                >
                  Back to home
                </Link>
                <Link
                  to="/newsletter"
                  className="inline-flex min-h-11 items-center rounded-full bg-[image:var(--gradient-gold)] px-5 py-2.5 text-sm font-semibold text-primary"
                >
                  Re-subscribe
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void unsubscribe(email);
              }}
              noValidate
              aria-busy={state === "loading"}
            >
              <MailX className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <h2 className="mt-3 font-display text-2xl font-semibold">Confirm your email</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Sorry to see you go. You can re-subscribe any time.
              </p>

              <label htmlFor="unsubscribe-email" className="mt-5 mb-1.5 block text-sm font-medium">
                Email address
              </label>
              <input
                id="unsubscribe-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                maxLength={255}
                value={email}
                disabled={state === "loading"}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setFieldError(null);
                }}
                aria-invalid={Boolean(fieldError)}
                aria-describedby={fieldError ? "unsubscribe-email-error" : undefined}
                placeholder="you@company.com"
                className={`w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 disabled:opacity-60 ${
                  fieldError
                    ? "border-destructive focus:border-destructive focus:ring-destructive/30"
                    : "border-input focus:border-accent focus:ring-accent/30"
                }`}
              />
              {fieldError ? (
                <p id="unsubscribe-email-error" className="mt-1.5 text-xs text-destructive">
                  {fieldError}
                </p>
              ) : null}

              {state === "error" ? (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-destructive/10 p-3 text-sm font-medium text-destructive"
                >
                  {message}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={state === "loading"}
                className="mt-5 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {state === "loading" ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : null}
                {state === "loading" ? "Unsubscribing…" : "Unsubscribe"}
              </button>
            </form>
          )}
        </div>
      </Section>
    </>
  );
}
