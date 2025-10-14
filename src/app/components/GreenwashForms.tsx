'use client';

import React, { useState, useCallback, useRef } from 'react';
import { X, FileText, AlertTriangle } from 'lucide-react';
import { useLockBodyScroll } from '../../components/useLockBodyScroll';

interface GreenwashFormsProps {
  isOpen: boolean;
  onClose: () => void;
}

const GreenwashForms: React.FC<GreenwashFormsProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('auth');
  const [authLoaded, setAuthLoaded] = useState(false);
  const [violationLoaded, setViolationLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [authSubmitted, setAuthSubmitted] = useState(false);
  const [violationSubmitted, setViolationSubmitted] = useState(false);
  
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
  const [authForm, setAuthForm] = useState({
    permitId: '',
    dateIssued: '',
    fieldOfficer: '',
    workerId: '',
    assignedZone: '',
    objectType: '',
    locationAddress: '',
    dimensions: '',
    existingColor: '',
    approvedCode: '',
    authorizedAction: '',
    estimatedCost: '',
    expectedDate: '',
    observations: ''
  });

  const [violationForm, setViolationForm] = useState({
    ticketNo: '',
    date: '',
    zone: '',
    name: '',
    location: '',
    currentColor: '',
    approvedCode: '',
    violations: {
      notPaintedGreen: false,
      unauthorizedReplacement: false,
      competingColors: false,
      obstruction: false
    },
    fine: '',
    description: '',
    severity: ''
  });

  const exampleAuth = {
    permitId: '002942-GM',
    dateIssued: '01/22/2037',
    fieldOfficer: 'D. LEE',
    workerId: '229-B',
    assignedZone: 'ZONE B-EAST RIVER',
    objectType: 'billboard',
    locationAddress: 'SOUTH ST & PIKE SLIP',
    dimensions: '30 FT X 20 FT',
    existingColor: 'SKY BLUE WITH YELLOW',
    approvedCode: 'G-41 (CANOPY GREEN)',
    authorizedAction: 'replace',
    estimatedCost: '4850.00',
    expectedDate: '02/05/2037',
    observations: 'BILLBOARD IN UNAUTHORIZED COLORS. FULL REPLACEMENT REQUIRED FOR VISIBILITY.'
  };

  const exampleViolation = {
    ticketNo: 'UN-2037-032',
    date: '01/28/2037',
    zone: 'C-CHINATOWN',
    name: 'MERCHANT CART - L. WONG',
    location: 'CANAL ST & MOTT ST',
    currentColor: 'RED W/ WHITE',
    approvedCode: 'G-05 (VENDOR)',
    violations: {
      notPaintedGreen: true,
      unauthorizedReplacement: false,
      competingColors: true,
      obstruction: false
    },
    fine: '220.00',
    description: 'UNAUTHORIZED RED UMBRELLA CANOPY ON ACTIVE VENDOR CART, CREATING VISUAL DISRUPTION.',
    severity: 'minor'
  };

  const loadExample = (type: string) => {
    if (type === 'auth') {
      setAuthForm(exampleAuth);
      setAuthLoaded(true);
    } else {
      setViolationForm(exampleViolation);
      setViolationLoaded(true);
    }
  };

  const clearExample = (type: string) => {
    if (type === 'auth') {
      setAuthForm({
        permitId: '',
        dateIssued: '',
        fieldOfficer: '',
        workerId: '',
        assignedZone: '',
        objectType: '',
        locationAddress: '',
        dimensions: '',
        existingColor: '',
        approvedCode: '',
        authorizedAction: '',
        estimatedCost: '',
        expectedDate: '',
        observations: ''
      });
      setAuthLoaded(false);
    } else {
      setViolationForm({
        ticketNo: '',
        date: '',
        zone: '',
        name: '',
        location: '',
        currentColor: '',
        approvedCode: '',
        violations: {
          notPaintedGreen: false,
          unauthorizedReplacement: false,
          competingColors: false,
          obstruction: false
        },
        fine: '',
        description: '',
        severity: ''
      });
      setViolationLoaded(false);
    }
  };

  const handleAuthSubmit = () => {
    setAuthSubmitted(true);
    setTimeout(() => {
      setAuthForm({
        permitId: '',
        dateIssued: '',
        fieldOfficer: '',
        workerId: '',
        assignedZone: '',
        objectType: '',
        locationAddress: '',
        dimensions: '',
        existingColor: '',
        approvedCode: '',
        authorizedAction: '',
        estimatedCost: '',
        expectedDate: '',
        observations: ''
      });
      setAuthLoaded(false);
      setAuthSubmitted(false);
    }, 2000);
  };

  const handleViolationSubmit = () => {
    setViolationSubmitted(true);
    setTimeout(() => {
      setViolationForm({
        ticketNo: '',
        date: '',
        zone: '',
        name: '',
        location: '',
        currentColor: '',
        approvedCode: '',
        violations: {
          notPaintedGreen: false,
          unauthorizedReplacement: false,
          competingColors: false,
          obstruction: false
        },
        fine: '',
        description: '',
        severity: ''
      });
      setViolationLoaded(false);
      setViolationSubmitted(false);
    }, 2000);
  };

  const inputStyle = {
    backgroundColor: 'rgba(0, 143, 70, 0.3)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    border: 'none',
    color: '#FFFFFF',
    borderRadius: '8px',
    fontFamily: 'PPNeueMontreal, sans-serif'
  };

  const buttonStyle = {
    padding: '8px 14px',
    backgroundColor: 'rgba(0, 143, 70, 0.3)',
    color: '#FFFFFF',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
    letterSpacing: '0.3px',
    border: 'none',
    borderRadius: '8px',
    fontFamily: 'PPNeueMontreal, sans-serif'
  };

  if (!isOpen) return null;

  return (
    <>
      <style jsx>{`
        input[type="checkbox"],
        input[type="radio"] {
          appearance: none;
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          border: 1px solid #FFFFFF;
          border-radius: 2px;
          background: transparent;
          cursor: pointer;
          position: relative;
          flex-shrink: 0;
        }
        
        input[type="checkbox"]:checked,
        input[type="radio"]:checked {
          background: transparent;
        }
        
        input[type="checkbox"]:checked::after,
        input[type="radio"]:checked::after {
          content: '✕';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: #FFFFFF;
          font-size: 14px;
          font-weight: bold;
          line-height: 1;
        }
      `}</style>
      {/* Report Icon — positioned at top center */}
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
            src="/img/report-final.webp"
            alt="Report"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
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

        {/* Forms container */}
        <div
          tabIndex={-1}
          onClick={(e) => e.stopPropagation()}
          className={`
            relative z-10
            w-[92vw] sm:w-[86vw] md:w-auto
            h-screen
            max-w-[32rem] md:max-w-[34rem] lg:max-w-[68rem]
            focus:outline-none
            ${isClosing ? 'animate-[fadeOutScaleDown_0.3s_ease-in_forwards]' : 'opacity-0 scale-98 translate-y-2 animate-[fadeInScaleUp_0.4s_ease-out_0.12s_forwards]'}
          `}
        >

          {/* Scrollable forms content with top/bottom spacing */}
          <div 
            ref={scrollContainerRef}
            className="h-full w-full overflow-y-auto overscroll-contain scroll-smooth hide-scrollbar"
            onWheel={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()}
          >
            <div className="pb-20" style={{ paddingTop: 'calc(16px + 48px + 80px)' }}>
            {/* Tab Navigation - Only show on mobile, inside scroll area */}
            {isMobile && (
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setActiveTab('auth')}
                  className={`flex items-center gap-2 px-4 py-3 transition-all rounded-lg ${
                    activeTab === 'auth' ? 'opacity-100' : 'opacity-60'
                  }`}
                  style={{
                    ...buttonStyle,
                    border: 'none'
                  }}
                >
                  <FileText size={18} />
                  <span className="text-xs tracking-wider">AUT-37</span>
                </button>
                <button
                  onClick={() => setActiveTab('violation')}
                  className={`flex items-center gap-2 px-4 py-3 transition-all rounded-lg ${
                    activeTab === 'violation' ? 'opacity-100' : 'opacity-60'
                  }`}
                  style={{
                    ...buttonStyle,
                    border: 'none'
                  }}
                >
                  <AlertTriangle size={18} />
                  <span className="text-xs tracking-wider">VLT-37</span>
                </button>
              </div>
            )}

              <div className={isMobile ? '' : 'px-4 grid grid-cols-2 gap-3 items-start content-start'}>
          {/* Authorization Form */}
          {(isMobile ? activeTab === 'auth' : true) && (
          <div 
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: 'rgba(0, 143, 70, 0.3)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-medium text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif', letterSpacing: '0.025em' }}>
                  Authorization Form AUT-37
                </h2>
              </div>

                  <button
                onClick={() => authLoaded ? clearExample('auth') : loadExample('auth')}
                className="w-full mb-6 transition-all text-xs tracking-wider rounded-lg"
                style={buttonStyle}
              >
                {authLoaded ? 'CLEAR EXAMPLE' : 'LOAD EXAMPLE'}
                  </button>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                      <div>
                    <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>PERMIT ID NO:</label>
                        <input
                          type="text"
                          value={authForm.permitId}
                          onChange={(e) => setAuthForm({...authForm, permitId: e.target.value})}
                      className="w-full p-2 text-sm focus:outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>DATE ISSUED:</label>
                    <input
                      type="text"
                      value={authForm.dateIssued}
                      onChange={(e) => setAuthForm({...authForm, dateIssued: e.target.value})}
                      className="w-full p-2 text-sm focus:outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>FIELD OFFICER:</label>
                    <input
                      type="text"
                      value={authForm.fieldOfficer}
                      onChange={(e) => setAuthForm({...authForm, fieldOfficer: e.target.value})}
                      className="w-full p-2 text-sm focus:outline-none"
                      style={inputStyle}
                        />
                      </div>
                      <div>
                    <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>WORKER ID:</label>
                    <input
                      type="text"
                      value={authForm.workerId}
                      onChange={(e) => setAuthForm({...authForm, workerId: e.target.value})}
                      className="w-full p-2 text-sm focus:outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>ASSIGNED ZONE:</label>
                      <input
                        type="text"
                    value={authForm.assignedZone}
                    onChange={(e) => setAuthForm({...authForm, assignedZone: e.target.value})}
                    className="w-full p-2 text-sm focus:outline-none text-white"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>TYPE OF OBJECT:</label>
                  <div className="space-y-2">
                    {['vehicle', 'bench', 'billboard', 'building', 'other'].map(type => (
                      <label key={type} className="flex items-center space-x-3 cursor-pointer p-2 rounded" style={inputStyle}>
                        <input
                          type="radio"
                          name="objectType"
                          value={type}
                          checked={authForm.objectType === type}
                          onChange={(e) => setAuthForm({...authForm, objectType: e.target.value})}
                        />
                        <span className="text-sm uppercase text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>{type}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>LOCATION ADDRESS:</label>
                  <input
                    type="text"
                    value={authForm.locationAddress}
                    onChange={(e) => setAuthForm({...authForm, locationAddress: e.target.value})}
                    className="w-full p-2 text-sm focus:outline-none text-white"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>DIMENSIONS/SIZE:</label>
                  <input
                    type="text"
                    value={authForm.dimensions}
                    onChange={(e) => setAuthForm({...authForm, dimensions: e.target.value})}
                    className="w-full p-2 text-sm focus:outline-none text-white"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>EXISTING COLOR:</label>
                  <input
                    type="text"
                    value={authForm.existingColor}
                    onChange={(e) => setAuthForm({...authForm, existingColor: e.target.value})}
                    className="w-full p-2 text-sm focus:outline-none text-white"
                    style={inputStyle}
                        />
                      </div>

                      <div>
                  <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>APPROVED GREEN CODE:</label>
                      <input
                        type="text"
                    value={authForm.approvedCode}
                    onChange={(e) => setAuthForm({...authForm, approvedCode: e.target.value})}
                    className="w-full p-2 text-sm focus:outline-none text-white"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>AUTHORIZED ACTION:</label>
                  <div className="space-y-2">
                    {['apply', 'replace', 'confiscate', 'other'].map(action => (
                      <label key={action} className="flex items-center space-x-3 cursor-pointer p-2 rounded" style={inputStyle}>
                        <input
                          type="radio"
                          name="authorizedAction"
                          value={action}
                          checked={authForm.authorizedAction === action}
                          onChange={(e) => setAuthForm({...authForm, authorizedAction: e.target.value})}
                        />
                        <span className="text-sm uppercase text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>{action === 'apply' ? 'Apply Green Paint' : action === 'replace' ? 'Replace Object' : action === 'confiscate' ? 'Confiscate Object' : 'Other'}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>ESTIMATED COST:</label>
                    <input
                      type="text"
                      value={authForm.estimatedCost}
                      onChange={(e) => setAuthForm({...authForm, estimatedCost: e.target.value})}
                      className="w-full p-2 text-sm focus:outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>EXPECTED DATE:</label>
                    <input
                      type="text"
                      value={authForm.expectedDate}
                      onChange={(e) => setAuthForm({...authForm, expectedDate: e.target.value})}
                      className="w-full p-2 text-sm focus:outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>INSPECTOR OBSERVATIONS:</label>
                  <textarea
                    value={authForm.observations}
                    onChange={(e) => setAuthForm({...authForm, observations: e.target.value})}
                    rows={3}
                    className="w-full p-2 text-sm focus:outline-none text-white"
                    style={inputStyle}
                  />
                </div>
                      </div>

              <div className="mt-6">
                      <button
                        onClick={handleAuthSubmit}
                        disabled={authSubmitted}
                  className="w-full font-medium tracking-widest transition-all duration-300 rounded-lg"
                  style={{
                    ...buttonStyle,
                    border: 'none',
                        padding: '12px',
                        opacity: authSubmitted ? 0.6 : 1,
                        cursor: authSubmitted ? 'not-allowed' : 'pointer'
                  }}
                >
                  {authSubmitted ? 'SUBMITTED' : 'SUBMIT'}
                      </button>
                    </div>
                  </div>
          </div>
          )}

            {/* Violation Form */}
          {(isMobile ? activeTab === 'violation' : true) && (
          <div 
            className="rounded-lg overflow-hidden"
            style={{
              backgroundColor: 'rgba(0, 143, 70, 0.3)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)'
            }}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-medium text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif', letterSpacing: '0.025em' }}>
                  Violation Ticket VLT-37
                </h2>
              </div>

              <button
                onClick={() => violationLoaded ? clearExample('violation') : loadExample('violation')}
                className="w-full mb-6 transition-all text-xs tracking-wider rounded-lg"
                style={buttonStyle}
              >
                {violationLoaded ? 'CLEAR EXAMPLE' : 'LOAD EXAMPLE'}
              </button>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                      <div>
                    <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>TICKET NO:</label>
                        <input
                          type="text"
                          value={violationForm.ticketNo}
                          onChange={(e) => setViolationForm({...violationForm, ticketNo: e.target.value})}
                      className="w-full p-2 text-sm focus:outline-none"
                      style={inputStyle}
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>DATE:</label>
                    <input
                      type="text"
                      value={violationForm.date}
                      onChange={(e) => setViolationForm({...violationForm, date: e.target.value})}
                      className="w-full p-2 text-sm focus:outline-none"
                      style={inputStyle}
                        />
                      </div>
                      <div>
                    <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>ZONE:</label>
                    <input
                      type="text"
                      value={violationForm.zone}
                      onChange={(e) => setViolationForm({...violationForm, zone: e.target.value})}
                      className="w-full p-2 text-sm focus:outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>NAME:</label>
                  <input
                    type="text"
                    value={violationForm.name}
                    onChange={(e) => setViolationForm({...violationForm, name: e.target.value})}
                    className="w-full p-2 text-sm focus:outline-none text-white"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>LOCATION:</label>
                      <input
                        type="text"
                        value={violationForm.location}
                        onChange={(e) => setViolationForm({...violationForm, location: e.target.value})}
                    className="w-full p-2 text-sm focus:outline-none text-white"
                    style={inputStyle}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>CURRENT COLOR:</label>
                    <input
                      type="text"
                      value={violationForm.currentColor}
                      onChange={(e) => setViolationForm({...violationForm, currentColor: e.target.value})}
                      className="w-full p-2 text-sm focus:outline-none"
                      style={inputStyle}
                        />
                      </div>
                      <div>
                    <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>APPROVED GREEN CODE:</label>
                    <input
                      type="text"
                      value={violationForm.approvedCode}
                      onChange={(e) => setViolationForm({...violationForm, approvedCode: e.target.value})}
                      className="w-full p-2 text-sm focus:outline-none"
                      style={inputStyle}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>NATURE OF VIOLATION:</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3 cursor-pointer p-2 rounded" style={inputStyle}>
                      <input
                        type="checkbox"
                        checked={violationForm.violations.notPaintedGreen}
                        onChange={(e) => setViolationForm({
                          ...violationForm,
                          violations: {...violationForm.violations, notPaintedGreen: e.target.checked}
                        })}
                      />
                      <span className="text-sm text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>Object not painted green</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-2 rounded" style={inputStyle}>
                      <input
                        type="checkbox"
                        checked={violationForm.violations.unauthorizedReplacement}
                        onChange={(e) => setViolationForm({
                          ...violationForm,
                          violations: {...violationForm.violations, unauthorizedReplacement: e.target.checked}
                        })}
                      />
                      <span className="text-sm text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>Unauthorized non-green replacement</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-2 rounded" style={inputStyle}>
                      <input
                        type="checkbox"
                        checked={violationForm.violations.competingColors}
                        onChange={(e) => setViolationForm({
                          ...violationForm,
                          violations: {...violationForm.violations, competingColors: e.target.checked}
                        })}
                      />
                      <span className="text-sm text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>Display of competing colors</span>
                    </label>
                    <label className="flex items-center space-x-3 cursor-pointer p-2 rounded" style={inputStyle}>
                      <input
                        type="checkbox"
                        checked={violationForm.violations.obstruction}
                        onChange={(e) => setViolationForm({
                          ...violationForm,
                          violations: {...violationForm.violations, obstruction: e.target.checked}
                        })}
                      />
                      <span className="text-sm text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>Obstruction of greening operations</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>FINE AMOUNT ($):</label>
                      <input
                        type="text"
                        value={violationForm.fine}
                        onChange={(e) => setViolationForm({...violationForm, fine: e.target.value})}
                    className="w-full p-2 text-sm focus:outline-none text-white"
                    style={inputStyle}
                      />
                    </div>

                <div>
                  <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>BRIEF DESCRIPTION:</label>
                  <textarea
                    value={violationForm.description}
                    onChange={(e) => setViolationForm({...violationForm, description: e.target.value})}
                    rows={3}
                    className="w-full p-2 text-sm focus:outline-none text-white"
                    style={inputStyle}
                  />
                    </div>

                <div>
                  <label className="block text-xs mb-2 text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>SEVERITY:</label>
                  <div className="space-y-2">
                    {['minor', 'major', 'critical'].map(sev => (
                      <label key={sev} className="flex items-center space-x-3 cursor-pointer p-2 rounded" style={inputStyle}>
                        <input
                          type="radio"
                          name="severity"
                          value={sev}
                          checked={violationForm.severity === sev}
                          onChange={(e) => setViolationForm({...violationForm, severity: e.target.value})}
                        />
                        <span className="text-sm uppercase text-white" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>{sev}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={handleViolationSubmit}
                  disabled={violationSubmitted}
                  className="w-full font-medium tracking-widest transition-all duration-300 rounded-lg"
                  style={{
                    ...buttonStyle,
                    border: 'none',
                    padding: '12px',
                    opacity: violationSubmitted ? 0.6 : 1,
                    cursor: violationSubmitted ? 'not-allowed' : 'pointer'
                  }}
                >
                  {violationSubmitted ? 'SUBMITTED' : 'SUBMIT'}
                </button>
              </div>
            </div>
          </div>
          )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GreenwashForms;
