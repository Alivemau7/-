import React, { useState, useEffect } from 'react';
import { VisualSettings } from '../types';

interface UIControlsProps {
  settings: VisualSettings;
  setSettings: React.Dispatch<React.SetStateAction<VisualSettings>>;
  onFileUpload: (file: File) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  fileName: string | null;
  isWishMode: boolean;
  onToggleWishMode: () => void;
}

const UIControls: React.FC<UIControlsProps> = ({
  settings,
  setSettings,
  onFileUpload,
  isPlaying,
  onTogglePlay,
  fileName,
  isWishMode,
  onToggleWishMode
}) => {
  const [fps, setFps] = useState(0);
  const [isPanelVisible, setIsPanelVisible] = useState(true);

  // FPS Logic
  useEffect(() => {
    let frameCount = 0;
    let lastTime = performance.now();
    let animationFrameId: number;

    const update = () => {
      const now = performance.now();
      frameCount++;
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        frameCount = 0;
        lastTime = now;
      }
      animationFrameId = requestAnimationFrame(update);
    };

    update();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  const handleChange = (key: keyof VisualSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  // Apple-style Card Component
  const ControlCard = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => (
    <div className={`bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-6 transition-all duration-300 ${className}`}>
      {children}
    </div>
  );

  return (
    <div className={`absolute inset-0 pointer-events-none p-6 flex flex-col justify-between z-50 font-sans text-slate-800 ${isWishMode ? 'cursor-crosshair' : ''}`}>
      
      {/* Top Bar: Stats & Title */}
      <div className="flex justify-between items-start pointer-events-auto w-full">
         <div className="flex flex-col gap-2">
            <h1 className="text-white font-light text-2xl tracking-tight opacity-90 drop-shadow-md">Cosmic Visualizer</h1>
            <div className="flex gap-3">
                <div className="bg-black/30 backdrop-blur-md rounded-full px-3 py-1 text-xs text-white font-medium flex items-center gap-2 border border-white/10">
                    <div className={`w-2 h-2 rounded-full ${fps > 50 ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                    {fps} FPS
                </div>
                <div className="bg-black/30 backdrop-blur-md rounded-full px-3 py-1 text-xs text-white font-medium border border-white/10">
                    45,000+ Particles
                </div>
                {isWishMode && (
                  <div className="bg-amber-500/80 backdrop-blur-md rounded-full px-3 py-1 text-xs text-white font-medium border border-white/10 animate-pulse">
                      ✨ Wish Mode Active
                  </div>
                )}
            </div>
         </div>
         
         {/* Toggle Visibility Button */}
         <button 
           onClick={() => setIsPanelVisible(!isPanelVisible)}
           className="bg-white/20 backdrop-blur-md hover:bg-white/30 text-white rounded-full w-10 h-10 flex items-center justify-center border border-white/10 transition-colors pointer-events-auto"
           title={isPanelVisible ? "Hide Controls" : "Show Controls"}
         >
            {isPanelVisible ? (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            )}
         </button>
      </div>

      {/* Right Control Panel */}
      <div className={`absolute top-24 right-6 w-80 pointer-events-auto transition-all duration-500 transform ${isPanelVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0 pointer-events-none'}`}>
        <ControlCard>
            {/* Wish Mode Toggle */}
            <button
                onClick={onToggleWishMode}
                className={`w-full mb-6 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center gap-2 shadow-sm ${
                    isWishMode 
                    ? 'bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-amber-200' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                {isWishMode ? 'Exit Wish Mode' : 'Enter Wish Mode'}
            </button>

            {/* Player Controls */}
            <div className="mb-6">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Audio Source</div>
                <div className="flex flex-col gap-3">
                    <label className="cursor-pointer group relative flex items-center justify-center w-full h-10 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors border border-slate-200">
                        <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors">
                            {fileName ? 'Change Audio File' : 'Upload MP3'}
                        </span>
                        <input type="file" accept="audio/mp3, audio/wav" className="hidden" onChange={handleFileChange} />
                    </label>
                    
                    {fileName && (
                        <div className="bg-slate-50 rounded-lg p-3 border border-slate-100 flex items-center justify-between">
                            <div className="truncate text-xs text-slate-500 font-medium max-w-[140px]">{fileName}</div>
                            <button 
                                onClick={onTogglePlay}
                                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isPlaying ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-200 text-slate-900 hover:bg-slate-50'}`}
                            >
                                {isPlaying ? (
                                    <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>
                                ) : (
                                    <svg width="10" height="10" fill="currentColor" viewBox="0 0 24 24" className="ml-0.5"><path d="M8 5v14l11-7z"/></svg>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Visual Settings */}
            <div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">Appearance</div>
                <div className="space-y-5">
                    
                    {/* Color Picker */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-slate-700">Theme Color</span>
                        <div className="relative overflow-hidden w-6 h-6 rounded-full shadow-sm ring-1 ring-slate-200">
                             <input 
                                type="color" 
                                value={settings.particleColor}
                                onChange={(e) => handleChange('particleColor', e.target.value)}
                                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] p-0 border-0 cursor-pointer"
                            />
                        </div>
                    </div>

                    {/* Sliders */}
                    {[
                        { label: 'Vibration', key: 'vibrationStrength', min: 0, max: 3, step: 0.1 },
                        { label: 'Bloom', key: 'brightness', min: 0, max: 1, step: 0.05 },
                        { label: 'Trails', key: 'trailStrength', min: 0, max: 0.9, step: 0.05 },
                        { label: 'Size', key: 'particleSize', min: 0.05, max: 0.4, step: 0.01 },
                    ].map((control) => (
                        <div key={control.key} className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="font-medium text-slate-600">{control.label}</span>
                                <span className="text-slate-400 font-mono">{Number(settings[control.key as keyof VisualSettings]).toFixed(2)}</span>
                            </div>
                            <input 
                                type="range" 
                                min={control.min} max={control.max} step={control.step}
                                value={settings[control.key as keyof VisualSettings] as number}
                                onChange={(e) => handleChange(control.key as keyof VisualSettings, parseFloat(e.target.value))}
                                className="w-full h-1 bg-slate-200 rounded-full appearance-none cursor-pointer"
                            />
                        </div>
                    ))}
                </div>
            </div>
        </ControlCard>
      </div>

      {/* Footer */}
      <div className={`text-center text-white/30 text-xs pointer-events-none transition-opacity duration-300 ${isPanelVisible ? 'opacity-100' : 'opacity-0'}`}>
        Designed for Apple Silicon & Android
      </div>
    </div>
  );
};

export default UIControls;