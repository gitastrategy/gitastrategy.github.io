// Single source of truth for every outbound n8n webhook used by the site.
// Update an endpoint here and every form picks it up.

import { withBase } from "./site-url";


export const WEBHOOKS = {
  /** Newsletter subscribe / unsubscribe — GET with ?email=&action= */
  newsletter: "https://rawaj.app.n8n.cloud/webhook/GitaStrategyNewsletter",
  /** Contact form — POST with a JSON body */
  contact: "https://rawaj.app.n8n.cloud/webhook/contact-us",
  /** Feedback form — POST with a JSON body */
  feedback: "https://kayoge6.app.n8n.cloud/webhook/feedback",
} as const;

export type NewsletterAction = "subscribe" | "unsubscribe";

/** Builds the newsletter GET URL with encoded query parameters. */
export function newsletterUrl(email: string, action: NewsletterAction): string {
  const url = new URL(WEBHOOKS.newsletter);
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
