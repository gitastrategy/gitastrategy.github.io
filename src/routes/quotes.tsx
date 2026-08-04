import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { PageHeader, Section } from "../components/site/PageHeader";
import { quotes } from "../data/gita";

export const Route = createFileRoute("/quotes")({
  head: () => ({
    meta: [
      { title: "Gita Quotes with Management Insight — Gita Strategy" },
      {
        name: "description",
        content:
          "Rotating Bhagavad Gita quotes, each paired with a practical management insight for leaders and students.",
      },
      { property: "og:title", content: "Gita Quotes with Management Insight" },
      {
        property: "og:description",
        content: "Verses and the management lesson each one carries.",
      },
      { property: "og:url", content: "/quotes" },
    ],
    links: [{ rel: "canonical", href: "/quotes" }],
  }),
  component: QuotesPage,
});

const ROTATE_MS = 7000;

function QuotesPage() {
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [paused, setPaused] = useState(false);

  // Respect the user's reduced-motion preference: no auto-rotation.
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setPlaying(!media.matches);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!playing || paused) return;
    const timer = window.setInterval(
      () => setIndex((v) => (v + 1) % quotes.length),
      ROTATE_MS,
    );
    return () => window.clearInterval(timer);
  }, [playing, paused]);

  const go = useCallback((delta: number) => {
    setIndex((v) => (v + delta + quotes.length) % quotes.length);
  }, []);

  const quote = quotes[index]!;

  return (
    <>
      <PageHeader
        eyebrow="Reflection"
        title="Quotes & Insight"
        intro="A verse, its translation, and the management principle it encodes."
      />
      <Section>
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
          className="rounded-2xl border border-border bg-card p-6 text-center shadow-elegant sm:p-12 lg:p-16"
        >
          <div aria-live="polite" aria-atomic="true">
            <p
              key={quote.sanskrit}
              className="sanskrit rise-in text-xl leading-relaxed break-words text-primary sm:text-3xl lg:text-4xl"
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

            <div className="flex gap-2" role="tablist" aria-label="Select quote">
              {quotes.map((item, idx) => (
                <button
                  key={item.sanskrit}
                  type="button"
                  role="tab"
                  aria-selected={idx === index}
                  aria-label={`Quote ${idx + 1} of ${quotes.length}`}
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
          {quotes.map((item, idx) => (
            <article
              key={item.translation}
              className={`rounded-xl border bg-card p-6 transition-colors ${
                idx === index ? "border-accent" : "border-border"
              }`}
            >
              <p className="sanskrit text-lg break-words text-primary">{item.sanskrit}</p>
              <p className="mt-3 text-sm text-muted-foreground">{item.translation}</p>
              <p className="mt-4 text-sm font-medium">{item.insight}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
