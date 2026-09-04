// Grounds the Gita Strategy Assistant in the site's own data: verses, toolkit
// tools and case studies. A small keyword-overlap retriever keeps the prompt
// short while making answers specific instead of generic.

import { caseStudies, quotes, toolkit, verses } from "../data/gita";

type Doc = { kind: "verse" | "tool" | "case" | "quote"; title: string; text: string };

const STOP = new Set(
  "the a an and or of to in for on with how what why when is are do does i my me we our you your can should about from at as by that this it".split(
    " ",
  ),
);

function tokenize(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP.has(w));
}

let cache: Doc[] | null = null;

function corpus(): Doc[] {
  if (cache) return cache;
  const docs: Doc[] = [];
  for (const v of verses as Array<Record<string, unknown>>) {
    const ref = String(v["reference"] ?? v["verse"] ?? "");
    docs.push({
      kind: "verse",
      title: `Gita ${ref}`,
      text: [
        ref,
        v["translation"],
        v["theme"],
        v["framework"],
        v["application"],
        v["managementLesson"],
        v["insight"],
      ]
        .filter(Boolean)
        .join(" — "),
    });
  }
  for (const t of toolkit as Array<Record<string, unknown>>) {
    docs.push({
      kind: "tool",
      title: String(t["name"] ?? t["title"] ?? "Tool"),
      text: [t["name"], t["title"], t["category"], t["summary"], t["description"], t["verse"]]
        .filter(Boolean)
        .join(" — "),
    });
  }
  for (const c of caseStudies as Array<Record<string, unknown>>) {
    docs.push({
      kind: "case",
      title: String(c["title"] ?? "Case study"),
      text: [c["title"], c["category"], c["situation"], c["decision"], c["outcome"], c["lesson"], c["verse"]]
        .filter(Boolean)
        .join(" — "),
    });
  }
  for (const q of quotes as Array<Record<string, unknown>>) {
    docs.push({
      kind: "quote",
      title: String(q["reference"] ?? "Quote"),
      text: [q["text"], q["translation"], q["category"], q["application"]].filter(Boolean).join(" — "),
    });
  }
  cache = docs;
  return docs;
}

/** Returns the most relevant knowledge snippets for a question. */
export function retrieveContext(question: string, limit = 6): string {
  const q = new Set(tokenize(question));
  if (q.size === 0) return "";
  const scored = corpus()
    .map((d) => {
      const words = tokenize(d.text);
      let score = 0;
      for (const w of words) if (q.has(w)) score++;
      return { d, score: score / Math.sqrt(words.length + 1) };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  if (scored.length === 0) return "";
  return scored
    .map(({ d }) => `[${d.kind}] ${d.title}: ${d.text.slice(0, 600)}`)
    .join("\n\n");
}
