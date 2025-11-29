import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { audioManager } from '../utils/audioManager';
import { VisualSettings } from '../types';

interface TreeParticlesProps {
  settings: VisualSettings;
}

// Optimized counts for high-fidelity visualization
export const PARTICLE_COUNTS = {
  LOW: 20000,  // Base of tree
  MID: 15000,  // Middle section
  HIGH: 7000   // Top section
};
const SNOW_COUNT = 2000;
const GIFT_COUNT = 80;
const LIGHT_COUNT = 1500;

const TreeParticles: React.FC<TreeParticlesProps> = ({ settings }) => {
  const lowPointsRef = useRef<THREE.Points>(null);
  const midPointsRef = useRef<THREE.Points>(null);
  const highPointsRef = useRef<THREE.Points>(null);
  const snowRef = useRef<THREE.Points>(null);
  const lightsRef = useRef<THREE.Points>(null);
  const giftsRef = useRef<THREE.InstancedMesh>(null);
  const starRef = useRef<THREE.Mesh>(null);

  // Generate a soft circular texture for particles - Adjusted for softer 'halo' look
  const particleTexture = useMemo(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64; // Higher res for better gradients
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
      gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.6)');
      gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.15)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }
    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter; // Better quality scaling
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }, []);

  // --- Geometry Generators ---

  // 1. Main Tree Generator
  const generateTreeGeometry = (count: number, minHeight: number, maxHeight: number, maxRadiusAtBase: number) => {
    const positions = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const colorObj = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const hNorm = Math.pow(Math.random(), 0.8); // Bias towards bottom slightly
      const y = minHeight + hNorm * (maxHeight - minHeight);
      
      // Cone shape logic
      const radiusAtHeight = (1 - hNorm) * maxRadiusAtBase; 
      // Volume distribution (random point inside circle at that height)
      const r = radiusAtHeight * Math.sqrt(Math.random()); 
      const angle = Math.random() * Math.PI * 2;
      
      const x = r * Math.cos(angle);
      const z = r * Math.sin(angle);

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      
      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;

      // Initial color variation
      const mix = Math.random();
      if (mix > 0.8) colorObj.set('#ffffff'); // sparkle
      else if (mix > 0.5) colorObj.set('#20ff80');
      else colorObj.set('#00aaff');
      
      colors[i * 3] = colorObj.r;
      colors[i * 3 + 1] = colorObj.g;
      colors[i * 3 + 2] = colorObj.b;
    }

    return { positions, originalPositions, colors };
  };

  // 2. Snow Generator
  const generateSnow = () => {
    const positions = new Float32Array(SNOW_COUNT * 3);
    const velocities = new Float32Array(SNOW_COUNT); // Falling speed
    const colors = new Float32Array(SNOW_COUNT * 3);
    const colorObj = new THREE.Color();

    for (let i = 0; i < SNOW_COUNT; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50; // Wide spread X
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40; // Wide spread Y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50; // Wide spread Z
      
      velocities[i] = 0.05 + Math.random() * 0.1;

      // Muted White and Icy Blue
      if (Math.random() > 0.6) colorObj.set('#ffffff'); // Pure White
      else colorObj.set('#d1f5ff'); // Very subtle Icy Blue
      
      colors[i * 3] = colorObj.r;
      colors[i * 3 + 1] = colorObj.g;
      colors[i * 3 + 2] = colorObj.b;
    }
    return { positions, velocities, colors };
  };

  // 3. Lights Generator
  const generateLights = () => {
    const positions = new Float32Array(LIGHT_COUNT * 3);
    const colors = new Float32Array(LIGHT_COUNT * 3);
    const phases = new Float32Array(LIGHT_COUNT); // For blinking
    const colorPalette = ['#ff3333', '#33ff33', '#3333ff', '#ffff33', '#ff33ff'];
    const colorObj = new THREE.Color();

    for (let i = 0; i < LIGHT_COUNT; i++) {
        const hNorm = Math.random();
        const y = -10 + hNorm * 20;
        const r = (1 - hNorm) * 8 * 0.95; // Slightly inside the max radius
        const angle = Math.random() * Math.PI * 2;
        
        positions[i * 3] = r * Math.cos(angle);
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = r * Math.sin(angle);

        colorObj.set(colorPalette[Math.floor(Math.random() * colorPalette.length)]);
        colors[i * 3] = colorObj.r;
        colors[i * 3 + 1] = colorObj.g;
        colors[i * 3 + 2] = colorObj.b;
        
        phases[i] = Math.random() * Math.PI * 2;
    }
    return { positions, colors, phases };
  };

  // 4. Star Shape Generator
  const starShape = useMemo(() => {
    const shape = new THREE.Shape();
    const points = 5;
    const outerRadius = 1.0;
    const innerRadius = 0.4;
    
    // Rotate -Math.PI/2 to make it point upwards
    const offsetAngle = -Math.PI / 2;

    for (let i = 0; i < points * 2; i++) {
        const angle = offsetAngle + (i / (points * 2)) * Math.PI * 2;
        const radius = i % 2 === 0 ? outerRadius : innerRadius;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        if (i === 0) shape.moveTo(x, y);
        else shape.lineTo(x, y);
    }
    shape.closePath();
    return shape;
  }, []);

  // --- Memos ---
  const lowTier = useMemo(() => generateTreeGeometry(PARTICLE_COUNTS.LOW, -10, -3, 8), []);
  const midTier = useMemo(() => generateTreeGeometry(PARTICLE_COUNTS.MID, -3, 4, 5), []);
  const highTier = useMemo(() => generateTreeGeometry(PARTICLE_COUNTS.HIGH, 4, 10, 2), []);
  const snow = useMemo(() => generateSnow(), []);
  const lights = useMemo(() => generateLights(), []);

  // --- Setup Gifts (InstancedMesh) ---
  const dummy = useMemo(() => new THREE.Object3D(), []);
  useEffect(() => {
    if (giftsRef.current) {
      for (let i = 0; i < GIFT_COUNT; i++) {
        const hNorm = Math.random() * 0.5; // Mostly lower half
        const y = -10 + hNorm * 12;
        const r = (1 - hNorm) * 7 * Math.sqrt(Math.random());
        const angle = Math.random() * Math.PI * 2;
        
        dummy.position.set(
          r * Math.cos(angle),
          y,
          r * Math.sin(angle)
        );
        dummy.rotation.set(Math.random(), Math.random(), Math.random());
        const scale = 0.3 + Math.random() * 0.4;
        dummy.scale.set(scale, scale, scale);
        dummy.updateMatrix();
        giftsRef.current.setMatrixAt(i, dummy.matrix);
        // Random colors for gifts
        giftsRef.current.setColorAt(i, new THREE.Color().setHSL(Math.random(), 0.8, 0.5));
      }
      giftsRef.current.instanceMatrix.needsUpdate = true;
      if (giftsRef.current.instanceColor) giftsRef.current.instanceColor.needsUpdate = true;
    }
  }, [dummy]);


  // --- Animation Loop ---
  useFrame((state) => {
    const { low, mid, high } = audioManager.getSpectralData();
    const time = state.clock.getElapsedTime();
    
    // Helper to animate distinct tiers with different behaviors
    const animateTreeTier = (
        ref: React.RefObject<THREE.Points>, 
        audioVal: number, 
        originals: Float32Array, 
        mode: 'low' | 'mid' | 'high'
    ) => {
        if (!ref.current) return;
        const positions = ref.current.geometry.attributes.position.array as Float32Array;
        
        // Normalize audio value (0-255) to 0-1 with a threshold to reduce noise
        const normalized = Math.max(0, (audioVal - 15) / 240);
        // Square it for more dramatic "pop" on beats
        const intensity = normalized * normalized; 
        
        const shake = settings.vibrationStrength * intensity;

        for (let i = 0; i < positions.length / 3; i+=1) {
            const idx = i * 3;
            const ox = originals[idx];
            const oy = originals[idx + 1];
            const oz = originals[idx + 2];

            let nx = ox, ny = oy, nz = oz;

            if (mode === 'low') {
                // Bass Mode: "Heartbeat" Pulse
                const pulse = 1 + (intensity * 0.35); 
                nx = ox * pulse;
                nz = oz * pulse;
                ny = oy + (Math.random() - 0.5) * shake * 0.3;
            } 
            else if (mode === 'mid') {
                // Mid Mode: "Flow" (Twist & Wave)
                const angle = intensity * 0.15 * (oy / 10);
                const cosA = Math.cos(angle);
                const sinA = Math.sin(angle);
                const rx = ox * cosA - oz * sinA;
                const rz = ox * sinA + oz * cosA;
                
                nx = rx + (Math.random() - 0.5) * shake * 0.6; 
                nz = rz + (Math.random() - 0.5) * shake * 0.6;
                ny = oy + Math.sin(time * 3 + ox) * 0.15 * intensity;
            } 
            else if (mode === 'high') {
                // High Mode: "Sparkle"
                nx = ox + (Math.random() - 0.5) * shake * 3.0; 
                ny = oy + (Math.random() - 0.5) * shake * 3.0;
                nz = oz + (Math.random() - 0.5) * shake * 3.0;
            }

            positions[idx] = nx;
            positions[idx + 1] = ny;
            positions[idx + 2] = nz;
        }
        ref.current.geometry.attributes.position.needsUpdate = true;
        
        // Color & Size Reaction - Enhanced for Dynamic Bloom
        const mat = ref.current.material as THREE.PointsMaterial;
        const baseColor = new THREE.Color(settings.particleColor);
        
        // Push Lightness higher (0.8) to trigger Bloom threshold strongly on beats
        const targetColor = baseColor.clone().offsetHSL(0, 0, intensity * 0.8);
        mat.color.lerp(targetColor, 0.15);
        
        // Size Pulse
        const baseSize = settings.particleSize * (mode === 'low' ? 1.0 : (mode === 'mid' ? 0.9 : 0.7));
        mat.size = baseSize * (1 + intensity * 1.5); // Slightly larger pulse
    };

    // Apply distinct animations
    animateTreeTier(lowPointsRef, low, lowTier.originalPositions, 'low');
    animateTreeTier(midPointsRef, mid, midTier.originalPositions, 'mid');
    animateTreeTier(highPointsRef, high, highTier.originalPositions, 'high');

    // 2. Animate Snow (Falling + Wind)
    if (snowRef.current) {
        const positions = snowRef.current.geometry.attributes.position.array as Float32Array;
        const wind = Math.sin(time * 0.5) * 0.05;
        for (let i = 0; i < SNOW_COUNT; i++) {
            positions[i * 3] += wind; 
            positions[i * 3 + 1] -= snow.velocities[i]; 
            
            if (positions[i * 3 + 1] < -15) {
                positions[i * 3 + 1] = 20;
                positions[i * 3] = (Math.random() - 0.5) * 50;
                positions[i * 3 + 2] = (Math.random() - 0.5) * 50;
            }
        }
        snowRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // 3. Animate Lights (Twinkle + Breathing)
    if (lightsRef.current) {
        lightsRef.current.rotation.y = time * 0.05;
        
        const energy = (low + mid) / 512;
        // Romantic breathing effect: Slow sine wave independent of music + music reaction
        const breathing = 0.5 + Math.sin(time * 1.5) * 0.3; 
        
        const lightMat = lightsRef.current.material as THREE.PointsMaterial;
        lightMat.size = settings.particleSize * 2.5 * (0.5 + breathing + energy * 1.5);
        lightMat.opacity = 0.6 + breathing * 0.4;
    }

    // 4. Gifts React to Bass (Bounce)
    if (giftsRef.current) {
        const bassKick = Math.pow(Math.max(0, (low - 40) / 255), 2);
        const scale = 1 + bassKick * 0.5;
        giftsRef.current.scale.setScalar(scale);
        giftsRef.current.rotation.y += 0.005 + bassKick * 0.02;
    }

    // 5. Star Reaction
    if (starRef.current) {
        starRef.current.rotation.y += 0.01;
        // Strong glow on high frequency
        const glow = 1 + (high / 255) * 0.8;
        starRef.current.scale.setScalar(glow);
        (starRef.current.material as THREE.MeshBasicMaterial).color.setHSL(0.16, 1, 0.5 + (high/255)*0.5);
    }
    
    // Rotate Main Tree Layers
    const rotationSpeed = 0.002;
    if(lowPointsRef.current) lowPointsRef.current.rotation.y -= rotationSpeed;
    if(midPointsRef.current) midPointsRef.current.rotation.y -= rotationSpeed * 1.2;
    if(highPointsRef.current) highPointsRef.current.rotation.y -= rotationSpeed * 1.5;

  });

  return (
    <group>
      {/* Main Tree Layers */}
      <points ref={lowPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={lowTier.positions.length / 3} array={lowTier.positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={lowTier.colors.length / 3} array={lowTier.colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial 
            size={settings.particleSize} 
            vertexColors 
            transparent 
            opacity={0.8} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false} 
            sizeAttenuation
            map={particleTexture}
        />
      </points>

      <points ref={midPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={midTier.positions.length / 3} array={midTier.positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={midTier.colors.length / 3} array={midTier.colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial 
            size={settings.particleSize * 0.9} 
            vertexColors 
            transparent 
            opacity={0.8} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false} 
            sizeAttenuation
            map={particleTexture}
        />
      </points>

      <points ref={highPointsRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={highTier.positions.length / 3} array={highTier.positions} itemSize={3} />
          <bufferAttribute attach="attributes-color" count={highTier.colors.length / 3} array={highTier.colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial 
            size={settings.particleSize * 0.7} 
            vertexColors 
            transparent 
            opacity={0.8} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false} 
            sizeAttenuation
            map={particleTexture}
        />
      </points>

      {/* Lights */}
      <points ref={lightsRef}>
        <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={lights.positions.length / 3} array={lights.positions} itemSize={3} />
            <bufferAttribute attach="attributes-color" count={lights.colors.length / 3} array={lights.colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial 
            size={settings.particleSize * 2.5} 
            vertexColors 
            transparent 
            opacity={1} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false} 
            sizeAttenuation
            map={particleTexture}
        />
      </points>

      {/* Snow */}
      <points ref={snowRef}>
        <bufferGeometry>
            <bufferAttribute attach="attributes-position" count={snow.positions.length / 3} array={snow.positions} itemSize={3} />
            <bufferAttribute attach="attributes-color" count={snow.colors.length / 3} array={snow.colors} itemSize={3} />
        </bufferGeometry>
        <pointsMaterial 
            size={0.15} 
            vertexColors 
            transparent 
            opacity={0.6} 
            blending={THREE.AdditiveBlending} 
            depthWrite={false} 
            sizeAttenuation
            map={particleTexture}
        />
      </points>

      {/* Gifts */}
      <instancedMesh ref={giftsRef} args={[undefined, undefined, GIFT_COUNT]}>
        <boxGeometry args={[0.5, 0.5, 0.5]} />
        <meshStandardMaterial roughness={0.3} metalness={0.8} />
      </instancedMesh>
      
      {/* Top Star */}
       <mesh ref={starRef} position={[0, 10.2, 0]}>
         <extrudeGeometry args={[starShape, { depth: 0.3, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.05, bevelSegments: 2 }]} />
         <meshBasicMaterial color="#ffffcc" toneMapped={false} />
         <pointLight intensity={3} distance={20} color="#ffffaa" />
      </mesh>
    </group>
  );
};

export default TreeParticles;