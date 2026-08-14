import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, Section } from "../components/site/PageHeader";
import { caseStudies, caseCategories } from "../data/gita";
import { seoUrls } from "../lib/site-url";

export const Route = createFileRoute("/case-studies")({
  head: () => {
    const urls = seoUrls("/case-studies");
    return {
      meta: [
        { title: "Case Studies — Gita Principles in Real Business Decisions" },
        {
          name: "description",
          content:
            "Business situations in leadership, strategy, ethics, change and crisis, each read through a Bhagavad Gita verse with the action taken and the practical takeaway.",
        },
        { property: "og:title", content: "Case Studies — Gita Strategy" },
        {
          property: "og:description",
          content:
            "Situation, challenge, Gita reading, action, outcome and takeaway for each business case.",
        },
        { property: "og:type", content: "website" },
        ...urls.meta,
      ],
      links: urls.links,
    };
  },
  component: CaseStudiesPage,
});

const ALL = "All";

function CaseStudiesPage() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>(ALL);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return caseStudies.filter((c) => {
      if (category !== ALL && c.category !== category) return false;
      if (!q) return true;
      return `${c.title} ${c.situation} ${c.challenge} ${c.lens} ${c.verse} ${c.reading} ${c.action} ${c.outcome} ${c.takeaway}`
        .toLowerCase()
        .includes(q);
    });
  }, [query, category]);

  return (
    <>
      <PageHeader
        eyebrow="Applied"
        title="Case Studies"
        intro="Composite situations from startups, corporates and factories — each with the challenge, the Gita reading, the action taken and the lesson you can reuse."
      />
      <Section>
        <div className="rounded-xl border border-border bg-card p-5 shadow-elegant">
          <label htmlFor="case-search" className="mb-1.5 block text-sm font-medium">
            Search case studies
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id="case-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “pivot”, “merger”, “pricing”…"
              className="min-h-11 w-full rounded-md border border-input bg-background py-2.5 pr-4 pl-9 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter case studies">
            {[ALL, ...caseCategories].map((c) => (
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
          Showing {filtered.length} of {caseStudies.length} case studies
        </p>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <h2 className="text-xl font-semibold">No case studies match that search</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Try a broader term such as “leadership” or “ethics”, or clear the filters.
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
          <div className="mt-6 space-y-6">
            {filtered.map((c) => (
              <article
                key={c.id}
                className="grid gap-6 rounded-xl border border-border bg-card p-6 shadow-elegant sm:p-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                      {c.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{c.verse}</span>
                  </div>
                  <h2 className="mt-3 font-display text-2xl font-semibold">{c.title}</h2>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.situation}</p>
                  <div className="mt-4">
                    <p className="eyebrow text-muted-foreground">The challenge</p>
                    <p className="mt-1.5 text-sm leading-relaxed">{c.challenge}</p>
                  </div>
                  <p className="mt-4 inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold">
                    {c.lens}
                  </p>
                </div>
                <div className="space-y-4 border-border md:border-l md:pl-6">
                  <div>
                    <p className="eyebrow text-muted-foreground">Gita reading</p>
                    <p className="mt-1.5 text-sm leading-relaxed">{c.reading}</p>
                  </div>
                  <div>
                    <p className="eyebrow text-muted-foreground">Action taken</p>
                    <p className="mt-1.5 text-sm leading-relaxed">{c.action}</p>
                  </div>
                  <div className="rounded-lg bg-secondary p-4">
                    <p className="eyebrow text-accent">Outcome</p>
                    <p className="mt-1.5 text-sm font-medium">{c.outcome}</p>
                  </div>
                  <div className="rounded-lg border border-dashed border-border p-4">
                    <p className="eyebrow text-accent">Key takeaway</p>
                    <p className="mt-1.5 text-sm font-medium">{c.takeaway}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}
