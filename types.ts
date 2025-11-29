export interface AppState {
  isPlaying: boolean;
  audioContext: AudioContext | null;
  analyser: AnalyserNode | null;
  source: MediaElementAudioSourceNode | null;
  audioElement: HTMLAudioElement | null;
  frequencyData: Uint8Array;
}

export interface VisualSettings {
  particleColor: string;
  vibrationStrength: number;
  brightness: number; // Bloom threshold/intensity
  trailStrength: number; // Afterimage dampening
  particleSize: number;
}

export enum FrequencyBand {
  Low = 'low',
  Mid = 'mid',
  High = 'high'
}
