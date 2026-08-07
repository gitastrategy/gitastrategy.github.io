// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { readFileSync } from "node:fs";
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// GitHub Pages build: `STATIC_EXPORT=1 bun run build` prerenders every route to
// static HTML in dist/client and skips the server bundler.
const staticExport = process.env["STATIC_EXPORT"] === "1";

const staticRoutes = [
  "/",
  "/verses",
  "/leadership",
  "/toolkit",
  "/case-studies",
  "/quotes",
  "/about",
  "/contact",
  "/feedback",
  "/newsletter",
  "/unsubscribe",
  "/chat",
  "/articles",
  "/404",
];

// Article detail pages come from the generated LinkedIn data file.
function articleRoutes(): string[] {
  try {
    const source = readFileSync("src/data/linkedin-posts.ts", "utf8");
    return [...source.matchAll(/"slug":\s*"([^"]+)"/g)].map((m) => `/articles/${m[1]}`);
  } catch {
    return [];
  }
}

const routes = staticExport ? [...staticRoutes, ...articleRoutes()] : staticRoutes;

export default defineConfig({
  ...(staticExport ? { nitro: false as const } : {}),
  vite: { base: process.env["BASE_PATH"] ?? "/" },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    ...(staticExport
      ? {
          prerender: { enabled: true, crawlLinks: true },
          pages: routes.map((path) => ({ path, prerender: { enabled: true } })),
        }
      : {}),
  },
});
