import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, Section } from "../components/site/PageHeader";
import { seoUrls } from "../lib/site-url";

export const Route = createFileRoute("/privacy")({
  head: () => {
    const urls = seoUrls("/privacy");
    return {
      meta: [
        { title: "Privacy Policy — Gita Strategy" },
        {
          name: "description",
          content:
            "How Gita Strategy collects, uses and protects the information you share through the newsletter, contact form, feedback form and AI assistant.",
        },
        { property: "og:title", content: "Privacy Policy — Gita Strategy" },
        {
          property: "og:description",
          content: "What data we collect, why we collect it and how you can have it removed.",
        },
        { property: "og:type", content: "website" },
        ...urls.meta,
      ],
      links: urls.links,
    };
  },
  component: PrivacyPage,
});

const sections = [
  {
    title: "What we collect",
    body: [
      "Newsletter: the email address you submit, plus the date of subscription.",
      "Contact and feedback forms: your name, email address, optional phone number, enquiry category and the message you write.",
      "Assistant: the questions you type or speak are sent to our AI provider to generate a reply. Your conversation history is stored only in your own browser and never on our servers.",
      "Basic technical data such as browser user agent, needed to prevent automated abuse.",
    ],
  },
  {
    title: "Why we use it",
    body: [
      "To answer your enquiry or feedback.",
      "To send the weekly Gita Strategy newsletter, only if you asked for it.",
      "To keep the site secure and to stop spam submissions.",
      "We never sell your data, and we never share it for advertising.",
    ],
  },
  {
    title: "Who processes it",
    body: [
      "Our hosting and database provider, which stores enquiries securely.",
      "Our workflow automation provider, which routes enquiries to gitastrategy@gmail.com.",
      "Our AI provider, which generates assistant replies. Do not include confidential information in assistant messages.",
    ],
  },
  {
    title: "How long we keep it",
    body: [
      "Newsletter subscriptions: until you unsubscribe. Every email includes an unsubscribe link, and you can unsubscribe at any time on our unsubscribe page.",
      "Enquiries and feedback: up to 24 months, so we can follow up on your request.",
    ],
  },
  {
    title: "Your rights",
    body: [
      "You can request a copy of your data, ask for corrections, or ask us to delete it entirely.",
      "Write to gitastrategy@gmail.com with the subject 'Data request' and we will respond within 30 days.",
    ],
  },
  {
    title: "Cookies",
    body: [
      "We do not use advertising or third-party tracking cookies.",
      "We use your browser's local storage only to remember your assistant conversation and interface preferences on your own device.",
    ],
  },
];

function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Legal"
        title="Privacy Policy"
        intro="Plain-language summary of what we collect, why, and how to have it removed."
      />
      <Section className="max-w-3xl">
        <p className="text-sm text-muted-foreground">Last updated: 1 January 2026</p>
        <div className="mt-10 space-y-10">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="font-display text-2xl font-semibold">{s.title}</h2>
              <ul className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
                {s.body.map((line) => (
                  <li key={line} className="border-l-2 border-border pl-4">
                    {line}
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="rounded-xl border border-border bg-secondary p-6 text-sm">
            Questions about this policy? Email{" "}
            <a className="font-semibold text-accent hover:underline" href="mailto:gitastrategy@gmail.com">
              gitastrategy@gmail.com
            </a>
            .
          </p>
        </div>
      </Section>
    </>
  );
}
