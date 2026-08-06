import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "../components/site/PageHeader";
import { KrishnaAssistant } from "../components/site/KrishnaAssistant";
import { seoUrls } from "../lib/site-url";

export const Route = createFileRoute("/krishna")({
  head: () => {
    const urls = seoUrls("/krishna");
    return {
      meta: [
        { title: "AI Krishna Assistant — Ask the Gita About Your Work" },
        {
          name: "description",
          content:
            "Talk or type to the AI Krishna assistant and get Bhagavad Gita guidance translated into practical strategy, leadership and decision-making advice.",
        },
        { property: "og:title", content: "AI Krishna Assistant — Gita Strategy" },
        {
          property: "og:description",
          content: "A voice and text assistant that answers work dilemmas through the Bhagavad Gita.",
        },
        ...urls.meta,
      ],
      links: urls.links,
    };
  },
  component: KrishnaPage,
});

function KrishnaPage() {
  return (
    <>
      <PageHeader
        eyebrow="AI Krishna"
        title="Counsel for the battlefield of work"
        intro="Speak or type your dilemma. Every answer is anchored in a Gita verse and ends with one action you can take this week."
      />
      <Section className="max-w-3xl">
        <KrishnaAssistant />
        <div className="mt-6 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
          <p>
            <strong className="text-foreground">Voice:</strong> tap Speak to dictate your question,
            and Voice on to hear the reply read aloud. Both use your browser&rsquo;s built-in speech
            support.
          </p>
          <p>
            <strong className="text-foreground">Note:</strong> this is a study aid, not spiritual,
            legal, medical or financial advice. Conversations are not stored.
          </p>
        </div>
      </Section>
    </>
  );
}
