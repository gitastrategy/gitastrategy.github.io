import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, ChevronLeft, ChevronRight, Copy, Pause, Play, Search } from "lucide-react";
import { PageHeader, Section } from "../components/site/PageHeader";
import { quotes, quoteCategories } from "../data/gita";
import { seoUrls } from "../lib/site-url";

export const Route = createFileRoute("/quotes")({
  head: () => {
    const urls = seoUrls("/quotes");
    return {
      meta: [
        { title: "Bhagavad Gita Quotes with Management Insight — Gita Strategy" },
        {
          name: "description",
          content:
            "Bhagavad Gita quotes with chapter and verse references, accurate translations and a practical leadership or management takeaway for each line.",
        },
        { property: "og:title", content: "Gita Quotes with Management Insight" },
        {
          property: "og:description",
          content: "Search and filter verses by leadership, strategy, focus, ethics and more.",
        },
        { property: "og:type", content: "website" },
        ...urls.meta,
      ],
      links: urls.links,
    };
  },
  component: QuotesPage,
});

const ROTATE_MS = 7000;
const ALL = "All";

function QuotesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [paused, setPaused] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return quotes.filter((item) => {
      if (category !== ALL && item.category !== category) return false;
      if (!q) return true;
      return `${item.translation} ${item.sanskrit} ${item.ref} ${item.category} ${item.insight}`
        .toLowerCase()
        .includes(q);
    });
  }, [query, category]);

  // Keep the carousel index valid whenever the filtered set changes.
  useEffect(() => {
    setIndex(0);
  }, [query, category]);

  // Respect the user's reduced-motion preference: no auto-rotation.
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPlaying(!media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!playing || paused || filtered.length < 2) return;
    const timer = window.setInterval(() => setIndex((v) => (v + 1) % filtered.length), ROTATE_MS);
    return () => window.clearInterval(timer);
  }, [playing, paused, filtered.length]);

  const go = useCallback(
    (delta: number) => {
      setIndex((v) => (v + delta + filtered.length) % filtered.length);
    },
    [filtered.length],
  );

  const copy = useCallback(async (id: string, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      window.setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 2000);
    } catch {
      /* clipboard may be blocked; the text stays selectable on the page */
    }
  }, []);

  const quote = filtered[Math.min(index, Math.max(filtered.length - 1, 0))];

  return (
    <>
      <PageHeader
        eyebrow="Reflection"
        title="Quotes & Insight"
        intro="A verse, its reference, an accurate translation, and the management principle it encodes."
      />
      <Section>
        <div className="rounded-xl border border-border bg-card p-5 shadow-elegant">
          <label htmlFor="quote-search" className="mb-1.5 block text-sm font-medium">
            Search quotes
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="quote-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “action”, “Chapter 2”, “culture”…"
              className="min-h-11 w-full rounded-md border border-input bg-background py-2.5 pr-4 pl-9 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter quotes by category">
            {[ALL, ...quoteCategories].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  category === c
                    ? "border-accent bg-accent/15 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <p className="mt-5 text-sm text-muted-foreground" aria-live="polite">
          Showing {filtered.length} of {quotes.length} quotes
        </p>

        {!quote ? (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <h2 className="text-xl font-semibold">No quotes match that search</h2>
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setCategory(ALL);
              }}
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div
              role="region"
              aria-roledescription="carousel"
              aria-label="Rotating Bhagavad Gita quotes"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onFocusCapture={() => setPaused(true)}
              onBlurCapture={() => setPaused(false)}
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft") {
                  e.preventDefault();
                  go(-1);
                } else if (e.key === "ArrowRight") {
                  e.preventDefault();
                  go(1);
                }
              }}
              className="mt-6 rounded-2xl border border-border bg-card p-6 text-center shadow-elegant sm:p-12 lg:p-16"
            >
              <div aria-live="polite" aria-atomic="true">
                <p className="eyebrow text-muted-foreground">
                  {quote.ref} · {quote.category}
                </p>
                <p
                  key={quote.id}
                  className="sanskrit rise-in mt-4 text-xl leading-relaxed break-words text-primary sm:text-3xl lg:text-4xl"
                >
                  {quote.sanskrit}
                </p>
                <p className="mt-6 text-base sm:text-lg">“{quote.translation}”</p>
                <div className="mx-auto mt-8 max-w-xl rounded-lg bg-secondary p-5">
                  <p className="eyebrow text-accent">Management insight</p>
                  <p className="mt-2 text-sm font-medium">{quote.insight}</p>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
                <button
                  type="button"
                  aria-label="Previous quote"
                  onClick={() => go(-1)}
                  className="grid h-11 w-11 place-items-center rounded-full border border-border transition-colors hover:bg-secondary"
                >
                  <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                </button>

                <div className="flex flex-wrap justify-center gap-2" role="group" aria-label="Select quote">
                  {filtered.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      aria-current={idx === index}
                      aria-label={`Quote ${idx + 1} of ${filtered.length}`}
                      onClick={() => setIndex(idx)}
                      className="grid h-11 w-6 place-items-center"
                    >
                      <span
                        className={`block h-1.5 rounded-full transition-all ${
                          idx === index ? "w-7 bg-accent" : "w-1.5 bg-border"
                        }`}
                      />
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  aria-label="Next quote"
                  onClick={() => go(1)}
                  className="grid h-11 w-11 place-items-center rounded-full border border-border transition-colors hover:bg-secondary"
                >
                  <ChevronRight className="h-4 w-4" aria-hidden="true" />
                </button>

                <button
                  type="button"
                  onClick={() => setPlaying((v) => !v)}
                  aria-pressed={playing}
                  className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
                >
                  {playing ? (
                    <Pause className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Play className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  {playing ? "Pause rotation" : "Play rotation"}
                </button>
              </div>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {filtered.map((item, idx) => (
                <article
                  key={item.id}
                  className={`flex flex-col rounded-xl border bg-card p-6 transition-colors ${
                    idx === index ? "border-accent" : "border-border"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
                      {item.category}
                    </span>
                    <span className="text-muted-foreground">{item.ref}</span>
                  </div>
                  <p className="sanskrit mt-4 text-lg break-words text-primary">{item.sanskrit}</p>
                  <p className="mt-3 text-sm text-muted-foreground">“{item.translation}”</p>
                  <p className="mt-4 flex-1 text-sm font-medium">{item.insight}</p>
                  <button
                    type="button"
                    onClick={() =>
                      copy(item.id, `“${item.translation}” — Bhagavad Gita, ${item.ref}`)
                    }
                    className="mt-5 inline-flex min-h-11 items-center gap-2 self-start text-xs font-semibold text-accent hover:underline"
                  >
                    {copiedId === item.id ? (
                      <Check className="h-3.5 w-3.5" aria-hidden="true" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                    )}
                    {copiedId === item.id ? "Copied" : "Copy quote"}
                  </button>
                </article>
              ))}
            </div>
          </>
        )}
      </Section>
    </>
  );
}
