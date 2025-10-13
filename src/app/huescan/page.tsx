'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RotateCcw, Eye } from 'lucide-react';

export default function HueScan() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [scanning, setScanning] = useState(false);
  const [match, setMatch] = useState<'perfect' | 'close' | 'no' | null>(null);
  const [matchPercentage, setMatchPercentage] = useState(0);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [rgbValues, setRgbValues] = useState({ r: 0, g: 0, b: 0 });
  const [coordinates, setCoordinates] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFlipped, setIsFlipped] = useState(true); // Default to flipped for rear camera
  const [effectsEnabled, setEffectsEnabled] = useState(true);
  const [fps, setFps] = useState(0);
  const [detectMode, setDetectMode] = useState(false);
  const [detectionEngine, setDetectionEngine] = useState<'color' | null>(null);
  const [detectionFps, setDetectionFps] = useState(0);
  const [inferenceTime, setInferenceTime] = useState(0);
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.6);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const effectsCanvasRef = useRef<HTMLCanvasElement>(null);
  const detectionCanvasRef = useRef<HTMLCanvasElement>(null);
  const detectionBoxesRef = useRef<Map<string, any>>(new Map());
  const lastDetectionTimeRef = useRef<number>(0);

  const targetColor = { r: 0, g: 143, b: 70 }; // #008f46

  // Initialize Detect mode from localStorage and URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const detectParam = urlParams.get('detect') === '1';
    const savedDetectMode = localStorage.getItem('huescan-detect-mode') === 'true';
    const initialDetectMode = detectParam || savedDetectMode;
    setDetectMode(initialDetectMode);
  }, []);

  // Save Detect mode to localStorage
  useEffect(() => {
    localStorage.setItem('huescan-detect-mode', detectMode.toString());
  }, [detectMode]);

  const startCamera = useCallback(async () => {
    try {
      setIsLoading(true);
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
          setIsLoading(false);
          setScanning(true);
        };
        
        // Fallback timeout in case onloadedmetadata doesn't fire
        setTimeout(() => {
          if (isLoading) {
            console.log('Camera fallback timeout triggered');
            setIsLoading(false);
            setScanning(true);
          }
        }, 3000);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Failed to access camera. Please allow camera permissions.');
      setIsLoading(false);
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

  const toggleEffects = () => {
    setEffectsEnabled(prev => !prev);
  };

  const toggleDetectMode = () => {
    setDetectMode(prev => !prev);
  };

  // Initialize detection engine
  const initDetectionEngine = useCallback(async () => {
    if (!detectMode) return;
    
    // For green object detection, we don't need AI models
    // We'll use the existing color analysis from the HueScan functionality
    setDetectionEngine('color');
    console.log('Color-based green detection initialized');
  }, [detectMode]);

  // Initialize detection engine when Detect Mode is enabled
  useEffect(() => {
    if (detectMode) {
      initDetectionEngine();
    }
  }, [detectMode, initDetectionEngine]);

  // Hotkey handlers
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return; // Don't trigger hotkeys when typing
      }
      
      switch (event.key.toLowerCase()) {
        case 'd':
          toggleDetectMode();
          break;
        case 'f':
          toggleFlip();
          break;
        case 'e':
          toggleEffects();
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [toggleDetectMode, toggleFlip, toggleEffects]);

  // Draw detection boxes with animations
  const drawDetectionBoxes = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    ctx.clearRect(0, 0, width, height);
    
    const time = performance.now() * 0.001;
    const devicePixelRatio = window.devicePixelRatio || 1;
    
    // Set canvas size to match video
    ctx.canvas.width = width;
    ctx.canvas.height = height;
    
    detectionBoxesRef.current.forEach((box, id) => {
      if (box.opacity <= 0) return;
      
      const { bbox, score, class: className } = box;
      const x = bbox.originX;
      const y = bbox.originY;
      const w = bbox.width;
      const h = bbox.height;
      
      // Entry animation
      const scale = Math.min(box.opacity, 1);
      const centerX = x + w / 2;
      const centerY = y + h / 2;
      
      ctx.save();
      ctx.globalAlpha = box.opacity;
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      ctx.translate(-centerX, -centerY);
      
      // Box styling
      ctx.strokeStyle = '#008F46';
      ctx.lineWidth = 2 * devicePixelRatio;
      ctx.lineCap = 'square';
      
      // Draw corner brackets
      const bracketLength = 16;
      const bracketThickness = 2 * devicePixelRatio;
      
      // Top-left
      ctx.beginPath();
      ctx.moveTo(x, y + bracketLength);
      ctx.lineTo(x, y);
      ctx.lineTo(x + bracketLength, y);
      ctx.stroke();
      
      // Top-right
      ctx.beginPath();
      ctx.moveTo(x + w - bracketLength, y);
      ctx.lineTo(x + w, y);
      ctx.lineTo(x + w, y + bracketLength);
      ctx.stroke();
      
      // Bottom-left
      ctx.beginPath();
      ctx.moveTo(x, y + h - bracketLength);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x + bracketLength, y + h);
      ctx.stroke();
      
      // Bottom-right
      ctx.beginPath();
      ctx.moveTo(x + w - bracketLength, y + h);
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x + w, y + h - bracketLength);
      ctx.stroke();
      
      // Marching ants animation
      const dashOffset = (time * 40) % 20; // 40px/s animation
      ctx.setLineDash([8, 8]);
      ctx.lineDashOffset = dashOffset;
      ctx.strokeStyle = '#008F46';
      ctx.lineWidth = 1 * devicePixelRatio;
      
      ctx.strokeRect(x, y, w, h);
      
      // Draw label
      const labelText = `${className.toUpperCase()} ${Math.round(score * 100)}%`;
      ctx.font = `12px PPNeueMontreal, monospace`;
      ctx.fillStyle = '#008F46';
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 2;
      
      const labelWidth = Math.min(ctx.measureText(labelText).width, w - 8);
      const labelHeight = 20;
      const labelX = x;
      const labelY = y - 5;
      
      // Label background (pill shape)
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.roundRect(labelX, labelY - labelHeight, labelWidth + 8, labelHeight, labelHeight / 2);
      ctx.fill();
      
      // Label text
      ctx.fillStyle = '#008F46';
      ctx.fillText(labelText, labelX + 4, labelY - 2);
      
      ctx.restore();
    });
  }, []);

  // Process detection frame
  const processDetection = useCallback(async () => {
    if (!detectMode || !videoRef.current || !detectionCanvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = detectionCanvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx || video.readyState !== video.HAVE_ENOUGH_DATA) return;
    
    const startTime = performance.now();
    
    try {
      let detections: any[] = [];
      
      if (detectionEngine === 'color') {
        // Color-based green detection
        const tempCanvas = document.createElement('canvas');
        const tempCtx = tempCanvas.getContext('2d');
        if (!tempCtx) return;
        
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        tempCtx.drawImage(video, 0, 0);
        
        const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
        const data = imageData.data;
        
        // Find green regions
        const greenRegions: { x: number; y: number; width: number; height: number; score: number }[] = [];
        const blockSize = 20; // Check every 20x20 pixel block
        
        for (let y = 0; y < tempCanvas.height - blockSize; y += blockSize) {
          for (let x = 0; x < tempCanvas.width - blockSize; x += blockSize) {
            let totalR = 0, totalG = 0, totalB = 0;
            let pixelCount = 0;
            
            // Sample the block
            for (let by = 0; by < blockSize; by++) {
              for (let bx = 0; bx < blockSize; bx++) {
                const pixelIndex = ((y + by) * tempCanvas.width + (x + bx)) * 4;
                totalR += data[pixelIndex];
                totalG += data[pixelIndex + 1];
                totalB += data[pixelIndex + 2];
                pixelCount++;
              }
            }
            
            const avgR = totalR / pixelCount;
            const avgG = totalG / pixelCount;
            const avgB = totalB / pixelCount;
            
            // Check if this block is green enough
            const distance = colorDistance({ r: avgR, g: avgG, b: avgB }, targetColor);
            const maxDistance = 100; // Threshold for green detection
            const similarity = Math.max(0, 100 - (distance / maxDistance) * 100);
            
            if (similarity >= 60) { // Only detect strong green matches
              greenRegions.push({
                x: x,
                y: y,
                width: blockSize,
                height: blockSize,
                score: similarity / 100
              });
            }
          }
        }
        
        // Convert to detection format
        detections = greenRegions.map((region, index) => ({
          bbox: {
            originX: region.x,
            originY: region.y,
            width: region.width,
            height: region.height
          },
          score: region.score,
          class: 'green_object'
        }));
      }
      
      // Update detection boxes with smoothing
      const currentTime = performance.now();
      const smoothingFactor = 0.25; // Reduced smoothing for more accuracy
      
      detections.forEach((detection, index) => {
        const id = `${detection.class}_${index}`;
        const existing = detectionBoxesRef.current.get(id);
        
        if (existing) {
          // Smooth the bounding box
          detection.bbox.originX = existing.bbox.originX * (1 - smoothingFactor) + detection.bbox.originX * smoothingFactor;
          detection.bbox.originY = existing.bbox.originY * (1 - smoothingFactor) + detection.bbox.originY * smoothingFactor;
          detection.bbox.width = existing.bbox.width * (1 - smoothingFactor) + detection.bbox.width * smoothingFactor;
          detection.bbox.height = existing.bbox.height * (1 - smoothingFactor) + detection.bbox.height * smoothingFactor;
        }
        
        detectionBoxesRef.current.set(id, {
          ...detection,
          lastSeen: currentTime,
          opacity: existing ? Math.min(existing.opacity + 0.1, 1) : 0.1
        });
      });
      
      // Remove old detections
      detectionBoxesRef.current.forEach((box, id) => {
        if (currentTime - box.lastSeen > 300) {
          box.opacity -= 0.05;
          if (box.opacity <= 0) {
            detectionBoxesRef.current.delete(id);
          }
        }
      });
      
      // Draw detection boxes
      drawDetectionBoxes(ctx, video.videoWidth, video.videoHeight);
      
      // Update performance metrics
      const inferenceTime = performance.now() - startTime;
      setInferenceTime(Math.round(inferenceTime));
      
    } catch (error) {
      console.error('Detection processing error:', error);
    }
  }, [detectMode, detectionEngine, drawDetectionBoxes]);

  // Detection loop
  useEffect(() => {
    if (!detectMode || !detectionEngine) return;
    
    let detectionFrameCount = 0;
    let lastDetectionTime = performance.now();
    
    const detectionLoop = () => {
      const now = performance.now();
      
      // Run detection at 15-20 Hz (every 50-66ms) for better accuracy
      if (now - lastDetectionTime >= 60) {
        processDetection();
        lastDetectionTime = now;
        detectionFrameCount++;
        
        // Update detection FPS every second
        if (now - lastDetectionTime >= 1000) {
          setDetectionFps(Math.round((detectionFrameCount * 1000) / (now - lastDetectionTime)));
          detectionFrameCount = 0;
          lastDetectionTime = now;
        }
      }
      
      requestAnimationFrame(detectionLoop);
    };
    
    detectionLoop();
  }, [detectMode, detectionEngine, processDetection]);

  const applyCreativeEffects = useCallback(() => {
    if (!effectsCanvasRef.current || !videoRef.current) {
      console.log('Canvas or video not ready');
      return;
    }
    
    const canvas = effectsCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.log('Canvas context not available');
      return;
    }
    
    const video = videoRef.current;
    
    // Check if video is ready
    if (video.readyState < video.HAVE_ENOUGH_DATA) {
      console.log('Video not ready, readyState:', video.readyState);
      return;
    }
    
    // Set canvas size to match video
    canvas.width = video.videoWidth || video.clientWidth;
    canvas.height = video.videoHeight || video.clientHeight;
    
    const width = canvas.width;
    const height = canvas.height;
    
    console.log('Drawing video:', width, 'x', height);
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw video with effects
    ctx.save();
    
    // Apply flip if needed
    if (isFlipped) {
      ctx.scale(-1, 1);
      ctx.translate(-width, 0);
    }
    
    // Draw the video first (base layer)
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 1;
    ctx.filter = 'none';
    ctx.drawImage(video, 0, 0, width, height);
    
    if (effectsEnabled) {
      // Apply creative effects
      const time = Date.now() * 0.001;
      
      // Chromatic aberration effect
      ctx.globalCompositeOperation = 'screen';
      ctx.filter = 'hue-rotate(120deg) blur(1px)';
      ctx.globalAlpha = 0.3;
      ctx.drawImage(video, -2, 0, width, height);
      
      ctx.filter = 'hue-rotate(240deg) blur(1px)';
      ctx.globalAlpha = 0.3;
      ctx.drawImage(video, 2, 0, width, height);
      
      // Add scanlines
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      for (let i = 0; i < height; i += 4) {
        ctx.fillRect(0, i, width, 1);
      }
      
      // Add glitch effect
      if (Math.random() < 0.1) {
        ctx.globalCompositeOperation = 'difference';
        ctx.fillStyle = `hsl(${Math.random() * 360}, 100%, 50%)`;
        ctx.fillRect(Math.random() * width, 0, Math.random() * 50, height);
      }
      
      // Add noise
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
      ctx.fillRect(0, 0, width, height);
    }
    
    ctx.restore();
    
  }, [isFlipped, effectsEnabled]);

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
      
      // Update effects canvas size
      if (effectsCanvasRef.current) {
        effectsCanvasRef.current.width = video.videoWidth;
        effectsCanvasRef.current.height = video.videoHeight;
      }
      
      drawOverlay();
      applyCreativeEffects();
    }
    
    animationRef.current = requestAnimationFrame(analyzeFrame);
  }, [scanning, targetColor, drawOverlay, applyCreativeEffects]);

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
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-green-500 text-xl font-medium mb-4 tracking-wider">
              INITIALIZING HUE SCANNER...
            </div>
            <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

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
      
      {/* Effects Canvas */}
      <canvas
        ref={effectsCanvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      
      {/* Overlay Canvas */}
      <canvas
        ref={overlayCanvasRef}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
      />
      
      {/* Detection Canvas */}
      {detectMode && (
        <canvas
          ref={detectionCanvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        />
      )}
      
      {/* HUD Overlay */}
      {!isLoading && !error && (
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
            <div className="flex items-center gap-2">
              <span className="text-green-500">FLIP:</span>
              <span className="text-white">{isFlipped ? 'ON' : 'OFF'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-green-500">EFFECTS:</span>
              <span className="text-white">{effectsEnabled ? 'ON' : 'OFF'}</span>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-green-500">DETECT:</span>
              <span className="text-white">{detectMode ? 'ON' : 'OFF'}</span>
            </div>
            
            {detectMode && (
              <div className="flex items-center gap-2">
                <span className="text-green-500">ENGINE:</span>
                <span className="text-white">{detectionEngine?.toUpperCase() || 'LOADING'}</span>
              </div>
            )}
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
          
          {/* Privacy Notice */}
          {detectMode && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-black/80 backdrop-blur-sm border border-green-400/30 p-2 rounded text-xs text-green-400 font-mono">
              On-device detection. No data sent.
            </div>
          )}
        </div>
      )}
      
      {/* Controls */}
      {!isLoading && !error && (
        <>
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 pointer-events-auto z-50 flex gap-2">
            <button
              onClick={switchCamera}
              className="bg-black/60 backdrop-blur-sm border border-green-400/30 text-green-400 p-3 rounded-full hover:bg-green-400/20 transition-all"
              title="Switch Camera"
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
            
            <button
              onClick={toggleEffects}
              className={`bg-black/60 backdrop-blur-sm border border-green-400/30 text-green-400 p-3 rounded-full hover:bg-green-400/20 transition-all ${
                effectsEnabled ? 'bg-green-400/20 border-green-400' : ''
              }`}
              title={effectsEnabled ? 'Disable Effects' : 'Enable Effects'}
            >
              <div className="w-5 h-5 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full transition-all ${
                  effectsEnabled ? 'bg-green-400 animate-pulse' : 'bg-gray-400'
                }`} />
              </div>
            </button>
            
            <button
              onClick={toggleDetectMode}
              className={`bg-black/60 backdrop-blur-sm border border-green-400/30 text-green-400 p-3 rounded-full hover:bg-green-400/20 transition-all ${
                detectMode ? 'bg-green-400/20 border-green-400' : ''
              }`}
              title={detectMode ? 'Disable Detect Mode' : 'Enable Detect Mode'}
            >
              <Eye size={20} />
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
