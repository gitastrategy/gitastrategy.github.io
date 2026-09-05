import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { PageHeader, Section } from "../components/site/PageHeader";
import { sendWebhook, WebhookError } from "../lib/webhook";
import { WEBHOOKS } from "../lib/webhooks";

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


export const ENQUIRY_CATEGORIES = [
  "General Enquiry",
  "Sales",
  "Marketing",
  "Partnership",
  "Support",
  "Careers / HR",
  "Speaking / Workshop",
] as const;

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((v) => v === "" || /^[+0-9][0-9\s\-()]{6,}$/.test(v), "Enter a valid phone number"),
  category: z.enum(ENQUIRY_CATEGORIES),
  subject: z.string().trim().max(150),
  message: z.string().trim().min(10, "Please write at least 10 characters").max(2000),
});

type FormValues = z.infer<typeof schema>;
type FieldName = keyof FormValues;

const EMPTY: FormValues = {
  name: "",
  email: "",
  phone: "",
  category: "General Enquiry",
  subject: "",
  message: "",
};

const departments = [
  { label: "General", email: "info@gitastrategy.in" },
  { label: "Sales", email: "sales@gitastrategy.in" },
  { label: "Marketing", email: "marketing@gitastrategy.in" },
  { label: "Partnerships", email: "partnerships@gitastrategy.in" },
  { label: "Support", email: "support@gitastrategy.in" },
  { label: "Careers / HR", email: "hr@gitastrategy.in" },
];


const MESSAGE_LIMIT = 2000;

function ContactPage() {
  const [form, setForm] = useState<FormValues>(EMPTY);
  const [honeypot, setHoneypot] = useState("");
  const [errors, setErrors] = useState<Partial<Record<FieldName, string>>>({});
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  // Cancel any in-flight request if the user navigates away.
  useEffect(() => () => abortRef.current?.abort(), []);

  function validateField(field: FieldName, value: string) {
    const result = schema.shape[field].safeParse(value);
    setErrors((prev) => {
      const next = { ...prev };
      if (result.success) delete next[field];
      else next[field] = result.error.issues[0]!.message;
      return next;
    });
  }

  function update(field: FieldName, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) validateField(field, value);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const next: Partial<Record<FieldName, string>> = {};
      for (const issue of parsed.error.issues) {
        const key = issue.path[0] as FieldName;
        if (!next[key]) next[key] = issue.message;
      }
      setErrors(next);
      setStatus("idle");
      const first = document.getElementById(`contact-${Object.keys(next)[0]}`);
      first?.focus();
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
        url: contactEndpoint(),
        method: "POST",
        body: { ...parsed.data, website: honeypot },
        signal: controller.signal,
      });
      setStatus("success");
      setForm(EMPTY);
      toast.success("Message sent", { description: "We'll get back to you shortly." });
    } catch (error) {
      if (controller.signal.aborted && !(error instanceof WebhookError && error.kind === "timeout")) {
        return;
      }
      const message =
        error instanceof WebhookError
          ? `${error.message} Please try again, or email gitastrategy@gmail.com.`
          : "Something went wrong sending your message. Please email gitastrategy@gmail.com.";
      setStatus("error");
      setErrorText(message);
      toast.error("Message not sent", { description: message });
    }

  }

  const loading = status === "loading";

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
            aria-busy={loading}
            className="rounded-xl border border-border bg-card p-6 shadow-elegant sm:p-8"
          >
            <h2 className="text-2xl font-semibold">Send a message</h2>

            <Field id="contact-name" label="Name" error={errors.name}>
              {(props) => (
                <input
                  {...props}
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  onBlur={(e) => validateField("name", e.target.value)}
                  disabled={loading}
                  autoComplete="name"
                  maxLength={100}
                  className={inputClass(Boolean(errors.name))}
                  placeholder="Your full name"
                />
              )}
            </Field>

            <Field id="contact-email" label="Email" error={errors.email}>
              {(props) => (
                <input
                  {...props}
                  type="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  onBlur={(e) => validateField("email", e.target.value)}
                  disabled={loading}
                  autoComplete="email"
                  maxLength={255}
                  className={inputClass(Boolean(errors.email))}
                  placeholder="you@company.com"
                />
              )}
            </Field>

            <Field
              id="contact-message"
              label="Message"
              error={errors.message}
              hint={`${form.message.length}/${MESSAGE_LIMIT}`}
            >
              {(props) => (
                <textarea
                  {...props}
                  value={form.message}
                  onChange={(e) => update("message", e.target.value)}
                  onBlur={(e) => validateField("message", e.target.value)}
                  disabled={loading}
                  maxLength={MESSAGE_LIMIT}
                  rows={6}
                  className={`${inputClass(Boolean(errors.message))} resize-y`}
                  placeholder="How can we help?"
                />
              )}
            </Field>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {loading ? "Sending…" : "Send message"}
            </button>

            <div aria-live="polite" role="status">
              {status === "success" ? (
                <p className="rise-in mt-5 rounded-lg bg-accent/12 p-4 text-sm font-medium">
                  Your message has been received. We will get back to you soon.
                </p>
              ) : null}
              {status === "error" ? (
                <p className="rise-in mt-5 rounded-lg bg-destructive/10 p-4 text-sm font-medium text-destructive">
                  {errorText}
                </p>
              ) : null}
            </div>
          </form>

          <aside className="rounded-xl border border-border bg-secondary/60 p-6 sm:p-8">
            <h2 className="text-2xl font-semibold">Reach us directly</h2>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {departments.map((d) => (
                <div key={d.email}>
                  <dt className="eyebrow text-muted-foreground">{d.label}</dt>
                  <dd className="mt-1 text-sm break-words">
                    <a href={`mailto:${d.email}`} className="hover:text-accent hover:underline">
                      {d.email}
                    </a>
                  </dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 space-y-4 border-t border-border pt-6 text-sm">
              <div>
                <p className="eyebrow text-muted-foreground">Phone</p>
                <a href="tel:+918652074439" className="hover:text-accent hover:underline">
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
              rel="noreferrer noopener"
              className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-full bg-[image:var(--gradient-gold)] px-5 py-2.5 text-sm font-semibold text-primary"
            >
              <MessageCircle className="h-4 w-4" aria-hidden="true" /> Chat on WhatsApp
            </a>
          </aside>
        </div>
      </Section>
    </>
  );
}

function inputClass(hasError: boolean) {
  return `w-full rounded-md border bg-background px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:ring-2 disabled:opacity-60 ${
    hasError
      ? "border-destructive focus:border-destructive focus:ring-destructive/30"
      : "border-input focus:border-accent focus:ring-accent/30"
  }`;
}

type FieldRenderProps = {
  id: string;
  "aria-invalid": boolean;
  "aria-describedby": string | undefined;
};

function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: string;
  children: (props: FieldRenderProps) => React.ReactNode;
}) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [error ? errorId : null, hint ? hintId : null].filter(Boolean).join(" ");

  return (
    <div className="mt-5">
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      {children({
        id,
        "aria-invalid": Boolean(error),
        "aria-describedby": describedBy || undefined,
      })}
      <div className="mt-1.5 flex items-start justify-between gap-3">
        {error ? (
          <p id={errorId} className="text-xs text-destructive">
            {error}
          </p>
        ) : (
          <span />
        )}
        {hint ? (
          <p id={hintId} className="text-xs text-muted-foreground tabular-nums">
            {hint}
          </p>
        ) : null}
      </div>
    </div>
  );
}
