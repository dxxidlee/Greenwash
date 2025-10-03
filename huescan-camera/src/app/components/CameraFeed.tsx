'use client';
import { useRef, useEffect, useState } from 'react';

interface CameraFeedProps {
  onComplianceUpdate: (compliance: number) => void;
  isScanning: boolean;
  onScanningChange: (scanning: boolean) => void;
}

export default function CameraFeed({ onComplianceUpdate, isScanning, onScanningChange }: CameraFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Target green color (#008F46)
  const targetGreen = { r: 0, g: 143, b: 70 };

  useEffect(() => {
    startCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment', // Use back camera on mobile
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permissions.');
      console.error('Camera error:', err);
    }
  };

  const analyzeFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return;

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw current video frame to canvas
    ctx.drawImage(video, 0, 0);

    // Get image data
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;

    let greenPixels = 0;
    let totalPixels = 0;

    // Sample every 10th pixel for performance
    for (let i = 0; i < data.length; i += 40) { // RGBA = 4 bytes, so 40 = 10 pixels
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Calculate color distance from target green
      const distance = Math.sqrt(
        Math.pow(r - targetGreen.r, 2) +
        Math.pow(g - targetGreen.g, 2) +
        Math.pow(b - targetGreen.b, 2)
      );

      // If distance is within threshold (adjust as needed)
      if (distance < 100) {
        greenPixels++;
      }
      totalPixels++;
    }

    const compliance = totalPixels > 0 ? (greenPixels / totalPixels) * 100 : 0;
    onComplianceUpdate(compliance);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isScanning && hasPermission) {
      interval = setInterval(analyzeFrame, 100); // Analyze every 100ms
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isScanning, hasPermission]);

  return (
    <div className="relative">
      {!hasPermission && !error && (
        <div className="flex items-center justify-center h-96 bg-gray-800 rounded">
          <div className="text-center">
            <div className="text-green-400 mb-2">Requesting Camera Access...</div>
            <div className="text-sm text-gray-400">Please allow camera permissions</div>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-center justify-center h-96 bg-gray-800 rounded">
          <div className="text-center">
            <div className="text-red-400 mb-2">Camera Error</div>
            <div className="text-sm text-gray-400">{error}</div>
            <button 
              onClick={startCamera}
              className="mt-4 px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {hasPermission && (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-auto rounded"
          />
          <canvas
            ref={canvasRef}
            className="hidden"
          />
          
          {/* Overlay */}
          <div className="absolute top-4 left-4 bg-black bg-opacity-50 px-3 py-2 rounded">
            <div className="text-green-400 text-sm font-mono">
              {isScanning ? 'SCANNING...' : 'READY'}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
