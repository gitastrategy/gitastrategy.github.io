// Shared, environment-agnostic CSV helpers for the Google Sheet content pipeline.
// Used by the browser live-sync and by the server-side scheduled sync.

export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else quoted = false;
      } else field += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") {
      row.push(field);
      field = "";
    } else if (c === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (c !== "\r") field += c as string;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim()));
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);

/** Milliseconds for a sheet date label such as `12-Apr-2026`. 0 when unparseable. */
export function dateMs(label: string): number {
  const t = Date.parse(String(label ?? "").replace(/-/g, " "));
  return Number.isNaN(t) ? 0 : t;
}

export type SheetPost = {
  id: string;
  slug: string;
  date: string;
  title: string;
  category: string;
  subCategory: string;
  topic: string;
  trend: string;
  summary: string;
  content: string;
  imageUrl: string;
  urn: string;
};

const pick = (row: Record<string, string>, ...names: string[]) => {
  for (const n of names) if (row[n]) return row[n] as string;
  return "";
};

/** Maps the Gita Strategy article sheet (see docs/ARTICLE_SHEET_TEMPLATE.md) to posts. */
export function sheetCsvToPosts(csv: string): SheetPost[] {
  const rows = parseCsv(csv);
  const header = (rows.shift() ?? []).map((h) => h.trim());
  const records = rows.map((r) => {
    const o: Record<string, string> = {};
    header.forEach((h, i) => (o[h] = (r[i] ?? "").trim()));
    return o;
  });

  const seen = new Set<string>();
  return records
    .filter((r) => pick(r, "Title"))
    .filter((r) => {
      const status = pick(r, "Status", "Publish").toLowerCase();
      return status === "" || status === "published" || status === "yes" || status === "true";
    })
    .map((r) => {
      const title = pick(r, "Title");
      const base = pick(r, "Slug") || slugify(title) || "post";
      let slug = base;
      let n = 2;
      while (seen.has(slug)) slug = `${base}-${n++}`;
      seen.add(slug);
      return {
        id: pick(r, "PostId", "Id") || slug,
        slug,
        date: pick(r, "Date"),
        title,
        category: pick(r, "Category"),
        subCategory: pick(r, "SubCategory", "Sub Category"),
        topic: pick(r, "Topic"),
        trend: pick(r, "Trend"),
        summary: pick(r, "Summary"),
        content: pick(r, "Content", "Article", "Body"),
        imageUrl: pick(r, "ImageUrl", "Image"),
        urn: pick(r, "LinkedInPostURN", "URN"),
      } satisfies SheetPost;
    });
}
