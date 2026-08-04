import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "../components/site/PageHeader";
import { posts } from "../data/gita";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Gita Strategy" },
      {
        name: "description",
        content:
          "Essays on Karma Yoga and agile management, Krishna's leadership, strategic thinking in uncertainty and emotional control.",
      },
      { property: "og:title", content: "Blog — Gita Strategy" },
      {
        property: "og:description",
        content: "Long-form writing at the intersection of Gita philosophy and management practice.",
      },
      { property: "og:url", content: "/blog" },
    ],
    links: [{ rel: "canonical", href: "/blog" }],
  }),
  component: BlogPage,
});

function BlogPage() {
  return (
    <>
      <PageHeader
        eyebrow="Writing"
        title="The Journal"
        intro="Essays for students, entrepreneurs and managers who want philosophy that survives contact with a P&L."
      />
      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {posts.map((p) => (
            <article
              key={p.slug}
              className="flex flex-col rounded-xl border border-border bg-card p-8 shadow-elegant transition-transform hover:-translate-y-1"
            >
              <div className="flex items-center gap-3">
                <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold">
                  {p.tag}
                </span>
                <span className="text-xs text-muted-foreground">{p.read} read</span>
              </div>
              <h2 className="mt-4 text-2xl font-semibold">{p.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                {p.excerpt}
              </p>
              <p className="mt-5 text-sm font-semibold text-accent">Coming soon</p>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
