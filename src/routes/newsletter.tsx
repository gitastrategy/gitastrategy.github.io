import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { z } from "zod";
import { PageHeader, Section } from "../components/site/PageHeader";

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

const WEBHOOK = "https://yesorat.app.n8n.cloud/webhook/GitaStrategyNewsletter";
const emailSchema = z.string().trim().email("Enter a valid email address").max(255);

type Action = "subscribe" | "unsubscribe";

function NewsletterPage() {
  const [pending, setPending] = useState<Action | null>(null);
  const [emails, setEmails] = useState({ subscribe: "", unsubscribe: "" });
  const [feedback, setFeedback] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);

  async function run(action: Action) {
    const parsed = emailSchema.safeParse(emails[action]);
    if (!parsed.success) {
      setFeedback({ tone: "bad", text: parsed.error.issues[0]!.message });
      return;
    }
    setFeedback(null);
    setPending(action);
    try {
      const url = `${WEBHOOK}?email=${encodeURIComponent(parsed.data)}&action=${action}`;
      const res = await fetch(url, { method: "GET" });
      if (!res.ok) throw new Error("failed");
      setFeedback({
        tone: "ok",
        text:
          action === "subscribe"
            ? "Successfully subscribed to Bhagavad Gita Strategy Newsletter."
            : "You have been unsubscribed.",
      });
      setEmails((e) => ({ ...e, [action]: "" }));
    } catch {
      setFeedback({
        tone: "bad",
        text: "We could not reach the newsletter service. Please check your connection and try again.",
      });
    } finally {
      setPending(null);
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
            title="Subscribe"
            description="Join students, founders and managers reading the weekly note."
            cta="Subscribe"
            value={emails.subscribe}
            onChange={(v) => setEmails((e) => ({ ...e, subscribe: v }))}
            onSubmit={() => run("subscribe")}
            loading={pending === "subscribe"}
            primary
          />
          <Card
            title="Unsubscribe"
            description="Leave any time. No questions, no retention emails."
            cta="Unsubscribe"
            value={emails.unsubscribe}
            onChange={(v) => setEmails((e) => ({ ...e, unsubscribe: v }))}
            onSubmit={() => run("unsubscribe")}
            loading={pending === "unsubscribe"}
          />
        </div>

        {feedback ? (
          <p
            className={`rise-in mt-8 rounded-lg p-4 text-center text-sm font-medium ${
              feedback.tone === "ok" ? "bg-accent/12" : "bg-destructive/10 text-destructive"
            }`}
          >
            {feedback.text}
          </p>
        ) : null}
      </Section>
    </>
  );
}

function Card({
  title,
  description,
  cta,
  value,
  onChange,
  onSubmit,
  loading,
  primary,
}: {
  title: string;
  description: string;
  cta: string;
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  loading: boolean;
  primary?: boolean;
}) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="rounded-xl border border-border bg-card p-8 shadow-elegant"
    >
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      <input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={255}
        placeholder="you@company.com"
        className="mt-5 w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
      />
      <button
        type="submit"
        disabled={loading}
        className={`mt-4 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60 ${
          primary
            ? "bg-[image:var(--gradient-gold)] text-primary"
            : "border border-border bg-background text-foreground"
        }`}
      >
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {loading ? "Working…" : cta}
      </button>
    </form>
  );
}
