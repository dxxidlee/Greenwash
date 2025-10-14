// app/components/Chrome.tsx
'use client';
import { useState, useEffect } from 'react';

export default function Chrome() {
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleProfileInteraction = {
    // Desktop: hover
    onMouseEnter: !isMobile ? () => setShowProfileDropdown(true) : undefined,
    onMouseLeave: !isMobile ? () => setShowProfileDropdown(false) : undefined,
    // Mobile: press and hold
    onTouchStart: isMobile ? () => setShowProfileDropdown(true) : undefined,
    onTouchEnd: isMobile ? () => setShowProfileDropdown(false) : undefined,
  };

  return (
    <>
      {/* Profile Image - Top Left */}
      <div 
        className="fixed z-20"
        style={{ 
          top: 'var(--edge-margin)', 
          left: 'var(--edge-margin)' 
        }}
        {...handleProfileInteraction}
      >
        <img 
          src="/img/id_photo.png" 
          alt="Profile" 
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className="h-14 w-auto object-contain shrink-0"
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none'
          }}
        />
        
        {/* Profile Dropdown */}
        {showProfileDropdown && (
          <div 
            className="absolute top-full left-0 mt-2 gw-glass-light profile-dropdown pointer-events-none z-50"
            style={{ minWidth: '320px' }}
          >
            {/* Header - Two Lines */}
            <div className="mb-3 leading-tight">
              <div className="text-sm font-medium" style={{color: 'var(--gw-green)'}}>
                Officer: D. Lee
              </div>
              <div className="text-sm font-medium mb-3" style={{color: 'var(--gw-green)'}}>
                ID: 229-B
              </div>
              {/* Thin line separator */}
              <div 
                className="h-px mb-3" 
                style={{
                  backgroundColor: 'var(--gw-green)',
                  width: '100%'
                }}
              />
            </div>
            
            {/* Description Paragraph - No orphans */}
            <p className="text-sm leading-tight" style={{color: 'var(--gw-green)'}}>
              Greenwash replaces ecology with appearance after the authorized removal of the city's green spaces. Standardized color is governance; compliance is public good. Uniform green is now policy. Use the workstation to file requests, report non-compliance, verify hue by scanner, enter the cleansing chamber, and complete the scheduled&nbsp;self-test. Nonconformance will be&nbsp;recorded.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Combined Logo with Seal */}
      <div 
        className="fixed left-1/2 -translate-x-1/2"
        style={{ 
          bottom: 'var(--edge-margin)',
          maxWidth: '90vw' // Prevent overflow on mobile
        }}
      >
        <img 
          src="/img/logo_with_seal.png" 
          alt="Greenwash logo with seal" 
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
          className="h-16 md:h-16 sm:h-12 w-auto object-contain shrink-0 max-w-full"
          style={{
            userSelect: 'none',
            WebkitUserSelect: 'none',
            WebkitTouchCallout: 'none',
            pointerEvents: 'none'
          }}
        />
      </div>
    </>
  );
}
