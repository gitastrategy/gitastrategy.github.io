// Google Sheet that powers the Article/Blog library.
// Column template: docs/ARTICLE_SHEET_TEMPLATE.md

export const ARTICLES_SHEET_ID =
  (import.meta.env["VITE_ARTICLES_SHEET_ID"] as string | undefined) ??
  "1bYXRX8aThHDZdj0kslXDK-EdzR2-KjXJq4c880Q6Pkg";

export const ARTICLES_SHEET_GID =
  (import.meta.env["VITE_ARTICLES_GID"] as string | undefined) ?? "0";

export function articlesCsvUrl(sheetId = ARTICLES_SHEET_ID, gid = ARTICLES_SHEET_GID): string {
  return `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

export const ARTICLES_SHEET_URL = `https://docs.google.com/spreadsheets/d/${ARTICLES_SHEET_ID}/edit`;
