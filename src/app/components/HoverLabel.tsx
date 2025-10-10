// app/components/HoverLabel.tsx
'use client';
export default function HoverLabel({ text, anchor }:{ text:string; anchor:{x:number;y:number} | null }) {
  if (!anchor) return null;
  return (
    <div 
      className="fixed text-[14px] font-medium pointer-events-none z-50 rounded-full shadow-2xl"
      style={{ 
        left: anchor.x, 
        top: anchor.y, 
        transform:'translate(-50%, -50%)',
        whiteSpace: 'nowrap',
        borderRadius: '9999px',
        padding: '8px 14px',
        backgroundColor: 'rgba(0, 143, 70, 0.3)',
        color: '#FFFFFF',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
        letterSpacing: '0.3px'
      }}
    >
      {text}
    </div>
  );
}
