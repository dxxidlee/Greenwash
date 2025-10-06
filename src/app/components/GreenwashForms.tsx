'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Maximize2, CheckCircle, Trash2, X, Minimize2 } from 'lucide-react';
import { useLockBodyScroll } from '../../components/useLockBodyScroll';

interface GreenwashFormsProps {
  isOpen: boolean;
  onClose: () => void;
}

const GreenwashForms: React.FC<GreenwashFormsProps> = ({ isOpen, onClose }) => {
  const [leftSize, setLeftSize] = useState(50);
  const [authSubmitted, setAuthSubmitted] = useState(false);
  const [violationSubmitted, setViolationSubmitted] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  
  const backdropRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const prevActive = useRef<HTMLElement | null>(null);

  useLockBodyScroll(isOpen);

  // Handle close with animation
  const handleClose = useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400); // Match animation duration
  }, [onClose]);

  // ESC to close
  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") handleClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isOpen, handleClose]);

  // Focus trap (minimal) + restore
  React.useEffect(() => {
    if (isOpen) {
      prevActive.current = document.activeElement as HTMLElement | null;
      panelRef.current?.focus();
    } else {
      prevActive.current?.focus?.();
    }
  }, [isOpen]);
  
  const emptyAuthForm = {
    permitId: '',
    dateIssued: '',
    fieldOfficer: '',
    workerId: '',
    assignedZone: '',
    objectType: 'billboard',
    location: '',
    dimensions: '',
    existingColor: '',
    approvedGreenCode: '',
    authorizedAction: 'replace',
    observations: '',
    estimatedCost: '',
    expectedDate: '',
    officerSignature: '',
    supervisingAuthority: ''
  };

  const emptyViolationForm = {
    ticketNo: '',
    date: '',
    zone: '',
    name: '',
    objectType: 'other',
    location: '',
    currentColor: '',
    approvedGreenCode: '',
    violations: {
      notPaintedGreen: false,
      unauthorizedNonGreen: false,
      displayCompetingColors: false,
      obstruction: false
    },
    fine: '',
    description: '',
    severity: 'minor',
    officer: ''
  };

  const [authForm, setAuthForm] = useState(emptyAuthForm);
  const [violationForm, setViolationForm] = useState(emptyViolationForm);
  const [activeExamples, setActiveExamples] = useState(true);

  const examples = [
    {
      name: "Billboard Replacement - Pike Slip",
      type: "auth",
      data: {
        permitId: "002942-GM",
        dateIssued: "01/22/2037",
        fieldOfficer: "D. LEE",
        workerId: "229-B",
        assignedZone: "ZONE B-EAST RIVER",
        objectType: "billboard",
        location: "SOUTH ST & PIKE SLIP",
        dimensions: "30 FT X 20 FT",
        existingColor: "SKY BLUE WITH YELLOW",
        approvedGreenCode: "G-41 (CANOPY GREEN)",
        authorizedAction: "replace",
        observations: "BILLBOARD IN UNAUTHORIZED COLORS. FULL REPLACEMENT REQUIRED FOR VISIBILITY.",
        estimatedCost: "4,850.00",
        expectedDate: "02/05/2037",
        officerSignature: "D. LEE",
        supervisingAuthority: "J. ALVAREZ"
      }
    },
    {
      name: "Vendor Cart Violation - Canal St",
      type: "violation",
      data: {
        ticketNo: "UN-2037-032",
        date: "01/28/2037",
        zone: "C-CHINATOWN",
        name: "MERCHANT CART - L. WONG",
        objectType: "other",
        location: "CANAL ST & MOTT ST",
        currentColor: "RED W/ WHITE",
        approvedGreenCode: "G-05 (VENDOR)",
        violations: {
          notPaintedGreen: true,
          unauthorizedNonGreen: false,
          displayCompetingColors: true,
          obstruction: false
        },
        fine: "220.00",
        description: "UNAUTHORIZED RED UMBRELLA CANOPY ON ACTIVE VENDOR CART, CREATING VISUAL DISRUPTION.",
        severity: "minor",
        officer: "D.LEE (229-B)"
      }
    }
  ];

  const loadExample = (example: any) => {
    if (example.type === 'auth') {
      setAuthForm(example.data);
    } else {
      setViolationForm(example.data);
    }
  };

  const clearAuthForm = () => {
    setAuthForm(emptyAuthForm);
  };

  const clearViolationForm = () => {
    setViolationForm(emptyViolationForm);
  };

  const expandLeft = () => setLeftSize(70);
  const expandRight = () => setLeftSize(30);
  const reset = () => setLeftSize(50);

  const handleAuthSubmit = () => {
    setAuthSubmitted(true);
    setTimeout(() => {
      setAuthSubmitted(false);
      setAuthForm(emptyAuthForm);
    }, 1000);
  };

  const handleViolationSubmit = () => {
    setViolationSubmitted(true);
    setTimeout(() => {
      setViolationSubmitted(false);
      setViolationForm(emptyViolationForm);
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Exit X — positioned at top right corner of screen, completely separate */}
            <button
        onClick={handleClose}
        aria-label="Close"
        style={{
          position: 'fixed',
          top: '16px',
          right: '16px',
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
          transition-all duration-500 ease-out
          focus:outline-none focus:ring-2 focus:ring-white/30
          ${isClosing ? 'animate-[fadeOutScale_0.4s_ease-in_forwards]' : 'opacity-0 scale-95 animate-[fadeInScale_0.4s_ease-out_0.08s_forwards]'}
        `}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      <div
        ref={backdropRef}
        onClick={handleClose}
        aria-hidden={false}
        aria-modal="true"
        role="dialog"
        className="fixed inset-0 z-[100] flex items-center justify-center bg-transparent"
      >
        {/* Full screen blur layer with smooth animation */}
        <div 
          className={`
            fixed inset-0
            backdrop-blur-md md:backdrop-blur-lg
            supports-[backdrop-filter]:backdrop-saturate-150
            supports-[backdrop-filter]:backdrop-contrast-100
            backdrop-boost no-blur-fallback
            ${isClosing ? 'animate-[fadeOut_0.32s_ease-in_forwards]' : 'opacity-0 animate-[fadeIn_0.32s_ease-out_forwards]'}
          `}
        />

        {/* Forms container - no visible container */}
        <div
          ref={panelRef}
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          className={`
            relative z-10
            w-[92vw] sm:w-[86vw] md:w-auto
            h-screen
            max-w-[32rem] md:max-w-[34rem]
            focus:outline-none
            ${isClosing ? 'animate-[fadeOutScaleDown_0.4s_ease-in_forwards]' : 'opacity-0 scale-95 translate-y-4 animate-[fadeInScaleUp_0.4s_ease-out_0.16s_forwards]'}
          `}
        >
        {/* Scrollable forms content with top/bottom spacing */}
        <div className="h-full w-full overflow-y-auto overscroll-contain scroll-smooth hide-scrollbar">
          <div className="pt-20 pb-20 space-y-4 sm:space-y-5 md:space-y-6">
            {/* Forms Header */}
            <article
              className={`
                relative
                rounded-2xl md:rounded-[24px]
                shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                bg-[rgba(0,143,70,0.3)]
                noise-surface
                p-4 sm:p-5 md:p-6
                scroll-mt-6
                opacity-0 translate-y-4
                animate-[fadeInUp_0.32s_ease-out_forwards]
              `}
            >
              <div className="text-center">
                <div className="text-sm tracking-wide uppercase text-white mb-2">GREENWASH COMPLIANCE DIVISION</div>
                <h1 className="text-xl font-bold text-white mb-2">Forms & Documentation</h1>
                <div className="text-sm text-white">Authorization & Violation Forms</div>
              </div>
            </article>

            {/* Examples */}
            <article
              className={`
                relative
                rounded-2xl md:rounded-[24px]
                shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                bg-[rgba(0,143,70,0.3)]
                noise-surface
                p-4 sm:p-5 md:p-6
                scroll-mt-6
                opacity-0 translate-y-4
                animate-[fadeInUp_0.32s_ease-out_forwards]
              `}
              style={{ animationDelay: '100ms' }}
            >
              <div className="mb-4">
                <div className="text-sm font-bold text-white mb-3">Load Example:</div>
                <div className="space-y-2">
                {examples.map((example, idx) => (
                  <button
                    key={idx}
                    onClick={() => loadExample(example)}
                      className="w-full text-left p-3 bg-[rgba(0,143,70,0.2)] hover:bg-[rgba(0,143,70,0.4)] transition-all rounded-lg text-white text-sm"
                  >
                    {example.name}
                  </button>
                ))}
              </div>
              </div>
            </article>

            {/* Authorization Form */}
            <article
              className={`
                relative
                rounded-2xl md:rounded-[24px]
                shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                bg-[rgba(0,143,70,0.3)]
                noise-surface
                p-4 sm:p-5 md:p-6
                scroll-mt-6
                opacity-0 translate-y-4
                animate-[fadeInUp_0.32s_ease-out_forwards]
              `}
              style={{ animationDelay: '200ms' }}
            >
              <div className="mb-4">
                <h2 className="text-lg font-bold text-white mb-4">Authorization Form</h2>
                <div className="space-y-3">
                      <div>
                    <label className="text-xs text-white font-bold block mb-1">PERMIT ID NO:</label>
                        <input
                          type="text"
                          value={authForm.permitId}
                          onChange={(e) => setAuthForm({...authForm, permitId: e.target.value})}
                      className="w-full bg-[rgba(0,143,70,0.2)] border border-white/30 p-2 text-sm text-white focus:border-white outline-none rounded"
                      placeholder="Enter permit ID"
                        />
                      </div>
                      <div>
                    <label className="text-xs text-white font-bold block mb-1">LOCATION ADDRESS:</label>
                      <input
                        type="text"
                        value={authForm.location}
                        onChange={(e) => setAuthForm({...authForm, location: e.target.value})}
                      className="w-full bg-[rgba(0,143,70,0.2)] border border-white/30 p-2 text-sm text-white focus:border-white outline-none rounded"
                      placeholder="Enter location"
                        />
                      </div>
                      <div>
                    <label className="text-xs text-white font-bold block mb-1">APPROVED GREEN CODE:</label>
                      <input
                        type="text"
                        value={authForm.approvedGreenCode}
                        onChange={(e) => setAuthForm({...authForm, approvedGreenCode: e.target.value})}
                      className="w-full bg-[rgba(0,143,70,0.2)] border border-white/30 p-2 text-sm text-white focus:border-white outline-none rounded"
                      placeholder="Enter green code"
                        />
                      </div>
                      <button
                        onClick={handleAuthSubmit}
                        disabled={authSubmitted}
                    className="w-full py-3 bg-[rgba(0,143,70,0.5)] text-white flex items-center justify-center gap-2 hover:bg-[rgba(0,143,70,0.6)] transition-colors rounded-lg disabled:opacity-50"
                      >
                        {authSubmitted ? (
                      <>
                            <CheckCircle size={16} />
                            SUBMITTED
                      </>
                        ) : (
                          'SUBMIT AUTHORIZATION FORM'
                        )}
                      </button>
                    </div>
                  </div>
            </article>

            {/* Violation Form */}
            <article
              className={`
                relative
                rounded-2xl md:rounded-[24px]
                shadow-[0_2px_12px_rgba(0,0,0,0.06)]
                bg-[rgba(0,143,70,0.3)]
                noise-surface
                p-4 sm:p-5 md:p-6
                scroll-mt-6
                opacity-0 translate-y-4
                animate-[fadeInUp_0.32s_ease-out_forwards]
              `}
              style={{ animationDelay: '300ms' }}
            >
              <div className="mb-4">
                <h2 className="text-lg font-bold text-white mb-4">Violation Ticket</h2>
                <div className="space-y-3">
                      <div>
                    <label className="text-xs text-white font-bold block mb-1">TICKET NO:</label>
                        <input
                          type="text"
                          value={violationForm.ticketNo}
                          onChange={(e) => setViolationForm({...violationForm, ticketNo: e.target.value})}
                      className="w-full bg-[rgba(0,143,70,0.2)] border border-white/30 p-2 text-sm text-white focus:border-white outline-none rounded"
                      placeholder="Enter ticket number"
                        />
                      </div>
                      <div>
                    <label className="text-xs text-white font-bold block mb-1">LOCATION:</label>
                      <input
                        type="text"
                        value={violationForm.location}
                        onChange={(e) => setViolationForm({...violationForm, location: e.target.value})}
                      className="w-full bg-[rgba(0,143,70,0.2)] border border-white/30 p-2 text-sm text-white focus:border-white outline-none rounded"
                      placeholder="Enter location"
                        />
                      </div>
                      <div>
                    <label className="text-xs text-white font-bold block mb-1">FINE: $</label>
                      <input
                        type="text"
                        value={violationForm.fine}
                        onChange={(e) => setViolationForm({...violationForm, fine: e.target.value})}
                      className="w-full bg-[rgba(0,143,70,0.2)] border border-white/30 p-2 text-sm text-white focus:border-white outline-none rounded"
                      placeholder="Enter fine amount"
                      />
                    </div>
                      <button
                        onClick={handleViolationSubmit}
                        disabled={violationSubmitted}
                    className="w-full py-3 bg-[rgba(0,143,70,0.5)] text-white flex items-center justify-center gap-2 hover:bg-[rgba(0,143,70,0.6)] transition-colors rounded-lg disabled:opacity-50"
                      >
                        {violationSubmitted ? (
                      <>
                            <CheckCircle size={16} />
                            SUBMITTED
                      </>
                        ) : (
                          'SUBMIT VIOLATION TICKET'
                        )}
                      </button>
                    </div>
              </div>
            </article>
                  </div>
                </div>
              </div>
            </div>
          </>
  );
};

export default GreenwashForms;
