import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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

function QuotesPage() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setI((v) => (v + 1) % quotes.length), 7000);
    return () => clearInterval(t);
  }, []);

  const q = quotes[i]!;

  return (
    <>
      <PageHeader
        eyebrow="Reflection"
        title="Quotes & Insight"
        intro="A verse, its translation, and the management principle it encodes."
      />
      <Section>
        <div className="rounded-2xl border border-border bg-card p-10 text-center shadow-elegant sm:p-16">
          <p key={q.sanskrit} className="sanskrit rise-in text-2xl leading-relaxed text-primary sm:text-4xl">
            {q.sanskrit}
          </p>
          <p className="mt-6 text-lg">“{q.translation}”</p>
          <div className="mx-auto mt-8 max-w-xl rounded-lg bg-secondary p-5">
            <p className="eyebrow text-accent">Management insight</p>
            <p className="mt-2 text-sm font-medium">{q.insight}</p>
          </div>
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              type="button"
              aria-label="Previous quote"
              onClick={() => setI((v) => (v - 1 + quotes.length) % quotes.length)}
              className="grid h-10 w-10 place-items-center rounded-full border border-border"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="flex gap-2">
              {quotes.map((item, idx) => (
                <button
                  key={item.sanskrit}
                  type="button"
                  aria-label={`Go to quote ${idx + 1}`}
                  onClick={() => setI(idx)}
                  className={`h-1.5 rounded-full transition-all ${
                    idx === i ? "w-7 bg-accent" : "w-1.5 bg-border"
                  }`}
                />
              ))}
            </div>
            <button
              type="button"
              aria-label="Next quote"
              onClick={() => setI((v) => (v + 1) % quotes.length)}
              className="grid h-10 w-10 place-items-center rounded-full border border-border"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {quotes.map((item) => (
            <article key={item.translation} className="rounded-xl border border-border bg-card p-6">
              <p className="sanskrit text-lg text-primary">{item.sanskrit}</p>
              <p className="mt-3 text-sm text-muted-foreground">{item.translation}</p>
              <p className="mt-4 text-sm font-medium">{item.insight}</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
