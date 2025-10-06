// app/page.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import Chrome from './components/Chrome';
import Clock2037 from './components/Clock2037';
import Ring from './components/Ring';
import HoverLabel from './components/HoverLabel';
import GreenwashForms from './components/GreenwashForms';
import GreenwashFinder from './components/GreenwashFinder';
import JournalModal from '../components/JournalModal';
import GreenwashQuiz from './components/GreenwashQuiz';
import GreenwashManual from './components/GreenwashManual';

const DOT_LABELS = [
  'BreakRoom BRK-37',
  'Protocol PRT-37', 
  'HueScan HUE-37',
  'Report RPT-37',
  'Files FLS-37',
  'Journal JNL-37',
  'SelfTest STT-37'
];

export default function Home() {
  const [hoverIdx, setHoverIdx] = useState<number|null>(null);
  const [anchor, setAnchor] = useState<{x:number;y:number}|null>(null);
  const [isFormsOpen, setIsFormsOpen] = useState(false);
  const [isFilesOpen, setIsFilesOpen] = useState(false);
  const [isJournalOpen, setIsJournalOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const ringRef = useRef<HTMLDivElement|null>(null);

  useEffect(() => {
    if (hoverIdx === null) { setAnchor(null); return; }
    
    // Show hover label in the dead center of the page (center of the big circle rotation)
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    
    // Set anchor to the exact center of the viewport
    setAnchor({ x: centerX, y: centerY });
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

  return (
    <main className="min-h-screen relative overflow-hidden select-none bg-white">
      <Clock2037 />
      <Chrome />
      <Ring hoverIdx={hoverIdx} setHoverIdx={setHoverIdx} onDotClick={handleDotClick} />
      {hoverIdx !== null && <HoverLabel text={DOT_LABELS[hoverIdx] || "Lorem Ipsum"} anchor={anchor} />}
      <GreenwashForms isOpen={isFormsOpen} onClose={() => setIsFormsOpen(false)} />
      <GreenwashFinder isOpen={isFilesOpen} onClose={() => setIsFilesOpen(false)} />
      <JournalModal 
        open={isJournalOpen} 
        onClose={() => setIsJournalOpen(false)} 
        entries={[
          {
            id: '1',
            date: '01.28.25',
            title: 'The vendor cart on Canal Street',
            body: `The vendor cart on Canal & Mott was a stark reminder of why we do this work. Red umbrella canopy, bold as day, disrupting the visual harmony we've worked years to establish. The merchant—L. Wong—wasn't hostile, just tired. Said he'd had the cart for twenty years, long before the ordinance.

I explained the new codes, showed him G-05 Vendor Green. He nodded slowly, understanding but not accepting. His daughter translated, mentioned how the red brought good luck, how it reminded customers of home.

Sometimes I wonder if uniformity is worth the stories we erase. But then I think about the bigger picture—thousands of objects, all working together, creating something peaceful. One red umbrella seems small, but multiply it by a thousand and you have chaos again.

The fine was $220. He paid on the spot. Said he'd have it repainted by next week.`
          },
          {
            id: '2',
            date: '01.22.25',
            title: 'Authorization 002942-GM',
            body: `Approved authorization 002942-GM today. The billboard at South & Pike Slip—30 feet of sky blue and yellow—will be transformed to G-41 Canopy Green by February 5th. Cost estimate came in at $4,850. The supervisor signed off without hesitation.

From my office window, I can already imagine it: another piece of the city falling into place, the chaos giving way to calm. Sometimes I stand here and picture the whole city in green. It's beautiful. It's peaceful.

But late at night, I wonder what we've lost. Every color tells a story. Blue was the ocean, yellow was the sun. Now it's just G-41. Canopy Green. Approved. Compliant. Safe.

The work continues. The city gets greener. And I tell myself this is progress.`
          },
          {
            id: '3',
            date: '12.15.24',
            title: 'The flower vendor on Mulberry',
            body: `We had our quarterly meeting today. Talked about compliance rates—94.3% citywide, Zone A leading at 97.2%. The numbers are good, the revenue is up, the city is greener.

But during the meeting, I kept thinking about the flower vendor on Mulberry who cried when we made her paint over her pink cart. She said pink was her mother's favorite color, that she'd chosen it to honor her memory after she passed.

We gave her G-05. Vendor Green. Regulation compliant. She never smiled the same way again.

The collective good, they keep telling us. The greater harmony. Visual peace for all citizens. Some days I believe it. Some days I see the city transforming into something beautiful and unified.

Other days, I just see pink turning to green, and I wonder what harmony really means.`
          }
        ]}
      />
      <GreenwashQuiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
      <GreenwashManual isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
    </main>
  );
}