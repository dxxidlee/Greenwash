'use client';
import { useState, useEffect } from 'react';

export default function HueScanPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    // Hide loading after iframe loads
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    // Hide instructions after 5 seconds
    const instructionTimer = setTimeout(() => {
      setShowInstructions(false);
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(instructionTimer);
    };
  }, []);

  return (
    <div className="w-full h-screen bg-gray-900 relative overflow-hidden">
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-900 z-50 flex items-center justify-center">
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

      {/* Instructions Overlay */}
      {showInstructions && (
        <div className="absolute top-4 left-4 right-4 z-40 bg-gray-900/80 backdrop-blur-sm border border-green-500/30 rounded p-4">
          <div className="text-green-500 text-sm font-medium mb-2 tracking-wider">
            HUE SCANNER ACTIVATED
          </div>
          <div className="text-green-400 text-xs space-y-1">
            <div>• Allow camera access when prompted</div>
            <div>• Point camera at objects to scan</div>
            <div>• Green compliance percentage shown in real-time</div>
            <div>• High compliance = green objects detected</div>
            <div>• Switch cameras using dropdown if available</div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="absolute top-4 right-4 z-40">
        <a
          href="/"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors tracking-wider"
        >
          ← BACK TO HOME
        </a>
      </div>

      {/* Main Experience */}
      <iframe
        src="https://huescan-camera.vercel.app"
        className="w-full h-full border-0"
        title="HueScan Camera Experience"
        allow="camera; microphone; fullscreen"
        onLoad={() => setIsLoading(false)}
      />

      {/* Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="w-full h-full bg-gradient-radial from-transparent via-transparent to-gray-900/20"></div>
      </div>
    </div>
  );
}
