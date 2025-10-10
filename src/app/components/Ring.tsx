// app/components/Ring.tsx
'use client';
import { useMemo, useEffect, useState, useRef } from 'react';

const DOTS = 6;
const RADIUS_VMIN = 28;    // Less tight radius for better mobile experience
const DOT = 140;            // Increased size for better video visibility
const BASE_SPEED = 0.0375; // 75% slower than 0.15 (0.15 * 0.25 = 0.0375)
const GREEN = '#008F46';
const ANGLE_OFFSET = -Math.PI / 2; // start at top (12 o'clock)

const DOT_LABELS = [
  'BreakRoom BRK-37',
  'HueScan HUE-37',
  'Report RPT-37',
  'Files FLS-37',
  'Journal JNL-37',
  'SelfTest STT-37'
];

// Image sources replacing videos
const IMAGE_SOURCES = [
  '/img/breakroom-final.webp', // BreakRoom BRK-37
  '/img/huescan-final.webp',   // HueScan HUE-37
  '/img/report-final.webp',    // Report RPT-37
  '/img/files-final.webp',     // Files FLS-37
  '/img/journal-final.webp',   // Journal JNL-37
  '/img/selftest-final.webp',  // SelfTest STT-37
];

export default function Ring({ hoverIdx, setHoverIdx, onDotClick, containerRef }:{
  hoverIdx: number | null;
  setHoverIdx: (i:number|null)=>void;
  onDotClick?: (index: number) => void;
  containerRef?: React.RefObject<HTMLDivElement>;
}) {
  const dots = useMemo(() => Array.from({ length: DOTS }), []);
  const [rotation, setRotation] = useState(0);
  const [rotationSpeed, setRotationSpeed] = useState(BASE_SPEED);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const speedDecayRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
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
      if (!isPaused && !prefersReducedMotion) {
        setRotation(prev => {
          const newRotation = prev + rotationSpeed;
          // Keep rotation between 0 and 360 to prevent infinite growth
          return newRotation >= 360 ? newRotation - 360 : newRotation;
        });
      }
      animationRef.current = requestAnimationFrame(animate);
    };
    
    animationRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [rotationSpeed, isPaused, prefersReducedMotion]);

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

  // Calculate ring size based on container
  const [ringSize, setRingSize] = useState({ width: RADIUS_VMIN * 2, height: RADIUS_VMIN * 2 });
  
  useEffect(() => {
    const updateRingSize = () => {
      if (containerRef?.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calculate optimal size based on container dimensions
        const maxSize = Math.min(containerWidth, containerHeight);
        const minSize = Math.max(56, maxSize * 0.6); // Minimum 56px, max 60% of container
        const size = Math.min(maxSize * 0.8, minSize); // Use 80% of container or minSize, whichever is smaller
        
        setRingSize({ width: size, height: size });
      }
    };
    
    updateRingSize();
    window.addEventListener('resize', updateRingSize);
    return () => window.removeEventListener('resize', updateRingSize);
  }, [containerRef]);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div 
        className="relative" 
        style={{ 
          width: `${ringSize.width}px`, 
          height: `${ringSize.height}px`
        }}
      >
        {dots.map((_, i) => {
          const angle = ANGLE_OFFSET + (i/DOTS) * 2*Math.PI + (rotation * Math.PI / 180); // top-first layout
          const radius = ringSize.width / 2 - DOT / 2; // Dynamic radius based on container size
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isHovered = hoverIdx === i;
          const inactive = hoverIdx !== null && hoverIdx !== i;
          
          return (
            <div
              key={i}
              className={`absolute transition-all duration-200 cursor-pointer ${
                isHovered && !isMobile ? 'scale-110' : isHovered && isMobile ? 'scale-105' : inactive ? 'blur-[2px] opacity-60' : ''
              }`}
              style={{
                width: DOT, 
                height: DOT, 
                left:`calc(50% + ${x}px - ${DOT/2}px)`,
                top: `calc(50% + ${y}px - ${DOT/2}px)`,
                boxShadow: 'none', // Remove any shadows
                outline: 'none' // Remove focus outline
              }}
              {...handleSphereInteraction(i)}
              onClick={() => onDotClick?.(i)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onDotClick?.(i);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`${DOT_LABELS[i] || `Option ${i + 1}`}`}
            >
              {IMAGE_SOURCES[i] ? (
                <img
                  src={IMAGE_SOURCES[i]}
                  alt={DOT_LABELS[i] || `Option ${i + 1}`}
                  className="w-full h-full object-contain"
                  draggable={false}
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-gray-400 text-xs font-medium"
                  style={{ backgroundColor: 'white', border: '1px solid #f0f0f0' }}
                >
                  {i + 1}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
