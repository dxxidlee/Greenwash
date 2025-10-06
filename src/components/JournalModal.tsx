import React, { useEffect, useRef } from "react";
import { useLockBodyScroll } from "./useLockBodyScroll";

type JournalEntry = {
  id: string;
  date: string;      // "05.01.25"
  title: string;
  body: string;      // plain text or sanitized HTML
};

type Props = {
  open: boolean;
  onClose: () => void;
  entries: JournalEntry[];
};

export default function JournalModal({ open, onClose, entries }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevActive = useRef<HTMLElement | null>(null);

  useLockBodyScroll(open);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus trap + restore
  useEffect(() => {
    if (open) {
      prevActive.current = document.activeElement as HTMLElement | null;
      panelRef.current?.focus();
    } else {
      prevActive.current?.focus?.();
    }
  }, [open]);

  // Click-outside to close
  const onBackdropClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      onMouseDown={onBackdropClick}
      aria-hidden={false}
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-[2px] animate-in fade-in duration-150"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className="
          relative w-full h-[90vh] sm:h-[86vh] md:h-[82vh]
          max-w-[48rem] md:max-w-[56rem]
          focus:outline-none
          animate-in zoom-in-95 fade-in duration-200 ease-out
          p-4 sm:p-6 md:p-8
          overflow-hidden
        "
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Close (X) button */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="
            absolute top-3 right-3 sm:top-4 sm:right-4
            inline-flex items-center justify-center
            h-9 w-9 rounded-full
            bg-black/70 text-white dark:bg-white/20
            hover:bg-black/80 dark:hover:bg-white/30
            transition
            focus:outline-none focus:ring-2 focus:ring-black/30 dark:focus:ring-white/30
          "
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Scrollable stack of rounded-square cards */}
        <div
          className="
            modal-scroll
            h-full w-full overflow-y-auto overscroll-contain scroll-smooth
            pr-1
          "
        >
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
            {entries.map((e) => (
              <article
                key={e.id}
                className="
                  relative
                  rounded-[40px]
                  bg-black/30
                  p-4 sm:p-5 md:p-6
                  scroll-mt-6
                "
                style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
              >
                <div className="text-[15px] tracking-wide uppercase text-neutral-500 mb-2">
                  {e.date}
                </div>
                <h3 className="text-[15px] font-medium mb-2">
                  {e.title}
                </h3>
                <div className="prose prose-neutral dark:prose-invert max-w-none text-[15px] leading-6">
                  {e.body}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
