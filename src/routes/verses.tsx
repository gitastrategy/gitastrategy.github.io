import { createFileRoute } from "@tanstack/react-router";
import { useId, useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { PageHeader, Section } from "../components/site/PageHeader";
import { verses } from "../data/gita";

export const Route = createFileRoute("/verses")({
  head: () => ({
    meta: [
      { title: "Verse to Strategy Mapping — Gita Strategy" },
      {
        name: "description",
        content:
          "Interactive Bhagavad Gita verse cards mapped to SWOT, Five Forces, leadership styles and decision-making under uncertainty.",
      },
      { property: "og:title", content: "Verse to Strategy Mapping — Gita Strategy" },
      {
        property: "og:description",
        content:
          "Sanskrit shloka, translation, framework mapping, business example, manager takeaway.",
      },
      { property: "og:url", content: "/verses" },
    ],
    links: [{ rel: "canonical", href: "/verses" }],
  }),
  component: VersesPage,
});

const ALL = "All frameworks";

function VersesPage() {
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [framework, setFramework] = useState<string>(ALL);
  const [openIds, setOpenIds] = useState<string[]>(() => [verses[0]!.id]);

  const frameworks = useMemo(
    () => [ALL, ...Array.from(new Set(verses.map((v) => v.framework)))],
    [],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return verses.filter((v) => {
      const matchesFramework = framework === ALL || v.framework === framework;
      if (!matchesFramework) return false;
      if (!q) return true;
      return [v.ref, v.sanskrit, v.translation, v.framework, v.mapping, v.example, v.takeaway]
        .join(" ")
        .toLowerCase()
        .includes(q);
    });
  }, [query, framework]);

  const toggle = (id: string) =>
    setOpenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const resetFilters = () => {
    setQuery("");
    setFramework(ALL);
  };

  return (
    <>
      <PageHeader
        eyebrow="Core feature"
        title="Verse → Strategy Mapping"
        intro="Every card pairs a shloka with a named management framework, a real-world business situation, and one takeaway you can use on Monday."
      />
      <Section>
        <div className="rounded-xl border border-border bg-card p-5 shadow-elegant">
          <label htmlFor={searchId} className="mb-1.5 block text-sm font-medium">
            Search verses and mappings
          </label>
          <div className="relative">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “detachment”, “Five Forces”, “pivot”…"
              className="w-full rounded-md border border-input bg-background py-2.5 pr-10 pl-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="absolute top-1/2 right-2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Filter by framework">
            {frameworks.map((f) => {
              const active = f === framework;
              return (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFramework(f)}
                  aria-pressed={active}
                  className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                    active
                      ? "border-accent bg-accent/15 text-foreground"
                      : "border-border bg-background text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {f}
                </button>
              );
            })}
          </div>
        </div>

        <p className="mt-5 text-sm text-muted-foreground" aria-live="polite">
          Showing {filtered.length} of {verses.length} verse mappings
        </p>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <h2 className="text-xl font-semibold">No verses match that search</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
              Try a broader term such as “leadership”, “ethics” or “execution”, or clear the
              filters to see every mapping.
            </p>
            <button
              type="button"
              onClick={resetFilters}
              className="mt-6 inline-flex min-h-11 items-center rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 lg:grid-cols-2">
            {filtered.map((v) => {
              const isOpen = openIds.includes(v.id);
              const panelId = `verse-panel-${v.id}`;
              return (
                <article
                  key={v.id}
                  className="rounded-xl border border-border bg-card p-6 shadow-elegant transition-shadow hover:shadow-aura sm:p-7"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="eyebrow text-muted-foreground">{v.ref}</p>
                      <p className="sanskrit mt-3 text-lg leading-relaxed break-words text-primary sm:text-xl">
                        {v.sanskrit}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-full bg-accent/15 px-3 py-1 text-[0.65rem] font-semibold tracking-wide text-accent-foreground uppercase">
                      {v.framework}
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    “{v.translation}”
                  </p>

                  <button
                    type="button"
                    onClick={() => toggle(v.id)}
                    className="mt-5 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-accent"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                  >
                    {isOpen ? "Hide mapping" : "Show strategic mapping"}
                    <ChevronDown
                      aria-hidden="true"
                      className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <div id={panelId} hidden={!isOpen}>
                    {isOpen ? (
                      <div className="rise-in mt-5 space-y-4 border-t border-border pt-5">
                        <Field label="Strategic mapping" value={v.mapping} />
                        <Field label="Business example" value={v.example} />
                        <div className="rounded-lg bg-secondary p-4">
                          <p className="eyebrow text-accent">Key takeaway</p>
                          <p className="mt-1.5 text-sm font-medium">{v.takeaway}</p>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow text-muted-foreground">{label}</p>
      <p className="mt-1.5 text-sm leading-relaxed">{value}</p>
    </div>
  );
}
