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
    <>
      {/* Exit X — positioned at top right corner of screen, completely separate */}
      <button
        onClick={onClose}
        aria-label="Close"
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
          zIndex: 200
        }}
        className="
          inline-flex items-center justify-center
          h-12 w-12
          rounded-full
          border border-black/10 dark:border-white/10
          shadow-[0_2px_12px_rgba(0,0,0,0.06)]
          bg-white/90 dark:bg-neutral-900/90
          noise-surface
          text-[#008F46]
          hover:bg-white dark:hover:bg-neutral-900
          transition-all duration-500 ease-out
          focus:outline-none focus:ring-2 focus:ring-[#008F46]/30
          opacity-0 scale-95
          animate-[fadeInScale_0.5s_ease-out_0.1s_forwards]
        "
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div
        ref={backdropRef}
        onClick={onClose}
        aria-hidden={false}
        aria-modal="true"
        role="dialog"
        className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent"
      >
        {/* Full screen blur layer with smooth animation */}
        <div 
          className="
            fixed inset-0
            backdrop-blur-md md:backdrop-blur-lg
            supports-[backdrop-filter]:backdrop-saturate-150
            supports-[backdrop-filter]:backdrop-contrast-100
            backdrop-boost no-blur-fallback
            opacity-0
            animate-[fadeIn_0.4s_ease-out_forwards]
          "
        />

        {/* Journal entries container - no visible container */}
        <div
          ref={panelRef}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          className="
            relative z-10
            w-[92vw] sm:w-[86vw] md:w-auto
            h-screen
            max-w-[32rem] md:max-w-[34rem]
            focus:outline-none
            opacity-0 scale-95 translate-y-4
            animate-[fadeInScaleUp_0.5s_ease-out_0.2s_forwards]
          "
        >
        {/* Scrollable column of journal entries with top/bottom spacing */}
        <div className="h-full w-full overflow-y-auto overscroll-contain scroll-smooth hide-scrollbar">
          <div className="pt-20 pb-20 space-y-4 sm:space-y-5 md:space-y-6">
            {entries.map((e, index) => (
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
                  opacity-0 translate-y-4
                  animate-[fadeInUp_0.4s_ease-out_forwards]
                "
                style={{
                  animationDelay: `${300 + (index * 100)}ms`
                }}
              >
                <div className="text-xs tracking-wide uppercase text-[#008F46] mb-2">
                  {e.date}
                </div>
                <div className="prose max-w-none text-sm md:text-[15px] leading-6 text-[#008F46]">
                  {e.body}
                </div>
              </article>
            ))}
          </div>
        </div>
        </div>
      </div>
    </>
  );
}