import React, { useState, useEffect } from 'react';
import Scene from './components/Scene';
import UIControls from './components/UIControls';
import { VisualSettings } from './types';
import { audioManager } from './utils/audioManager';

const DEFAULT_SETTINGS: VisualSettings = {
  particleColor: '#00ffcc', // Cyberpunk teal default
  vibrationStrength: 1.0,
  brightness: 0.5,
  trailStrength: 0.3,
  particleSize: 0.15
};

const App: React.FC = () => {
  const [settings, setSettings] = useState<VisualSettings>(DEFAULT_SETTINGS);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isWishMode, setIsWishMode] = useState(false);

  const handleFileUpload = (file: File) => {
    const url = URL.createObjectURL(file);
    audioManager.loadAudio(url);
    setFileName(file.name);
    setIsPlaying(false); // Let user hit play to avoid auto-play policy issues initially
  };

  const togglePlay = () => {
    if (!fileName) return;
    
    if (isPlaying) {
      audioManager.pause();
    } else {
      audioManager.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioManager.pause();
    };
  }, []);

  return (
    <div className="relative w-full h-screen bg-black">
      <Scene settings={settings} isWishMode={isWishMode} />
      <UIControls 
        settings={settings}
        setSettings={setSettings}
        onFileUpload={handleFileUpload}
        isPlaying={isPlaying}
        onTogglePlay={togglePlay}
        fileName={fileName}
        isWishMode={isWishMode}
        onToggleWishMode={() => setIsWishMode(!isWishMode)}
      />
    </div>
  );
};

export default App;