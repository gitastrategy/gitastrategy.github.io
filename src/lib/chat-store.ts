import { withBase } from "./site-url";

export type ChatRole = "user" | "assistant";
export type ChatMessage = { id: string; role: ChatRole; content: string; at: number };

const STORAGE_KEY = "gs:chat:v1";
const MAX_STORED = 60;

/**
 * Where the browser should send chat turns.
 * Static hosts (GitHub Pages, custom domain) have no server, so requests go to
 * the Lovable-hosted API of the same app. Locally / on Lovable we stay same-origin.
 */
export function chatEndpoint(): string {
  const override = import.meta.env["VITE_CHAT_API_URL"] as string | undefined;
  if (override) return override;
  if (typeof window === "undefined") return withBase("/api/krishna");

  const host = window.location.hostname;
  const sameOrigin =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host.endsWith(".lovable.app") ||
    host.endsWith(".lovableproject.com");

  return sameOrigin ? withBase("/api/krishna") : "https://gitastrategy.lovable.app/api/krishna";
}

export function newMessage(role: ChatRole, content: string): ChatMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    role,
    content,
    at: Date.now(),
  };
}

export function loadConversation(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (m): m is ChatMessage =>
        !!m &&
        typeof m === "object" &&
        typeof (m as ChatMessage).content === "string" &&
        ((m as ChatMessage).role === "user" || (m as ChatMessage).role === "assistant"),
    );
  } catch {
    return [];
  }
}

export function saveConversation(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-MAX_STORED)));
  } catch {
    /* storage may be full or blocked */
  }
}

export function clearConversation() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

export function formatTime(at: number): string {
  try {
    return new Date(at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}
