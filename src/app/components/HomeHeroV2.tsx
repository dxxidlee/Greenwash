'use client';
import { useEffect, useRef, useState } from 'react';
import Ring from './Ring';
import HoverLabel from './HoverLabel';
import GreenwashForms from './GreenwashForms';
import GreenwashFinder from './GreenwashFinder';
import JournalModal from '../../components/JournalModal';
import GreenwashQuiz from './GreenwashQuiz';
import GreenwashManual from './GreenwashManual';
import ProtocolQuickList from './ProtocolQuickList';

const DOT_LABELS = [
  'BreakRoom BRK-37',
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
    } else {
      // Centered ring mode – anchor at viewport center
      setAnchor({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
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
          backgroundImage: 'url(/img/id_photo.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.3
        }}
      />
      
      {/* Green haze overlay */}
      <div className="fixed inset-0 bg-gradient-to-br from-green-50/20 to-green-100/10 pointer-events-none" />
      
      {/* Profile - Fixed Position */}
      <div 
        className="fixed z-20"
        style={{ top: '10px', left: '2px' }}
      >
        <div className="relative">
          <div 
            className="cursor-pointer"
            style={{ width: '70px', height: '70px' }}
            onMouseEnter={() => !isMobile && setShowProfilePopup(true)}
            onMouseLeave={() => !isMobile && setShowProfilePopup(false)}
            onTouchStart={() => isMobile && setShowProfilePopup(true)}
            onTouchEnd={() => isMobile && setShowProfilePopup(false)}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                setShowProfilePopup(!showProfilePopup);
              }
            }}
          >
            <img 
              src="/img/id_photo.webp" 
              alt="Officer Profile"
              className="w-full h-full object-contain"
            />
          </div>
          
          {/* Profile Popup */}
          {showProfilePopup && (
              <div 
                className="absolute top-20 left-2 backdrop-blur-sm shadow-2xl rounded-lg p-4 min-w-[280px] z-50"
                style={{ backgroundColor: 'rgba(0, 143, 70, 0.3)' }}
              >
              <div className="text-xs font-medium text-white mb-2">
                Officer: D. Lee
              </div>
              <div className="border-t border-white mb-2"></div>
              <div className="text-xs font-medium text-white mb-2">
                ID: 229-B
              </div>
              <div className="border-t border-white mb-2"></div>
              <div className="text-xs font-medium text-white mb-2">
                The Greenwash initiative represents a comprehensive approach to urban environmental compliance. 
                Through systematic color standardization and visual harmony protocols, we ensure that all public 
                and commercial spaces adhere to the established green palette guidelines. This project aims to 
                create a unified, peaceful urban environment while maintaining strict compliance standards 
                across all zones and sectors.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Live Time - Fixed Position */}
      <div 
        className="fixed z-20"
        style={{ top: '10px', left: '70px' }}
      >
        <div 
          className="font-medium text-[#008F46] text-left"
          data-live-time
          style={{ 
            fontFamily: 'PPNeueMontreal, sans-serif',
            fontSize: '0.8rem'
          }}
        >
          {currentTime}
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="relative z-10 min-h-screen grid grid-cols-12 gap-4 p-4">
        
        {/* Right-side Vertical Logo */}
        <div className="fixed z-10 pointer-events-none" style={{ bottom: '10px', right: '10px' }}>
          <img 
            src="/img/vertical_logo.webp" 
            alt="GREENWASH Logo"
            className="object-contain"
            style={{ height: '45vh' }}
          />
        </div>

        {/* Centered Ring Overlay (matches Chrome middle layout) */}
        <Ring 
          hoverIdx={hoverIdx} 
          setHoverIdx={setHoverIdx} 
          onDotClick={handleDotClick}
          centered
        />
      </div>

      {/* Protocol Quick List */}
      <ProtocolQuickList />

      {/* Hover Label */}
      {hoverIdx !== null && anchor && (
        <HoverLabel text={DOT_LABELS[hoverIdx] || ""} anchor={anchor} />
      )}
      
      {/* Modals */}
      <GreenwashForms isOpen={isFormsOpen} onClose={() => setIsFormsOpen(false)} />
      <GreenwashFinder isOpen={isFilesOpen} onClose={() => setIsFilesOpen(false)} />
      <JournalModal 
        open={isJournalOpen} 
        onClose={() => setIsJournalOpen(false)} 
        entries={[
          {
            id: '1',
            date: '03.12.37',
            title: '',
            body: `Harmony Visits in mixed-use towers. We prepped residents for March audits: rollers, chips, and measured light. Relief is the dominant emotion—no one wants to be the reason a floor fails. After the shift, I opened the BreakRoom app by choice. Seat sensor confirmed weight; the visor lowered. The corridor rendered steady. I spoke the Standard Recitation plain. ALIGNMENT CONFIRMED on the first pass. The hall didn't end; it simply stopped asking. J. Alvarez approved me for Public Integrity Outreach next month. On the stairwell, someone had drawn a tiny planet with a marker—blue, trying to be brave in a green building. Two months ago, I would have argued with myself about logging it. Tonight I filed the order and, while the crew rolled it out, I hummed the paragraph the way you hum while tying your shoes. The paint dried to G-08, and the air felt smoother by one degree. I don't think fear is the reason I believe it now. I think I prefer the way the city sounds when the sentence is true, and I prefer a door that opens when I speak it right.`
          },
          {
            id: '2',
            date: '02.24.37',
            title: '',
            body: `SelfTest passed on the second try. They rotated me through Enforcement "to round experience." The vest makes you visible; visibility lowers the argument. We flagged market umbrellas for near-green substitutions; conversations are technical now—metamerism, overcast readings, brick casting. Protocol phrases leave my mouth like tools: visual integrity, coherence threshold, public mood index. After lunch, J. Alvarez sent me back to the BreakRoom for a brief cadence clean-up. Strap, visor, corridor. I kept my body still and let the hall "move." The paragraph went out whole: …Where I waver, I correct. Where I question, I complete. Approval on the third pass. The tone is small and kind. On the way home, the derelict storefront looked like a checklist instead of a wound. Solvable is near safe. I tried to recall the exact curve of the old park path and found only fog. I rehearsed the closing lines against the apartment wall—I am seen. I am the same. The same is safe. The room agreed.`
          },
          {
            id: '3',
            date: '02.06.37',
            title: '',
            body: `Second session—day-seat cycle. They warn that it "may require most of a day." The visor hides the clock. The corridor is sharper now—ceiling panels bloom and dim to your cadence. The paragraph lives in my mouth: …my memory does not outrank the plan; my preference does not outrank the protocol. I choose legibility over noise… The engine hates curl (small smile in vowels) and praise (proud weight on "I"). Too much "self," and you see RESET before the last line. The seat vibrates lightly when your affect drifts; the hallway glides back to the same vanishing point and waits. Hydration chimes every two hours. You do not stand. By late afternoon, I could feel the system anticipating me; my Recital Stability Index rose, and the corridor stopped fighting. After release, HueScan felt different in my hand—like a ruler that finally belonged to the page. A kid passed with a green helmet reading 54%—personal item, not enforceable—but my chest didn't unlock until he vanished from the frame. At night, I taped over the router's red LED; one pixel can tilt a room. I fell asleep whispering The city is a single surface; I do not fracture it.`
          },
          {
            id: '4',
            date: '01.22.37',
            title: '',
            body: `First BreakRoom. The tech tightened the chest strap, lowered the visor, and the world became a long hall with a floating dot at the far end. My body didn't move; the system used optical flow to suggest motion while the seat held me. A thin line pulse matched my breath. Text: BEGIN RECITATION. I spoke the paragraph—I walked the corridor of agreement. Uniform green is public safety. Variance breeds decay; color is care…—and heard my voice tip upward on the last clause like I was asking permission. The waveform shook; the scene faded and snapped back to the same starting frame. Overlay: TONE DRIFT DETECTED — SESSION LOOP. If you try to lift the visor, the session throws "disengage voids progress" and locks inputs for five seconds. Hours compressed into head tilt, breaths, syllables. I learned the grading rules by failing them: flatten "I," land G-08 with no heat, breathe after "care," equal weight on coherence and style. When the system finally played the approval tone, I felt my jaw click like a lid sitting on a jar. Outside, J. Alvarez asked if I felt steadier. I said "aligned." It felt borrowed. It stayed.`
          },
          {
            id: '5',
            date: '01.05.37',
            title: '',
            body: `They posted the 06:00 bulletin: "Phase 2 Harmonization — facades, fixtures, transit furniture to G-08 Entry Green by quarter's end." The memo says visual coherence reduces escalation risk. I read it twice and kept hearing paint described like policy, policy like weather. At intake, we ran HueScan along Myrtle—benches 62%, hydrants 71%, and a mailbox 58%. The chirp is surgical when it's off target. Supervisor J. Alvarez asked if I'd booked BreakRoom alignment. He clarified: it's not a room—it's a seat and a visor. You're strapped in, posture sensors live, and you don't get up. The display renders an endless corridor, but your body stays put. They issued us the Standard Recitation—one paragraph you must speak "without tremor" to exit a session. I walk the corridor of agreement. Uniform green is public safety… It reads like instructions for being a color. Protocol warns that comparison breeds grief, and grief breeds variance. I told a resident that there is only one calm when she asked for a softer shade. I believed myself for three seconds and then didn't. I taped #008F46 to my door and waited for it to go quiet. It didn't. Maybe quiet is a skill they measure now.`
          }
        ]}
      />
      <GreenwashQuiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
      <GreenwashManual isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
    </main>
  );
}
