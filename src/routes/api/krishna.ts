import { createFileRoute } from "@tanstack/react-router";
import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "../../lib/ai-gateway.server";

type ChatMessage = { role: "user" | "assistant"; content: string };
type Body = { messages?: unknown };

const MODEL = "google/gemini-2.5-flash";

const SYSTEM_PROMPT = `You are "AI Krishna", the guide of the Gita Strategy project.
You speak with the calm, direct clarity of Krishna counselling Arjuna on the battlefield of Kurukshetra,
but you address modern strategic management problems: leadership, decision-making under uncertainty,
ethics, execution and crisis management.

Rules:
- Ground answers in the Bhagavad Gita. Cite chapter.verse (e.g. 2.47) when you reference a teaching.
- Always bridge the teaching to a concrete management action the person can take this week.
- Be concise: 120-200 words, plain language, no lists longer than four points.
- Never claim divinity, never give medical, legal or financial advice, and never invent verses.
- If a question is outside strategy, leadership or the Gita, gently steer back.
- The reply is often read aloud, so avoid markdown tables, emoji and long URLs.`;

function sanitize(messages: unknown): ChatMessage[] {
  if (!Array.isArray(messages)) return [];
  return messages
    .filter(
      (m): m is ChatMessage =>
        !!m &&
        typeof m === "object" &&
        (( m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant") &&
        typeof (m as ChatMessage).content === "string",
    )
    .slice(-12)
    .map((m) => ({ role: m.role, content: m.content.slice(0, 4000) }));
}

export const Route = createFileRoute("/api/krishna")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: Body;
        try {
          body = (await request.json()) as Body;
        } catch {
          return Response.json({ error: "Invalid JSON body." }, { status: 400 });
        }

        const messages = sanitize(body.messages);
        if (messages.length === 0) {
          return Response.json({ error: "At least one message is required." }, { status: 400 });
        }

        const apiKey = process.env["LOVABLE_API_KEY"];
        if (!apiKey) {
          return Response.json({ error: "The assistant is not configured." }, { status: 500 });
        }

        try {
          const gateway = createLovableAiGatewayProvider(apiKey);
          const result = await generateText({
            model: gateway(MODEL),
            system: SYSTEM_PROMPT,
            messages,
          });
          return Response.json({ reply: result.text });
        } catch (error) {
          const status = (error as { statusCode?: number; status?: number }).statusCode ??
            (error as { status?: number }).status ?? 500;
          if (status === 429) {
            return Response.json(
              { error: "Too many questions right now. Please pause a moment and try again." },
              { status: 429 },
            );
          }
          if (status === 402) {
            return Response.json(
              { error: "The assistant has run out of credits. Please try again later." },
              { status: 402 },
            );
          }
          console.error("krishna assistant failed", error);
          return Response.json({ error: "The assistant could not answer just now." }, { status: 500 });
        }
      },
    },
  },
});
