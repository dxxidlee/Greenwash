// app/components/Ring.tsx
'use client';
import { useMemo, useEffect, useState, useRef } from 'react';

const DOTS = 7;
const RADIUS_VMIN = 28;    // Less tight radius for better mobile experience
const DOT = 140;            // Increased size for better video visibility
const BASE_SPEED = 0.0375; // 75% slower than 0.15 (0.15 * 0.25 = 0.0375)
const GREEN = '#008F46';

// Video sources - replace these paths with actual video files
const VIDEO_SOURCES = [
  null, // BreakRoom BRK-37 - add video path here
  null, // Protocol PRT-37 - add video path here
  '/img/video-1.mp4', // HueScan HUE-37
  null, // Report RPT-37 - add video path here
  '/img/video-2.mp4', // Files FLS-37
  '/img/video-3.mp4', // Journal JNL-37
  null, // SelfTest STT-37 - add video path here
];

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
          height:`calc(${RADIUS_VMIN*2}vmin)`
        }}
      >
        {dots.map((_, i) => {
          const angle = (i/DOTS) * 2*Math.PI + (rotation * Math.PI / 180); // Add rotation to angle
          const x = Math.cos(angle) * RADIUS_VMIN;
          const y = Math.sin(angle) * RADIUS_VMIN;
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
                left:`calc(50% + ${x}vmin - ${DOT/2}px)`,
                top: `calc(50% + ${y}vmin - ${DOT/2}px)`,
                boxShadow: 'none', // Remove any shadows
                outline: 'none' // Remove focus outline
              }}
              {...handleSphereInteraction(i)}
              onClick={() => onDotClick?.(i)}
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
