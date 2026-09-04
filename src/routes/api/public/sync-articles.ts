import { createFileRoute } from "@tanstack/react-router";
import { articlesCsvUrl } from "../../../lib/sheet";
import { dateMs, sheetCsvToPosts } from "../../../lib/csv";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, x-sync-key",
};

// Idempotent, input-free job: it only ever pulls the fixed Gita Strategy sheet.
// A short cooldown keeps repeated calls from hammering Google or the database.
const COOLDOWN_MS = 30_000;
let lastRunAt = 0;

async function sync() {
  const res = await fetch(articlesCsvUrl(), { redirect: "follow" });
  if (!res.ok) throw new Error(`Sheet responded ${res.status}`);
  const posts = sheetCsvToPosts(await res.text());
  if (posts.length === 0) throw new Error("Sheet returned no rows");

  const { supabaseAdmin } = await import("../../../integrations/supabase/client.server");
  const rows = posts.map((p) => {
    const ms = dateMs(p.date);
    return {
      slug: p.slug,
      title: p.title,
      date_label: p.date,
      published_at: ms ? new Date(ms).toISOString() : null,
      category: p.category,
      sub_category: p.subCategory,
      topic: p.topic,
      trend: p.trend,
      summary: p.summary,
      content: p.content,
      image_url: p.imageUrl,
      urn: p.urn,
      kind: "article",
      status: "published",
      source_id: p.id,
    };
  });

  const { error } = await supabaseAdmin.from("articles").upsert(rows, { onConflict: "slug" });
  if (error) throw new Error(error.message);
  return rows.length;
}

async function run() {
  const key = process.env["CONTENT_SYNC_SECRET"];
  const now = Date.now();
  if (now - lastRunAt < COOLDOWN_MS) {
    return Response.json({ ok: true, skipped: "cooldown" }, { headers: CORS });
  }
  lastRunAt = now;
  try {
    const synced = await sync();
    return Response.json({ ok: true, synced, keyed: Boolean(key) }, { headers: CORS });
  } catch (error) {
    console.error("article sync failed", error);
    return Response.json({ ok: false, error: "Sync failed." }, { status: 502, headers: CORS });
  }
}

/** Pulls the Google Sheet into the database. Called by the scheduled job. */
export const Route = createFileRoute("/api/public/sync-articles")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () => run(),
      POST: async () => run(),
    },
  },
});
