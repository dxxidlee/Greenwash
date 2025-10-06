import React, { useEffect, useRef } from "react";
import { useLockBodyScroll } from "./useLockBodyScroll";

type JournalEntry = {
  id: string;
  date: string;    // "05.01.25"
  title: string;
  body: string;    // plain text or sanitized HTML
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

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Focus trap (minimal) + restore
  useEffect(() => {
    if (open) {
      prevActive.current = document.activeElement as HTMLElement | null;
      panelRef.current?.focus();
    } else {
      prevActive.current?.focus?.();
    }
  }, [open]);

  // Backdrop click closes; panel stops propagation
  const onBackdropMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  if (!open) return null;

  return (
    <div
      ref={backdropRef}
      onMouseDown={onBackdropMouseDown}
      aria-hidden={false}
      aria-modal="true"
      role="dialog"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent animate-in fade-in duration-150"
    >
      {/* Full screen blur layer */}
      <div 
        className="
          fixed inset-0
          backdrop-blur-md md:backdrop-blur-lg
          supports-[backdrop-filter]:backdrop-saturate-150
          supports-[backdrop-filter]:backdrop-contrast-100
          backdrop-boost no-blur-fallback
        "
      />
      
      {/* Exit X — positioned at top right corner of screen, outside journal container */}
      <button
        onClick={onClose}
        aria-label="Close"
        className="
          fixed top-4 right-4 z-20
          inline-flex items-center justify-center
          h-12 w-12
          rounded-2xl md:rounded-[24px]
          border border-black/10 dark:border-white/10
          shadow-[0_2px_12px_rgba(0,0,0,0.06)]
          bg-white/90 dark:bg-neutral-900/90
          noise-surface
          text-green-600 dark:text-green-400
          hover:bg-white dark:hover:bg-neutral-900
          transition
          focus:outline-none focus:ring-2 focus:ring-green-300 dark:focus:ring-green-500
        "
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Journal entries container - no visible container */}
      <div
        ref={panelRef}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        className="
          relative z-10
          w-[92vw] sm:w-[86vw] md:w-auto
          h-screen
          max-w-[40rem] md:max-w-[42rem]
          focus:outline-none
          animate-in zoom-in-95 fade-in duration-200 ease-out
        "
      >
        {/* Scrollable column of journal entries with top/bottom spacing */}
        <div className="h-full w-full overflow-y-auto overscroll-contain scroll-smooth hide-scrollbar">
          <div className="pt-4 pb-4 space-y-4 sm:space-y-5 md:space-y-6">
            {entries.map((e) => (
              <article
                key={e.id}
                className="
                  relative
                  rounded-2xl md:rounded-[24px]
                  border border-black/10 dark:border-white/10
                  shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                  bg-white/90 dark:bg-neutral-900/90
                  noise-surface
                  p-4 sm:p-5 md:p-6
                  scroll-mt-6
                "
              >
                <div className="text-xs tracking-wide uppercase text-green-600 dark:text-green-400 mb-2">
                  {e.date}
                </div>
                <div className="prose prose-green dark:prose-green max-w-none text-sm md:text-[15px] leading-6 text-green-700 dark:text-green-300">
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