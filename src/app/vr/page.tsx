'use client';
import { Canvas } from '@react-three/fiber';
import { XR, VRButton, Controllers, Hands } from '@react-three/xr';
import { OrbitControls, Fog } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as THREE from 'three';

// Room dimensions from spec: 18m × 12m × 2.7m ceiling
const ROOM_WIDTH = 18;
const ROOM_DEPTH = 12;
const ROOM_HEIGHT = 2.7;
const COLUMN_SIZE = 0.6;
const COLUMN_GRID = 3;
const TILE_SIZE = 0.6;
const PANEL_WIDTH = 1.2;
const PANEL_HEIGHT = 0.6;

// Brand colors
const BRAND_GREEN = '#008F46';
const LIGHT_GREEN_FOG = '#e8f5e8';

function BackroomGeometry() {
  const groupRef = useRef<THREE.Group>(null);

  // Create floor
  const Floor = () => (
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[ROOM_WIDTH, ROOM_DEPTH]} />
      <meshLambertMaterial color={BRAND_GREEN} />
    </mesh>
  );

  // Create walls with openings
  const Walls = () => (
    <group>
      {/* Back wall */}
      <mesh position={[0, ROOM_HEIGHT / 2, -ROOM_DEPTH / 2]}>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, 0.1]} />
        <meshLambertMaterial color={BRAND_GREEN} />
      </mesh>
      
      {/* Front wall */}
      <mesh position={[0, ROOM_HEIGHT / 2, ROOM_DEPTH / 2]}>
        <boxGeometry args={[ROOM_WIDTH, ROOM_HEIGHT, 0.1]} />
        <meshLambertMaterial color={BRAND_GREEN} />
      </mesh>
      
      {/* Left wall */}
      <mesh position={[-ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.1, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshLambertMaterial color={BRAND_GREEN} />
      </mesh>
      
      {/* Right wall */}
      <mesh position={[ROOM_WIDTH / 2, ROOM_HEIGHT / 2, 0]}>
        <boxGeometry args={[0.1, ROOM_HEIGHT, ROOM_DEPTH]} />
        <meshLambertMaterial color={BRAND_GREEN} />
      </mesh>
    </group>
  );

  // Create columns on 3m grid
  const Columns = () => {
    const columns = [];
    const startX = -ROOM_WIDTH / 2 + COLUMN_GRID;
    const startZ = -ROOM_DEPTH / 2 + COLUMN_GRID;
    
    for (let x = startX; x < ROOM_WIDTH / 2; x += COLUMN_GRID) {
      for (let z = startZ; z < ROOM_DEPTH / 2; z += COLUMN_GRID) {
        columns.push(
          <mesh key={`column-${x}-${z}`} position={[x, ROOM_HEIGHT / 2, z]}>
            <boxGeometry args={[COLUMN_SIZE, ROOM_HEIGHT, COLUMN_SIZE]} />
            <meshLambertMaterial color={BRAND_GREEN} />
          </mesh>
        );
      }
    }
    return <group>{columns}</group>;
  };

  // Create drop ceiling with tiles
  const Ceiling = () => {
    const tiles = [];
    const panels = [];
    const tilesX = Math.ceil(ROOM_WIDTH / TILE_SIZE);
    const tilesZ = Math.ceil(ROOM_DEPTH / TILE_SIZE);
    
    for (let x = 0; x < tilesX; x++) {
      for (let z = 0; z < tilesZ; z++) {
        const posX = (x - tilesX / 2) * TILE_SIZE + TILE_SIZE / 2;
        const posZ = (z - tilesZ / 2) * TILE_SIZE + TILE_SIZE / 2;
        
        // Ceiling tile
        tiles.push(
          <mesh key={`tile-${x}-${z}`} position={[posX, ROOM_HEIGHT, posZ]}>
            <boxGeometry args={[TILE_SIZE, 0.02, TILE_SIZE]} />
            <meshLambertMaterial color="#f0f0f0" />
          </mesh>
        );
        
        // Add emissive panels every two tiles
        if (x % 2 === 0 && z % 2 === 0) {
          panels.push(
            <mesh key={`panel-${x}-${z}`} position={[posX, ROOM_HEIGHT - 0.01, posZ]}>
              <boxGeometry args={[PANEL_WIDTH, 0.01, PANEL_HEIGHT]} />
              <meshBasicMaterial 
                color="#e8f5e8" 
                emissive="#e8f5e8"
                emissiveIntensity={0.3}
              />
            </mesh>
          );
        }
      }
    }
    
    return (
      <group>
        {tiles}
        {panels}
      </group>
    );
  };

  // Baseboard trim
  const Baseboard = () => (
    <group>
      {/* Floor perimeter trim */}
      <mesh position={[0, 0.04, -ROOM_DEPTH / 2]}>
        <boxGeometry args={[ROOM_WIDTH, 0.08, 0.08]} />
        <meshLambertMaterial color="#006633" />
      </mesh>
      <mesh position={[0, 0.04, ROOM_DEPTH / 2]}>
        <boxGeometry args={[ROOM_WIDTH, 0.08, 0.08]} />
        <meshLambertMaterial color="#006633" />
      </mesh>
      <mesh position={[-ROOM_WIDTH / 2, 0.04, 0]}>
        <boxGeometry args={[0.08, 0.08, ROOM_DEPTH]} />
        <meshLambertMaterial color="#006633" />
      </mesh>
      <mesh position={[ROOM_WIDTH / 2, 0.04, 0]}>
        <boxGeometry args={[0.08, 0.08, ROOM_DEPTH]} />
        <meshLambertMaterial color="#006633" />
      </mesh>
    </group>
  );

  return (
    <group ref={groupRef}>
      <Floor />
      <Walls />
      <Columns />
      <Ceiling />
      <Baseboard />
    </group>
  );
}

function Lighting() {
  return (
    <group>
      {/* Ambient light for overall illumination */}
      <ambientLight intensity={0.4} color="#e8f5e8" />
      
      {/* Directional light from above to simulate ceiling panels */}
      <directionalLight
        position={[0, ROOM_HEIGHT - 0.5, 0]}
        intensity={0.6}
        color="#e8f5e8"
        castShadow={false}
      />
      
      {/* Additional soft fill light */}
      <hemisphereLight
        skyColor="#e8f5e8"
        groundColor={BRAND_GREEN}
        intensity={0.3}
      />
    </group>
  );
}

export default function VRPage() {
  const router = useRouter();

  const handleExit = () => {
    router.push('/');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black">
      {/* Exit button */}
      <button
        onClick={handleExit}
        className="absolute top-4 right-4 z-60 text-white hover:opacity-75 text-2xl font-bold"
        style={{ color: '#008F46' }}
      >
        ✕
      </button>

      {/* VR Button */}
      <div className="absolute top-4 left-4 z-60">
        <VRButton />
      </div>

      {/* Title */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-60">
        <h1 
          className="text-2xl font-bold"
          style={{ 
            color: '#008F46',
            fontFamily: 'PPNeueMontreal, sans-serif'
          }}
        >
          Greenwash
        </h1>
      </div>

      {/* Three.js Canvas */}
      <Canvas
        camera={{ 
          position: [0, 1.6, 2], 
          fov: 75,
          near: 0.1,
          far: 100
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <XR>
          <Suspense fallback={null}>
            {/* Fog for depth and atmosphere */}
            <Fog attach="fog" args={[LIGHT_GREEN_FOG, 5, 15]} />
            
            {/* Lighting */}
            <Lighting />
            
            {/* Room geometry */}
            <BackroomGeometry />
            
            {/* VR Controllers and Hands */}
            <Controllers />
            <Hands />
            
            {/* Non-VR fallback controls */}
            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              maxPolarAngle={Math.PI / 2}
              minDistance={0.5}
              maxDistance={10}
            />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}
