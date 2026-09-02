// Live Google Sheet sync for the Article/Blog library.
//
// The build-time script (scripts/sync-content.mjs) bakes a snapshot into
// src/data/linkedin-posts.ts so the site is fast and works offline. This module
// refreshes that snapshot in the browser on every visit, so articles added or
// edited in the sheet appear without a rebuild or any manual website update.

import { useEffect, useState } from "react";
import { allPosts, type ContentPost } from "../data/content";
import type { LinkedInPost } from "../data/linkedin-posts";

const SHEET_ID =
  (import.meta.env["VITE_ARTICLES_SHEET_ID"] as string | undefined) ??
  "1bYXRX8aThHDZdj0kslXDK-EdzR2-KjXJq4c880Q6Pkg";
const SHEET_GID = (import.meta.env["VITE_ARTICLES_GID"] as string | undefined) ?? "0";

const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&gid=${SHEET_GID}`;
const CACHE_KEY = "gs:articles:v1";
const CACHE_TTL_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 12_000;

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c as string;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim()));
}

const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

const pick = (row: Record<string, string>, ...names: string[]) => {
  for (const n of names) if (row[n]) return row[n] as string;
  return "";
};

function toPosts(csv: string): LinkedInPost[] {
  const rows = parseCsv(csv);
  const header = (rows.shift() ?? []).map((h) => h.trim());
  const records = rows.map((r) => {
    const o: Record<string, string> = {};
    header.forEach((h, i) => (o[h] = (r[i] ?? "").trim()));
    return o;
  });

  const seen = new Set<string>();
  return records
    .filter((r) => pick(r, "Title"))
    .map((r) => {
      const title = pick(r, "Title");
      let slug = slugify(title) || "post";
      let n = 2;
      while (seen.has(slug)) slug = `${slugify(title)}-${n++}`;
      seen.add(slug);
      return {
        id: pick(r, "PostId", "Id") || slug,
        slug,
        date: pick(r, "Date"),
        title,
        category: pick(r, "Category"),
        subCategory: pick(r, "SubCategory", "Sub Category"),
        topic: pick(r, "Topic"),
        trend: pick(r, "Trend"),
        summary: pick(r, "Summary"),
        content: pick(r, "Content", "Article", "Body"),
        imageUrl: pick(r, "ImageUrl", "Image"),
        urn: pick(r, "LinkedInPostURN", "URN"),
      } satisfies LinkedInPost;
    });
}

function time(date: string): number {
  const t = Date.parse(date.replace(/-/g, " "));
  return Number.isNaN(t) ? 0 : t;
}

/** Merges freshly fetched sheet articles over the built-in snapshot. */
export function mergePosts(live: LinkedInPost[]): ContentPost[] {
  const base = allPosts();
  const blogs = base.filter((p) => p.kind === "blog");
  const bySlug = new Map<string, ContentPost>();
  for (const p of base.filter((p) => p.kind === "article")) bySlug.set(p.slug, p);
  for (const p of live) bySlug.set(p.slug, { ...p, kind: "article" });
  return [...bySlug.values(), ...blogs].sort((a, b) => time(b.date) - time(a.date));
}

function readCache(): LinkedInPost[] | null {
  try {
    const raw = window.sessionStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { at: number; posts: LinkedInPost[] };
    if (!parsed?.at || Date.now() - parsed.at > CACHE_TTL_MS) return null;
    return Array.isArray(parsed.posts) ? parsed.posts : null;
  } catch {
    return null;
  }
}

function writeCache(posts: LinkedInPost[]) {
  try {
    window.sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), posts }));
  } catch {
    /* storage may be unavailable */
  }
}

export async function fetchLivePosts(signal?: AbortSignal): Promise<LinkedInPost[]> {
  const cached = readCache();
  if (cached) return cached;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  signal?.addEventListener("abort", () => controller.abort(), { once: true });
  try {
    const res = await fetch(CSV_URL, { signal: controller.signal, redirect: "follow" });
    if (!res.ok) throw new Error(`Sheet responded ${res.status}`);
    const posts = toPosts(await res.text());
    if (posts.length === 0) throw new Error("Sheet returned no articles");
    writeCache(posts);
    return posts;
  } finally {
    clearTimeout(timer);
  }
}

export type LivePostsState = {
  posts: ContentPost[];
  status: "loading" | "live" | "cached-fallback";
  refresh: () => void;
};

/**
 * Returns the article library, starting from the built-in snapshot and
 * upgrading to the live sheet as soon as it arrives. Never blocks rendering
 * and silently keeps the snapshot if the sheet is unreachable.
 */
export function useLivePosts(): LivePostsState {
  const [posts, setPosts] = useState<ContentPost[]>(() => allPosts());
  const [status, setStatus] = useState<LivePostsState["status"]>("loading");
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();
    setStatus("loading");
    fetchLivePosts(controller.signal)
      .then((live) => {
        if (cancelled) return;
        setPosts(mergePosts(live));
        setStatus("live");
      })
      .catch(() => {
        if (!cancelled) setStatus("cached-fallback");
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [nonce]);

  return { posts, status, refresh: () => setNonce((n) => n + 1) };
}
