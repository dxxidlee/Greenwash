'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RotateCcw } from 'lucide-react';

export default function HueScan() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [match, setMatch] = useState<'perfect' | 'close' | 'no' | null>(null);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [rgbValues, setRgbValues] = useState({ r: 0, g: 0, b: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(true); // Default to flipped for rear camera
  const [isMobile, setIsMobile] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const filterCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayAnimationRef = useRef<number | null>(null);
  const filterAnimationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const isPageVisible = useRef<boolean>(true);
  const watchdogRef = useRef<NodeJS.Timeout | null>(null);
  const lastFrameTimeRef = useRef<number>(Date.now());

  const targetColor = { r: 0, g: 143, b: 70 }; // #008f46

  // Detect if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
                             (window.innerWidth <= 768);
      setIsMobile(isMobileDevice);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle page visibility changes (tab switching)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Page hidden - pause animations
        isPageVisible.current = false;
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        if (overlayAnimationRef.current) {
          cancelAnimationFrame(overlayAnimationRef.current);
          overlayAnimationRef.current = null;
        }
        if (filterAnimationRef.current) {
          cancelAnimationFrame(filterAnimationRef.current);
          filterAnimationRef.current = null;
        }
        console.log('Page hidden - paused');
      } else {
        // Page visible - resume animations by setting flag
        isPageVisible.current = true;
        frameCountRef.current = 0;
        lastUpdateTimeRef.current = 0;
        console.log('Page visible - will resume on next scan check');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);


  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      // Try with exact facingMode first for mobile
      let constraints: MediaStreamConstraints = {
        video: {
          facingMode: { exact: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60, min: 30 }
        }
      };

      console.log('Requesting camera with exact facingMode:', facingMode);
      
      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (exactError) {
        console.warn('Exact facingMode failed, trying ideal:', exactError);
        // Fallback to ideal if exact fails
        constraints = {
          video: {
            facingMode: { ideal: facingMode },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 60, min: 30 }
          }
        };
        mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      }
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Log the actual camera being used
        const videoTrack = mediaStream.getVideoTracks()[0];
        const settings = videoTrack.getSettings();
        console.log('Camera loaded:', {
          facingMode: settings.facingMode,
          label: videoTrack.label,
          width: settings.width,
          height: settings.height
        });
        
        videoRef.current.onloadedmetadata = async () => {
          console.log('Video metadata loaded, starting video playback');
          // CRITICAL: Explicitly play video on mobile
          if (videoRef.current) {
            try {
              await videoRef.current.play();
              console.log('Video playing successfully');
            } catch (playError) {
              console.error('Error playing video:', playError);
            }
          }
          setScanning(true);
        };
        
        // Fallback: try to play immediately and set scanning
        setTimeout(async () => {
          if (videoRef.current && videoRef.current.paused) {
            try {
              await videoRef.current.play();
              console.log('Video started via fallback');
            } catch (e) {
              console.warn('Fallback play failed:', e);
            }
          }
          setScanning(true);
        }, 500);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError(`Failed to access ${facingMode === 'user' ? 'front' : 'rear'} camera. Please allow camera permissions.`);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      setStream(null);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    if (overlayAnimationRef.current) {
      cancelAnimationFrame(overlayAnimationRef.current);
      overlayAnimationRef.current = null;
    }
    if (filterAnimationRef.current) {
      cancelAnimationFrame(filterAnimationRef.current);
      filterAnimationRef.current = null;
    }
    setScanning(false);
  }, [stream]);

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    startCamera();
  }, [startCamera]);

  const switchCamera = async () => {
    console.log('Switching camera from:', facingMode, 'to:', facingMode === 'user' ? 'environment' : 'user');
    
    // Stop current camera completely
    stopCamera();
    
    // Wait a bit longer for cleanup
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Switch facing mode
    setFacingMode(prev => {
      const newMode = prev === 'user' ? 'environment' : 'user';
      console.log('New facing mode set to:', newMode);
      return newMode;
    });
    
    // Camera will auto-start via useEffect
  };

  const toggleFlip = () => {
    setIsFlipped(prev => !prev);
  };


  // Hotkey handlers
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Don't trigger hotkeys when typing
      }
      
      if (event.key.toLowerCase() === 'f') {
          toggleFlip();
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleFlip]);


  const colorDistance = (c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }) => {
    return Math.sqrt(
      Math.pow(c1.r - c2.r, 2) +
      Math.pow(c1.g - c2.g, 2) +
      Math.pow(c1.b - c2.b, 2)
    );
  };

  // Green filter effect - highlights green objects, darkens everything else
  const applyGreenFilter = useCallback(() => {
    if (!isPageVisible.current || !scanning) return;
    
    try {
      filterAnimationRef.current = requestAnimationFrame(applyGreenFilter);
    
    const video = videoRef.current;
      const filterCanvas = filterCanvasRef.current;
      
      if (!video || !filterCanvas || video.readyState !== video.HAVE_ENOUGH_DATA) return;
      
      // Update filter canvas size if needed
      if (filterCanvas.width !== video.videoWidth || filterCanvas.height !== video.videoHeight) {
        filterCanvas.width = video.videoWidth;
        filterCanvas.height = video.videoHeight;
      }
      
      const ctx = filterCanvas.getContext('2d', { willReadFrequently: true, alpha: false });
      if (!ctx) return;
      
      // Draw video frame
      ctx.drawImage(video, 0, 0, filterCanvas.width, filterCanvas.height);
      
      // Get image data
      const imageData = ctx.getImageData(0, 0, filterCanvas.width, filterCanvas.height);
        const data = imageData.data;
        
      // More lenient green detection for mobile compatibility
      const pixelStep = isMobile ? 8 : 4; // Process fewer pixels on mobile for performance
      
      // Apply INVERTED green highlighting filter - white background, green objects visible
      for (let i = 0; i < data.length; i += pixelStep) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        // More lenient green detection
        const isGreenish = g > r && g > b && g > 50; // Lowered threshold from 60 to 50
        const greenStrength = isGreenish ? (g - Math.max(r, b)) / 255 : 0;
        
        if (greenStrength > 0.1) { // Lowered from 0.15 to 0.1 for more sensitivity
          // Keep green pixels visible and slightly enhanced
          const boost = 1.3 + greenStrength * 0.4; // Stronger boost for visibility
          data[i] = Math.min(255, r * 0.85);
          data[i + 1] = Math.min(255, g * boost);
          data[i + 2] = Math.min(255, b * 0.85);
        } else {
          // INVERT non-green pixels - make them white/bright
          const brightness = 0.85;
          const inverted = 255 - ((r + g + b) / 3);
          const whitened = inverted * brightness + (255 * (1 - brightness));
          
          data[i] = whitened;
          data[i + 1] = whitened * 1.05;
          data[i + 2] = whitened;
        }
        
        // Add 20 pixel noise for texture
        const noise = (Math.random() - 0.5) * 20;
        data[i] = Math.max(0, Math.min(255, data[i] + noise));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise));
        
        // Fill in skipped pixels on mobile for smoother look
        if (isMobile && pixelStep === 8) {
          for (let j = 4; j < pixelStep && i + j < data.length; j += 4) {
            data[i + j] = data[i];
            data[i + j + 1] = data[i + 1];
            data[i + j + 2] = data[i + 2];
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
      
    } catch (err) {
      console.error('Filter error:', err);
      filterAnimationRef.current = requestAnimationFrame(applyGreenFilter);
    }
  }, [scanning, isMobile]);

  // Separate overlay animation loop for smooth 60fps overlay
  const drawOverlay = useCallback(() => {
    if (!isPageVisible.current || !scanning) return; // Don't animate when page is hidden
    
    try {
      overlayAnimationRef.current = requestAnimationFrame(drawOverlay);
      lastFrameTimeRef.current = Date.now(); // Update heartbeat
      
      const canvas = overlayCanvasRef.current;
    const video = videoRef.current;
    
      // Ensure video is ready and canvas is properly sized before drawing
      if (!canvas || !video || video.readyState !== video.HAVE_ENOUGH_DATA) return;
      
      // Sync canvas size with video dimensions to prevent glitches
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
      
      // Don't draw if canvas still doesn't have proper dimensions
      if (canvas.width === 0 || canvas.height === 0) return;
    
      const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const size = 140;
    const bracketLength = 40;
    const sampleSize = 40; // Same as in analyzeFrame - this is what's actually scanned
    
    // Corner brackets - GREEN #008F46 - Same thickness as crosshair
    ctx.strokeStyle = 'rgba(0, 143, 70, 0.9)';
    ctx.lineWidth = 5; // Match crosshair thickness
    ctx.lineCap = 'square';
    ctx.lineJoin = 'miter';
    
    const adjustedSize = size; // No pulse animation
    
    ctx.beginPath();
    // Top-left
    ctx.moveTo(centerX - adjustedSize, centerY - adjustedSize + bracketLength);
    ctx.lineTo(centerX - adjustedSize, centerY - adjustedSize);
    ctx.lineTo(centerX - adjustedSize + bracketLength, centerY - adjustedSize);
    // Top-right
    ctx.moveTo(centerX + adjustedSize - bracketLength, centerY - adjustedSize);
    ctx.lineTo(centerX + adjustedSize, centerY - adjustedSize);
    ctx.lineTo(centerX + adjustedSize, centerY - adjustedSize + bracketLength);
    // Bottom-left
    ctx.moveTo(centerX - adjustedSize, centerY + adjustedSize - bracketLength);
    ctx.lineTo(centerX - adjustedSize, centerY + adjustedSize);
    ctx.lineTo(centerX - adjustedSize + bracketLength, centerY + adjustedSize);
    // Bottom-right
    ctx.moveTo(centerX + adjustedSize - bracketLength, centerY + adjustedSize);
    ctx.lineTo(centerX + adjustedSize, centerY + adjustedSize);
    ctx.lineTo(centerX + adjustedSize, centerY + adjustedSize - bracketLength);
    ctx.stroke();
    
    // GREEN CROSSHAIR - Sharp edges, solid stroke
    ctx.strokeStyle = 'rgba(0, 143, 70, 1)'; // Exact green #008F46
    ctx.lineWidth = 5;
    ctx.lineCap = 'square'; // Sharp edges, not rounded
    const crossSize = 25;
    ctx.beginPath();
    ctx.moveTo(centerX - crossSize, centerY);
    ctx.lineTo(centerX + crossSize, centerY);
    ctx.moveTo(centerX, centerY - crossSize);
    ctx.lineTo(centerX, centerY + crossSize);
    ctx.stroke();
    
    // Center dot - GREEN
    ctx.fillStyle = 'rgba(0, 143, 70, 1)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
    ctx.fill();
    } catch (err) {
      console.error('Overlay draw error:', err);
      // Restart on next frame despite error
      overlayAnimationRef.current = requestAnimationFrame(drawOverlay);
    }
  }, [scanning, match]);

  const analyzeFrame = useCallback(() => {
    if (!isPageVisible.current || !scanning) return; // Don't analyze when page is hidden
    
    try {
      // Always schedule next frame first for smooth animation
      animationRef.current = requestAnimationFrame(analyzeFrame);
      lastFrameTimeRef.current = Date.now(); // Update heartbeat
      
      if (!videoRef.current || !canvasRef.current) {
        return;
      }

    const video = videoRef.current;
    const canvas = canvasRef.current;
      
      if (video.readyState !== video.HAVE_ENOUGH_DATA) {
        return;
      }
      
      // Throttle analysis to every 3rd frame for performance (still 20fps analysis)
      frameCountRef.current++;
      if (frameCountRef.current % 3 !== 0) {
        return;
      }

      // Performance optimization: only update canvas size if it changed
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
        
        // Also update overlay canvas size once
        if (overlayCanvasRef.current) {
          overlayCanvasRef.current.width = video.videoWidth;
          overlayCanvasRef.current.height = video.videoHeight;
        }
      }
      
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) {
        return;
      }
      
      ctx.drawImage(video, 0, 0);
      
      const centerX = canvas.width >> 1;
      const centerY = canvas.height >> 1;
      const sampleSize = 40; // Even smaller for speed
      
      const imageData = ctx.getImageData(
        centerX - sampleSize,
        centerY - sampleSize,
        sampleSize << 1,
        sampleSize << 1
      );
      
      let totalR = 0, totalG = 0, totalB = 0;
      let totalDistance = 0;
      const data = imageData.data;
      const length = data.length;
      
      const targetR = targetColor.r;
      const targetG = targetColor.g;
      const targetB = targetColor.b;
      let sampleCount = 0;
      
      // Sample every 4th pixel for maximum performance
      for (let i = 0; i < length; i += 16) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        totalR += r;
        totalG += g;
        totalB += b;
        
        const dr = r - targetR;
        const dg = g - targetG;
        const db = b - targetB;
        totalDistance += Math.sqrt(dr * dr + dg * dg + db * db);
        sampleCount++;
      }
      
      const avgR = Math.round(totalR / sampleCount);
      const avgG = Math.round(totalG / sampleCount);
      const avgB = Math.round(totalB / sampleCount);
      
      // Throttle state updates to reduce re-renders (update every 100ms max)
      const now = performance.now();
      if (now - lastUpdateTimeRef.current > 100) {
      setRgbValues({ r: avgR, g: avgG, b: avgB });
        lastUpdateTimeRef.current = now;
      }
      
      const avgDistance = totalDistance / sampleCount;
      const similarity = Math.max(0, Math.min(100, 100 - (avgDistance / 441.67) * 100));
      
      // Green validation - must be greenish but more lenient
      const isGreenish = avgG > avgR && avgG > avgB && avgG > 70; // Lowered from 80
      const greenDominance = avgG - Math.max(avgR, avgB);
      
      let adjustedSimilarity = similarity;
      if (!isGreenish || greenDominance < 20) { // Lowered from 30
        // Not green, severely penalize
        adjustedSimilarity = Math.min(adjustedSimilarity, 40);
      }
      
      setMatchPercentage(Math.round(adjustedSimilarity));
      
      // More lenient thresholds - 80%+ is compliant
      const newMatch = adjustedSimilarity >= 80 && isGreenish ? 'perfect' :
                       adjustedSimilarity >= 60 && isGreenish ? 'close' : 'no';
      
      // Only update if match status changed (reduce re-renders)
      if (newMatch !== match) {
        setMatch(newMatch);
      }
    } catch (err) {
      console.error('Frame analysis error:', err);
      // Restart on next frame despite error
      animationRef.current = requestAnimationFrame(analyzeFrame);
    }
  }, [scanning, targetColor, match]);

  // Start/stop animation loops based on scanning state
  useEffect(() => {
    if (scanning && isPageVisible.current) {
      console.log('Starting analysis loop');
      frameCountRef.current = 0;
      lastUpdateTimeRef.current = 0;
      lastFrameTimeRef.current = Date.now();
      
      // Delay start slightly to ensure camera is ready
      const startTimeout = setTimeout(() => {
        analyzeFrame();
      drawOverlay();
        applyGreenFilter();
      }, 100);
      
      // Watchdog to restart loops if they stop (check every 2 seconds)
      watchdogRef.current = setInterval(() => {
        const now = Date.now();
        const timeSinceLastFrame = now - lastFrameTimeRef.current;
        
        // If no frame in 1 second and we're scanning, restart
        if (timeSinceLastFrame > 1000 && scanning && isPageVisible.current) {
          console.warn('Animation loops stopped, restarting...');
          
          // Cancel existing frames
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
          if (overlayAnimationRef.current) {
            cancelAnimationFrame(overlayAnimationRef.current);
          }
          
          // Restart
          frameCountRef.current = 0;
          lastUpdateTimeRef.current = 0;
          lastFrameTimeRef.current = now;
          analyzeFrame();
      drawOverlay();
          applyGreenFilter();
        }
      }, 2000);
      
      return () => {
        clearTimeout(startTimeout);
        if (watchdogRef.current) {
          clearInterval(watchdogRef.current);
          watchdogRef.current = null;
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        if (overlayAnimationRef.current) {
          cancelAnimationFrame(overlayAnimationRef.current);
          overlayAnimationRef.current = null;
        }
        if (filterAnimationRef.current) {
          cancelAnimationFrame(filterAnimationRef.current);
          filterAnimationRef.current = null;
        }
      };
    } else {
      if (watchdogRef.current) {
        clearInterval(watchdogRef.current);
        watchdogRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (overlayAnimationRef.current) {
        cancelAnimationFrame(overlayAnimationRef.current);
        overlayAnimationRef.current = null;
      }
      if (filterAnimationRef.current) {
        cancelAnimationFrame(filterAnimationRef.current);
        filterAnimationRef.current = null;
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden" style={{ touchAction: 'none' }}>
      {/* Error Screen */}
      {error && (
        <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto p-6">
            <div className="text-red-500 text-xl font-medium mb-4 tracking-wider">
              CAMERA ERROR
            </div>
            <div className="text-gray-300 text-sm mb-6">
              {error}
          </div>
            <button
              onClick={startCamera}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded text-sm font-medium transition-colors"
            >
              RETRY
            </button>
          </div>
        </div>
      )}

      {/* Video Feed - Hidden, used for processing */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          transform: isFlipped ? 'scaleX(-1) translateZ(0)' : 'translateZ(0)',
          willChange: 'transform',
          backfaceVisibility: 'hidden',
          WebkitTransform: isFlipped ? 'scaleX(-1) translateZ(0)' : 'translateZ(0)',
          opacity: 0, // Hidden - using filter canvas instead
          pointerEvents: 'none'
        }}
      />
      
      {/* Green Filter Canvas - Shows stylized green-only view */}
      <canvas
        ref={filterCanvasRef}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ 
          transform: isFlipped ? 'scaleX(-1) translateZ(0)' : 'translateZ(0)',
          willChange: 'contents',
          backfaceVisibility: 'hidden',
          WebkitTransform: isFlipped ? 'scaleX(-1) translateZ(0)' : 'translateZ(0)'
        }}
      />
      
      {/* Overlay Canvas - UI elements on top */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ 
          willChange: 'contents',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      />
      
      {/* HueScan Icon - Top Center */}
      {!error && (
        <div
          style={{
            position: 'fixed',
            top: '16px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 200,
            pointerEvents: 'none'
          }}
        >
          <img 
            src="/img/huescan-final.webp" 
            alt="HueScan"
            draggable={false}
            onContextMenu={(e) => e.preventDefault()}
            style={{
              height: '48px',
              width: 'auto',
              display: 'block',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              WebkitTouchCallout: 'none',
              pointerEvents: 'none'
            }}
          />
              </div>
            )}
      
      {/* HUD Overlay */}
      {!error && (
        <div className="absolute inset-0 pointer-events-none select-none">
          {/* Bottom Left - Status & Detection Box */}
          <div 
            className="absolute bottom-4 left-4" 
            style={{ 
              width: '299px',
              transform: isMobile ? 'scale(0.6)' : 'scale(0.8)',
              transformOrigin: 'bottom left'
            }}
          >
            <div 
              className={`backdrop-blur-md rounded-2xl p-5 transition-all duration-300 ${
                match === 'perfect' 
                  ? 'bg-[rgba(0,255,100,0.4)]' 
                  : match === 'close'
                  ? 'bg-[rgba(255,200,0,0.3)]'
                  : 'bg-[rgba(255,100,100,0.3)]'
              }`}
              style={{
                boxShadow: match === 'perfect' 
                  ? '0 0 30px rgba(0, 255, 100, 0.3)' 
                  : match === 'close'
                  ? '0 0 25px rgba(255, 200, 0, 0.3)'
                  : '0 0 20px rgba(255, 100, 100, 0.2)'
              }}
            >
              {/* Top Row: Percentage + Color Box + Detected Info */}
              <div className="flex items-center gap-3 pb-3 mb-3 border-b border-white mx-2">
                {/* Large Percentage */}
                <div className="text-5xl font-medium text-white" style={{ opacity: 1 }}>
              {matchPercentage}%
          </div>
          
                {/* Color Preview Box */}
                <div 
                  className="w-12 h-12 rounded-lg flex-shrink-0"
              style={{ 
                backgroundColor: `rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})` 
              }}
            />
                
                {/* Detected Label and Hex */}
                <div className="flex flex-col text-white" style={{ opacity: 1 }}>
                  <div className="text-sm font-medium">Detected</div>
                  <div className="text-base font-medium">
                    #{rgbValues.r.toString(16).padStart(2, '0').toUpperCase()}
                    {rgbValues.g.toString(16).padStart(2, '0').toUpperCase()}
                    {rgbValues.b.toString(16).padStart(2, '0').toUpperCase()}
                  </div>
                </div>
          </div>
          
              {/* Bottom Row: Compliance Status */}
              <div className="text-2xl font-medium text-white px-2" style={{ opacity: 1 }}>
                {match === 'perfect' ? 'Compliant' : 
                 match === 'close' ? 'Partial Match' : 
                 'Not Compliant'}
            </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Controls */}
      {!error && (
        <>
          {/* Exit X Button - Top Right */}
          <div className="absolute top-4 right-4 pointer-events-auto z-50">
            <a
              href="/"
              aria-label="Close"
              className="inline-flex items-center justify-center h-12 w-12 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] bg-[rgba(0,143,70,0.3)] text-white hover:bg-[rgba(0,143,70,0.4)] active:bg-[rgba(0,143,70,0.4)] transition-all duration-300 ease-out focus:outline-none focus-visible:outline-none"
              style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </a>
          </div>

          {/* Camera Control Buttons - Below X button on both mobile and desktop */}
          <div className="absolute top-20 right-4 pointer-events-auto z-50 flex flex-col gap-3">
            {/* Switch Camera - Mobile Only */}
            {isMobile && (
            <button
              onClick={switchCamera}
                className="inline-flex items-center justify-center h-12 w-12 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] bg-[rgba(0,143,70,0.3)] text-white hover:bg-[rgba(0,143,70,0.4)] active:bg-[rgba(0,143,70,0.4)] transition-all duration-300 ease-out focus:outline-none focus-visible:outline-none"
                style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}
                title={`Switch to ${facingMode === 'user' ? 'Rear' : 'Selfie'} Camera`}
            >
                <RotateCcw size={18} />
            </button>
            )}
            {/* Flip Display - Works on all devices */}
            <button
              onClick={toggleFlip}
              className="inline-flex items-center justify-center h-12 w-12 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] bg-[rgba(0,143,70,0.3)] text-white hover:bg-[rgba(0,143,70,0.4)] active:bg-[rgba(0,143,70,0.4)] transition-all duration-300 ease-out focus:outline-none focus-visible:outline-none"
              style={{ outline: 'none', WebkitTapHighlightColor: 'transparent' }}
              title={isFlipped ? 'Unflip Display' : 'Flip Display'}
            >
              <Camera size={18} className={isFlipped ? 'scale-x-[-1]' : ''} />
            </button>
      </div>
        </>
      )}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
