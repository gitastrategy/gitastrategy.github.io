# Gita Strategy

**Bhagavad Gita for Modern Strategic Management** — verse-to-strategy mappings, leadership lessons, a practical toolkit, case studies, quotes, blog, contact and newsletter management.

- Stack: TanStack Start (React 19) + Vite 7 + Tailwind CSS v4
- Design tokens: `src/styles.css` (deep indigo, saffron, gold, ivory)
- Content: `src/data/gita.ts`
- Routes: `src/routes/*` (`/`, `/verses`, `/leadership`, `/toolkit`, `/case-studies`, `/quotes`, `/blog`, `/about`, `/contact`, `/newsletter`)

## Integrations

| Form | Method | Endpoint |
| --- | --- | --- |
| Contact | POST (JSON: `name`, `email`, `message`) | `https://yesorat.app.n8n.cloud/webhook/contact-us` |
| Newsletter | GET (`?email=…&action=subscribe\|unsubscribe`) | `https://yesorat.app.n8n.cloud/webhook/GitaStrategyNewsletter` |

Both are called directly from the browser — no server credentials required, so the build stays fully static-friendly.

## Local development

```bash
bun install
bun run dev      # http://localhost:8080
bun run build    # production build
```

## Deploying to GitHub Pages (`github.com/gitastrategy`)

The app has no runtime server dependency (all data is local, all form posts go to n8n webhooks), so it can be published as a static site.

1. **Base path.** If the site is served from a project subpath (`https://gitastrategy.github.io/<repo>/`), set the Vite base before building:

   ```ts
   // vite.config.ts
   export default defineConfig({
     base: process.env.BASE_PATH ?? "/",
     // …existing plugins
   });
   ```

   Serving from a user/organization page (`https://gitastrategy.github.io/`) or a custom domain needs no change — keep `base: "/"`.

2. **SPA fallback.** GitHub Pages has no server rewrite, so copy the built `index.html` to `404.html` in the publish step (included below) to make deep links such as `/verses` work on refresh.

3. **GitHub Actions workflow** — save as `.github/workflows/deploy.yml`:

   ```yaml
   name: Deploy to GitHub Pages
   on:
     push:
       branches: [main]
     workflow_dispatch:

   permissions:
     contents: read
     pages: write
     id-token: write

   jobs:
     build:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: oven-sh/setup-bun@v2
         - run: bun install --frozen-lockfile
         - run: bun run build
           env:
             BASE_PATH: /${{ github.event.repository.name }}/
         - name: Add SPA fallback
           run: cp dist/client/index.html dist/client/404.html
         - uses: actions/configure-pages@v5
         - uses: actions/upload-pages-artifact@v3
           with:
             path: dist/client
     deploy:
       needs: build
       runs-on: ubuntu-latest
       environment:
         name: github-pages
         url: ${{ steps.deployment.outputs.page_url }}
       steps:
         - id: deployment
           uses: actions/deploy-pages@v4
   ```

   Adjust `path:` if your build emits to a different client output directory, and set **Settings → Pages → Source** to *GitHub Actions*.

4. **Custom domain.** Add a `public/CNAME` file containing e.g. `gitastrategy.in`, and keep `base: "/"`.

## Contact

info@gitastrategy.in · +91 8652074439 · Mumbai, India – 421204 · [WhatsApp](https://wa.me/918652074439)
