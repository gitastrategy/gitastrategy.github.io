// Shared network helper for the n8n webhook integrations.
// Adds a request timeout, bounded retries for transient failures, and
// distinguishes user-actionable errors from transport errors.

export class WebhookError extends Error {
  readonly kind: "network" | "timeout" | "server" | "client";

  constructor(kind: WebhookError["kind"], message: string) {
    super(message);
    this.name = "WebhookError";
    this.kind = kind;
  }
}

const TIMEOUT_MS = 15_000;
const MAX_ATTEMPTS = 3;
const RETRY_BASE_MS = 600;

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export type WebhookRequest = {
  url: string;
  method?: "GET" | "POST";
  body?: unknown;
  /** External abort (e.g. component unmount) */
  signal?: AbortSignal;
};

/**
 * Sends a request to a webhook with a timeout and retry on transient failures.
 * Throws a WebhookError with a user-safe message on final failure.
 */
export async function sendWebhook({
  url,
  method = "POST",
  body,
  signal,
}: WebhookRequest): Promise<void> {
  let lastError: WebhookError = new WebhookError("network", "Request never ran.");

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    if (signal?.aborted) throw new WebhookError("network", "Request cancelled.");

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    const onExternalAbort = () => controller.abort();
    signal?.addEventListener("abort", onExternalAbort, { once: true });

    try {
      const response = await fetch(url, {
        method,
        signal: controller.signal,
        ...(body !== undefined
          ? { headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
          : {}),
      });

      if (response.ok) return;

      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        throw new WebhookError(
          "client",
          "The request was rejected. Please review your details and try again.",
        );
      }
      lastError = new WebhookError("server", "The service is temporarily unavailable.");
    } catch (error) {
      if (error instanceof WebhookError) {
        if (error.kind === "client") throw error;
        lastError = error;
      } else if (controller.signal.aborted && !signal?.aborted) {
        lastError = new WebhookError("timeout", "The request timed out.");
      } else if (signal?.aborted) {
        throw new WebhookError("network", "Request cancelled.");
      } else {
        lastError = new WebhookError("network", "We could not reach the service.");
      }
    } finally {
      clearTimeout(timer);
      signal?.removeEventListener("abort", onExternalAbort);
    }

    if (attempt < MAX_ATTEMPTS) await sleep(RETRY_BASE_MS * 2 ** (attempt - 1));
  }

  throw lastError;
}
