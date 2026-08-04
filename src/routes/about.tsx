import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "../components/site/PageHeader";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Gita Strategy" },
      {
        name: "description",
        content:
          "Why we merge ancient Indian philosophy with modern management, who this is for, and our vision of ethical strategic leadership.",
      },
      { property: "og:title", content: "About — Gita Strategy" },
      {
        property: "og:description",
        content: "Purpose, audience and vision behind Gita Strategy.",
      },
      { property: "og:url", content: "/about" },
    ],
    links: [{ rel: "canonical", href: "/about" }],
  }),
  component: AboutPage,
});

const blocks = [
  {
    title: "Purpose",
    body: "Management education is rich in frameworks and thin in philosophy. The Bhagavad Gita is the opposite: a complete theory of action, duty and detachment delivered under maximum pressure. Gita Strategy holds both in the same frame — every verse we publish is paired with a named management concept, not a vague inspiration.",
  },
  {
    title: "Audience",
    body: "Management students who want a distinctive analytical lens; entrepreneurs deciding under real uncertainty; and managers who have discovered that the hardest problems in leadership are ethical and emotional before they are analytical.",
  },
  {
    title: "Vision",
    body: "Leadership that is simultaneously strategic and ethical — where dharma is a filter applied before options are ranked, and excellence is measured by the quality of action rather than the luck of the outcome.",
  },
];

function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About"
        title="Ancient philosophy, working management"
        intro="A study platform for people who refuse to choose between rigour and meaning."
      />
      <Section className="max-w-3xl">
        <div className="space-y-12">
          {blocks.map((b) => (
            <div key={b.title}>
              <p className="eyebrow text-accent">{b.title}</p>
              <h2 className="mt-2 text-3xl font-semibold">{b.title}</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground">{b.body}</p>
            </div>
          ))}
          <blockquote className="sanskrit rounded-xl border-l-2 border-accent bg-secondary p-8 text-xl text-primary">
            योगः कर्मसु कौशलम् — Yoga is skill in action.
          </blockquote>
        </div>
      </Section>
    </>
  );
}
