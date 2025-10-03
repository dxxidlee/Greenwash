'use client';
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Box, Plane } from '@react-three/drei';
import * as THREE from 'three';

export default function VRScene() {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.1;
    }
  });

  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      
      {/* Room Structure */}
      <group ref={groupRef}>
        {/* Floor */}
        <Plane args={[20, 20]} rotation={[-Math.PI / 2, 0, 0]} position={[0, -2, 0]}>
          <meshBasicMaterial color="#004400" />
        </Plane>
        
        {/* Walls */}
        <Box args={[20, 4, 0.2]} position={[0, 0, -10]}>
          <meshBasicMaterial color="#006600" />
        </Box>
        <Box args={[20, 4, 0.2]} position={[0, 0, 10]}>
          <meshBasicMaterial color="#006600" />
        </Box>
        <Box args={[0.2, 4, 20]} position={[-10, 0, 0]}>
          <meshBasicMaterial color="#006600" />
        </Box>
        <Box args={[0.2, 4, 20]} position={[10, 0, 0]}>
          <meshBasicMaterial color="#006600" />
        </Box>
        
        {/* Ceiling */}
        <Plane args={[20, 20]} rotation={[Math.PI / 2, 0, 0]} position={[0, 2, 0]}>
          <meshBasicMaterial color="#002200" />
        </Plane>
        
        {/* Compliance Text */}
        <Text
          position={[0, 1, -9.9]}
          fontSize={0.5}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          UNIFORM GREEN IS POLICY
        </Text>
        
        <Text
          position={[0, 0.5, -9.9]}
          fontSize={0.3}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          COMPLIANCE IS A PUBLIC GOOD
        </Text>
        
        <Text
          position={[0, 0, -9.9]}
          fontSize={0.3}
          color="#00ff00"
          anchorX="center"
          anchorY="middle"
        >
          I AFFIRM MY ROLE IN GREENWASH
        </Text>
      </group>
    </>
  );
}
