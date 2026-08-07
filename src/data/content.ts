import { linkedInPosts, type LinkedInPost } from "./linkedin-posts";
import { blogPosts } from "./blog-posts";

/** A post shown on the Article/Blog page: a synced LinkedIn article or a site essay. */
export type ContentPost = LinkedInPost & { kind: "article" | "blog" };

function withKind(posts: LinkedInPost[], kind: ContentPost["kind"]): ContentPost[] {
  return posts.map((p) => ({ ...p, kind }));
}

function time(date: string): number {
  const t = Date.parse(date.replace(/-/g, " "));
  return Number.isNaN(t) ? 0 : t;
}

/** All articles and blog posts, newest first. */
export function allPosts(): ContentPost[] {
  return [...withKind(linkedInPosts, "article"), ...withKind(blogPosts, "blog")].sort(
    (a, b) => time(b.date) - time(a.date),
  );
}

export function findPost(slug: string): ContentPost | undefined {
  return allPosts().find((p) => p.slug === slug);
}

/** Approximate reading time, used as a card/detail affordance. */
export function readingTime(post: ContentPost): string {
  const words = post.content.trim().split(/\s+/).length;
  return `${Math.max(1, Math.round(words / 220))} min read`;
}
