// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

const routes = [
  "/",
  "/verses",
  "/leadership",
  "/toolkit",
  "/case-studies",
  "/quotes",
  "/blog",
  "/about",
  "/contact",
  "/newsletter",
];

export default defineConfig({
  nitro: false,
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
    // Emit static HTML for every route so the build can be hosted on GitHub Pages.
    prerender: { enabled: true, crawlLinks: true },
    pages: routes.map((path) => ({ path, prerender: { enabled: true } })),
  },
});

