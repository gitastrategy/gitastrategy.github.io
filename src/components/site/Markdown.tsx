import type { ReactNode } from "react";

// Minimal, dependency-free renderer for the light markdown used in the
// LinkedIn article content (bold, italics, headings, bullet lists, hashtags).

function inline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_|"[^"]+")/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let i = 0;

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) nodes.push(text.slice(last, match.index));
    const token = match[0];
    const key = `${keyPrefix}-${i++}`;
    if (token.startsWith("**")) {
      nodes.push(
        <strong key={key} className="font-semibold text-foreground">
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith("*") || token.startsWith("_")) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>);
    } else {
      nodes.push(
        <span key={key} className="italic">
          {token}
        </span>,
      );
    }
    last = match.index + token.length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
}

export function Markdown({ content, className = "" }: { content: string; className?: string }) {
  const blocks = content
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter(Boolean);

  return (
    <div className={`space-y-5 ${className}`}>
      {blocks.map((block, index) => {
        const key = `block-${index}`;

        if (/^#{1,6}\s/.test(block)) {
          const level = block.match(/^#+/)![0].length;
          const text = block.replace(/^#+\s*/, "");
          const Tag = (level <= 2 ? "h2" : "h3") as "h2" | "h3";
          return (
            <Tag
              key={key}
              className={
                Tag === "h2"
                  ? "font-display text-2xl font-semibold sm:text-3xl"
                  : "font-display text-xl font-semibold"
              }
            >
              {inline(text, key)}
            </Tag>
          );
        }

        // A block that is entirely bold acts as a subheading in the source data.
        if (/^\*\*[^*]+\*\*$/.test(block)) {
          return (
            <h2 key={key} className="font-display text-2xl font-semibold sm:text-3xl">
              {block.slice(2, -2)}
            </h2>
          );
        }

        if (/^\s*#[A-Za-z]/.test(block) && block.split(/\s+/).every((w) => w.startsWith("#"))) {
          return (
            <ul key={key} className="flex flex-wrap gap-2 pt-2">
              {block.split(/\s+/).map((tag) => (
                <li
                  key={tag}
                  className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-foreground"
                >
                  {tag}
                </li>
              ))}
            </ul>
          );
        }

        const lines = block.split("\n");
        if (lines.every((l) => /^\s*([-*•]|\d+\.)\s+/.test(l))) {
          return (
            <ul key={key} className="list-disc space-y-2 pl-5 text-muted-foreground">
              {lines.map((line, li) => (
                <li key={`${key}-${li}`}>{inline(line.replace(/^\s*([-*•]|\d+\.)\s+/, ""), `${key}-${li}`)}</li>
              ))}
            </ul>
          );
        }

        return (
          <p key={key} className="leading-relaxed text-muted-foreground">
            {inline(block, key)}
          </p>
        );
      })}
    </div>
  );
}
