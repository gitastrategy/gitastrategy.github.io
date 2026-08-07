import { createFileRoute } from "@tanstack/react-router";
import { Chatbot } from "../components/site/Chatbot";
import { PageHeader, Section } from "../components/site/PageHeader";
import { seoUrls } from "../lib/site-url";

export const Route = createFileRoute("/chat")({
  head: () => {
    const urls = seoUrls("/chat");
    return {
      meta: [
        { title: "AI Chat — Ask the Gita About Your Work | Gita Strategy" },
        {
          name: "description",
          content:
            "Chat by text or voice with the Gita Strategy assistant and turn Bhagavad Gita teachings into practical leadership, strategy and decision-making advice.",
        },
        { property: "og:title", content: "AI Chat — Gita Strategy" },
        {
          property: "og:description",
          content: "A simple text and voice assistant that answers work dilemmas through the Gita.",
        },
        { property: "og:type", content: "website" },
        ...urls.meta,
      ],
      links: urls.links,
    };
  },
  component: ChatPage,
});

function ChatPage() {
  return (
    <>
      <PageHeader
        eyebrow="AI Chat"
        title="Counsel for the battlefield of work"
        intro="Speak or type your dilemma. Every answer is anchored in a Gita verse and ends with one action you can take this week."
      />
      <Section className="max-w-3xl">
        <div className="h-[70vh] min-h-[32rem]">
          <Chatbot />
        </div>
        <div className="mt-6 grid gap-3 text-xs text-muted-foreground sm:grid-cols-2">
          <p>
            <strong className="text-foreground">Voice:</strong> tap the mic to dictate and the
            speaker icon to hear replies read aloud, using your browser&rsquo;s built-in speech
            support.
          </p>
          <p>
            <strong className="text-foreground">History:</strong> your conversation is kept in this
            browser only and can be cleared any time with the bin icon.
          </p>
        </div>
      </Section>
    </>
  );
}
