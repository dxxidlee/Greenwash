// app/components/HoverLabel.tsx
'use client';
export default function HoverLabel({ text, anchor }:{ text:string; anchor:{x:number;y:number} | null }) {
  if (!anchor) return null;
  return (
    <div 
      className="fixed gw-glass-light text-[14px] font-medium pointer-events-none z-50"
      style={{ 
        left: anchor.x, 
        top: anchor.y, 
        transform:'translate(-50%, -50%)',
        whiteSpace: 'nowrap',
        borderRadius: '9999px',
        padding: '8px 14px'
      }}
    >
      {text}
    </div>
  );
}
