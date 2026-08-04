import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, Section } from "../components/site/PageHeader";
import { toolkit } from "../data/gita";

export const Route = createFileRoute("/toolkit")({
  head: () => ({
    meta: [
      { title: "Strategy Toolkit — Gita Strategy" },
      {
        name: "description",
        content:
          "Dharma-Adharma SWOT, Karma Yoga sprints, the detachment decision ledger and the Sthitaprajna focus frame.",
      },
      { property: "og:title", content: "Strategy Toolkit — Gita Strategy" },
      {
        property: "og:description",
        content: "Four practical frameworks inspired by the Bhagavad Gita.",
      },
      { property: "og:url", content: "/toolkit" },
    ],
    links: [{ rel: "canonical", href: "/toolkit" }],
  }),
  component: ToolkitPage,
});

function ToolkitPage() {
  const [active, setActive] = useState(0);
  const tool = toolkit[active];

  return (
    <>
      <PageHeader
        eyebrow="Interactive"
        title="Strategy Toolkit"
        intro="Frameworks rebuilt on Gita foundations — usable in a workshop, a board pack, or a Monday stand-up."
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)]">
          <div className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible">
            {toolkit.map((t, i) => (
              <button
                key={t.name}
                type="button"
                onClick={() => setActive(i)}
                className={`shrink-0 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors lg:w-full ${
                  i === active
                    ? "border-accent bg-accent/12 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>

          <article
            key={tool.name}
            className="rise-in rounded-xl border border-border bg-card p-8 shadow-elegant"
          >
            <p className="eyebrow text-accent">{tool.subtitle}</p>
            <h2 className="mt-2 text-3xl font-semibold">{tool.name}</h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{tool.body}</p>
            <ol className="mt-6 space-y-3">
              {tool.steps.map((s, i) => (
                <li key={s} className="flex gap-3 text-sm">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-gold)] text-xs font-bold text-primary">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{s}</span>
                </li>
              ))}
            </ol>
          </article>
        </div>
      </Section>
    </>
  );
}
