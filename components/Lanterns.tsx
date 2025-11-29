import React, { useState, useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Trail } from '@react-three/drei';
import * as THREE from 'three';

interface LanternData {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  life: number;
  scale: number;
  color: string;
}

interface LanternsProps {
  isWishMode: boolean;
}

const Lantern: React.FC<{ data: LanternData }> = ({ data }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    if (groupRef.current) {
        // Linearly interpolate position for smooth Trail
        groupRef.current.position.copy(data.position);
        
        // Gentle swaying rotation
        groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5 + data.id) * 0.1;
        groupRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={groupRef} position={data.position}>
        <Trail 
            width={data.scale * 4} 
            length={6} 
            color={new THREE.Color("#ffaa00")} 
            attenuation={(t) => t * t}
        >
            <mesh scale={data.scale}>
                {/* Lantern Body */}
                <cylinderGeometry args={[0.25, 0.4, 0.6, 8]} />
                <meshStandardMaterial 
                    emissive="#ff6600" 
                    emissiveIntensity={1.5} 
                    color="#ffaa00" 
                    transparent 
                    opacity={data.life} 
                    roughness={0.4}
                />
                
                {/* Inner Light */}
                <pointLight distance={8} intensity={2} color="#ffaa00" decay={2} position={[0, -0.2, 0]} />
            </mesh>
        </Trail>
    </group>
  );
};

export const Lanterns: React.FC<LanternsProps> = ({ isWishMode }) => {
  const [lanterns, setLanterns] = useState<LanternData[]>([]);
  const nextId = useRef(0);

  const handleClick = (e: any) => {
    if (!isWishMode) return;
    e.stopPropagation(); // Prevent clicking through to other future interactive elements
    
    // Get the point in 3D space where the user clicked
    const point = e.point; 
    
    const newLantern: LanternData = {
      id: nextId.current++,
      position: point.clone(),
      velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.8, // Wind drift X
          1.0 + Math.random() * 0.8,   // Rising speed Y
          (Math.random() - 0.5) * 0.8  // Wind drift Z
      ),
      life: 1.0,
      scale: 0.6 + Math.random() * 0.4,
      color: '#ffaa00'
    };

    setLanterns(prev => [...prev, newLantern]);
  };

  useFrame((state, delta) => {
    if (lanterns.length === 0) return;

    setLanterns(prev => prev.map(l => ({
        ...l,
        position: l.position.clone().add(l.velocity.clone().multiplyScalar(delta)),
        life: l.life - delta * 0.03 // Slowly fade out over ~30 seconds
    })).filter(l => l.life > 0));
  });

  return (
    <group>
        {/* Click Target: Huge invisible sphere to detect clicks 'anywhere' in space */}
        {isWishMode && (
             <mesh onClick={handleClick} visible={false}>
                <sphereGeometry args={[100, 16, 16]} />
                <meshBasicMaterial side={THREE.DoubleSide} />
            </mesh>
        )}
        
        {/* Render Active Lanterns */}
        {lanterns.map(l => (
            <Lantern key={l.id} data={l} />
        ))}
    </group>
  );
};
