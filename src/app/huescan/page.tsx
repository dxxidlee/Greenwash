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
  const overlayAnimationRef = useRef<number | null>(null);
  const lastUpdateTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const isPageVisible = useRef<boolean>(true);

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
      
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 60, min: 30 } // Request 60fps
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Optimize video element
        videoRef.current.onloadedmetadata = () => {
          console.log('Camera loaded successfully');
          setScanning(true);
        };
        
        // Fallback timeout
        setTimeout(() => {
            setScanning(true);
        }, 500);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to access camera. Please allow camera permissions.');
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
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    // Longer delay to ensure proper cleanup
    setTimeout(() => startCamera(), 300);
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

  // Separate overlay animation loop for smooth 60fps overlay
  const drawOverlay = useCallback(() => {
    if (!isPageVisible.current) return; // Don't animate when page is hidden
    
    overlayAnimationRef.current = requestAnimationFrame(drawOverlay);
    
    const canvas = overlayCanvasRef.current;
    if (!canvas || canvas.width === 0 || canvas.height === 0) return;
    
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
    
    // SCANNING AREA INDICATOR - Shows exact pixels being analyzed
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;
    ctx.setLineDash([8, 8]); // Dashed line
    ctx.strokeRect(centerX - sampleSize, centerY - sampleSize, sampleSize * 2, sampleSize * 2);
    ctx.setLineDash([]); // Reset dash
    
    // Semi-transparent fill to show scanning area
    ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.fillRect(centerX - sampleSize, centerY - sampleSize, sampleSize * 2, sampleSize * 2);
    
    // Corner brackets - ALWAYS WHITE
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 2;
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
    
    // Optimized crosshair - always white
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 3;
    const crossSize = 20;
    ctx.beginPath();
    ctx.moveTo(centerX - crossSize, centerY);
    ctx.lineTo(centerX + crossSize, centerY);
    ctx.moveTo(centerX, centerY - crossSize);
    ctx.lineTo(centerX, centerY + crossSize);
    ctx.stroke();
    
    // Center dot - always white
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.fillRect(centerX - 3, centerY - 3, 6, 6);
  }, [match]);

  const analyzeFrame = useCallback(() => {
    if (!isPageVisible.current) return; // Don't analyze when page is hidden
    
    // Always schedule next frame first for smooth animation
    animationRef.current = requestAnimationFrame(analyzeFrame);
    
    if (!videoRef.current || !canvasRef.current || !scanning) {
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
    
    try {
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
    }
  }, [scanning, targetColor, match]);

  // Start/stop animation loops based on scanning state
  useEffect(() => {
    if (scanning && isPageVisible.current) {
      console.log('Starting analysis loop');
      frameCountRef.current = 0;
      lastUpdateTimeRef.current = 0;
      
      // Delay start slightly to ensure camera is ready
      const startTimeout = setTimeout(() => {
        analyzeFrame();
        drawOverlay();
      }, 100);
      
      return () => {
        clearTimeout(startTimeout);
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
          animationRef.current = null;
        }
        if (overlayAnimationRef.current) {
          cancelAnimationFrame(overlayAnimationRef.current);
          overlayAnimationRef.current = null;
        }
      };
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (overlayAnimationRef.current) {
        cancelAnimationFrame(overlayAnimationRef.current);
        overlayAnimationRef.current = null;
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

      {/* Video Feed */}
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
          WebkitTransform: isFlipped ? 'scaleX(-1) translateZ(0)' : 'translateZ(0)'
        }}
      />
      
      {/* Overlay Canvas */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ 
          willChange: 'contents',
          transform: 'translateZ(0)',
          backfaceVisibility: 'hidden'
        }}
      />
      
      {/* HUD Overlay */}
      {!error && (
        <div className="absolute inset-0 pointer-events-none select-none">
          {/* Center Compliance Status - BIG AND CLEAR */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
            <div 
              className={`backdrop-blur-md rounded-3xl px-8 py-6 transition-all duration-300 ${
                match === 'perfect' 
                  ? 'bg-[rgba(0,255,100,0.4)]' 
                  : match === 'close'
                  ? 'bg-[rgba(255,200,0,0.3)]'
                  : 'bg-[rgba(255,100,100,0.3)]'
              }`}
              style={{
                boxShadow: match === 'perfect' 
                  ? '0 0 40px rgba(0, 255, 100, 0.3)' 
                  : match === 'close'
                  ? '0 0 30px rgba(255, 200, 0, 0.3)'
                  : '0 0 20px rgba(255, 100, 100, 0.2)'
              }}
            >
              <div className="text-center">
                <div 
                  className={`text-5xl font-bold mb-2 ${
                    match === 'perfect' ? 'text-green-300' : 
                    match === 'close' ? 'text-yellow-300' : 
                    'text-red-300'
                  }`}
                  style={{ 
                    WebkitTextStroke: '0',
                    textShadow: 'none'
                  }}
                >
                  {matchPercentage}%
            </div>
                <div 
                  className={`text-2xl font-bold tracking-wider ${
                    match === 'perfect' ? 'text-white' : 
                    match === 'close' ? 'text-yellow-100' : 
                    'text-red-100'
                  }`}
                  style={{ 
                    WebkitTextStroke: '0',
                    textShadow: 'none',
                    opacity: 1
                  }}
                >
                  {match === 'perfect' ? 'COMPLIANT' : 
                   match === 'close' ? 'PARTIAL MATCH' : 
                   'NOT COMPLIANT'}
            </div>
                {match === 'perfect' && (
                  <div className="text-xs text-white mt-2" style={{ opacity: 1 }}>
                    GREEN APPROVED: #008F46
              </div>
            )}
          </div>
            </div>
          </div>
          
          {/* Top Left - Target Color */}
          <div className="absolute top-4 left-4">
            <div className="bg-[rgba(0,143,70,0.3)] backdrop-blur-sm rounded-2xl px-4 py-3 text-white text-sm tracking-wider">
              <div className="flex items-center gap-2" style={{ opacity: 1 }}>
                <span>TARGET:</span>
                <span className="font-bold">#008F46</span>
              </div>
            </div>
          </div>
          
          {/* Bottom - Detected Color Info */}
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2">
            <div className="bg-[rgba(0,143,70,0.3)] backdrop-blur-sm rounded-2xl p-4 text-white flex items-center gap-4">
              {/* Color Preview */}
              <div 
                className="w-16 h-16 rounded-lg flex-shrink-0"
              style={{ 
                backgroundColor: `rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})` 
              }}
            />
              {/* HEX Code */}
              <div style={{ opacity: 1 }}>
                <div className="text-xs tracking-wider mb-1">DETECTED</div>
                <div className="text-xl font-bold tracking-wider">
                  #{rgbValues.r.toString(16).padStart(2, '0').toUpperCase()}
                  {rgbValues.g.toString(16).padStart(2, '0').toUpperCase()}
                  {rgbValues.b.toString(16).padStart(2, '0').toUpperCase()}
                </div>
          </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Controls */}
      {!error && (
        <>
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 pointer-events-auto z-50 flex gap-3">
            <button
              onClick={isMobile ? switchCamera : undefined}
              disabled={!isMobile}
              className={`bg-black/60 backdrop-blur-sm border border-green-400/30 text-green-400 p-3 rounded-full transition-all ${
                isMobile ? 'hover:bg-green-400/20 cursor-pointer' : 'opacity-30 cursor-not-allowed'
              }`}
              title={isMobile ? "Switch Camera" : "Switch Camera (Mobile Only)"}
            >
              <RotateCcw size={20} />
            </button>
            <button
              onClick={toggleFlip}
              className={`bg-black/60 backdrop-blur-sm border border-green-400/30 text-green-400 p-3 rounded-full hover:bg-green-400/20 transition-all ${
                isFlipped ? 'bg-green-400/20 border-green-400' : ''
              }`}
              title={isFlipped ? 'Unflip Camera' : 'Flip Camera'}
            >
              <Camera size={20} className={isFlipped ? 'scale-x-[-1]' : ''} />
            </button>
          </div>

      {/* Exit X Button */}
          <div className="absolute top-4 right-4 pointer-events-auto z-50">
        <a
          href="/"
          aria-label="Close"
          className="inline-flex items-center justify-center h-12 w-12 rounded-full shadow-[0_2px_12px_rgba(0,0,0,0.06)] bg-[rgba(0,143,70,0.3)] text-white hover:bg-[rgba(0,143,70,0.4)] transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-white/30"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </a>
      </div>
        </>
      )}
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
