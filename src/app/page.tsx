// app/page.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import Chrome from './components/Chrome';
import Clock2037 from './components/Clock2037';
import Ring from './components/Ring';
import HoverLabel from './components/HoverLabel';

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
    // TODO: Implement individual features
    console.log(`Clicked: ${DOT_LABELS[index]}`);
  };

  return (
    <main className="min-h-screen relative overflow-hidden select-none bg-white">
      <Clock2037 />
      <Chrome />
      <Ring hoverIdx={hoverIdx} setHoverIdx={setHoverIdx} onDotClick={handleDotClick} />
      {hoverIdx !== null && <HoverLabel text={DOT_LABELS[hoverIdx] || "Lorem Ipsum"} anchor={anchor} />}
    </main>
  );
}