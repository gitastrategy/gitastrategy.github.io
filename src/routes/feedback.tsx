import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "../components/site/PageHeader";
import { FeedbackForm } from "../components/site/FeedbackForm";
import { seoUrls } from "../lib/site-url";

export const Route = createFileRoute("/feedback")({
  head: () => {
    const urls = seoUrls("/feedback");
    return {
      meta: [
        { title: "Share Your Feedback — Gita Strategy" },
        {
          name: "description",
          content:
            "Tell us what is working and what is missing on Gita Strategy. Share feedback on verses, frameworks, case studies and the newsletter.",
        },
        { property: "og:title", content: "Share Your Feedback — Gita Strategy" },
        {
          property: "og:description",
          content: "A two-minute feedback form for readers, students and managers.",
        },
        { property: "og:type", content: "website" },
        ...urls.meta,
      ],
      links: urls.links,
    };
  },
  component: FeedbackPage,
});

function FeedbackPage() {
  return (
    <>
      <PageHeader
        eyebrow="Feedback"
        title="Tell us what to improve"
        intro="Two minutes of your time shapes the next verse mapping, framework and case study. Every message is read."
      />
      <Section className="max-w-3xl">
        <div className="rounded-xl border border-border bg-card p-6 shadow-elegant sm:p-8">
          <FeedbackForm />
        </div>
      </Section>
    </>
  );
}
