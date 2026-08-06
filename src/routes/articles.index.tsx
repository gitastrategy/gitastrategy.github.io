import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader, Section } from "../components/site/PageHeader";
import { sortedLinkedInPosts } from "../data/linkedin-posts";
import { seoUrls } from "../lib/site-url";

export const Route = createFileRoute("/articles/")({
  head: () => {
    const urls = seoUrls("/articles");
    return {
      meta: [
        { title: "Articles — Gita Strategy LinkedIn Library" },
        {
          name: "description",
          content:
            "The full library of Gita Strategy LinkedIn articles on ethical leadership, Karma Yoga, decision-making and emerging strategic management.",
        },
        { property: "og:title", content: "Articles — Gita Strategy LinkedIn Library" },
        {
          property: "og:description",
          content:
            "Long-form LinkedIn articles connecting Bhagavad Gita philosophy with modern strategy practice.",
        },
        ...urls.meta,
      ],
      links: urls.links,
    };
  },
  component: ArticlesPage,
});

function ArticlesPage() {
  const posts = useMemo(() => sortedLinkedInPosts(), []);
  const categories = useMemo(
    () => ["All", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean))).sort()],
    [posts],
  );
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      if (category !== "All" && p.category !== category) return false;
      if (!q) return true;
      return `${p.title} ${p.summary} ${p.topic} ${p.trend} ${p.subCategory}`
        .toLowerCase()
        .includes(q);
    });
  }, [posts, query, category]);

  return (
    <>
      <PageHeader
        eyebrow="Article library"
        title="LinkedIn Articles"
        intro="Every published Gita Strategy article, in full — ethical leadership, Karma Yoga execution, decision psychology and emerging strategic management."
      />
      <Section>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search
              className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <label htmlFor="article-search" className="sr-only">
              Search articles
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
          <div className="flex flex-wrap gap-2">
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
        </div>

        <p aria-live="polite" className="mt-4 text-sm text-muted-foreground">
          Showing {filtered.length} of {posts.length} articles
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((post) => (
            <article
              key={post.id}
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
                  <span className="rounded-full bg-accent/15 px-3 py-1 font-semibold">
                    {post.trend || post.topic}
                  </span>
                  <span className="text-muted-foreground">{post.date}</span>
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
                  Read the full article →
                </Link>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 ? (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            No articles match that search. Try a different term or clear the filters.
          </p>
        ) : null}
      </Section>
    </>
  );
}
