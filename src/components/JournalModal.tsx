import React, { useEffect, useRef } from "react";
import { useLockBodyScroll } from "./useLockBodyScroll";
import { AnimatePresence, motion } from "framer-motion";

type JournalEntry = { id: string; date: string; title: string; body: string; };
type Props = { open: boolean; onClose: () => void; entries: JournalEntry[]; };

const EASE = [0.2, 0, 0, 1] as const;          // crisp, modern
const DURATION = 0.22;                          // ~220ms

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
      // defer so DOM is ready for focus
      requestAnimationFrame(() => panelRef.current?.focus());
    } else {
      prevActive.current?.focus?.();
    }
  }, [open]);

  const onBackdropMouseDown: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (e.target === backdropRef.current) onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={backdropRef}
          onMouseDown={onBackdropMouseDown}
          aria-hidden={false}
          aria-modal="true"
          role="dialog"
          className="
            fixed inset-0 z-[100] flex items-center justify-center
            bg-transparent
            backdrop-blur-md md:backdrop-blur-lg
            supports-[backdrop-filter]:backdrop-saturate-150
            supports-[backdrop-filter]:backdrop-contrast-100
            pointer-events-auto
            backdrop-boost no-blur-fallback rm-no-anim
          "
          initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
          animate={{ opacity: 1, backdropFilter: "blur(8px)" }}
          exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
          transition={{ duration: DURATION, ease: EASE }}
        >
          {/* FIXED 'X' — top-right of viewport, safe-area aware */}
          <motion.button
            onClick={onClose}
            aria-label="Close"
            className="
              fixed z-[110]
              top-[calc(env(safe-area-inset-top,0px)+12px)]
              right-[calc(env(safe-area-inset-right,0px)+12px)]
              inline-flex items-center justify-center
              h-9 w-9 rounded-full
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
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: DURATION, ease: EASE }}
          >
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </motion.button>

          {/* PANEL — thin, full-height, buttery in/out */}
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            onMouseDown={(e) => e.stopPropagation()}
            className="
              relative
              w-[92vw] sm:w-[86vw] md:w-auto
              h-[100svh] md:h-[100vh]
              max-w-[40rem] md:max-w-[42rem]
              rounded-none md:rounded-3xl
              bg-white/90 dark:bg-neutral-900/85
              border md:border border-black/10 dark:border-white/10
              shadow-[0_10px_40px_rgba(0,0,0,0.25)]
              focus:outline-none
              noise-surface
              p-0
              overflow-hidden rm-no-anim
            "
            initial={{ opacity: 0, y: 12, scale: 0.985 }}
            animate={{ opacity: 1, y: 0,  scale: 1 }}
            exit={{    opacity: 0, y: 12, scale: 0.985 }}
            transition={{ duration: DURATION, ease: EASE }}
          >
            {/* SCROLLER — hits panel edges; scrollbar hidden */}
            <div className="h-full w-full overflow-y-auto overscroll-none scroll-smooth hide-scrollbar">
              <div className="p-4 sm:p-6 md:p-7">
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
                  <div className="h-4 sm:h-5 md:h-6" />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}