// ============= RSS feed of the article library =============
// Serves /rss.xml — latest published articles and blog posts from the live
// database, falling back to the content bundled at build time when the
// database cannot be reached (e.g. static deployment preview).

import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { allPosts, type ContentPost } from "../data/content";
import { absoluteUrl, SITE_ORIGIN } from "../lib/site-url";

const LIMIT = 30;

type FeedItem = {
  slug: string;
  title: string;
  summary: string;
  category: string;
  date: string;
  publishedAt: string | null;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RFC 822 date, falling back to "now" for rows without a usable date. */
function rfc822(item: FeedItem): string {
  const parsed = item.publishedAt ? new Date(item.publishedAt) : new Date(item.date);
  if (Number.isNaN(parsed.getTime())) return new Date().toUTCString();
  return parsed.toUTCString();
}

async function liveItems(): Promise<FeedItem[]> {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
  if (!url || !key) throw new Error("backend not configured");
  const supabase = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await supabase
    .from("articles")
    .select("slug,title,summary,category,date_label,published_at")
    .eq("status", "published")
    .order("published_at", { ascending: false, nullsFirst: false })
    .limit(LIMIT);
  if (error || !data) throw new Error("query failed");
  return (data as Array<Record<string, string | null>>).map((r) => ({
    slug: r["slug"] ?? "",
    title: r["title"] ?? "",
    summary: r["summary"] ?? "",
    category: r["category"] ?? "",
    date: r["date_label"] ?? "",
    publishedAt: r["published_at"] ?? null,
  }));
}

function staticItems(): FeedItem[] {
  const posts: ContentPost[] = [...allPosts()]
    .sort((a, b) => (b.date ?? "").localeCompare(a.date ?? ""))
    .slice(0, LIMIT);
  return posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    category: p.category,
    date: p.date,
    publishedAt: null,
  }));
}

function buildRss(items: FeedItem[]): string {
  const channelUrl = absoluteUrl("/articles");
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    "<channel>",
    `  <title>${escapeXml("Gita Strategy — Articles & Blog")}</title>`,
    `  <link>${escapeXml(channelUrl)}</link>`,
    `  <description>${escapeXml(
      "Bhagavad Gita wisdom applied to modern strategic management: leadership, decision-making, ethics and execution.",
    )}</description>`,
    `  <language>en</language>`,
    `  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    `  <atom:link href="${escapeXml(absoluteUrl("/rss.xml"))}" rel="self" type="application/rss+xml" />`,
  ];
  for (const item of items) {
    const link = absoluteUrl(`/articles/${item.slug}`);
    lines.push(
      "  <item>",
      `    <title>${escapeXml(item.title)}</title>`,
      `    <link>${escapeXml(link)}</link>`,
      `    <guid isPermaLink="true">${escapeXml(link)}</guid>`,
      `    <pubDate>${rfc822(item)}</pubDate>`,
      item.category ? `    <category>${escapeXml(item.category)}</category>` : "",
      item.summary ? `    <description>${escapeXml(item.summary.slice(0, 500))}</description>` : "",
      "  </item>",
    );
  }
  lines.push("</channel>", "</rss>");
  return lines.filter(Boolean).join("\n");
}

async function render(): Promise<Response> {
  let items: FeedItem[];
  try {
    items = await liveItems();
    if (items.length === 0) items = staticItems();
  } catch {
    items = staticItems();
  }
  return new Response(buildRss(items), {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=600",
    },
  });
}

export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: () => render(),
      HEAD: () => render(),
    },
  },
});

// SITE_ORIGIN is imported so the feed always uses the canonical domain.
export const feedSiteOrigin = SITE_ORIGIN;
