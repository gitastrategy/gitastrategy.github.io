// Base-path aware URL helpers.
//
// GitHub Pages can serve the app from a subpath (e.g. /gitastrategy/). Vite's
// `base` is exposed as import.meta.env.BASE_URL and the router uses it as its
// basepath, so <Link to="/verses"> already resolves correctly. These helpers
// cover the places the router does NOT touch: canonical links, og:url, raw
// <a href>/asset URLs and generated SEO files.

export const SITE_ORIGIN = "https://gitastrategy.in";

/** Vite base, always normalised to a leading and trailing slash ("/" or "/repo/"). */
export function basePath(): string {
  const raw = import.meta.env.BASE_URL || "/";
  const withLeading = raw.startsWith("/") ? raw : `/${raw}`;
  return withLeading.endsWith("/") ? withLeading : `${withLeading}/`;
}

/** Prefixes an app path with the deployment base path: "/verses" -> "/repo/verses". */
export function withBase(path: string): string {
  const base = basePath();
  if (!path || path === "/") return base;
  return `${base}${path.replace(/^\/+/, "")}`;
}

/** Absolute canonical URL for a route path, respecting the base path. */
export function absoluteUrl(path: string): string {
  return `${SITE_ORIGIN}${withBase(path)}`;
}

/** Standard head() entries (canonical + og:url) for a route. */
export function seoUrls(path: string) {
  const url = absoluteUrl(path);
  return {
    meta: [{ property: "og:url", content: url }],
    links: [{ rel: "canonical", href: url }],
  };
}
