import React, { useEffect, useRef, useCallback } from "react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const prevActive = useRef<HTMLElement | null>(null);
  const [isClosing, setIsClosing] = React.useState(false);
  const [isMobile, setIsMobile] = React.useState(false);

  useLockBodyScroll(open);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 350); // Match animation duration for smooth exit
  }, [onClose]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, handleClose]);

  // Focus trap (minimal) + restore
  useEffect(() => {
    if (open) {
      prevActive.current = document.activeElement as HTMLElement | null;
      panelRef.current?.focus();
    } else {
      prevActive.current?.focus?.();
    }
  }, [open]);

  // Forward scroll events to the entries container
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        top: e.deltaY,
        behavior: 'auto'
      });
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  if (!open) return null;

  return (
    <>
      {/* Journal Icon — positioned at top center */}
      <div
        style={{
          position: 'fixed',
          top: '16px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 200
        }}
      >
        <div
          className={`
            ${isClosing ? 'animate-[fadeOutScale_0.3s_ease-in_forwards]' : 'opacity-0 animate-[fadeInScale_0.4s_ease-out_0.08s_forwards]'}
          `}
        >
          <img 
            src="/img/journal-final.webp" 
            alt="Journal"
            style={{
              height: '48px',
              width: 'auto',
              display: 'block'
            }}
          />
        </div>
      </div>

      {/* Exit X — positioned at top right corner of screen, completely separate */}
      <button
        onClick={handleClose}
        aria-label="Close"
        style={{
          position: 'fixed',
          top: '16px',
          right: isMobile ? '24px' : '16px',
          zIndex: 200
        }}
        className={`
          inline-flex items-center justify-center
          h-12 w-12
          rounded-full
          shadow-[0_2px_12px_rgba(0,0,0,0.06)]
          bg-[rgba(0,143,70,0.3)]
          noise-surface
          text-white
          hover:bg-[rgba(0,143,70,0.4)]
          transition-all duration-300 ease-out
          focus:outline-none focus:ring-2 focus:ring-white/30
          ${isClosing ? 'animate-[fadeOutScale_0.3s_ease-in_forwards]' : 'opacity-0 scale-95 animate-[fadeInScale_0.4s_ease-out_0.08s_forwards]'}
        `}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div
        ref={backdropRef}
        onClick={handleClose}
        onWheel={handleWheel}
        onTouchMove={handleTouchMove}
        aria-hidden={false}
        aria-modal="true"
        role="dialog"
        className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent overflow-hidden"
      >
        {/* Full screen blur layer with smooth animation */}
        <div 
          className={`
            fixed inset-0
            backdrop-blur-md md:backdrop-blur-lg
            supports-[backdrop-filter]:backdrop-saturate-150
            supports-[backdrop-filter]:backdrop-contrast-100
            backdrop-boost no-blur-fallback
            ${isClosing ? 'animate-[fadeOut_0.3s_ease-in_forwards]' : 'opacity-0 animate-[fadeIn_0.4s_ease-out_forwards]'}
          `}
          style={{ pointerEvents: 'none' }}
        />

        {/* Journal entries container - no visible container */}
        <div
          ref={panelRef}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          onWheel={handleWheel}
          onTouchMove={handleTouchMove}
          className={`
            relative z-10
            w-[92vw] sm:w-[86vw] md:w-auto
            h-screen
            max-w-[32rem] md:max-w-[34rem]
            focus:outline-none
            ${isClosing ? 'animate-[fadeOutScaleDown_0.3s_ease-in_forwards]' : 'opacity-0 scale-98 translate-y-2 animate-[fadeInScaleUp_0.4s_ease-out_0.12s_forwards]'}
          `}
        >
        {/* Scrollable column of journal entries with top/bottom spacing */}
        <div 
          ref={scrollContainerRef}
          className="h-full w-full overflow-y-auto overscroll-contain scroll-smooth hide-scrollbar"
        >
          <div className="pb-20 space-y-4 sm:space-y-5 md:space-y-6" style={{ paddingTop: 'calc(16px + 48px + 80px)' }}>
            {entries.map((e, index) => (
              <article
                key={e.id}
                className={`
                  relative
                  rounded-2xl md:rounded-[24px]
                  shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                  bg-[rgba(0,143,70,0.3)]
                  noise-surface
                  p-4 sm:p-5 md:p-6
                  scroll-mt-6
                  ${isClosing ? 'animate-[fadeOutDown_0.25s_ease-in_forwards]' : 'opacity-0 translate-y-3 animate-[fadeInUp_0.35s_ease-out_forwards]'}
                `}
                style={{
                  animationDelay: isClosing ? `${index * 40}ms` : `${200 + (index * 60)}ms`
                }}
              >
                <div className="text-xs tracking-wide uppercase text-white mb-2">
                  {e.date}
                </div>
                <div className="border-t border-white mb-2"></div>
                <div className="prose max-w-none text-sm md:text-[15px] leading-6 text-white">
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