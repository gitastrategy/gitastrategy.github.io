# Gita Strategy

**Bhagavad Gita for Modern Strategic Management** — verse-to-strategy mappings, leadership lessons, a practical toolkit, case studies, quotes, blog, contact and newsletter management.

- Stack: TanStack Start (React 19) + Vite 7 + Tailwind CSS v4
- Design tokens: `src/styles.css` (deep indigo, saffron, gold, ivory)
- Content: `src/data/gita.ts`
- Routes: `src/routes/*` (`/`, `/verses`, `/leadership`, `/toolkit`, `/case-studies`, `/quotes`, `/blog`, `/about`, `/contact`, `/newsletter`)

## Integrations

All outbound endpoints live in `src/lib/webhooks.ts` — update them there and every form picks up the change.

| Form | Method | Endpoint |
| --- | --- | --- |
| Feedback | POST (JSON: `name`, `phone`, `email`, `feedback`, `source`, `submittedAt`) | `https://mibikef.app.n8n.cloud/webhook/feedback` |
| Newsletter | GET (`?email=…&action=subscribe\|unsubscribe`) | `https://rawaj.app.n8n.cloud/webhook/GitaStrategyNewsletter` |
| Contact | POST (JSON) to `/api/public/contact` — the server validates, stores and forwards the enquiry to the automation workflow | `https://rawaj.app.n8n.cloud/webhook/contact-us` (server-side forward) |

Feedback and newsletter are called directly from the browser; contact goes through the site's own API route so nothing is lost if the automation workflow is down.

## Local development

```bash
bun install
bun run dev      # http://localhost:8080
bun run build    # production build
```

## Deploying to GitHub Pages (`gitastrategy/gitastrategy.github.io`)

The repo now ships `.github/workflows/deploy.yml`, which prerenders all 10 routes to static HTML and publishes `dist/client`.

If you currently see the README rendered at https://gitastrategy.github.io/, GitHub Pages is still serving the repo through Jekyll. Fix it in two steps:

1. Push this repo (including `.github/workflows/deploy.yml`) to `main`.
2. In **Settings → Pages → Build and deployment → Source**, choose **GitHub Actions** (not "Deploy from a branch"), then re-run the workflow.

Build details:

- `STATIC_EXPORT=1 bun run build` turns on prerendering and writes `dist/client/index.html`, `dist/client/verses/index.html`, etc.
- `BASE_PATH` sets the Vite base. Keep `/` for `gitastrategy.github.io` or a custom domain; use `/<repo>/` for a project subpath.
- The workflow copies `index.html` to `404.html` (deep-link fallback) and adds `.nojekyll` so Jekyll never touches the output.
- Custom domain: add `public/CNAME` containing e.g. `gitastrategy.in` and keep `BASE_PATH=/`.


## Contact

info@gitastrategy.in · +91 8652074439 · Mumbai, India – 421204 · [WhatsApp](https://wa.me/918652074439)
