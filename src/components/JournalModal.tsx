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
      className="
        fixed inset-0 z-[100] flex items-center justify-center
        bg-transparent
        pointer-events-auto
        transition-opacity duration-300 ease-out
        animate-in fade-in duration-300
      "
    >
      {/* Blurred background overlay - separate from journal content */}
      <div 
        className="
          absolute inset-0
          backdrop-blur-md md:backdrop-blur-lg
          supports-[backdrop-filter]:backdrop-saturate-150
          supports-[backdrop-filter]:backdrop-contrast-100
          backdrop-boost no-blur-fallback
          transition-all duration-300 ease-out
        "
      />
      
      {/* Journal panel - NOT blurred */}
      <div
        ref={panelRef}
        tabIndex={-1}
        onMouseDown={(e) => e.stopPropagation()}
        className="
          relative z-10
          w-[92vw] sm:w-[86vw] md:w-auto
          h-[84vh] sm:h-[82vh] md:h-[78vh]
          max-w-[40rem] md:max-w-[42rem]
          rounded-2xl md:rounded-3xl
          bg-white/90 dark:bg-neutral-900/85
          border border-black/10 dark:border-white/10
          shadow-[0_10px_40px_rgba(0,0,0,0.25)]
          focus:outline-none
          noise-surface
          p-4 sm:p-6 md:p-7
          overflow-hidden
          transform transition-all duration-300 ease-out
          animate-in zoom-in-95 fade-in duration-300
        "
      >
        {/* Exit X — same visuals & behavior */}
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

        {/* Scrollable column of rounded-square entries; scrollbar hidden */}
        <div className="h-full w-full overflow-y-auto overscroll-contain scroll-smooth hide-scrollbar pr-0">
          <div className="space-y-4 sm:space-y-5 md:space-y-6">
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
                <div className="text-xs tracking-wide uppercase text-neutral-500 mb-2">
                  {e.date}
                </div>
                <h3 className="text-base md:text-lg font-medium mb-2">{e.title}</h3>
                <div className="prose prose-neutral dark:prose-invert max-w-none text-sm md:text-[15px] leading-6">
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