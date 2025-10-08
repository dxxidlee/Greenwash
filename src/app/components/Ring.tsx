// app/components/Ring.tsx
'use client';
import { useMemo, useEffect, useState, useRef } from 'react';

const DOTS = 7;
const RADIUS_VMIN = 28;    // Less tight radius for better mobile experience
const DOT = 140;            // Increased size for better video visibility
const BASE_SPEED = 0.0375; // 75% slower than 0.15 (0.15 * 0.25 = 0.0375)
const GREEN = '#008F46';

const DOT_LABELS = [
  'BreakRoom BRK-37',
  'Protocol PRT-37', 
  'HueScan HUE-37',
  'Report RPT-37',
  'Files FLS-37',
  'Journal JNL-37',
  'SelfTest STT-37'
];

// Video sources - replace these paths with actual video files
const VIDEO_SOURCES = [
  '/img/video-4.mp4', // BreakRoom BRK-37
  '/img/video-6.mp4', // Protocol PRT-37
  '/img/video-1.mp4', // HueScan HUE-37
  '/img/video-7.mp4', // Report RPT-37
  '/img/video-2.mp4', // Files FLS-37
  '/img/video-3.mp4', // Journal JNL-37
  '/img/video-5.mp4', // SelfTest STT-37
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
          const angle = (i/DOTS) * 2*Math.PI + (rotation * Math.PI / 180); // Add rotation to angle
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
              {VIDEO_SOURCES[i] ? (
                <video
                  className="w-full h-full object-contain"
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  onLoadedData={(e) => {
                    console.log('Video loaded successfully:', VIDEO_SOURCES[i]);
                    const video = e.target as HTMLVideoElement;
                    // Set playback speed to 0.75x (75% of normal speed)
                    video.playbackRate = 0.75;
                    // Ensure smooth looping by seeking to a frame slightly before the end
                    video.addEventListener('timeupdate', () => {
                      if (video.currentTime >= video.duration - 0.1) {
                        video.currentTime = 0.05; // Start slightly after beginning to avoid duplicate frames
                      }
                    });
                  }}
                  onError={(e) => {
                    console.error('Video failed to load:', VIDEO_SOURCES[i], e);
                  }}
                >
                  <source src={VIDEO_SOURCES[i]} type="video/mp4" />
                  {/* Fallback if video fails to load */}
                  Your browser does not support the video tag.
                </video>
              ) : (
                // Placeholder circle until video is added
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
