// Client-side spam protection for the static deployment: a honeypot field,
// a minimum time-on-form check, and a per-form sliding-window rate limit.
// This is deterrence, not authentication — the n8n workflows remain the
// authority on what is accepted.

export const HONEYPOT_NAME = "company_website";

/** Visually hidden, screen-reader-hidden honeypot input props. */
export const honeypotProps = {
  type: "text" as const,
  name: HONEYPOT_NAME,
  tabIndex: -1,
  autoComplete: "off",
  "aria-hidden": true as const,
  className:
    "absolute left-[-9999px] h-px w-px overflow-hidden opacity-0 pointer-events-none",
};

/** Minimum seconds a genuine human needs before submitting. */
const MIN_FILL_MS = 2_000;

export type SpamVerdict = { ok: true } | { ok: false; reason: string };

type Limit = { max: number; windowMs: number };

const DEFAULT_LIMIT: Limit = { max: 3, windowMs: 10 * 60 * 1000 };

function key(form: string) {
  return `gs:submits:${form}`;
}

function readStamps(form: string): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key(form));
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((n): n is number => typeof n === "number") : [];
  } catch {
    return [];
  }
}

function writeStamps(form: string, stamps: number[]) {
  try {
    window.localStorage.setItem(key(form), JSON.stringify(stamps.slice(-20)));
  } catch {
    /* storage may be unavailable */
  }
}

/**
 * Runs every guard for a submission attempt.
 * `startedAt` is the timestamp captured when the form first mounted/focused.
 */
export function checkSubmission(
  form: string,
  opts: { honeypot: string; startedAt: number; limit?: Limit },
): SpamVerdict {
  if (opts.honeypot.trim().length > 0) {
    return { ok: false, reason: "This submission looks automated." };
  }
  if (Date.now() - opts.startedAt < MIN_FILL_MS) {
    return { ok: false, reason: "That was too quick — please review your details and submit again." };
  }

  const limit = opts.limit ?? DEFAULT_LIMIT;
  const now = Date.now();
  const recent = readStamps(form).filter((t) => now - t < limit.windowMs);
  if (recent.length >= limit.max) {
    const minutes = Math.max(1, Math.ceil((limit.windowMs - (now - (recent[0] ?? now))) / 60000));
    return {
      ok: false,
      reason: `You have sent several messages already. Please try again in about ${minutes} minute${minutes === 1 ? "" : "s"}.`,
    };
  }
  return { ok: true };
}

/** Record a successful submission against the rate limit. */
export function recordSubmission(form: string) {
  writeStamps(form, [...readStamps(form), Date.now()]);
}
