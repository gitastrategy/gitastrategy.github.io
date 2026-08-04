import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
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
        content: "Sanskrit shloka, translation, framework mapping, business example, manager takeaway.",
      },
      { property: "og:url", content: "/verses" },
    ],
    links: [{ rel: "canonical", href: "/verses" }],
  }),
  component: VersesPage,
});

function VersesPage() {
  const [open, setOpen] = useState<string | null>(verses[0]!.id);

  return (
    <>
      <PageHeader
        eyebrow="Core feature"
        title="Verse → Strategy Mapping"
        intro="Every card pairs a shloka with a named management framework, a real-world business situation, and one takeaway you can use on Monday."
      />
      <Section>
        <div className="grid gap-5 lg:grid-cols-2">
          {verses.map((v) => {
            const isOpen = open === v.id;
            return (
              <article
                key={v.id}
                className="rounded-xl border border-border bg-card p-7 shadow-elegant transition-shadow hover:shadow-aura"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="eyebrow text-muted-foreground">{v.ref}</p>
                    <p className="sanskrit mt-3 text-xl leading-relaxed text-primary">
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
                  onClick={() => setOpen(isOpen ? null : v.id)}
                  className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-accent"
                  aria-expanded={isOpen}
                >
                  {isOpen ? "Hide mapping" : "Show strategic mapping"}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

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
              </article>
            );
          })}
        </div>
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
