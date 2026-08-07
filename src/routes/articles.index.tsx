import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, Section } from "../components/site/PageHeader";
import { allPosts, readingTime } from "../data/content";
import { seoUrls } from "../lib/site-url";

export const Route = createFileRoute("/articles/")({
  head: () => {
    const urls = seoUrls("/articles");
    return {
      meta: [
        { title: "Articles & Blog — Gita Strategy Library" },
        {
          name: "description",
          content:
            "Every Gita Strategy article and blog essay: ethical leadership, Karma Yoga execution, decision-making under uncertainty and emerging strategic management.",
        },
        { property: "og:title", content: "Articles & Blog — Gita Strategy Library" },
        {
          property: "og:description",
          content:
            "Long-form writing connecting Bhagavad Gita philosophy with modern strategy practice.",
        },
        { property: "og:type", content: "website" },
        ...urls.meta,
      ],
      links: urls.links,
    };
  },
  component: ArticlesPage,
});

const TYPES = [
  { id: "all", label: "All" },
  { id: "article", label: "Articles" },
  { id: "blog", label: "Blog" },
] as const;

function ArticlesPage() {
  const posts = useMemo(() => allPosts(), []);
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean))).sort()],
    [posts],
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [type, setType] = useState<(typeof TYPES)[number]["id"]>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (type !== "all" && p.kind !== type) return false;
      if (category !== "All" && p.category !== category) return false;
      if (!q) return true;
      return `${p.title} ${p.summary} ${p.topic} ${p.trend} ${p.subCategory}`
        .toLowerCase()
        .includes(q);
    });
  }, [posts, query, category, type]);

  return (
    <>
      <PageHeader
        eyebrow="Article / Blog"
        title="Articles & Blog"
        intro="Published LinkedIn articles and original essays in one library — ethical leadership, Karma Yoga execution, decision psychology and emerging strategic management."
      />
      <Section>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <label htmlFor="article-search" className="sr-only">
              Search articles and blog posts
            </label>
            <input
              id="article-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title, theme or trend"
              className="min-h-11 w-full rounded-full border border-input bg-background py-2.5 pr-4 pl-9 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/30"
            />
          </div>
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by content type">
            {TYPES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                aria-pressed={type === t.id}
                className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                  type === t.id
                    ? "border-transparent bg-accent text-accent-foreground"
                    : "border-border bg-background text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
              className={`rounded-full border px-3.5 py-2 text-xs font-semibold transition-colors ${
                category === c
                  ? "border-transparent bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <p aria-live="polite" className="mt-4 text-sm text-muted-foreground">
          Showing {filtered.length} of {posts.length} pieces
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <article
              key={post.slug}
              className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-elegant transition-transform hover:-translate-y-1"
            >
              {post.imageUrl ? (
                <img
                  src={post.imageUrl}
                  alt=""
                  loading="lazy"
                  width={640}
                  height={280}
                  className="h-40 w-full object-cover"
                />
              ) : null}
              <div className="flex flex-1 flex-col p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span
                    className={`rounded-full px-3 py-1 font-semibold ${
                      post.kind === "blog" ? "bg-primary/10 text-primary" : "bg-accent/15"
                    }`}
                  >
                    {post.kind === "blog" ? "Blog" : "Article"}
                  </span>
                  <span className="text-muted-foreground">{post.date}</span>
                  <span className="text-muted-foreground">· {readingTime(post)}</span>
                </div>
                <h2 className="mt-3 font-display text-xl leading-snug font-semibold">
                  <Link
                    to="/articles/$slug"
                    params={{ slug: post.slug }}
                    className="hover:text-accent"
                  >
                    {post.title}
                  </Link>
                </h2>
                <p className="mt-3 line-clamp-4 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {post.summary}
                </p>
                <Link
                  to="/articles/$slug"
                  params={{ slug: post.slug }}
                  className="mt-5 text-sm font-semibold text-accent hover:underline"
                >
                  Read in full →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            Nothing matches that search. Try a different term or clear the filters.
          </p>
        ) : null}
      </Section>
    </>
  );
}
