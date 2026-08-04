import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "../components/site/PageHeader";
import { leadershipLessons, archetypes } from "../data/gita";

export const Route = createFileRoute("/leadership")({
  head: () => ({
    meta: [
      { title: "Leadership Lessons — Gita Strategy" },
      {
        name: "description",
        content:
          "Krishna as strategic leader, Arjuna as overwhelmed decision-maker: crisis leadership, emotional intelligence, ethics and duty vs outcome.",
      },
      { property: "og:title", content: "Leadership Lessons — Gita Strategy" },
      {
        property: "og:description",
        content: "Four leadership disciplines drawn from the Kurukshetra dialogue.",
      },
      { property: "og:url", content: "/leadership" },
    ],
    links: [{ rel: "canonical", href: "/leadership" }],
  }),
  component: LeadershipPage,
});

function LeadershipPage() {
  return (
    <>
      <PageHeader
        eyebrow="Leadership"
        title="Two archetypes, one battlefield"
        intro="The Gita is a leadership case study staged at the worst possible moment — the instant before an irreversible decision."
      />

      <Section>
        <div className="grid gap-6 md:grid-cols-2">
          {archetypes.map((a) => (
            <article key={a.name} className="rounded-xl border border-border bg-card p-8 shadow-elegant">
              <p className="eyebrow text-accent">{a.role}</p>
              <h2 className="mt-2 text-3xl font-semibold">{a.name}</h2>
              <ul className="mt-5 space-y-3">
                {a.traits.map((t) => (
                  <li key={t} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
                    {t}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>

      <section className="border-y border-border bg-secondary/60">
        <div className="mx-auto max-w-6xl px-5 py-16">
          <h2 className="text-3xl font-semibold">Four disciplines</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2">
            {leadershipLessons.map((l) => (
              <article key={l.title} className="rounded-xl border border-border bg-card p-7">
                <h3 className="text-2xl font-semibold">{l.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{l.body}</p>
                <p className="mt-4 rounded-lg bg-accent/10 p-3 text-sm font-medium">
                  Practice: {l.practice}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
