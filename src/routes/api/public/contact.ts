import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { WEBHOOKS } from "../../../lib/webhooks";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const CATEGORIES = [
  "General Enquiry",
  "Sales",
  "Marketing",
  "Partnership",
  "Support",
  "Careers / HR",
  "Speaking / Workshop",
] as const;

const schema = z.object({
  name: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().default(""),
  category: z.enum(CATEGORIES).optional().default("General Enquiry"),
  subject: z.string().trim().max(150).optional().default(""),
  message: z.string().trim().min(10).max(2000),
  website: z.string().max(0).optional(), // honeypot: bots fill this in
});

// Small in-memory throttle per IP to blunt automated abuse.
const hits = new Map<string, number[]>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) hits.clear();
  return recent.length > MAX_PER_WINDOW;
}

export const Route = createFileRoute("/api/public/contact")({
  server: {
    handlers: {
      OPTIONS: async () => new Response(null, { status: 204, headers: CORS }),
      POST: async ({ request }) => {
        const ip =
          request.headers.get("cf-connecting-ip") ??
          request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          "unknown";
        if (rateLimited(ip)) {
          return Response.json(
            { ok: false, error: "Too many messages from this connection. Please try again later." },
            { status: 429, headers: CORS },
          );
        }

        let raw: unknown;
        try {
          raw = await request.json();
        } catch {
          return Response.json({ ok: false, error: "Invalid request." }, { status: 400, headers: CORS });
        }

        const parsed = schema.safeParse(raw);
        if (!parsed.success) {
          return Response.json(
            { ok: false, error: parsed.error.issues[0]?.message ?? "Please check the form." },
            { status: 400, headers: CORS },
          );
        }
        const data = parsed.data;
        if (data.website) {
          // Honeypot tripped — accept silently so bots learn nothing.
          return Response.json({ ok: true }, { headers: CORS });
        }

        // 1. Forward to the n8n inbox workflow.
        let deliveredWebhook = false;
        let deliveryError: string | null = null;
        try {
          const res = await fetch(WEBHOOKS.contact, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: data.name,
              email: data.email,
              phone: data.phone,
              category: data.category,
              subject: data.subject || `${data.category} enquiry from ${data.name}`,
              message: data.message,
              to: "gitastrategy@gmail.com",
              source: "gitastrategy.in/contact",
            }),
            signal: AbortSignal.timeout(12_000),
          });
          deliveredWebhook = res.ok;
          if (!res.ok) deliveryError = `webhook ${res.status}`;
        } catch (error) {
          deliveryError = error instanceof Error ? error.message : "webhook failed";
        }

        // 2. Always persist, so no enquiry is ever lost even if the webhook is down.
        let stored = false;
        try {
          const { supabaseAdmin } = await import("../../../integrations/supabase/client.server");
          const { error } = await supabaseAdmin.from("enquiries").insert({
            name: data.name,
            email: data.email,
            phone: data.phone,
            category: data.category,
            subject: data.subject,
            message: data.message,
            source: "contact",
            delivered_webhook: deliveredWebhook,
            delivery_error: deliveryError,
            user_agent: request.headers.get("user-agent")?.slice(0, 300) ?? "",
          });
          stored = !error;
          if (error) console.error("enquiry insert failed", error);
        } catch (error) {
          console.error("enquiry insert threw", error);
        }

        if (!deliveredWebhook && !stored) {
          return Response.json(
            { ok: false, error: "We could not deliver your message. Please email gitastrategy@gmail.com." },
            { status: 502, headers: CORS },
          );
        }

        return Response.json({ ok: true, delivered: deliveredWebhook, stored }, { headers: CORS });
      },
    },
  },
});
