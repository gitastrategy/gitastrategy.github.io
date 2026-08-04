import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { z } from "zod";
import { PageHeader, Section } from "../components/site/PageHeader";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — Gita Strategy" },
      {
        name: "description",
        content:
          "Reach the Gita Strategy team in Mumbai: general, sales, marketing, partnerships, support and careers contacts, plus a direct message form.",
      },
      { property: "og:title", content: "Contact Us — Gita Strategy" },
      {
        property: "og:description",
        content: "Send us a message or reach the right team directly.",
      },
      { property: "og:url", content: "/contact" },
    ],
    links: [{ rel: "canonical", href: "/contact" }],
  }),
  component: ContactPage,
});

const WEBHOOK = "https://yesorat.app.n8n.cloud/webhook/contact-us";

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(1000),
});

const departments = [
  { label: "General", email: "info@gitastrategy.in" },
  { label: "Sales", email: "sales@gitastrategy.in" },
  { label: "Marketing", email: "marketing@gitastrategy.in" },
  { label: "Partnerships", email: "partnerships@gitastrategy.in" },
  { label: "Support", email: "support@gitastrategy.in" },
  { label: "Careers / HR", email: "hr@gitastrategy.in" },
];

function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      return;
    }
    setErrors({});
    setStatus("loading");
    try {
      const res = await fetch(WEBHOOK, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      setForm({ name: "", email: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Start a conversation"
        intro="Questions, collaborations, workshops or speaking — we read everything that arrives."
      />
      <Section>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
          <form
            onSubmit={onSubmit}
            noValidate
            className="rounded-xl border border-border bg-card p-8 shadow-elegant"
          >
            <h2 className="text-2xl font-semibold">Send a message</h2>

            <Field label="Name" error={errors.name}>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                maxLength={100}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                placeholder="Your full name"
              />
            </Field>

            <Field label="Email" error={errors.email}>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                maxLength={255}
                className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                placeholder="you@company.com"
              />
            </Field>

            <Field label="Message" error={errors.message}>
              <textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                maxLength={1000}
                rows={6}
                className="w-full resize-y rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/30"
                placeholder="How can we help?"
              />
            </Field>

            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-60"
            >
              {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {status === "loading" ? "Sending…" : "Send message"}
            </button>

            {status === "success" ? (
              <p className="rise-in mt-5 rounded-lg bg-accent/12 p-4 text-sm font-medium">
                Your message has been received. We will get back to you soon.
              </p>
            ) : null}
            {status === "error" ? (
              <p className="rise-in mt-5 rounded-lg bg-destructive/10 p-4 text-sm font-medium text-destructive">
                Something went wrong sending your message. Please try again, or email
                info@gitastrategy.in.
              </p>
            ) : null}
          </form>

          <aside className="rounded-xl border border-border bg-secondary/60 p-8">
            <h2 className="text-2xl font-semibold">Reach us directly</h2>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {departments.map((d) => (
                <div key={d.email}>
                  <dt className="eyebrow text-muted-foreground">{d.label}</dt>
                  <dd className="mt-1 text-sm">
                    <a href={`mailto:${d.email}`} className="hover:text-accent">
                      {d.email}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 space-y-4 border-t border-border pt-6 text-sm">
              <div>
                <p className="eyebrow text-muted-foreground">Phone</p>
                <a href="tel:+918652074439" className="hover:text-accent">
                  +91 8652074439
                </a>
              </div>
              <div>
                <p className="eyebrow text-muted-foreground">Location</p>
                <p>Mumbai, India – 421204</p>
              </div>
              <div>
                <p className="eyebrow text-muted-foreground">Office hours</p>
                <p>Mon – Fri: 9:00 – 18:00 IST</p>
                <p className="text-muted-foreground">Sat – Sun: Closed</p>
              </div>
            </div>

            <a
              href="https://wa.me/918652074439"
              target="_blank"
              rel="noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-gold)] px-5 py-2.5 text-sm font-semibold text-primary"
            >
              <MessageCircle className="h-4 w-4" /> Chat on WhatsApp
            </a>
          </aside>
        </div>
      </Section>
    </>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-5">
      <label className="mb-1.5 block text-sm font-medium">{label}</label>
      {children}
      {error ? <p className="mt-1.5 text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
