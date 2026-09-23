import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ExternalLink, Loader2, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { clearIntegrationSettingsCache, type IntegrationSetting } from "@/lib/settings-client";

export const Route = createFileRoute("/_authenticated/admin/settings")({
  head: () => ({
    meta: [
      { title: "Integration settings — Gita Strategy admin" },
      { name: "robots", content: "noindex, nofollow" },
      { name: "description", content: "Private admin area for managing integration links." },
      { property: "og:title", content: "Integration settings — Gita Strategy admin" },
      { property: "og:description", content: "Private admin area for managing integration links." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: AdminSettingsPage,
});

type Row = IntegrationSetting & { dirty?: boolean; saving?: boolean };

const EMPTY_NEW = { key: "", label: "", method: "POST", url: "", description: "", kind: "webhook" };

function AdminSettingsPage() {
  const navigate = useNavigate();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [email, setEmail] = useState("");
  const [draft, setDraft] = useState(EMPTY_NEW);
  const [adding, setAdding] = useState(false);
  const [claiming, setClaiming] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    setEmail(userData.user?.email ?? "");
    const { data: adminData } = await supabase.rpc("has_role", {
      _user_id: userData.user?.id ?? "",
      _role: "admin",
    });
    setIsAdmin(Boolean(adminData));

    const { data, error } = await supabase
      .from("integration_settings")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) toast.error("Could not load settings", { description: error.message });
    setRows((data ?? []) as Row[]);
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  function patch(id: string, changes: Partial<Row>) {
    setRows((current) => current.map((r) => (r.id === id ? { ...r, ...changes, dirty: true } : r)));
  }

  async function save(row: Row) {
    if (!row.url.trim()) {
      toast.error("Add a link before saving");
      return;
    }
    setRows((c) => c.map((r) => (r.id === row.id ? { ...r, saving: true } : r)));
    const { error } = await supabase
      .from("integration_settings")
      .update({
        label: row.label,
        description: row.description,
        method: row.method,
        url: row.url.trim(),
        enabled: row.enabled,
        sort_order: row.sort_order,
      })
      .eq("id", row.id);
    setRows((c) => c.map((r) => (r.id === row.id ? { ...r, saving: false, dirty: Boolean(error) } : r)));
    if (error) {
      toast.error("Save failed", { description: error.message });
      return;
    }
    clearIntegrationSettingsCache();
    toast.success("Saved", { description: `${row.label || row.key} is now live.` });
  }

  async function remove(row: Row) {
    if (!window.confirm(`Remove "${row.label || row.key}"? The built-in link will be used instead.`)) return;
    const { error } = await supabase.from("integration_settings").delete().eq("id", row.id);
    if (error) {
      toast.error("Could not remove", { description: error.message });
      return;
    }
    clearIntegrationSettingsCache();
    setRows((c) => c.filter((r) => r.id !== row.id));
    toast.success("Removed");
  }

  async function add() {
    if (!draft.key.trim() || !draft.url.trim()) {
      toast.error("A name and a link are required");
      return;
    }
    setAdding(true);
    const { data, error } = await supabase
      .from("integration_settings")
      .insert({
        key: draft.key.trim(),
        label: draft.label.trim() || draft.key.trim(),
        description: draft.description.trim(),
        method: draft.method,
        url: draft.url.trim(),
        kind: draft.kind,
        sort_order: (rows.at(-1)?.sort_order ?? 0) + 10,
      })
      .select()
      .single();
    setAdding(false);
    if (error || !data) {
      toast.error("Could not add", { description: error?.message ?? "Unknown error" });
      return;
    }
    clearIntegrationSettingsCache();
    setRows((c) => [...c, data as Row]);
    setDraft(EMPTY_NEW);
    toast.success("Added");
  }

  async function claimAdmin() {
    setClaiming(true);
    const { data, error } = await supabase.rpc("claim_first_admin");
    setClaiming(false);
    if (error) {
      toast.error("Could not grant access", { description: error.message });
      return;
    }
    if (data) {
      toast.success("Admin access granted");
      void load();
    } else {
      toast.error("An administrator already exists. Ask them to add your account.");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth" });
  }

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Backend configuration
            </p>
            <h1 className="mt-1 text-3xl font-semibold">Integration settings</h1>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Every webhook and alternative link the site uses, in one place. Saving applies
              immediately. This page is private and is not linked anywhere on the website.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => void load()}
              className="inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-medium hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4" aria-hidden="true" /> Refresh
            </button>
            <button
              type="button"
              onClick={() => void signOut()}
              className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm font-medium hover:bg-muted"
            >
              Sign out
            </button>
          </div>
        </header>

        {email ? (
          <p className="mt-4 text-xs text-muted-foreground">Signed in as {email}</p>
        ) : null}

        {isAdmin === false ? (
          <div className="mt-6 rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">This account is not an administrator</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              You can view the links, but you cannot change them. If you are the first person
              setting this up, claim administrator access below.
            </p>
            <button
              type="button"
              onClick={() => void claimAdmin()}
              disabled={claiming}
              className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-full bg-[image:var(--gradient-gold)] px-6 text-sm font-semibold text-primary disabled:opacity-60"
            >
              {claiming ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              Claim administrator access
            </button>
          </div>
        ) : null}

        {loading ? (
          <p className="mt-10 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading…
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {rows.map((row) => (
              <section key={row.id} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">{row.label || row.key}</h2>
                    <p className="text-xs text-muted-foreground">Reference name: {row.key}</p>
                  </div>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={row.enabled}
                      disabled={!isAdmin}
                      onChange={(e) => patch(row.id, { enabled: e.target.checked })}
                      className="h-4 w-4"
                    />
                    In use
                  </label>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-[7rem_1fr]">
                  <div>
                    <label htmlFor={`m-${row.id}`} className="mb-1.5 block text-sm font-medium">
                      Method
                    </label>
                    <select
                      id={`m-${row.id}`}
                      value={row.method}
                      disabled={!isAdmin}
                      onChange={(e) => patch(row.id, { method: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor={`u-${row.id}`} className="mb-1.5 block text-sm font-medium">
                      Link
                    </label>
                    <input
                      id={`u-${row.id}`}
                      type="url"
                      value={row.url}
                      disabled={!isAdmin}
                      onChange={(e) => patch(row.id, { url: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 font-mono text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-3">
                  <label htmlFor={`d-${row.id}`} className="mb-1.5 block text-sm font-medium">
                    Notes
                  </label>
                  <input
                    id={`d-${row.id}`}
                    type="text"
                    value={row.description}
                    disabled={!isAdmin}
                    onChange={(e) => patch(row.id, { description: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => void save(row)}
                    disabled={!isAdmin || !row.dirty || row.saving}
                    className="inline-flex min-h-10 items-center gap-2 rounded-full bg-[image:var(--gradient-gold)] px-5 text-sm font-semibold text-primary disabled:opacity-50"
                  >
                    {row.saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <Save className="h-4 w-4" aria-hidden="true" />
                    )}
                    Save
                  </button>
                  <a
                    href={row.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm text-accent underline-offset-4 hover:underline"
                  >
                    Open link <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => void remove(row)}
                    disabled={!isAdmin}
                    className="ml-auto inline-flex items-center gap-1.5 text-sm text-destructive underline-offset-4 hover:underline disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" aria-hidden="true" /> Remove
                  </button>
                </div>
              </section>
            ))}

            {isAdmin ? (
              <section className="rounded-xl border border-dashed border-border bg-card/50 p-5">
                <h2 className="text-lg font-semibold">Add another link</h2>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="new-key" className="mb-1.5 block text-sm font-medium">
                      Reference name
                    </label>
                    <input
                      id="new-key"
                      value={draft.key}
                      onChange={(e) => setDraft({ ...draft, key: e.target.value })}
                      placeholder="e.g. eventsWebhook"
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-label" className="mb-1.5 block text-sm font-medium">
                      Display name
                    </label>
                    <input
                      id="new-label"
                      value={draft.label}
                      onChange={(e) => setDraft({ ...draft, label: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="new-method" className="mb-1.5 block text-sm font-medium">
                      Method
                    </label>
                    <select
                      id="new-method"
                      value={draft.method}
                      onChange={(e) => setDraft({ ...draft, method: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                    >
                      <option value="GET">GET</option>
                      <option value="POST">POST</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="new-kind" className="mb-1.5 block text-sm font-medium">
                      Type
                    </label>
                    <select
                      id="new-kind"
                      value={draft.kind}
                      onChange={(e) => setDraft({ ...draft, kind: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 text-sm"
                    >
                      <option value="webhook">Webhook</option>
                      <option value="link">Alternative / fallback link</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="new-url" className="mb-1.5 block text-sm font-medium">
                      Link
                    </label>
                    <input
                      id="new-url"
                      type="url"
                      value={draft.url}
                      onChange={(e) => setDraft({ ...draft, url: e.target.value })}
                      placeholder="https://…"
                      className="w-full rounded-md border border-input bg-background px-3 py-2.5 font-mono text-xs sm:text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => void add()}
                  disabled={adding}
                  className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold hover:bg-muted disabled:opacity-60"
                >
                  {adding ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Plus className="h-4 w-4" aria-hidden="true" />
                  )}
                  Add link
                </button>
              </section>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
