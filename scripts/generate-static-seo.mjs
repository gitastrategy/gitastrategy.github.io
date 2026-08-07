// Generates dist/client/sitemap.xml and dist/client/robots.txt after a static
// build so both always match the routes and article slugs that were emitted.
//
//   SITE_URL=https://gitastrategy.in BASE_PATH=/ node scripts/generate-static-seo.mjs
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const SITE_URL = (process.env.SITE_URL || "https://gitastrategy.in").replace(/\/+$/, "");
const rawBase = process.env.BASE_PATH || "/";
const BASE = (rawBase.startsWith("/") ? rawBase : `/${rawBase}`).replace(/\/*$/, "/");
const OUT_DIR = process.env.OUT_DIR || "dist/client";

const staticRoutes = [
  ["/", "1.0"],
  ["/verses", "0.9"],
  ["/articles", "0.9"],
  ["/chat", "0.8"],
  ["/leadership", "0.8"],
  ["/toolkit", "0.8"],
  ["/case-studies", "0.8"],
  ["/quotes", "0.7"],
  ["/about", "0.6"],
  ["/contact", "0.6"],
  ["/feedback", "0.6"],
  ["/newsletter", "0.6"],
];

function articleSlugs() {
  const files = ["src/data/linkedin-posts.ts", "src/data/blog-posts.ts"];
  const slugs = [];
  for (const file of files) {
    if (!existsSync(file)) continue;
    const source = readFileSync(file, "utf8");
    for (const m of source.matchAll(/slug:\s*"([^"]+)"|"slug":\s*"([^"]+)"/g)) {
      slugs.push(m[1] || m[2]);
    }
  }
  return [...new Set(slugs)];
}

const url = (path) => `${SITE_URL}${BASE}${path.replace(/^\/+/, "")}`;

const entries = [
  ...staticRoutes.map(([path, priority]) => ({ loc: url(path), priority })),
  ...articleSlugs().map((slug) => ({ loc: url(`/articles/${slug}`), priority: "0.7" })),
];

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...entries.map((e) => `  <url><loc>${e.loc}</loc><priority>${e.priority}</priority></url>`),
  "</urlset>",
].join("\n");

const robots = [
  "User-agent: Googlebot",
  "Allow: /",
  "",
  "User-agent: Bingbot",
  "Allow: /",
  "",
  "User-agent: Twitterbot",
  "Allow: /",
  "",
  "User-agent: facebookexternalhit",
  "Allow: /",
  "",
  "User-agent: *",
  "Allow: /",
  "Disallow: /unsubscribe",
  "",
  `Sitemap: ${SITE_URL}${BASE}sitemap.xml`,
  "",
].join("\n");

writeFileSync(join(OUT_DIR, "sitemap.xml"), `${sitemap}\n`);
writeFileSync(join(OUT_DIR, "robots.txt"), robots);
console.log(`Wrote ${entries.length} sitemap URLs and robots.txt to ${OUT_DIR}`);
