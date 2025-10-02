// app/components/Clock2037.tsx
'use client';
import { useEffect, useState } from 'react';

function fmt(d: Date) {
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const month = months[d.getMonth()];
  const day = String(d.getDate()).padStart(2,'0');
  let h = d.getHours(); const m = String(d.getMinutes()).padStart(2,'0'); const s = String(d.getSeconds()).padStart(2,'0');
  const am = h >= 12 ? 'PM' : 'AM'; h = h % 12 || 12; const hh = String(h).padStart(2,'0');
  return `${month} ${day} 2037 ${hh}:${m}:${s} ${am}`;
}

export default function Clock2037() {
  const [now, setNow] = useState(fmt(new Date()));
  useEffect(() => { const id = setInterval(() => setNow(fmt(new Date())), 1000); return () => clearInterval(id); }, []);
  return (
    <div 
      aria-label="Live time" 
      className="fixed text-[12px] leading-none tracking-wide font-medium" 
      style={{
        color:'var(--gw-green)',
        top: 'var(--edge-margin)', 
        right: 'var(--edge-margin)'
      }}
    >
      {now}
    </div>
  );
}
