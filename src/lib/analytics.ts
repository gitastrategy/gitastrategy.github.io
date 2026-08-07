// Lightweight, dependency-free analytics dispatcher.
// Events are pushed to a global dataLayer (GTM), forwarded to gtag if present,
// and mirrored to a small in-memory buffer so nothing is lost before a tag loads.

export type AnalyticsProps = Record<string, string | number | boolean | undefined>;

type Win = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  __gsEvents?: Array<{ event: string; props: AnalyticsProps; at: string }>;
};

export function track(event: string, props: AnalyticsProps = {}): void {
  if (typeof window === "undefined") return;
  const w = window as Win;
  const payload = { event, props, at: new Date().toISOString() };

  w.__gsEvents = [...(w.__gsEvents ?? []), payload].slice(-100);

  try {
    w.dataLayer = w.dataLayer ?? [];
    w.dataLayer.push({ event, ...props });
    w.gtag?.("event", event, props);
  } catch {
    /* analytics must never break the UI */
  }

  if (import.meta.env.DEV) console.debug("[analytics]", event, props);
}

/** Click handler helper for CTAs. */
export function trackCta(label: string, location: string) {
  return () => track("cta_click", { label, location });
}
