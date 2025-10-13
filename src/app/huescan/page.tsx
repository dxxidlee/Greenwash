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
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Scanline effect
    ctx.strokeStyle = 'rgba(0, 255, 100, 0.15)';
    ctx.lineWidth = 1;
    const time = Date.now() / 20;
    for (let i = 0; i < height; i += 4) {
      const offset = (time + i) % height;
      ctx.beginPath();
      ctx.moveTo(0, offset);
      ctx.lineTo(width, offset);
      ctx.stroke();
    }
    
    // Corner brackets
    const centerX = width / 2;
    const centerY = height / 2;
    const size = 120;
    const bracketLength = 30;
    const thickness = 3;
    
    const matchColor = match === 'perfect' ? 'rgba(0, 255, 100, 0.9)' : 
                       match === 'close' ? 'rgba(255, 200, 0, 0.9)' : 
                       'rgba(255, 50, 50, 0.6)';
    
    ctx.strokeStyle = matchColor;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'square';
    
    // Top-left
    ctx.beginPath();
    ctx.moveTo(centerX - size, centerY - size + bracketLength);
    ctx.lineTo(centerX - size, centerY - size);
    ctx.lineTo(centerX - size + bracketLength, centerY - size);
    ctx.stroke();
    
    // Top-right
    ctx.beginPath();
    ctx.moveTo(centerX + size - bracketLength, centerY - size);
    ctx.lineTo(centerX + size, centerY - size);
    ctx.lineTo(centerX + size, centerY - size + bracketLength);
    ctx.stroke();
    
    // Bottom-left
    ctx.beginPath();
    ctx.moveTo(centerX - size, centerY + size - bracketLength);
    ctx.lineTo(centerX - size, centerY + size);
    ctx.lineTo(centerX - size + bracketLength, centerY + size);
    ctx.stroke();
    
    // Bottom-right
    ctx.beginPath();
    ctx.moveTo(centerX + size - bracketLength, centerY + size);
    ctx.lineTo(centerX + size, centerY + size);
    ctx.lineTo(centerX + size, centerY + size - bracketLength);
    ctx.stroke();
    
    // Center crosshair
    ctx.strokeStyle = matchColor;
    ctx.lineWidth = 2;
    const crossSize = 15;
    ctx.beginPath();
    ctx.moveTo(centerX - crossSize, centerY);
    ctx.lineTo(centerX + crossSize, centerY);
    ctx.moveTo(centerX, centerY - crossSize);
    ctx.lineTo(centerX, centerY + crossSize);
    ctx.stroke();
  }, [match]);

  const analyzeFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !scanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      ctx.drawImage(video, 0, 0);
      
      const centerX = Math.floor(canvas.width / 2);
      const centerY = Math.floor(canvas.height / 2);
      const sampleSize = 60;
      
      const imageData = ctx.getImageData(
        centerX - sampleSize,
        centerY - sampleSize,
        sampleSize * 2,
        sampleSize * 2
      );
      
      let totalR = 0, totalG = 0, totalB = 0;
      let totalDistance = 0;
      let pixelCount = 0;
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        const r = imageData.data[i];
        const g = imageData.data[i + 1];
        const b = imageData.data[i + 2];
        
        totalR += r;
        totalG += g;
        totalB += b;
        
        const distance = colorDistance({ r, g, b }, targetColor);
        totalDistance += distance;
        pixelCount++;
      }
      
      const avgR = Math.round(totalR / pixelCount);
      const avgG = Math.round(totalG / pixelCount);
      const avgB = Math.round(totalB / pixelCount);
      
      setRgbValues({ r: avgR, g: avgG, b: avgB });
      setCoordinates({ x: centerX, y: centerY });
      
      const avgDistance = totalDistance / pixelCount;
      const maxDistance = 441.67;
      const similarity = Math.max(0, 100 - (avgDistance / maxDistance) * 100);
      
      setMatchPercentage(Math.round(similarity));
      
      if (similarity >= 85) {
        setMatch('perfect');
      } else if (similarity >= 70) {
        setMatch('close');
      } else {
        setMatch('no');
      }
      
      // Update overlay canvas size
      if (overlayCanvasRef.current) {
        overlayCanvasRef.current.width = video.videoWidth;
        overlayCanvasRef.current.height = video.videoHeight;
      }
      
      drawOverlay();
    }
    
    animationRef.current = requestAnimationFrame(analyzeFrame);
  }, [scanning, targetColor, drawOverlay]);

  useEffect(() => {
    if (scanning && videoRef.current) {
      const video = videoRef.current;
      video.addEventListener('loadeddata', analyzeFrame);
      return () => {
        video.removeEventListener('loadeddata', analyzeFrame);
      };
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
        className={`absolute inset-0 w-full h-full object-cover ${
          isFlipped ? 'scale-x-[-1]' : ''
        }`}
      />
      
      {/* Overlay Canvas */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      
      {/* HUD Overlay */}
      {!error && (
        <div className="absolute inset-0 pointer-events-none select-none">
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
          
          {/* Top Right Status */}
          <div className="absolute top-4 right-20">
            <div className="bg-[rgba(0,143,70,0.3)] backdrop-blur-sm rounded-2xl p-4 text-right text-xs tracking-wider text-white">
            <div className={`text-2xl font-bold mb-2 ${
                match === 'perfect' ? 'text-white' : 
                match === 'close' ? 'text-yellow-300' : 
                'text-red-300'
            }`}>
              {matchPercentage}%
            </div>
              <div className="opacity-70">
              {match === 'perfect' ? 'MATCH_CONFIRMED' : 
               match === 'close' ? 'PARTIAL_MATCH' : 
               'SCANNING...'}
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
