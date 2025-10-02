// app/components/Ring.tsx
'use client';
import { useMemo, useEffect, useState, useRef } from 'react';

const DOTS = 7;
const RADIUS_VMIN = 28;    // Less tight radius for better mobile experience
const DOT = 60;            // Smaller dots for better mobile experience
const BASE_SPEED = 0.0375; // 75% slower than 0.15 (0.15 * 0.25 = 0.0375)
const GREEN = '#008F46';

export default function Ring({ hoverIdx, setHoverIdx, onDotClick }:{
  hoverIdx: number | null;
  setHoverIdx: (i:number|null)=>void;
  onDotClick?: (index: number) => void;
}) {
  const dots = useMemo(() => Array.from({ length: DOTS }), []);
  const [rotation, setRotation] = useState(0);
  const [rotationSpeed, setRotationSpeed] = useState(BASE_SPEED);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const speedDecayRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle scroll to increase rotation speed
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (isPaused) return;
      
      const scrollDelta = Math.abs(e.deltaY);
      const speedBoost = Math.min(scrollDelta / 100, 2);
      setRotationSpeed(BASE_SPEED + speedBoost);
      
      // Clear existing decay timeout
      if (speedDecayRef.current) clearTimeout(speedDecayRef.current);
      
      // Start decay back to base speed
      speedDecayRef.current = setTimeout(() => {
        const decayInterval = setInterval(() => {
          setRotationSpeed(current => {
            const newSpeed = Math.max(current - 0.02, BASE_SPEED);
            if (newSpeed <= BASE_SPEED) {
              clearInterval(decayInterval);
              return BASE_SPEED;
            }
            return newSpeed;
          });
        }, 50);
      }, 300);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      if (speedDecayRef.current) clearTimeout(speedDecayRef.current);
    };
  }, [isPaused]);

  // Smooth animation loop
  useEffect(() => {
    const animate = () => {
      if (!isPaused) {
        setRotation(prev => prev + rotationSpeed);
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rotationSpeed, isPaused]);

  // Pause rotation on hover
  useEffect(() => {
    setIsPaused(hoverIdx !== null);
  }, [hoverIdx]);

  const handleSphereInteraction = (index: number) => ({
    // Desktop: hover
    onMouseEnter: !isMobile ? () => setHoverIdx(index) : undefined,
    onMouseLeave: !isMobile ? () => setHoverIdx(null) : undefined,
    // Mobile: press and hold
    onTouchStart: isMobile ? () => setHoverIdx(index) : undefined,
    onTouchEnd: isMobile ? () => setHoverIdx(null) : undefined,
  });

  return (
    <div className="fixed left-1/2 top-1/2" style={{ transform:'translate(-50%,-50%)' }}>
      <div 
        className="relative" 
        style={{ 
          width:`calc(${RADIUS_VMIN*2}vmin)`, 
          height:`calc(${RADIUS_VMIN*2}vmin)`,
          transform: `rotate(${rotation}deg)`
        }}
      >
        {dots.map((_, i) => {
          const angle = (i/DOTS) * 2*Math.PI;
          const x = Math.cos(angle) * RADIUS_VMIN;
          const y = Math.sin(angle) * RADIUS_VMIN;
          const isHovered = hoverIdx === i;
          const inactive = hoverIdx !== null && hoverIdx !== i;
          
          return (
            <button
              key={i}
              aria-label={`dot-${i}`}
              {...handleSphereInteraction(i)}
              onClick={() => onDotClick?.(i)}
              className={`absolute rounded-full transition-all duration-200 cursor-pointer ${
                isHovered && !isMobile ? 'scale-110' : isHovered && isMobile ? 'scale-105' : inactive ? 'blur-[2px] opacity-60' : ''
              }`}
              style={{
                width: DOT, 
                height: DOT, 
                background: GREEN,
                left:`calc(50% + ${x}vmin - ${DOT/2}px)`,
                top: `calc(50% + ${y}vmin - ${DOT/2}px)`,
                transform: `rotate(-${rotation}deg)` // Counter-rotate to keep dots upright
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
