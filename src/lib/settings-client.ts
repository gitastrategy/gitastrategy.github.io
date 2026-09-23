// Loads the integration links saved in the admin settings area and applies
// them over the built-in defaults. Read-only and safe for anonymous visitors:
// these URLs already ship in the client bundle as defaults.

import { supabase } from "@/integrations/supabase/client";
import { setWebhookOverrides } from "./webhooks";

export type IntegrationSetting = {
  id: string;
  key: string;
  label: string;
  description: string;
  method: string;
  url: string;
  kind: string;
  enabled: boolean;
  sort_order: number;
  updated_at: string;
};

const CACHE_KEY = "gs:integration-settings:v1";
const CACHE_MS = 5 * 60 * 1000;

function applyRows(rows: Pick<IntegrationSetting, "key" | "url" | "enabled">[]): void {
  const map: Record<string, string> = {};
  for (const row of rows) if (row.enabled && row.url) map[row.key] = row.url;
  setWebhookOverrides(map);
}

/** Fetches the saved links once per session (cached) and applies them. */
export async function loadIntegrationSettings(): Promise<void> {
  if (typeof window === "undefined") return;

  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached) as { at: number; rows: IntegrationSetting[] };
      if (Date.now() - parsed.at < CACHE_MS) {
        applyRows(parsed.rows);
        return;
      }
    }
  } catch {
    /* ignore unreadable cache */
  }

  try {
    const { data, error } = await supabase
      .from("integration_settings")
      .select("key, url, enabled")
      .order("sort_order", { ascending: true });
    if (error || !data) return;
    applyRows(data);
    try {
      sessionStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), rows: data }));
    } catch {
      /* storage may be full or blocked */
    }
  } catch {
    /* offline or blocked — built-in defaults stay in effect */
  }
}

/** Clears the cache so the next load picks up freshly saved links. */
export function clearIntegrationSettingsCache(): void {
  try {
    sessionStorage.removeItem(CACHE_KEY);
  } catch {
    /* ignore */
  }
}
