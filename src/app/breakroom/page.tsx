'use client';
import { useEffect } from 'react';

export default function BreakRoomPage() {
  useEffect(() => {
    // Redirect to the local breakroom-vr index.html with cache busting
    const timestamp = Date.now();
    window.location.href = `/breakroom-vr/index.html?v=${timestamp}`;
  }, []);

  return (
    <div className="w-full h-screen bg-black flex items-center justify-center">
      <div className="text-center">
        <div className="text-green-500 text-xl font-medium mb-4 tracking-wider">
          REDIRECTING TO BREAKROOM...
        </div>
        <div className="w-64 h-1 bg-gray-800 rounded-full overflow-hidden">
          <div className="h-full bg-green-500 rounded-full animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
