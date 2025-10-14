'use client';
import { useEffect, useState, useRef } from 'react';

const PROTOCOL_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'access', label: 'System Access' },
  { id: 'conduct', label: 'Conduct Policy' },
  { id: 'visual', label: 'Visual Integrity' },
  { id: 'enforcement', label: 'Enforcement' }
];

const PROTOCOL_CONTENT = {
  overview: `Greenwash safeguards unity through chromatic order. It exists to uphold visual consistency across the city's modified environments.
This digital manual serves as an orientation for all active personnel under the Metropolitan Office of Urban Colorization (MOUC). Familiarity with these protocols is mandatory.`,
  
  access: `Journal: Record task logs, field observations, and daily reflections.

Reports: Submit violation tickets and permit slips for administrative review.

Breakroom: Reserved for disciplinary recalibration and reflection sessions.

Huescan: Verify object compliance with Standard Green (Code 008F43).

Files: Access archived materials including posters, forms, and approved object lists.

Selftest: Complete your daily cognitive assessment to confirm Greenwash compliance.`,
  
  conduct: `Maintain accuracy in all records, composure during interface use, and discretion with restricted materials.
Unauthorized actions, deletions, or unsanctioned uploads are prohibited.
Each session is logged, encrypted, and reviewed for compliance.`,
  
  visual: `Greenwash maintains order through perfect perception.
Personnel are responsible for preserving chromatic balance in all visible zones.
Distortions, discoloration, or unauthorized hues are to be corrected or concealed.
Documentation is secondary to restoration.

Imperfection invites scrutiny.
Scrutiny restores order.`,
  
  enforcement: `Failure to adhere to established procedures may result in:

Temporary suspension of portal access privileges.

Reassignment to analog paint-mixing or sanitation duties.

Permanent deactivation from the Greenwash Program.

Compliance ensures color harmony.
Noncompliance invites correction.`
};

export default function ProtocolQuickList() {
  const [liveTimeFontSize, setLiveTimeFontSize] = useState('0.8rem');
  const [isMobile, setIsMobile] = useState(false);
  const [activePopup, setActivePopup] = useState<string | null>(null);

  // Check for mobile and update font size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Read live time font size and set CSS custom property
  useEffect(() => {
    const updateFontSize = () => {
      const liveTimeElement = document.querySelector('[data-live-time]');
      if (liveTimeElement) {
        const computedStyle = window.getComputedStyle(liveTimeElement);
        const fontSize = computedStyle.fontSize;
        setLiveTimeFontSize(fontSize);
        document.documentElement.style.setProperty('--liveTimeFontSize', fontSize);
      }
    };

    // Initial update
    updateFontSize();
    
    // Update on resize
    window.addEventListener('resize', updateFontSize);
    return () => window.removeEventListener('resize', updateFontSize);
  }, []);

  const handleMouseEnter = (id: string) => {
    setActivePopup(id);
  };

  const handleMouseLeave = () => {
    setActivePopup(null);
  };

  const handleTouchStart = (id: string) => {
    setActivePopup(id);
  };

  const handleTouchEnd = () => {
    setActivePopup(null);
  };

  const handleOutsideClick = () => {
    setActivePopup(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // No action needed for keyboard
    }
  };

  return (
    <>
      
      <div 
        className="fixed z-10 pointer-events-auto"
        data-protocol-list
        style={{ 
          bottom: '10px', 
          left: '10px',
          fontSize: 'var(--liveTimeFontSize, 0.8rem)'
        }}
      >
      <div className="text-[#008F46] font-medium" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>
        {/* Header */}
        <div className="mb-1 font-medium ml-9">Protocol</div>
        
        {/* List Items */}
        <div className="space-y-1">
          {PROTOCOL_ITEMS.map((item, index) => (
            <div key={item.id} className="relative">
              <div 
                className="flex items-center cursor-pointer hover:opacity-100 transition-opacity duration-200"
                onMouseEnter={() => !isMobile && handleMouseEnter(item.id)}
                onMouseLeave={() => !isMobile && handleMouseLeave()}
                onTouchStart={() => isMobile && handleTouchStart(item.id)}
                onTouchEnd={() => isMobile && handleTouchEnd()}
                tabIndex={0}
                role="button"
                aria-label={`Protocol ${item.label}`}
                style={{ 
                  outline: 'none',
                  fontFamily: 'PPNeueMontreal, sans-serif',
                  lineHeight: '1.2'
                }}
              >
                {/* Number Column */}
                <div className="text-[#008F46] font-medium mr-3 w-6 text-left">
                  {String(index + 1).padStart(2, '0')}
                </div>
                
                {/* Label Column */}
                <div className="text-[#008F46] font-medium">
                  {item.label}
                </div>
              </div>
              
              {/* Horizontal Rule */}
              <div 
                className="mt-1 bg-[#008F46]"
                style={{ 
                  width: '12em',
                  height: '0.5px'
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>
      </div>
      
      {/* Protocol Popups - Styled exactly like profile dropdown, positioned above */}
      {activePopup && (
        <div 
          className="fixed z-50 backdrop-blur-sm shadow-2xl rounded-lg p-4 pointer-events-none"
          style={{ 
            backgroundColor: 'rgba(0, 143, 70, 0.3)',
            bottom: 'calc(10px + 8.5em + 8px)', // Position above the protocol list with 8px gap (same as profile dropdown mt-2)
            left: '10px', // Same left position as protocol list
            width: '320px' // Fixed width to match profile dropdown
          }}
        >
          {/* Section Title */}
          <div className="text-xs font-medium text-white mb-2">
            Protocol: {PROTOCOL_ITEMS.find(item => item.id === activePopup)?.label}
          </div>
          <div className="border-t border-white mb-2"></div>
          
          {/* Content */}
          <div className="text-xs font-medium text-white mb-2" style={{ whiteSpace: 'pre-line' }}>
            {PROTOCOL_CONTENT[activePopup as keyof typeof PROTOCOL_CONTENT]}
          </div>
        </div>
      )}
    </>
  );
}
