// Single source of truth for every outbound n8n webhook used by the site.
//
// The values below are the built-in defaults. They can be overridden at runtime
// from the admin settings area (integration_settings table) — see
// src/lib/settings-client.ts. Always read them through webhookUrl()/WEBHOOKS
// helpers so an override applies everywhere.

import { withBase } from "./site-url";

export type WebhookKey = "newsletter" | "contact" | "feedback" | "feedbackFallback";

export const WEBHOOK_DEFAULTS: Record<WebhookKey, string> = {
  /** Newsletter subscribe / unsubscribe — GET with ?email=&action= */
  newsletter: "https://vetixe.app.n8n.cloud/webhook/GitaStrategyNewsletter",
  /** Contact form — POST with a JSON body */
  contact: "https://vetixe.app.n8n.cloud/webhook/contact-us",
  /** Feedback form — POST with a JSON body */
  feedback: "https://xacade.app.n8n.cloud/webhook/feedback",
  /** Standalone hosted feedback form — fallback when the webhook is down */
  feedbackFallback: "https://xacade.app.n8n.cloud/form/cfcf4fd4-dba8-417c-ba04-19438a58409a",
};

/** Human-readable labels used by the admin settings screen. */
export const WEBHOOK_LABELS: Record<WebhookKey, { label: string; method: "GET" | "POST" }> = {
  feedback: { label: "Feedback form webhook", method: "POST" },
  feedbackFallback: { label: "Feedback fallback form", method: "GET" },
  newsletter: { label: "Newsletter webhook", method: "GET" },
  contact: { label: "Contact enquiry webhook", method: "POST" },
};

const overrides: Partial<Record<WebhookKey, string>> = {};

/** Applies runtime overrides loaded from the database. */
export function setWebhookOverrides(map: Partial<Record<string, string>>): void {
  for (const key of Object.keys(WEBHOOK_DEFAULTS) as WebhookKey[]) {
    const value = map[key]?.trim();
    if (value) overrides[key] = value;
    else delete overrides[key];
  }
}

/** Resolves a webhook URL: database override first, built-in default otherwise. */
export function webhookUrl(key: WebhookKey): string {
  return overrides[key] ?? WEBHOOK_DEFAULTS[key];
}

/**
 * Backwards-compatible accessor. Reads resolve through webhookUrl(), so any
 * override saved in the admin settings area takes effect immediately.
 */
export const WEBHOOKS = new Proxy({} as Record<WebhookKey, string>, {
  get: (_t, prop: string) => webhookUrl(prop as WebhookKey),
});

export type NewsletterAction = "subscribe" | "unsubscribe";

/** Builds the newsletter GET URL with encoded query parameters. */
export function newsletterUrl(email: string, action: NewsletterAction): string {
  const url = new URL(webhookUrl("newsletter"));
  url.searchParams.set("email", email);
  url.searchParams.set("action", action);
  return url.toString();
}

/**
 * The contact endpoint. Our own server route validates, stores and forwards the
 * enquiry, so nothing is lost if the automation workflow is down. Static hosts
 * (GitHub Pages, custom domain) have no server, so they call the hosted API.
 */
export function contactEndpoint(): string {
  const override = import.meta.env["VITE_API_BASE_URL"] as string | undefined;
  if (override) return `${override.replace(/\/$/, "")}/api/public/contact`;
  if (typeof window === "undefined") return withBase("/api/public/contact");
  const host = window.location.hostname;
  const sameOrigin =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com");
  return sameOrigin
    ? withBase("/api/public/contact")
    : "https://gitastrategy.lovable.app/api/public/contact";
}
