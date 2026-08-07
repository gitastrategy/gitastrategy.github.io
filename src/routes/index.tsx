import { createFileRoute, Link } from "@tanstack/react-router";
import { trackCta } from "../lib/analytics";
import { ArrowRight, Compass, Scale, Sparkles } from "lucide-react";
import heroImage from "../assets/hero-kurukshetra.jpg";
import { verses, quotes } from "../data/gita";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Gita Strategy — Ancient Wisdom, Modern Strategy" },
      {
        name: "description",
        content:
          "Bhagavad Gita verses mapped to SWOT, Porter's Five Forces, leadership styles and decision-making under uncertainty.",
      },
      { property: "og:title", content: "Gita Strategy — Ancient Wisdom, Modern Strategy" },
      {
        property: "og:description",
        content:
          "A premium, academic guide connecting the Bhagavad Gita with modern strategic management.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

const pillars = [
  {
    icon: Compass,
    title: "Verse → Strategy",
    body: "Each shloka mapped to a named framework, a business example and a manager's takeaway.",
    to: "/verses",
  },
  {
    icon: Scale,
    title: "Ethical leadership",
    body: "Dharma as a decision filter applied before options are ranked, never as a trade-off after.",
    to: "/leadership",
  },
  {
    icon: Sparkles,
    title: "Working toolkit",
    body: "Four practical frameworks — SWOT reframed, Karma Yoga sprints, decision ledgers, focus frames.",
    to: "/toolkit",
  },
] as const;

function Home() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <img
          src={heroImage}
          alt="Silhouette of Krishna and Arjuna's chariot on the Kurukshetra battlefield at dawn"
          width={1920}
          height={1088}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-[image:var(--gradient-dusk)] opacity-80" />
        <div className="relative mx-auto max-w-4xl px-5 py-28 text-center text-[oklch(0.97_0.01_85)] sm:py-36">
          <p className="eyebrow rise-in text-[var(--gold)]">
            Ancient Wisdom · Modern Strategy · Timeless Leadership
          </p>
          <p className="sanskrit rise-in mt-8 text-2xl leading-relaxed text-[var(--gold)] sm:text-4xl">
            Karmanye vadhikaraste ma phaleshu kadachana
          </p>
          <h1 className="rise-in mt-6 text-4xl font-semibold sm:text-6xl">
            The Bhagavad Gita for Modern Strategic Management
          </h1>
          <p className="rise-in mx-auto mt-6 max-w-2xl text-base opacity-85 sm:text-lg">
            Leadership, decision-making, ethics and execution — read through eighteen chapters
            of the oldest strategy dialogue ever recorded.
          </p>
          <div className="rise-in mt-10 flex flex-wrap justify-center gap-3">
            <Link
              to="/verses"
              onClick={trackCta("Explore Verses", "home_hero")}
              className="inline-flex items-center gap-2 rounded-full bg-[image:var(--gradient-gold)] px-6 py-3 text-sm font-semibold text-[oklch(0.2_0.05_265)] shadow-aura"
            >
              Explore Verses <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/toolkit"
              onClick={trackCta("Learn Strategy Mapping", "home_hero")}
              className="inline-flex items-center gap-2 rounded-full border border-current/40 px-6 py-3 text-sm font-medium"
            >
              Learn Strategy Mapping
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="grid gap-6 md:grid-cols-3">
          {pillars.map(({ icon: Icon, ...p }) => (
            <Link
              key={p.title}
              to={p.to}
              className="group rounded-xl border border-border bg-card p-7 shadow-elegant transition-transform hover:-translate-y-1"
            >
              <Icon className="h-6 w-6 text-accent" />
              <h2 className="mt-4 text-2xl font-semibold">{p.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent">
                Continue <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-secondary/60">
        <div className="mx-auto max-w-6xl px-5 py-20">
          <p className="eyebrow text-accent">Featured mappings</p>
          <h2 className="mt-3 text-3xl font-semibold sm:text-4xl">
            Where the shloka meets the strategy deck
          </h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {verses.slice(0, 4).map((v) => (
              <article key={v.id} className="rounded-xl border border-border bg-card p-7">
                <p className="eyebrow text-muted-foreground">{v.ref}</p>
                <p className="sanskrit mt-3 text-lg text-primary">{v.sanskrit}</p>
                <p className="mt-3 text-sm text-muted-foreground">{v.translation}</p>
                <p className="mt-5 inline-block rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent-foreground">
                  {v.framework}
                </p>
              </article>
            ))}
          </div>
          <Link
            to="/verses"
            className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-accent"
          >
            See all verse mappings <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-5 py-20 text-center">
        <p className="eyebrow text-accent">Daily reflection</p>
        <p className="sanskrit mt-6 text-2xl text-primary sm:text-3xl">{quotes[1]!.sanskrit}</p>
        <p className="mt-4 text-lg">{quotes[1]!.translation}</p>
        <p className="mt-3 text-sm text-muted-foreground">{quotes[1]!.insight}</p>
        <Link
          to="/quotes"
          className="mt-8 inline-flex rounded-full border border-border px-5 py-2.5 text-sm font-medium"
        >
          Rotating quotes
        </Link>
      </section>
    </>
  );
}
