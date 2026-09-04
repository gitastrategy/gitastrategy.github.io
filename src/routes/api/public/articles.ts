import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control": "public, max-age=30, s-maxage=60",
};

type Row = {
  slug: string;
  title: string;
  date_label: string;
  published_at: string | null;
  category: string;
  sub_category: string;
  topic: string;
  trend: string;
  summary: string;
  content: string;
  image_url: string;
  urn: string;
  kind: string;
  source_id: string;
};

/** Public, read-only feed of every published article/blog post. */
export const Route = createFileRoute("/api/public/articles")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      GET: async () => {
        const url = process.env["SUPABASE_URL"];
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"] ?? process.env["SUPABASE_ANON_KEY"];
        if (!url || !key) {
          return Response.json({ posts: [], error: "Backend not configured." }, { status: 500, headers: CORS });
        }

        const supabase = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) {
                h.delete("Authorization");
              }
              h.set("apikey", key);
              return fetch(input, { ...init, headers: h });
            },
          },
        });

        const { data, error } = await supabase
          .from("articles")
          .select(
            "slug,title,date_label,published_at,category,sub_category,topic,trend,summary,content,image_url,urn,kind,source_id",
          )
          .eq("status", "published")
          .order("published_at", { ascending: false, nullsFirst: false })
          .limit(500);

        if (error) {
          console.error("articles feed failed", error);
          return Response.json({ posts: [], error: "Could not load articles." }, { status: 502, headers: CORS });
        }

        const posts = ((data ?? []) as Row[]).map((r) => ({
          id: r.source_id || r.slug,
          slug: r.slug,
          date: r.date_label,
          title: r.title,
          category: r.category,
          subCategory: r.sub_category,
          topic: r.topic,
          trend: r.trend,
          summary: r.summary,
          content: r.content,
          imageUrl: r.image_url,
          urn: r.urn,
          kind: r.kind === "blog" ? "blog" : "article",
          publishedAt: r.published_at,
        }));

        return Response.json({ posts, count: posts.length }, { headers: CORS });
      },
    },
  },
});
