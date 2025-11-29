import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import TreeParticles from './TreeParticles';
import { Lanterns } from './Lanterns';
import { VisualSettings } from '../types';

interface SceneProps {
  settings: VisualSettings;
  isWishMode: boolean;
}

const Scene: React.FC<SceneProps> = ({ settings, isWishMode }) => {
  return (
    <Canvas
      camera={{ position: [0, 8, 30], fov: 55 }}
      gl={{ 
        antialias: false, 
        alpha: false, 
        powerPreference: "high-performance",
        toneMappingExposure: 1.5 // Slightly increased exposure for brightness
      }} 
      dpr={[1, 2]}
    >
      <color attach="background" args={['#050505']} />
      
      {/* Background */}
      <Stars 
        radius={200} 
        depth={50} 
        count={7000} 
        factor={4} 
        saturation={0} 
        fade 
        speed={1} 
      />

      {/* Lighting for the InstancedMesh Gifts */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[10, 20, 10]} intensity={1.5} color="#ffffff" />
      <pointLight position={[-10, 5, 10]} intensity={1} color="#ffaaee" distance={50} />

      <TreeParticles settings={settings} />
      <Lanterns isWishMode={isWishMode} />

      <OrbitControls 
        enablePan={false} 
        autoRotate={!isWishMode} // Stop rotation when wishing so it's easier to click
        autoRotateSpeed={0.3}
        minDistance={15} 
        maxDistance={70} 
        maxPolarAngle={Math.PI / 1.5}
      />

      {/* Dreamy Post Processing */}
      <EffectComposer enableNormalPass={false} multisampling={0}>
        <Bloom 
          luminanceThreshold={0.55 - (settings.brightness * 0.3)} // Lower threshold to catch more colors
          luminanceSmoothing={0.9} // Maximum smoothing for soft halo
          mipmapBlur={true} // Enable Mipmap Blur for the 'Romantic' wide glow
          intensity={settings.brightness * 2.5} // Boost intensity to compensate for soft spread
          radius={0.7} // Spread radius
        />
      </EffectComposer>
    </Canvas>
  );
};

export default Scene;