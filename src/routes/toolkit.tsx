import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Search } from "lucide-react";
import { PageHeader, Section } from "../components/site/PageHeader";
import { toolkit, toolCategories } from "../data/gita";
import { seoUrls } from "../lib/site-url";

export const Route = createFileRoute("/toolkit")({
  head: () => {
    const urls = seoUrls("/toolkit");
    return {
      meta: [
        { title: "Strategy Toolkit — Gita-Based Management Frameworks" },
        {
          name: "description",
          content:
            "Practical Gita-based frameworks for strategy, leadership, decision-making, execution and ethics — what each tool is, when to use it, and how to run it.",
        },
        { property: "og:title", content: "Strategy Toolkit — Gita Strategy" },
        {
          property: "og:description",
          content:
            "Dharma–Adharma SWOT, Karma Yoga sprints, the Detachment Decision Ledger, the Guna Culture Scan and more.",
        },
        { property: "og:type", content: "website" },
        ...urls.meta,
      ],
      links: urls.links,
    };
  },
  component: ToolkitPage,
});

const ALL = "All";

function ToolkitPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);
  const [activeId, setActiveId] = useState(toolkit[0]!.id);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return toolkit.filter((t) => {
      if (category !== ALL && t.category !== category) return false;
      if (!q) return true;
      return `${t.name} ${t.subtitle} ${t.what} ${t.when} ${t.body} ${t.verse} ${t.example} ${t.steps.join(" ")}`
        .toLowerCase()
        .includes(q);
    });
  }, [query, category]);

  const active = filtered.find((t) => t.id === activeId) ?? filtered[0];
  const activeIndex = active ? filtered.findIndex((t) => t.id === active.id) : -1;

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"];
    if (!keys.includes(e.key) || filtered.length === 0) return;
    e.preventDefault();
    const last = filtered.length - 1;
    let next = activeIndex;
    if (e.key === "ArrowRight" || e.key === "ArrowDown") next = activeIndex === last ? 0 : activeIndex + 1;
    if (e.key === "ArrowLeft" || e.key === "ArrowUp") next = activeIndex <= 0 ? last : activeIndex - 1;
    if (e.key === "Home") next = 0;
    if (e.key === "End") next = last;
    setActiveId(filtered[next]!.id);
    tabRefs.current[next]?.focus();
  }

  return (
    <>
      <PageHeader
        eyebrow="Interactive"
        title="Strategy Toolkit"
        intro="Frameworks rebuilt on Gita foundations — each one states what it is, when to use it, how to run it, and the verse it stands on."
      />
      <Section>
        <div className="rounded-xl border border-border bg-card p-5 shadow-elegant">
          <label htmlFor="toolkit-search" className="mb-1.5 block text-sm font-medium">
            Search the toolkit
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="toolkit-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “pricing”, “culture”, “kill criteria”…"
              className="min-h-11 w-full rounded-md border border-input bg-background py-2.5 pr-4 pl-9 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter tools by category">
            {[ALL, ...toolCategories].map((c) => (
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
          Showing {filtered.length} of {toolkit.length} tools
        </p>

        {!active ? (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <h2 className="text-xl font-semibold">No tools match that search</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Try a broader term, or clear the filters to see the full toolkit.
            </p>
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
          <div className="mt-6 grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
            <div
              role="tablist"
              aria-label="Strategy frameworks"
              aria-orientation="vertical"
              onKeyDown={onKeyDown}
              className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
            >
              {filtered.map((t, i) => {
                const selected = t.id === active.id;
                return (
                  <button
                    key={t.id}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    type="button"
                    role="tab"
                    id={`toolkit-tab-${t.id}`}
                    aria-selected={selected}
                    aria-controls="toolkit-panel"
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setActiveId(t.id)}
                    className={`min-h-11 shrink-0 rounded-lg border px-4 py-3 text-left text-sm font-medium transition-colors lg:w-full ${
                      selected
                        ? "border-accent bg-accent/12 text-foreground"
                        : "border-border bg-card text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <span className="block">{t.name}</span>
                    <span className="mt-0.5 block text-[0.7rem] font-semibold tracking-wide text-muted-foreground uppercase">
                      {t.category}
                    </span>
                  </button>
                );
              })}
            </div>

            <article
              key={active.id}
              id="toolkit-panel"
              role="tabpanel"
              aria-labelledby={`toolkit-tab-${active.id}`}
              tabIndex={0}
              className="rise-in rounded-xl border border-border bg-card p-6 shadow-elegant sm:p-8"
            >
              <p className="eyebrow text-accent">{active.subtitle}</p>
              <h2 className="mt-2 text-2xl font-semibold sm:text-3xl">{active.name}</h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-border p-4">
                  <p className="eyebrow text-muted-foreground">What it is</p>
                  <p className="mt-1.5 text-sm leading-relaxed">{active.what}</p>
                </div>
                <div className="rounded-lg border border-border p-4">
                  <p className="eyebrow text-muted-foreground">When to use it</p>
                  <p className="mt-1.5 text-sm leading-relaxed">{active.when}</p>
                </div>
              </div>

              <p className="mt-5 text-sm leading-relaxed text-muted-foreground">{active.body}</p>

              <p className="eyebrow mt-6 text-muted-foreground">How to run it</p>
              <ol className="mt-3 space-y-3">
                {active.steps.map((s, i) => (
                  <li key={s} className="flex gap-3 text-sm">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[image:var(--gradient-gold)] text-xs font-bold text-primary">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{s}</span>
                  </li>
                ))}
              </ol>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg bg-secondary p-4">
                  <p className="eyebrow text-accent">Gita anchor</p>
                  <p className="mt-1.5 text-sm font-medium">{active.verse}</p>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <p className="eyebrow text-accent">In practice</p>
                  <p className="mt-1.5 text-sm font-medium">{active.example}</p>
                </div>
              </div>
            </article>
          </div>
        )}
      </Section>
    </>
  );
}
