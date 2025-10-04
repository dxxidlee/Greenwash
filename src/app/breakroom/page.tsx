'use client';
import { useState, useEffect } from 'react';

export default function BreakRoomPage() {
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
    <div className="w-full h-screen bg-black relative overflow-hidden">
      {/* Loading Screen */}
      {isLoading && (
        <div className="absolute inset-0 bg-black z-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-green-500 text-xl font-medium mb-4 tracking-wider">
              INITIALIZING BREAKROOM...
            </div>
            <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 rounded-full animate-pulse"></div>
            </div>
          </div>
        </div>
      )}

      {/* Instructions Overlay */}
      {showInstructions && (
        <div className="absolute top-4 left-4 right-4 z-40 bg-black/80 backdrop-blur-sm border border-green-500/30 rounded p-4">
          <div className="text-green-500 text-sm font-medium mb-2 tracking-wider">
            COMPLIANCE TRAINING INITIATED
          </div>
          <div className="text-green-400 text-xs space-y-1">
            <div>• Click to start the experience</div>
            <div>• Use WASD to move around</div>
            <div>• Mouse to look around</div>
            <div>• ESC to toggle compliance HUD</div>
            <div>• Hold record button for 2+ seconds</div>
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
        src="https://breakroom-vr.vercel.app"
        className="w-full h-full border-0"
        title="BreakRoom VR Experience"
        allow="camera; microphone; fullscreen"
        onLoad={() => setIsLoading(false)}
      />

      {/* Vignette Effect */}
      <div className="absolute inset-0 pointer-events-none z-10">
        <div className="w-full h-full bg-gradient-radial from-transparent via-transparent to-black/20"></div>
      </div>
    </div>
  );
}
