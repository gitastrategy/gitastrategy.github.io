// Single source of truth for every outbound n8n webhook used by the site.
// Update an endpoint here and every form picks it up.

export const WEBHOOKS = {
  /** Newsletter subscribe / unsubscribe — GET with ?email=&action= */
  newsletter: "https://rawaj.app.n8n.cloud/webhook/GitaStrategyNewsletter",
  /** Contact form — POST with a JSON body */
  contact: "https://rawaj.app.n8n.cloud/webhook/contact-us",
  /** Feedback form — POST with a JSON body */
  feedback: "https://jawepah.app.n8n.cloud/webhook/feedback",
} as const;

export type NewsletterAction = "subscribe" | "unsubscribe";

/** Builds the newsletter GET URL with encoded query parameters. */
export function newsletterUrl(email: string, action: NewsletterAction): string {
  const url = new URL(WEBHOOKS.newsletter);
  url.searchParams.set("email", email);
  url.searchParams.set("action", action);
  return url.toString();
}
