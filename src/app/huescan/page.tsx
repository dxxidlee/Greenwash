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
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(true); // Default to flipped for rear camera
  const [isMobile, setIsMobile] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

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


  const startCamera = useCallback(async () => {
    try {
      setError(null);
      
      const constraints = {
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          console.log('Camera loaded successfully');
          setScanning(true);
        };
        
        // Fallback timeout in case onloadedmetadata doesn't fire
        setTimeout(() => {
            setScanning(true);
        }, 1000);
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
    setTimeout(() => startCamera(), 100);
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

  const drawOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    if (width === 0 || height === 0) return;
    
    ctx.clearRect(0, 0, width, height);
    
    const centerX = width / 2;
    const centerY = height / 2;
    const size = 140;
    const bracketLength = 40;
    
    // Match color - cached
    const matchColor = match === 'perfect' ? 'rgba(0, 255, 100, 1)' : 
                       match === 'close' ? 'rgba(255, 200, 0, 1)' : 
                       'rgba(255, 100, 100, 0.8)';
    
    // Optimized: Draw all brackets in one path
    ctx.strokeStyle = matchColor;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    const pulseScale = match === 'perfect' ? 1 + Math.sin(Date.now() / 200) * 0.03 : 1;
    const adjustedSize = size * pulseScale;
    
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
    
    // Optimized crosshair
    ctx.lineWidth = 3;
    const crossSize = 20;
    ctx.beginPath();
    ctx.moveTo(centerX - crossSize, centerY);
    ctx.lineTo(centerX + crossSize, centerY);
    ctx.moveTo(centerX, centerY - crossSize);
    ctx.lineTo(centerX, centerY + crossSize);
    ctx.stroke();
    
    // Center dot
    ctx.fillStyle = matchColor;
    ctx.fillRect(centerX - 3, centerY - 3, 6, 6);
  }, [match]);

  const analyzeFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !scanning) {
      animationRef.current = requestAnimationFrame(analyzeFrame);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      animationRef.current = requestAnimationFrame(analyzeFrame);
      return;
    }

    // Performance optimization: only update canvas size if it changed
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      // Also update overlay canvas size
      if (overlayCanvasRef.current) {
        overlayCanvasRef.current.width = video.videoWidth;
        overlayCanvasRef.current.height = video.videoHeight;
      }
    }
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) {
      animationRef.current = requestAnimationFrame(analyzeFrame);
      return;
    }
      
      ctx.drawImage(video, 0, 0);
      
      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);
    const sampleSize = 60; // Reduced for better performance
      
      const imageData = ctx.getImageData(
        centerX - sampleSize,
        centerY - sampleSize,
        sampleSize * 2,
        sampleSize * 2
      );
      
      let totalR = 0, totalG = 0, totalB = 0;
      let totalDistance = 0;
    const data = imageData.data;
    const pixelCount = data.length / 4;
    
    // Optimized loop - process every other pixel for speed
    for (let i = 0; i < data.length; i += 8) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
        
        totalR += r;
        totalG += g;
        totalB += b;
        
      // Inline distance calculation for speed
      const dr = r - targetColor.r;
      const dg = g - targetColor.g;
      const db = b - targetColor.b;
      totalDistance += Math.sqrt(dr * dr + dg * dg + db * db);
    }
    
    const sampledPixels = pixelCount / 2;
    const avgR = Math.round(totalR / sampledPixels);
    const avgG = Math.round(totalG / sampledPixels);
    const avgB = Math.round(totalB / sampledPixels);
      
      setRgbValues({ r: avgR, g: avgG, b: avgB });
      setCoordinates({ x: centerX, y: centerY });
      
    const avgDistance = totalDistance / sampledPixels;
      const maxDistance = 441.67;
      const similarity = Math.max(0, 100 - (avgDistance / maxDistance) * 100);
      
      setMatchPercentage(Math.round(similarity));
      
    // Threshold detection
    if (similarity >= 75) {
        setMatch('perfect');
    } else if (similarity >= 50) {
        setMatch('close');
      } else {
        setMatch('no');
      }
      
      drawOverlay();
    
    animationRef.current = requestAnimationFrame(analyzeFrame);
  }, [scanning, targetColor, drawOverlay]);

  useEffect(() => {
    if (scanning) {
      console.log('Starting analysis loop');
      analyzeFrame();
    } else {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    }
  }, [scanning, analyzeFrame]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
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
          backfaceVisibility: 'hidden'
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
                  ? 'bg-[rgba(0,255,100,0.4)] border-2 border-green-400' 
                  : match === 'close'
                  ? 'bg-[rgba(255,200,0,0.3)] border-2 border-yellow-400'
                  : 'bg-[rgba(255,100,100,0.3)] border-2 border-red-400'
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
                <div className={`text-5xl font-bold mb-2 ${
                  match === 'perfect' ? 'text-green-300' : 
                  match === 'close' ? 'text-yellow-300' : 
                  'text-red-300'
                }`}>
                  {matchPercentage}%
                </div>
                <div className={`text-2xl font-bold tracking-wider ${
                  match === 'perfect' ? 'text-white' : 
                  match === 'close' ? 'text-yellow-100' : 
                  'text-red-100'
                }`}>
                  {match === 'perfect' ? '✓ COMPLIANT' : 
                   match === 'close' ? '! PARTIAL MATCH' : 
                   '✗ NOT COMPLIANT'}
                </div>
                {match === 'perfect' && (
                  <div className="text-xs text-white/80 mt-2">
                    GREEN APPROVED: #008F46
            </div>
                )}
            </div>
            </div>
            </div>
            
          {/* Top Left Info */}
          <div className="absolute top-4 left-4">
            <div className="bg-[rgba(0,143,70,0.3)] backdrop-blur-sm rounded-2xl p-4 text-white text-xs tracking-wider space-y-2">
              <div className="flex items-center gap-2">
                <span className="opacity-70">SYSTEM:</span>
                <span>HUESCAN_v2.1</span>
              </div>
            <div className="flex items-center gap-2">
                <span className="opacity-70">TARGET:</span>
                <span>#008F46</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="opacity-70">MODE:</span>
                <span>{facingMode === 'environment' ? 'REAR' : 'FRONT'}</span>
            </div>
              <div className="flex items-center gap-2">
                <span className="opacity-70">FLIP:</span>
                <span>{isFlipped ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </div>
          
          {/* Top Right Match % */}
          <div className="absolute top-4 right-20">
            <div className="bg-[rgba(0,143,70,0.3)] backdrop-blur-sm rounded-2xl p-4 text-center text-xs tracking-wider text-white">
              <div className="opacity-70 mb-1">MATCH</div>
              <div className={`text-xl font-bold ${
                match === 'perfect' ? 'text-green-300' : 
                match === 'close' ? 'text-yellow-300' : 
                'text-red-300'
            }`}>
              {matchPercentage}%
            </div>
            </div>
          </div>
          
          {/* Bottom Left RGB Values */}
          <div className="absolute bottom-24 left-4">
            <div className="bg-[rgba(0,143,70,0.3)] backdrop-blur-sm rounded-2xl p-4 text-white text-xs tracking-wider space-y-2">
              <div className="opacity-70">COORDINATES</div>
            <div>X: {coordinates.x}</div>
            <div>Y: {coordinates.y}</div>
              <div className="mt-3 opacity-70">COLOR VALUES</div>
              <div>R: {rgbValues.r}</div>
              <div>G: {rgbValues.g}</div>
              <div>B: {rgbValues.b}</div>
              <div className="mt-3">
              <div className="flex items-center gap-2">
                  <span className="opacity-70">HEX:</span>
                  <span>
                  #{rgbValues.r.toString(16).padStart(2, '0')}
                  {rgbValues.g.toString(16).padStart(2, '0')}
                  {rgbValues.b.toString(16).padStart(2, '0')}
                </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Bottom Right Color Preview */}
          <div className="absolute bottom-24 right-4">
            <div className="bg-[rgba(0,143,70,0.3)] backdrop-blur-sm rounded-2xl p-4 text-white">
              <div className="text-xs tracking-wider mb-3 text-center opacity-70">
              DETECTED
            </div>
            <div 
                className="w-16 h-16 rounded-lg border-2 border-white/30"
              style={{ 
                backgroundColor: `rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})` 
              }}
            />
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
