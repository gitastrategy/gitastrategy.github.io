import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "../components/site/PageHeader";
import { caseStudies } from "../data/gita";

export const Route = createFileRoute("/case-studies")({
  head: () => ({
    meta: [
      { title: "Case Studies — Gita Strategy" },
      {
        name: "description",
        content:
          "Modern business situations read through Gita philosophy: startup attachment, ethical dilemmas and high-pressure leadership calls.",
      },
      { property: "og:title", content: "Case Studies — Gita Strategy" },
      {
        property: "og:description",
        content: "Three business situations interpreted through the Bhagavad Gita.",
      },
      { property: "og:url", content: "/case-studies" },
    ],
    links: [{ rel: "canonical", href: "/case-studies" }],
  }),
  component: CaseStudiesPage,
});

function CaseStudiesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Applied"
        title="Case Studies"
        intro="Composite situations from startups, corporates and factories — each resolved with a Gita reading rather than a slogan."
      />
      <Section>
        <div className="space-y-6">
          {caseStudies.map((c) => (
            <article
              key={c.title}
              className="grid gap-6 rounded-xl border border-border bg-card p-8 shadow-elegant md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"
            >
              <div>
                <h2 className="text-2xl font-semibold">{c.title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{c.situation}</p>
                <p className="mt-4 inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold">
                  {c.lens}
                </p>
              </div>
              <div className="space-y-4 border-border md:border-l md:pl-6">
                <div>
                  <p className="eyebrow text-muted-foreground">Gita reading</p>
                  <p className="mt-1.5 text-sm leading-relaxed">{c.reading}</p>
                </div>
                <div className="rounded-lg bg-secondary p-4">
                  <p className="eyebrow text-accent">Outcome</p>
                  <p className="mt-1.5 text-sm font-medium">{c.outcome}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
