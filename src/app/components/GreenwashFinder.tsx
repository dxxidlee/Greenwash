'use client';

import React, { useState, useCallback, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import { useLockBodyScroll } from '../../components/useLockBodyScroll';

interface GreenwashFinderProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Item {
  id: number;
  title: string;
  subtitle: string;
  category: string;
  date: string;
  status?: string;
  image?: string;
}

const GreenwashFinder: React.FC<GreenwashFinderProps> = ({ isOpen, onClose }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const backdropRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useLockBodyScroll(isOpen);

  // Check if mobile
  React.useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check for reduced motion preference
  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 350);
  }, [onClose]);

  // ESC to close
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleClose]);

  // Prevent scroll events from reaching the background
  const handleWheelBackdrop = useCallback((e: React.WheelEvent) => {
    e.stopPropagation();
  }, []);

  const handleTouchMoveBackdrop = useCallback((e: React.TouchEvent) => {
    e.stopPropagation();
  }, []);

  const filters = [
    { id: 'approved-object', label: 'Approved Object' },
    { id: 'campaign-poster', label: 'Campaign Poster' },
    { id: 'violation-ticket', label: 'Violation Ticket' },
    { id: 'authorization-form', label: 'Authorization Form' }
  ];

  const items: Item[] = [
    // Sorted by date - most recent first (items with "New" status are the 5 most recent)
    { id: 16, title: 'Monthly Summary Jan', subtitle: 'Campaign Poster', category: 'campaign-poster', date: '02.15.37', image: '/img/poster-1.webp', status: 'New' },
    { id: 19, title: 'Monthly Summary Jan', subtitle: 'Violation Ticket', category: 'violation-ticket', date: '02.12.37', image: '/img/violation-ticket-1.webp', status: 'New' },
    { id: 8, title: 'Chinatown Zone Report', subtitle: 'Approved Object', category: 'approved-object', date: '02.08.37', image: '/img/approv-obj-8.webp', status: 'New' },
    { id: 21, title: 'Monthly Summary Jan', subtitle: 'Authorization Form', category: 'authorization-form', date: '02.05.37', image: '/img/auth-form-1.webp', status: 'New' },
    { id: 1, title: 'GW-CH-1123', subtitle: 'Approved Object', category: 'approved-object', date: '02.01.37', image: '/img/approv-obj-1.webp', status: 'New' },
    { id: 4, title: 'Q1 Compliance Report', subtitle: 'Approved Object', category: 'approved-object', date: '01.31.37', image: '/img/approv-obj-4.webp' },
    { id: 17, title: 'Monthly Summary Jan', subtitle: 'Campaign Poster', category: 'campaign-poster', date: '01.29.37', image: '/img/poster-2.webp' },
    { id: 3, title: 'Canal Street Evidence', subtitle: 'Approved Object', category: 'approved-object', date: '01.28.37', image: '/img/approv-obj-3.webp' },
    { id: 10, title: 'Evidence Photo 001', subtitle: 'Approved Object', category: 'approved-object', date: '01.27.37', image: '/img/approv-obj-10.webp' },
    { id: 22, title: 'Monthly Summary Jan', subtitle: 'Authorization Form', category: 'authorization-form', date: '01.25.37', image: '/img/auth-form-2.webp' },
    { id: 6, title: 'Pike Slip Authorization', subtitle: 'Approved Object', category: 'approved-object', date: '01.23.37', image: '/img/approv-obj-6.webp' },
    { id: 2, title: 'Billboard Authorization', subtitle: 'Approved Object', category: 'approved-object', date: '01.22.37', image: '/img/approv-obj-2.webp' },
    { id: 20, title: 'Monthly Summary Jan', subtitle: 'Violation Ticket', category: 'violation-ticket', date: '01.20.37', image: '/img/violation-ticket-2.webp' },
    { id: 18, title: 'Monthly Summary Jan', subtitle: 'Campaign Poster', category: 'campaign-poster', date: '01.18.37', image: '/img/poster-3.webp' },
    { id: 7, title: 'Violation Stats Q1', subtitle: 'Approved Object', category: 'approved-object', date: '01.15.37', image: '/img/approv-obj-7.webp' },
    { id: 12, title: 'Monthly Summary Jan', subtitle: 'Approved Object', category: 'approved-object', date: '01.12.37', image: '/img/approv-obj-12.webp' },
    { id: 23, title: 'Monthly Summary Jan', subtitle: 'Authorization Form', category: 'authorization-form', date: '01.10.37', image: '/img/auth-form-3.webp' },
    { id: 11, title: 'Evidence Photo 002', subtitle: 'Approved Object', category: 'approved-object', date: '01.08.37', image: '/img/approv-obj-11.webp' },
    { id: 13, title: 'Monthly Summary Jan', subtitle: 'Approved Object', category: 'approved-object', date: '01.05.37', image: '/img/approv-obj-13.webp' },
    { id: 14, title: 'Monthly Summary Jan', subtitle: 'Approved Object', category: 'approved-object', date: '12.28.36', image: '/img/approv-obj-14.webp' },
    { id: 15, title: 'Monthly Summary Jan', subtitle: 'Approved Object', category: 'approved-object', date: '12.20.36', image: '/img/approv-obj-15.webp' },
    { id: 5, title: 'Green Code G-41', subtitle: 'Approved Object', category: 'approved-object', date: '12.15.36', image: '/img/approv-obj-5.webp' },
    { id: 9, title: 'Green Code G-05', subtitle: 'Approved Object', category: 'approved-object', date: '12.01.36', image: '/img/approv-obj-9.webp' }
  ];

  const filteredItems = selectedFilter === 'all' 
    ? items 
    : items.filter(item => item.category === selectedFilter);

  if (!isOpen) return null;

  return (
    <>
      {/* Files Icon — positioned at top center */}
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
            src="/img/files-final.webp"
            alt="Files"
            style={{
              height: '48px',
              width: 'auto',
              display: 'block'
            }}
          />
        </div>
      </div>

      {/* Exit X — positioned at top right corner of screen */}
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
        onWheel={handleWheelBackdrop}
        onTouchMove={handleTouchMoveBackdrop}
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

        {/* Finder container */}
        <div
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          className={`
            relative z-10
            w-[92vw] sm:w-[86vw] md:w-[86vw]
            h-screen
            max-w-[32rem] md:max-w-[68rem] lg:max-w-[80rem]
            focus:outline-none
            ${isClosing ? 'animate-[fadeOutScaleDown_0.3s_ease-in_forwards]' : 'opacity-0 scale-98 translate-y-2 animate-[fadeInScaleUp_0.4s_ease-out_0.12s_forwards]'}
          `}
        >
          {/* Scrollable content with top/bottom spacing */}
          <div 
            ref={scrollContainerRef}
            className="h-full w-full overflow-y-auto overscroll-contain scroll-smooth hide-scrollbar"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="pb-20 px-4 md:px-0" style={{ paddingTop: 'calc(16px + 48px + 80px)' }}>

            {/* Filter Pills */}
            <div 
              className="flex gap-3 flex-wrap"
              style={{
                width: '100%',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: showFilters ? '24px' : '12px',
                transition: prefersReducedMotion 
                  ? 'margin-bottom 0.25s ease-out'
                  : 'margin-bottom 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.15s'
              }}
            >
              {/* Main trigger button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 rounded-full font-medium focus:outline-none"
                style={{
                  backgroundColor: showFilters ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 143, 70, 0.3)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  border: showFilters ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                  color: showFilters ? '#008F46' : '#FFFFFF',
                  transition: prefersReducedMotion
                    ? 'background-color 0.25s ease-out, border 0.25s ease-out, color 0.25s ease-out, transform 0.25s ease-out, opacity 0.25s ease-out'
                    : 'background-color 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.15s, border 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.15s, color 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.15s, transform 0.85s cubic-bezier(0.22, 1, 0.36, 1) 0.15s',
                  transform: prefersReducedMotion 
                    ? 'none' 
                    : showFilters 
                      ? isMobile ? 'translateX(-20%)' : 'translateX(-35%)'
                      : 'translateX(0)',
                  opacity: prefersReducedMotion && showFilters ? 0.9 : 1,
                  willChange: 'transform, background-color'
                }}
              >
                What are you looking for? →
              </button>

              {/* Filter options - staggered spring fade-up reveal */}
              {showFilters && filters.map((filter, index) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className="px-6 py-3 rounded-full font-medium focus:outline-none flex items-center gap-2"
                  style={{
                    backgroundColor: selectedFilter === filter.id ? 'rgba(255, 255, 255, 0.9)' : 'rgba(0, 143, 70, 0.3)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: selectedFilter === filter.id ? 'none' : '1px solid rgba(255, 255, 255, 0.3)',
                    color: selectedFilter === filter.id ? '#008F46' : '#FFFFFF',
                    opacity: prefersReducedMotion ? 1 : 0,
                    transform: prefersReducedMotion ? 'none' : 'translateY(12px)',
                    animation: prefersReducedMotion 
                      ? `fadeIn 0.25s ease-out ${index * 40}ms forwards`
                      : `fadeInUp 0.85s cubic-bezier(0.22, 1, 0.36, 1) ${150 + (index * 120)}ms forwards`
                  }}
                >
                  <span>{filter.label}</span>
                  {selectedFilter === filter.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedFilter('all');
                      }}
                      className="hover:opacity-70 transition-opacity"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        padding: 0
                      }}
                    >
                      <X size={16} />
                    </button>
                  )}
                </button>
              ))}
            </div>

            {/* Grid of items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredItems.map((item) => (
                <div
                  key={item.id}
                  className="group cursor-pointer"
                >
                  <div 
                    className="rounded-2xl overflow-hidden mb-3 relative"
                    style={{
                      backgroundColor: 'rgba(0, 143, 70, 0.3)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      aspectRatio: '1/1'
                    }}
                  >
                    {/* Image with padding */}
                    {item.image ? (
                      <div className="w-full h-full p-4 flex items-center justify-center">
                        <img
                          src={item.image}
                          alt={item.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain'
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="text-white opacity-50 text-xs">
                          {item.category.toUpperCase()}
                        </div>
                      </div>
                    )}

                    {/* Status badge */}
                    {item.status && (
                      <div 
                        className="absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.9)',
                          color: '#008F46'
                        }}
                      >
                        {item.status}
                  </div>
                    )}
                  </div>

                  {/* Item info */}
                  <div className="px-2" style={{ lineHeight: '1.2' }}>
                    <h3 className="font-medium text-sm mb-0.5" style={{ color: '#008F46', opacity: 0.8 }}>
                      {item.title}
                    </h3>
                    <p className="text-sm mb-0.5" style={{ color: '#008F46', opacity: 0.8 }}>
                      {item.subtitle}
                    </p>
                    <p className="text-sm" style={{ color: '#008F46', opacity: 0.8 }}>
                      {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Empty state */}
            {filteredItems.length === 0 && (
              <div className="text-center py-20">
                <p className="text-white opacity-50">
                  No items found in this category
                </p>
              </div>
            )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GreenwashFinder;
