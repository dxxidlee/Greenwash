// app/page.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import Chrome from './components/Chrome';
import Clock2037 from './components/Clock2037';
import Ring from './components/Ring';
import HoverLabel from './components/HoverLabel';
import GreenwashForms from './components/GreenwashForms';
import GreenwashFinder from './components/GreenwashFinder';
import GreenwashJournal from './components/GreenwashJournal';
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
      <GreenwashJournal isOpen={isJournalOpen} onClose={() => setIsJournalOpen(false)} />
      <GreenwashQuiz isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} />
      <GreenwashManual isOpen={isManualOpen} onClose={() => setIsManualOpen(false)} />
    </main>
  );
}