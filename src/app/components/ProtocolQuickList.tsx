'use client';
import { useEffect, useState } from 'react';

const PROTOCOL_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'access', label: 'System Access' },
  { id: 'conduct', label: 'Conduct Policy' },
  { id: 'visual', label: 'Visual Integrity' },
  { id: 'enforcement', label: 'Enforcement' }
];

const PROTOCOL_CONTENT = {
  overview: `Greenwash safeguards unity through chromatic order.
It exists to uphold visual consistency across the city's modified environments.
This digital manual serves as an orientation for all active personnel under the Metropolitan Office of Urban Colorization (MOUC).
Familiarity with these protocols is mandatory.`,
  
  access: `All personnel are required to access the Greenwash Portal at the start of each shift.

Core Modules:

Journal: Record task logs, field observations, and daily reflections.

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

  const handleItemClick = (id: string) => {
    setActivePopup(activePopup === id ? null : id);
  };

  const handleOutsideClick = () => {
    setActivePopup(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick(id);
    }
  };

  return (
    <>
      {/* Click outside handler */}
      {activePopup && (
        <div 
          className="fixed inset-0 z-40"
          onClick={handleOutsideClick}
        />
      )}
      
      <div 
        className="fixed z-10 pointer-events-auto"
        style={{ 
          bottom: '10px', 
          left: '10px',
          fontSize: 'var(--liveTimeFontSize, 0.8rem)'
        }}
      >
      <div className="text-[#008F46] font-medium" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>
        {/* Header */}
        <div className="mb-3 font-medium ml-9">Protocol</div>
        
        {/* Stroke under Protocol */}
        <div 
          className="mt-1 h-px bg-[#008F46] ml-9"
          style={{ 
            width: '12em'
          }}
        ></div>
        
        {/* List Items */}
        <div className="space-y-2">
          {PROTOCOL_ITEMS.map((item, index) => (
            <div key={item.id} className="relative">
              <div 
                className="flex items-center cursor-pointer hover:opacity-100 transition-opacity duration-200"
                onClick={() => handleItemClick(item.id)}
                onKeyDown={(e) => handleKeyDown(e, item.id)}
                tabIndex={0}
                role="button"
                aria-label={`Protocol ${item.label}`}
                style={{ 
                  outline: 'none',
                  fontFamily: 'PPNeueMontreal, sans-serif',
                  lineHeight: '1.2'
                }}
                onFocus={(e) => {
                  e.target.style.outline = '1px solid rgba(0, 143, 70, 0.6)';
                  e.target.style.outlineOffset = '2px';
                }}
                onBlur={(e) => {
                  e.target.style.outline = 'none';
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
                className="mt-1 h-px bg-[#008F46]"
                style={{ 
                  width: '12em'
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>
      </div>
      
      {/* Protocol Popups */}
      {activePopup && (
        <div 
          className="fixed z-50 backdrop-blur-sm shadow-2xl rounded-lg p-4 max-w-md"
          style={{ 
            backgroundColor: 'rgba(0, 143, 70, 0.3)',
            bottom: '10px',
            left: '220px', // Position to the right of the ProtocolQuickList
            maxHeight: 'calc(100vh - 20px)' // Don't exceed viewport height
          }}
        >
          <div className="text-white">
            {/* Header */}
            <div className="text-xs font-medium text-white mb-3">
              Greenwash Compliance Manual
            </div>
            <div className="border-t border-white mb-3"></div>
            
            {/* Section Title */}
            <div className="text-xs font-medium text-white mb-2">
              {PROTOCOL_ITEMS.find(item => item.id === activePopup)?.label}
            </div>
            <div className="border-t border-white mb-3"></div>
            
            {/* Content */}
            <div className="text-xs font-medium text-white whitespace-pre-line">
              {PROTOCOL_CONTENT[activePopup as keyof typeof PROTOCOL_CONTENT].split('⸻').map((paragraph, index) => (
                <div key={index}>
                  {paragraph.trim()}
                  {index < PROTOCOL_CONTENT[activePopup as keyof typeof PROTOCOL_CONTENT].split('⸻').length - 1 && (
                    <div className="border-t border-white my-3"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
