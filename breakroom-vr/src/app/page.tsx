'use client';
import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { VRButton, ARButton, XR } from '@react-three/xr';
import VRScene from './components/VRScene';

export default function BreakRoomPage() {
  return (
    <main className="w-full h-screen relative">
      {/* VR Controls */}
      <div className="absolute top-4 left-4 z-10">
        <VRButton />
      </div>
      
      {/* Back to Home */}
      <div className="absolute top-4 right-4 z-10">
        <a 
          href="http://localhost:3000" 
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded text-sm font-medium transition-colors"
        >
          ← Back to Home
        </a>
      </div>

      {/* VR Scene */}
      <Canvas>
        <XR>
          <Suspense fallback={null}>
            <VRScene />
          </Suspense>
        </XR>
      </Canvas>

      {/* Loading Screen */}
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="text-green-400 text-lg font-mono mb-4">BREAKROOM BRK-37</div>
          <div className="text-gray-400 text-sm">Loading VR Environment...</div>
        </div>
      </div>
    </main>
  );
}
