import { useEffect, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Chatbot } from "./Chatbot";
import { track } from "../../lib/analytics";

/** Floating bottom-right AI chat launcher available on every page. */
export function ChatWidget() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) track("chat_widget_opened", { location: "floating" });
        }}
        aria-expanded={open}
        aria-controls="chat-widget-panel"
        className="fixed right-4 bottom-4 z-40 inline-flex min-h-12 items-center gap-2 rounded-full bg-[image:var(--gradient-gold)] px-5 py-3 text-sm font-semibold text-primary shadow-aura transition-transform hover:-translate-y-0.5"
      >
        {open ? (
          <X className="h-4 w-4" aria-hidden="true" />
        ) : (
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
        )}
        {open ? "Close chat" : "Ask the Gita"}
      </button>

      {open ? (
        <div
          id="chat-widget-panel"
          className="fixed inset-x-3 bottom-20 z-40 h-[70vh] max-h-[34rem] sm:inset-x-auto sm:right-4 sm:w-[24rem]"
        >
          <Chatbot compact />
        </div>
      ) : null}
    </>
  );
}
