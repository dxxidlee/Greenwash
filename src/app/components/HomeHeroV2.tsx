'use client';
import { useEffect, useRef, useState } from 'react';
import Ring from './Ring';
import HoverLabel from './HoverLabel';
import GreenwashForms from './GreenwashForms';
import GreenwashFinder from './GreenwashFinder';
import JournalModal from '../../components/JournalModal';
import GreenwashQuiz from './GreenwashQuiz';
import GreenwashManual from './GreenwashManual';

const DOT_LABELS = [
  'BreakRoom BRK-37',
  'Protocol PRT-37', 
  'HueScan HUE-37',
  'Report RPT-37',
  'Files FLS-37',
  'Journal JNL-37',
  'SelfTest STT-37'
];

export default function HomeHeroV2() {
  const [hoverIdx, setHoverIdx] = useState<number|null>(null);
  const [anchor, setAnchor] = useState<{x:number;y:number}|null>(null);
  const [isFormsOpen, setIsFormsOpen] = useState(false);
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const ringRef = useRef<HTMLDivElement|null>(null);
  const rightPanelRef = useRef<HTMLDivElement|null>(null);

  // Check for mobile
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Live time update
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const year = 2037; // Fixed year as specified
      const month = now.toLocaleDateString('en-US', { month: 'short' });
      const day = now.getDate().toString().padStart(2, '0');
      const time = now.toLocaleTimeString('en-US', { 
        hour12: true, 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
      });
      setCurrentTime(`${month} ${day} ${year} ${time}`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle ring positioning and sizing
  useEffect(() => {
    if (hoverIdx === null) { 
      setAnchor(null); 
      return; 
    }
    
    if (rightPanelRef.current) {
      const rect = rightPanelRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      setAnchor({ x: centerX, y: centerY });
    }
  }, [hoverIdx]);

  const handleDotClick = (index: number) => {
    const label = DOT_LABELS[index];
    
    // Navigate to internal routes for specific features
    if (label === 'BreakRoom BRK-37') {
      window.location.href = '/breakroom';
    } else if (label === 'Protocol PRT-37') {
      setIsManualOpen(true);
    } else if (label === 'HueScan HUE-37') {
      window.location.href = '/huescan';
    } else if (label === 'Report RPT-37') {
      setIsFormsOpen(true);
    } else if (label === 'Files FLS-37') {
      setIsFilesOpen(true);
    } else if (label === 'Journal JNL-37') {
      setIsJournalOpen(true);
    } else if (label === 'SelfTest STT-37') {
      setIsQuizOpen(true);
    } else {
      // For other features, show placeholder
      console.log(`Clicked: ${label} - Feature coming soon`);
      alert(`${label} - Feature coming soon!`);
    }
  };

  // Handle ESC key for popup
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProfilePopup(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <main className="min-h-screen relative overflow-hidden select-none bg-white">
      {/* Background Image with 30% opacity overlay */}
      <div 
        className="fixed inset-0 bg-white"
        style={{
          backgroundImage: 'url(/img/id_photo.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3
        }}
      />
      
      {/* Green haze overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-50/20 to-green-100/10 pointer-events-none" />
      
      {/* Main Grid Layout */}
      <div className="relative z-10 min-h-screen grid grid-cols-12 gap-4 p-6">
        
        {/* Mobile Layout */}
        {isMobile ? (
          <>
            {/* Top Row - Profile and Time */}
            <div className="col-span-12 flex justify-between items-start mb-8">
              {/* Profile Section */}
              <div className="relative">
                <div 
                  className="cursor-pointer"
                  style={{ width: '60px', height: '60px' }}
                  onTouchStart={() => setShowProfilePopup(true)}
                  onTouchEnd={() => setShowProfilePopup(false)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowProfilePopup(!showProfilePopup);
                    }
                  }}
                >
                  <img 
                    src="/img/id_photo.png" 
                    alt="Officer Profile"
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Profile Popup */}
                {showProfilePopup && (
                  <div className="absolute top-16 left-0 bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-lg min-w-[280px] z-50">
                    <div className="text-sm font-medium text-gray-800 mb-2">
                      Officer: D. Lee | ID: 229-B
                    </div>
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      Project Information:
                    </div>
                    <div className="text-xs text-gray-700 leading-relaxed">
                      The GREENWASH initiative represents a comprehensive approach to urban environmental compliance. 
                      Through systematic color standardization and visual harmony protocols, we ensure that all public 
                      and commercial spaces adhere to the established green palette guidelines. This project aims to 
                      create a unified, peaceful urban environment while maintaining strict compliance standards 
                      across all zones and sectors.
                    </div>
                  </div>
                )}
              </div>

              {/* Live Time */}
              <div 
                className="font-medium text-[#008F46]"
                style={{ 
                  fontFamily: 'PPNeueMontreal, sans-serif',
                  fontSize: '0.8rem'
                }}
              >
                {currentTime}
              </div>
            </div>

            {/* Center Brand */}
            <div className="col-span-12 flex flex-col items-center justify-center mb-8 relative">
              {/* Vertical GREENWASH Logo */}
              <div className="flex items-center justify-center mb-8">
                <img 
                  src="/img/vertical_logo.png" 
                  alt="GREENWASH Logo"
                  className="object-contain"
                  style={{
                    height: '80vh'
                  }}
                />
              </div>
            </div>

            {/* Bottom Ring Panel - Full Width */}
            <div className="col-span-12 flex items-center justify-center">
              <div 
                ref={rightPanelRef}
                className="w-full h-64 flex items-center justify-center"
              >
                <Ring 
                  hoverIdx={hoverIdx} 
                  setHoverIdx={setHoverIdx} 
                  onDotClick={handleDotClick}
                  containerRef={rightPanelRef}
                />
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Desktop Layout */}
            {/* Profile Section - Top Left */}
            <div className="absolute top-8 left-8 z-20">
              <div className="relative">
                <div 
                  className="cursor-pointer"
                  style={{ width: '70px', height: '70px' }}
                  onMouseEnter={() => setShowProfilePopup(true)}
                  onMouseLeave={() => setShowProfilePopup(false)}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setShowProfilePopup(!showProfilePopup);
                    }
                  }}
                >
                  <img 
                    src="/img/id_photo.png" 
                    alt="Officer Profile"
                    className="w-full h-full object-contain"
                  />
                </div>
                
                {/* Profile Popup */}
                {showProfilePopup && (
                  <div className="absolute top-16 left-0 bg-white/80 backdrop-blur-sm border border-white/20 rounded-lg p-4 shadow-lg min-w-[280px] z-50">
                    <div className="text-sm font-medium text-gray-800 mb-2">
                      Officer: D. Lee | ID: 229-B
                    </div>
                    <div className="text-xs font-medium text-gray-600 mb-1">
                      Project Information:
                    </div>
                    <div className="text-xs text-gray-700 leading-relaxed">
                      The GREENWASH initiative represents a comprehensive approach to urban environmental compliance. 
                      Through systematic color standardization and visual harmony protocols, we ensure that all public 
                      and commercial spaces adhere to the established green palette guidelines. This project aims to 
                      create a unified, peaceful urban environment while maintaining strict compliance standards 
                      across all zones and sectors.
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Center Brand Column */}
            <div className="col-span-12 flex flex-col items-center justify-center relative">
              {/* Vertical GREENWASH Logo */}
              <div className="flex items-center justify-center w-full">
                <img 
                  src="/img/vertical_logo.png" 
                  alt="GREENWASH Logo"
                  className="object-contain"
                  style={{
                    height: '80vh'
                  }}
                />
              </div>
            </div>

            {/* Right Panel - Ring Container */}
            <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1/4 h-full flex items-center justify-center z-10">
              <div 
                ref={rightPanelRef}
                className="w-full h-full flex items-center justify-center"
              >
                <Ring 
                  hoverIdx={hoverIdx} 
                  setHoverIdx={setHoverIdx} 
                  onDotClick={handleDotClick}
                  containerRef={rightPanelRef}
                />
              </div>
            </div>

            {/* Live Time - Top Right */}
            <div className="absolute top-8 right-8 z-20">
              <div 
                className="font-medium text-[#008F46]"
                style={{ 
                  fontFamily: 'PPNeueMontreal, sans-serif',
                  fontSize: '0.8rem'
                }}
              >
                {currentTime}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Hover Label */}
      {hoverIdx !== null && <HoverLabel text={DOT_LABELS[hoverIdx] || "Lorem Ipsum"} anchor={anchor} />}
      
      {/* Modals */}
      <GreenwashForms isOpen={isFormsOpen} onClose={() => setIsFormsOpen(false)} />
      <GreenwashFinder isOpen={isFilesOpen} onClose={() => setIsFilesOpen(false)} />
      <JournalModal 
        open={isJournalOpen} 
        onClose={() => setIsJournalOpen(false)} 
        entries={[
          {
            id: '1',
            date: '01.28.25',
            title: '',
            body: `The vendor cart on Canal & Mott was a stark reminder of why we do this work. Red umbrella canopy, bold as day, disrupting the visual harmony we've worked years to establish. The merchant—L. Wong—wasn't hostile, just tired. Said he'd had the cart for twenty years, long before the ordinance.

I explained the new codes, showed him G-05 Vendor Green. He nodded slowly, understanding but not accepting. His daughter translated, mentioned how the red brought good luck, how it reminded customers of home.

Sometimes I wonder if uniformity is worth the stories we erase. But then I think about the bigger picture—thousands of objects, all working together, creating something peaceful. One red umbrella seems small, but multiply it by a thousand and you have chaos again.

The fine was $220. He paid on the spot. Said he'd have it repainted by next week.`
          },
          {
            id: '2',
            date: '01.22.25',
            title: '',
            body: `Approved authorization 002942-GM today. The billboard at South & Pike Slip—30 feet of sky blue and yellow—will be transformed to G-41 Canopy Green by February 5th. Cost estimate came in at $4,850. The supervisor signed off without hesitation.

From my office window, I can already imagine it: another piece of the city falling into place, the chaos giving way to calm. Sometimes I stand here and picture the whole city in green. It's beautiful. It's peaceful.

But late at night, I wonder what we've lost. Every color tells a story. Blue was the ocean, yellow was the sun. Now it's just G-41. Canopy Green. Approved. Compliant. Safe.

The work continues. The city gets greener. And I tell myself this is progress.`
          },
          {
            id: '3',
            date: '12.15.24',
            title: '',
            body: `We had our quarterly meeting today. Talked about compliance rates—94.3% citywide, Zone A leading at 97.2%. The numbers are good, the revenue is up, the city is greener.

But during the meeting, I kept thinking about the flower vendor on Mulberry who cried when we made her paint over her pink cart. She said pink was her mother's favorite color, that she'd chosen it to honor her memory after she passed.

We gave her G-05. Vendor Green. Regulation compliant. She never smiled the same way again.

The collective good, they keep telling us. The greater harmony. Visual peace for all citizens. Some days I believe it. Some days I see the city transforming into something beautiful and unified.

Other days, I just see pink turning to green, and I wonder what harmony really means.`
          },
          {
            id: '4',
            date: '11.08.24',
            title: '',
            body: `The compliance audit revealed something unexpected today. Zone C showed 98.7% adherence—the highest we've ever recorded. But walking through those streets, I felt something was missing. The uniformity was perfect, the harmony complete, yet the soul of the neighborhood seemed... diminished.

Mrs. Rodriguez's bakery on 3rd Street used to have a bright yellow awning. Now it's G-12 Morning Green, like everything else. She still bakes the same bread, but something in her eyes has changed. The yellow wasn't just color—it was joy, warmth, invitation.

I filed the report as required. Zone C: exemplary compliance. But I couldn't shake the feeling that we're not just changing colors—we're changing hearts.`
          },
          {
            id: '5',
            date: '10.15.24',
            title: '',
            body: `The new directive came down today: all residential doors must transition to G-08 Entry Green by year's end. That's 47,000 doors across the city. The logistics are staggering, but the supervisor says it's necessary for "visual coherence."

I think about my own apartment door. It's been forest green for ten years—not regulation, but it felt like home. Now it needs to be G-08. The exact same shade as every other door in the building, the block, the city.

Sometimes I wonder if we're building a better world or just a more uniform one. The reports show increased citizen satisfaction, but I notice fewer people lingering on their stoops, fewer conversations between neighbors. Maybe uniformity brings peace, but it also brings distance.`
          },
          {
            id: '6',
            date: '09.22.24',
            title: '',
            body: `The protest on Broadway was smaller than expected—maybe fifty people holding signs painted in unauthorized colors. Red, blue, yellow banners declaring "Color is Life" and "Let Us Choose." They were peaceful, just standing there, their signs a riot of non-compliance against the green backdrop.

We issued citations, of course. G-01 through G-47 violations, $150 each. Most paid on the spot. But one woman, maybe sixty, refused. She said her sign was painted with her granddaughter's favorite color—purple. "You can't regulate love," she told me.

I processed her citation. The law is the law. But her words stuck with me. Maybe we're not just regulating colors. Maybe we're regulating the things colors represent—memory, emotion, personal meaning. The fine was $150. The cost of preserving a grandmother's love for her granddaughter's favorite color.`
          }
        ]}
      />
      <GreenwashQuiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
      <GreenwashManual isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
    </main>
  );
}
