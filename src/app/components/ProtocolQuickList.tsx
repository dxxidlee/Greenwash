'use client';
import { useEffect, useState } from 'react';

const PROTOCOL_ITEMS = [
  { id: 'overview', label: 'Overview' },
  { id: 'access', label: 'System Access' },
  { id: 'conduct', label: 'Conduct Policy' },
  { id: 'visual', label: 'Visual Integrity' },
  { id: 'enforcement', label: 'Enforcement' }
];

export default function ProtocolQuickList() {
  const [liveTimeFontSize, setLiveTimeFontSize] = useState('0.8rem');
  const [isMobile, setIsMobile] = useState(false);

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
    // Navigate to protocol section
    window.location.href = `/protocol#${id}`;
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleItemClick(id);
    }
  };

  return (
    <div 
      className="fixed z-10 pointer-events-auto"
      style={{ 
        bottom: '10px', 
        left: '2px',
        fontSize: 'var(--liveTimeFontSize, 0.8rem)'
      }}
    >
      <div className="text-[#008F46] font-medium" style={{ fontFamily: 'PPNeueMontreal, sans-serif' }}>
        {/* Header */}
        <div className="mb-3 font-medium opacity-90">Protocol</div>
        
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
                <div className="text-[#008F46] font-medium relative group">
                  {item.label}
                  {/* Hover underline */}
                  <div className="absolute bottom-0 left-0 w-0 h-px bg-[#008F46] transition-all duration-200 group-hover:w-full"></div>
                </div>
              </div>
              
              {/* Horizontal Rule */}
              <div 
                className="mt-1 h-px bg-[#008F46]"
                style={{ 
                  width: `${item.label.length * 0.6}em`,
                  opacity: 0.6
                }}
              ></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
