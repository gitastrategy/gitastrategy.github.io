import { useEffect, useRef, useState } from "react";
import { MessageSquarePlus, X } from "lucide-react";
import { FeedbackForm } from "./FeedbackForm";
import { track } from "../../lib/analytics";

/**
 * Floating bottom-left feedback launcher. Opens the feedback form in a modal
 * dialog; the modal closes itself once the submission is confirmed.
 */
export function FeedbackModal() {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.querySelector<HTMLElement>("input, textarea, button")?.focus();
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previous;
    };
  }, [open]);

  function close() {
    setOpen(false);
    triggerRef.current?.focus();
  }

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          setOpen(true);
          track("feedback_modal_opened", { location: "floating" });
        }}
        className="fixed bottom-4 left-4 z-40 inline-flex min-h-11 items-center gap-2 rounded-full border border-border bg-card/95 px-4 py-2.5 text-sm font-semibold shadow-elegant backdrop-blur transition-transform hover:-translate-y-0.5"
      >
        <MessageSquarePlus className="h-4 w-4 text-accent" aria-hidden="true" />
        Feedback
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 backdrop-blur-sm sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) close();
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-modal-title"
            className="rise-in max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-border bg-card p-6 shadow-elegant sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow text-accent">Feedback</p>
                <h2 id="feedback-modal-title" className="mt-1 font-display text-2xl font-semibold">
                  Tell us what to improve
                </h2>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close feedback form"
                className="rounded-full border border-border p-2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-6">
              <FeedbackForm
                idPrefix="feedback-modal"
                source="gitastrategy.in/modal"
                onSuccess={close}
              />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
