// Live content pipeline for the Article/Blog library.
//
// Priority order in the browser:
//   1. The Cloud database feed (/api/public/articles) — updated by the scheduled
//      Google Sheet sync, so a new sheet row publishes without a rebuild.
//   2. The Google Sheet CSV directly, if the API is unreachable (static hosts).
//   3. The snapshot baked into src/data at build time.

import { useEffect, useState } from "react";
import { allPosts, type ContentPost } from "../data/content";
import type { LinkedInPost } from "../data/linkedin-posts";
import { dateMs, sheetCsvToPosts } from "./csv";
import { articlesCsvUrl } from "./sheet";
import { withBase } from "./site-url";

const CACHE_KEY = "gs:articles:v2";
const CACHE_TTL_MS = 5 * 60 * 1000;
const TIMEOUT_MS = 12_000;

/** Same-origin on Lovable/localhost, otherwise the hosted API. */
function apiUrl(path: string): string {
  const override = import.meta.env["VITE_API_BASE_URL"] as string | undefined;
  if (override) return `${override.replace(/\/$/, "")}${path}`;
  if (typeof window === "undefined") return withBase(path);
  const host = window.location.hostname;
  const sameOrigin =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com");
  return sameOrigin ? withBase(path) : `https://gitastrategy.lovable.app${path}`;
}

/** Merges freshly fetched articles over the built-in snapshot. */
export function mergePosts(live: LinkedInPost[]): ContentPost[] {
  const base = allPosts();
  const blogs = base.filter((p) => p.kind === "blog");
  const bySlug = new Map<string, ContentPost>();
  for (const p of base.filter((p) => p.kind === "article")) bySlug.set(p.slug, p);
  for (const p of live) bySlug.set(p.slug, { ...p, kind: "article" });
  return [...bySlug.values(), ...blogs].sort((a, b) => dateMs(b.date) - dateMs(a.date));
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

async function fromDatabase(signal: AbortSignal): Promise<LinkedInPost[]> {
  const res = await fetch(apiUrl("/api/public/articles"), { signal });
  if (!res.ok) throw new Error(`API responded ${res.status}`);
  const body = (await res.json()) as { posts?: LinkedInPost[] };
  const posts = body.posts ?? [];
  if (posts.length === 0) throw new Error("API returned no articles");
  return posts;
}

async function fromSheet(signal: AbortSignal): Promise<LinkedInPost[]> {
  const res = await fetch(articlesCsvUrl(), { signal, redirect: "follow" });
  if (!res.ok) throw new Error(`Sheet responded ${res.status}`);
  const posts = sheetCsvToPosts(await res.text());
  if (posts.length === 0) throw new Error("Sheet returned no articles");
  return posts;
}

export async function fetchLivePosts(signal?: AbortSignal): Promise<LinkedInPost[]> {
  const cached = readCache();
  if (cached) return cached;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  signal?.addEventListener("abort", () => controller.abort(), { once: true });
  try {
    let posts: LinkedInPost[];
    try {
      posts = await fromDatabase(controller.signal);
    } catch {
      posts = await fromSheet(controller.signal);
    }
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
 * upgrading to live content as soon as it arrives. Never blocks rendering and
 * silently keeps the snapshot if every source is unreachable.
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
