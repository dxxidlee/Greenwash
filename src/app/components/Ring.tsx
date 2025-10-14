// app/components/Ring.tsx
'use client';
import { useMemo, useEffect, useState, useRef, useLayoutEffect } from 'react';

const DOTS = 6;
const RADIUS_VMIN = 28;    // Less tight radius for better mobile experience
const DOT_DESKTOP = 126;   // 140 * 0.9 = 126 (90% of original size)
const DOT_MOBILE = 85;     // Smaller size for mobile (about 67% of desktop)
const BASE_SPEED_DESKTOP = 0.0375; // 75% slower than 0.15 (0.15 * 0.25 = 0.0375)
const BASE_SPEED_MOBILE = 0.06;    // Slightly faster on mobile for better visibility
const GREEN = '#008F46';

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

export default function Ring({ hoverIdx, setHoverIdx, onDotClick, containerRef, centered }:{
  hoverIdx: number | null;
  setHoverIdx: (i:number|null)=>void;
  onDotClick?: (index: number) => void;
  containerRef?: React.RefObject<HTMLDivElement>;
  centered?: boolean;
}) {
  const dots = useMemo(() => Array.from({ length: DOTS }), []);
  const [rotation, setRotation] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [rotationSpeed, setRotationSpeed] = useState(BASE_SPEED_DESKTOP);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [visibleDots, setVisibleDots] = useState<number[]>([]);
  const [ringSize, setRingSize] = useState<{ width:number; height:number } | null>(null);
  const [isReady, setIsReady] = useState(false);
  const speedDecayRef = useRef<NodeJS.Timeout | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Set appropriate base speed for device type
      if (hoverIdx === null) {
        setRotationSpeed(mobile ? BASE_SPEED_MOBILE : BASE_SPEED_DESKTOP);
      }
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [hoverIdx]);

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);
    
    const handleChange = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Sequential dot appearance animation
  useEffect(() => {
    if (!isReady || prefersReducedMotion) {
      setVisibleDots(Array.from({ length: DOTS }, (_, i) => i));
      return;
    }

    setVisibleDots([]);
    const delays = Array.from({ length: DOTS }, (_, i) => i * 250); // 250ms between each dot
    
    delays.forEach((delay, index) => {
      setTimeout(() => {
        setVisibleDots(prev => [...prev, index]);
      }, delay);
    });
  }, [isReady, prefersReducedMotion]);

  // Handle scroll to increase rotation speed
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Ignore while reduced motion preferred
      if (prefersReducedMotion) return;
      
      const BASE_SPEED = isMobile ? BASE_SPEED_MOBILE : BASE_SPEED_DESKTOP;
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
  }, [prefersReducedMotion, isMobile]);

  // Smooth animation loop (desktop only)
  useEffect(() => {
    // Don't animate on mobile at all
    if (isMobile) return;
    
    const animate = () => {
      if (!prefersReducedMotion) {
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
  }, [rotationSpeed, prefersReducedMotion, isMobile]);

  // On hover, slow down instead of pausing to keep RAF smooth (desktop only)
  useEffect(() => {
    if (prefersReducedMotion) return;
    const BASE_SPEED = isMobile ? BASE_SPEED_MOBILE : BASE_SPEED_DESKTOP;
    // On mobile, keep rotating at base speed even when touching
    // On desktop, slow down on hover
    setRotationSpeed(hoverIdx !== null && !isMobile ? 0.003 : BASE_SPEED);
  }, [hoverIdx, prefersReducedMotion, isMobile]);

  const handleSphereInteraction = (index: number) => ({
    // Desktop: hover
    onMouseEnter: !isMobile ? () => setHoverIdx(index) : undefined,
    onMouseLeave: !isMobile ? () => setHoverIdx(null) : undefined,
    // Mobile: press and hold
    onTouchStart: isMobile ? () => setHoverIdx(index) : undefined,
    onTouchEnd: isMobile ? () => setHoverIdx(null) : undefined,
  });

  // Calculate ring size based on container or viewport (centered)
  
  useLayoutEffect(() => {
    const updateRingSize = () => {
      const isMobileDevice = window.innerWidth < 768;
      
      if (!centered && containerRef?.current) {
        const container = containerRef.current;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        
        // Calculate optimal size based on container dimensions
        const maxSize = Math.min(containerWidth, containerHeight);
        const minSize = Math.max(56, maxSize * 0.6); // Minimum 56px, max 60% of container
        const size = Math.min(maxSize * 0.8, minSize); // Use 80% of container or minSize, whichever is smaller
        
        setRingSize({ width: size, height: size });
        setIsReady(true);
      } else {
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        const maxSize = Math.min(vw, vh);
        // Mobile: Increase ring size MORE to create bigger gaps (90% instead of 78%)
        const sizeMultiplier = isMobileDevice ? 0.90 : 0.78;
        const size = Math.max(360, Math.floor(maxSize * sizeMultiplier));
        setRingSize({ width: size, height: size });
        setIsReady(true);
      }
    };
    
    updateRingSize();
    window.addEventListener('resize', updateRingSize);
    return () => window.removeEventListener('resize', updateRingSize);
  }, [containerRef, centered]);

  if (!isReady || !ringSize) return null; // avoid clustered first paint

  return (
    <div className={centered ? 'fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2' : 'relative w-full h-full flex items-center justify-center'}>
      <div 
        className="relative" 
        style={{ 
          width: `${ringSize.width}px`, 
          height: `${ringSize.height}px`
        }}
      >
        {dots.map((_, i) => {
          const DOT_SIZE = isMobile ? DOT_MOBILE : DOT_DESKTOP;
          const angle = (i/DOTS) * 2*Math.PI + (rotation * Math.PI / 180); // Add rotation to angle
          const radius = ringSize.width / 2 - DOT_SIZE / 2; // Dynamic radius based on container size
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          const isHovered = hoverIdx === i;
          const inactive = hoverIdx !== null && hoverIdx !== i;
          const isVisible = visibleDots.includes(i);
          
          return (
            <div
              key={i}
              className={`absolute transform-gpu transition-all duration-500 ease-out cursor-pointer will-change-transform ${
                isHovered && !isMobile ? 'scale-110' : isHovered && isMobile ? 'scale-105' : inactive ? 'opacity-60' : ''
              } ${isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
              style={{
                width: DOT_SIZE, 
                height: DOT_SIZE, 
                left:`calc(50% + ${x}px - ${DOT_SIZE/2}px)`,
                top: `calc(50% + ${y}px - ${DOT_SIZE/2}px)`,
                boxShadow: 'none', // Remove any shadows
                outline: 'none', // Remove focus outline
                transformOrigin: 'center'
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
                  onContextMenu={(e) => e.preventDefault()}
                  style={{
                    userSelect: 'none',
                    WebkitUserSelect: 'none',
                    WebkitTouchCallout: 'none',
                    pointerEvents: 'none'
                  }}
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
