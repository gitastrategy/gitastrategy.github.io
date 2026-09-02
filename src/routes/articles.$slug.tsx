import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Loader2 } from "lucide-react";
import { Section } from "../components/site/PageHeader";
import { Markdown } from "../components/site/Markdown";
import { allPosts, findPost, readingTime, type ContentPost } from "../data/content";
import { absoluteUrl } from "../lib/site-url";
import { fetchLivePosts, mergePosts } from "../lib/live-content";

export const Route = createFileRoute("/articles/$slug")({
  loader: ({ params }): {
    slug: string;
    post: ContentPost | null;
    related: ContentPost[];
    prev: ContentPost | undefined;
    next: ContentPost | undefined;
  } => {
    const post = findPost(params.slug);
    if (!post) return { slug: params.slug, post: null, related: [], prev: undefined, next: undefined };
    const all = allPosts();
    const index = all.findIndex((p) => p.slug === post.slug);
    return {
      slug: params.slug,
      post,
      related: all.filter((p) => p.slug !== post.slug && p.category === post.category).slice(0, 3),
      prev: index > 0 ? all[index - 1] : undefined,
      next: index >= 0 && index < all.length - 1 ? all[index + 1] : undefined,
    };
  },
  head: ({ loaderData }) => {
    const post = loaderData?.post;
    if (!post) return {};
    const url = absoluteUrl(`/articles/${post.slug}`);
    return {
      meta: [
        { title: `${post.title.slice(0, 65)} — Gita Strategy` },
        { name: "description", content: post.summary.slice(0, 158) },
        { property: "og:title", content: post.title },
        { property: "og:description", content: post.summary.slice(0, 158) },
        { property: "og:type", content: "article" },
        { property: "og:url", content: url },
        ...(post.imageUrl
          ? [
              { property: "og:image", content: post.imageUrl },
              { name: "twitter:image", content: post.imageUrl },
            ]
          : []),
      ],
      links: [{ rel: "canonical", href: url }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: post.title,
            description: post.summary,
            datePublished: post.date,
            image: post.imageUrl || undefined,
            author: { "@type": "Organization", name: "Gita Strategy" },
            publisher: { "@type": "Organization", name: "Gita Strategy" },
            mainEntityOfPage: url,
          }),
        },
      ],
    };
  },
  component: ArticlePage,
});

function ArticlePage() {
  const data = Route.useLoaderData();
  const live = useLiveFallback(data.slug, data.post);
  if (!data.post) return live;
  return <ArticleBody post={data.post} related={data.related} prev={data.prev} next={data.next} />;
}

/**
 * Articles published to the Google Sheet after the last build have no
 * prerendered payload. Fetch the sheet in the browser and render them anyway.
 */
function useLiveFallback(slug: string, existing: ContentPost | null) {
  const [state, setState] = useState<"loading" | "missing">("loading");
  const [found, setFound] = useState<ContentPost | null>(null);

  useEffect(() => {
    if (existing) return;
    let cancelled = false;
    fetchLivePosts()
      .then((livePosts) => {
        if (cancelled) return;
        const match = mergePosts(livePosts).find((p) => p.slug === slug) ?? null;
        setFound(match);
        if (!match) setState("missing");
      })
      .catch(() => !cancelled && setState("missing"));
    return () => {
      cancelled = true;
    };
  }, [slug, existing]);

  if (existing) return null;
  if (found) return <ArticleBody post={found} related={[]} prev={undefined} next={undefined} />;
  return (
    <Section className="max-w-3xl">
      {state === "loading" ? (
        <p className="flex items-center gap-2 py-20 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading the latest
          articles…
        </p>
      ) : (
        <div className="py-20 text-center">
          <h1 className="font-display text-3xl font-semibold">Article not found</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            This piece may have been renamed or removed.
          </p>
          <Link to="/articles" className="mt-6 inline-block text-sm font-semibold text-accent hover:underline">
            Back to all articles & blog
          </Link>
        </div>
      )}
    </Section>
  );
}

function ArticleBody({
  post,
  related,
  prev,
  next,
}: {
  post: ContentPost;
  related: ContentPost[];
  prev: ContentPost | undefined;
  next: ContentPost | undefined;
}) {
  const linkedInUrl = post.urn
    ? `https://www.linkedin.com/feed/update/${post.urn}/`
    : "https://www.linkedin.com/";

  return (
    <>
      <section className="surface-dusk">
        <div className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
          <Link
            to="/articles"
            className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--gold)] hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All articles & blog
          </Link>
          <p className="eyebrow mt-6 text-[var(--gold)]">{post.trend || post.topic}</p>
          <h1 className="mt-3 text-3xl leading-tight font-semibold sm:text-4xl">{post.title}</h1>
          <p className="mt-4 text-sm opacity-80">
            {post.date} · {post.kind === "blog" ? "Blog" : "Article"} · {readingTime(post)} · {post.category}
            {post.subCategory ? ` · ${post.subCategory}` : ""}
          </p>
        </div>
      </section>

      <Section className="max-w-3xl">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt=""
            width={1200}
            height={520}
            className="mb-10 aspect-[21/9] w-full rounded-xl object-cover shadow-elegant"
          />
        ) : null}

        {post.summary ? (
          <p className="mb-10 border-l-2 border-accent pl-5 font-display text-xl leading-relaxed">
            {post.summary}
          </p>
        ) : null}

        <Markdown content={post.content} />

        <div className="mt-12 flex flex-wrap gap-3 border-t border-border pt-8">
          {post.urn ? (
          <a
            href={linkedInUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            View on LinkedIn <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
          ) : null}
          <Link
            to="/newsletter"
            className="inline-flex min-h-11 items-center rounded-full border border-border px-5 py-2.5 text-sm font-semibold"
          >
            Get these weekly
          </Link>
        </div>

        <nav className="mt-10 grid gap-4 sm:grid-cols-2" aria-label="Article navigation">
          {prev ? (
            <Link
              to="/articles/$slug"
              params={{ slug: prev.slug }}
              className="rounded-xl border border-border p-5 text-sm hover:border-accent"
            >
              <span className="text-xs text-muted-foreground">Newer article</span>
              <span className="mt-1 block font-semibold">{prev.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              to="/articles/$slug"
              params={{ slug: next.slug }}
              className="rounded-xl border border-border p-5 text-sm hover:border-accent sm:text-right"
            >
              <span className="text-xs text-muted-foreground">Older article</span>
              <span className="mt-1 block font-semibold">{next.title}</span>
            </Link>
          ) : null}
        </nav>

        {related.length > 0 ? (
          <div className="mt-12">
            <h2 className="font-display text-2xl font-semibold">Related reading</h2>
            <ul className="mt-4 space-y-3">
              {related.map((r: ContentPost) => (
                <li key={r.slug}>
                  <Link
                    to="/articles/$slug"
                    params={{ slug: r.slug }}
                    className="text-sm font-medium hover:text-accent"
                  >
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Section>
    </>
  );
}
