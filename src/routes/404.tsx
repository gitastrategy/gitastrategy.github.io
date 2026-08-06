import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader, Section } from "../components/site/PageHeader";

// Dedicated static 404 page. The GitHub Pages build copies this prerendered
// route to dist/client/404.html so unmatched URLs render the full app layout.
export const Route = createFileRoute("/404")({
  head: () => ({
    meta: [
      { title: "Page not found — Gita Strategy" },
      { name: "description", content: "This page does not exist. Explore verses, frameworks, case studies and articles instead." },
      { name: "robots", content: "noindex, follow" },
    ],
  }),
  component: NotFoundPage,
});

const links = [
  { to: "/verses", label: "Verse → Strategy mappings" },
  { to: "/toolkit", label: "Strategy toolkit" },
  { to: "/articles", label: "Article library" },
  { to: "/krishna", label: "AI Krishna assistant" },
  { to: "/case-studies", label: "Case studies" },
  { to: "/contact", label: "Contact us" },
] as const;

function NotFoundPage() {
  return (
    <>
      <PageHeader
        eyebrow="404"
        title="This path does not exist"
        intro="The page you are looking for has moved or never existed. Here is where most readers go next."
      />
      <Section className="max-w-3xl">
        <ul className="grid gap-3 sm:grid-cols-2">
          {links.map((l) => (
            <li key={l.to}>
              <Link
                to={l.to}
                className="block rounded-xl border border-border bg-card p-5 text-sm font-semibold shadow-elegant transition-colors hover:border-accent"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="inline-flex min-h-11 items-center rounded-full bg-[image:var(--gradient-gold)] px-6 py-3 text-sm font-semibold text-primary"
          >
            Go home
          </Link>
        </div>
      </Section>
    </>
  );
}
