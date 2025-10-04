'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Camera, RotateCcw } from 'lucide-react';

export default function HueScan() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [match, setMatch] = useState<'perfect' | 'close' | 'no' | null>(null);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [rgbValues, setRgbValues] = useState({ r: 0, g: 0, b: 0 });
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);

  const targetColor = { r: 0, g: 143, b: 70 }; // #008f46

  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
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
      }
      
      setScanning(true);
    } catch (err) {
      console.error('Camera error:', err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
      setStream(null);
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setScanning(false);
  };

  const switchCamera = async () => {
    stopCamera();
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
    setTimeout(() => startCamera(), 100);
  };

  const colorDistance = (c1: { r: number; g: number; b: number }, c2: { r: number; g: number; b: number }) => {
    return Math.sqrt(
      Math.pow(c1.r - c2.r, 2) +
      Math.pow(c1.g - c2.g, 2) +
      Math.pow(c1.b - c2.b, 2)
    );
  };

  const drawOverlay = () => {
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
  };

  const analyzeFrame = () => {
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
  };

  useEffect(() => {
    if (scanning && videoRef.current) {
      videoRef.current.addEventListener('loadeddata', analyzeFrame);
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadeddata', analyzeFrame);
        }
      };
    }
  }, [scanning]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      {/* Video Feed */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Overlay Canvas */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      
      {/* HUD Overlay */}
      {scanning && (
        <div className="absolute inset-0 pointer-events-none select-none font-mono">
          {/* Top Left Info */}
          <div className="absolute top-4 left-4 text-green-400 text-xs tracking-wider space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-green-500">SYSTEM:</span>
              <span className="text-white">HUESCAN_v2.1</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">TARGET:</span>
              <span className="text-white">#008F46</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">MODE:</span>
              <span className="text-white">{facingMode === 'environment' ? 'REAR' : 'FRONT'}</span>
            </div>
          </div>
          
          {/* Top Right Status */}
          <div className="absolute top-4 right-4 text-right text-xs tracking-wider">
            <div className={`text-2xl font-bold mb-2 ${
              match === 'perfect' ? 'text-green-400' : 
              match === 'close' ? 'text-yellow-400' : 
              'text-red-400'
            }`}>
              {matchPercentage}%
            </div>
            <div className="text-green-400">
              {match === 'perfect' ? 'MATCH_CONFIRMED' : 
               match === 'close' ? 'PARTIAL_MATCH' : 
               'SCANNING...'}
            </div>
          </div>
          
          {/* Bottom Left RGB Values */}
          <div className="absolute bottom-4 left-4 text-green-400 text-xs tracking-wider space-y-1">
            <div>X: {coordinates.x}</div>
            <div>Y: {coordinates.y}</div>
            <div className="mt-2">
              <div>R: {rgbValues.r}</div>
              <div>G: {rgbValues.g}</div>
              <div>B: {rgbValues.b}</div>
            </div>
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <span>HEX:</span>
                <span className="text-white">
                  #{rgbValues.r.toString(16).padStart(2, '0')}
                  {rgbValues.g.toString(16).padStart(2, '0')}
                  {rgbValues.b.toString(16).padStart(2, '0')}
                </span>
              </div>
            </div>
          </div>
          
          {/* Bottom Right Color Preview */}
          <div className="absolute bottom-4 right-4">
            <div className="text-green-400 text-xs tracking-wider mb-2 text-right">
              DETECTED
            </div>
            <div 
              className="w-16 h-16 border-2 border-green-400"
              style={{ 
                backgroundColor: `rgb(${rgbValues.r}, ${rgbValues.g}, ${rgbValues.b})` 
              }}
            />
          </div>
        </div>
      )}
      
      {/* Controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto z-50">
        <button
          onClick={switchCamera}
          className="bg-black/60 backdrop-blur-sm border border-green-400/30 text-green-400 p-3 rounded-full hover:bg-green-400/20 transition-all"
        >
          <RotateCcw size={20} />
        </button>
      </div>
      
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
