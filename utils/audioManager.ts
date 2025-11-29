export class AudioManager {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private source: MediaElementAudioSourceNode | null = null;
  private audio: HTMLAudioElement;
  private dataArray: Uint8Array;

  constructor() {
    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 1024; // Balance between resolution and performance
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    
    this.audio = new Audio();
    this.audio.loop = true;
    this.audio.crossOrigin = "anonymous";
  }

  loadAudio(url: string) {
    if (this.source) {
      this.source.disconnect();
    }
    this.audio.src = url;
    // Create source only once per element usually, but here we manage safe recreation
    try {
        this.source = this.audioContext.createMediaElementSource(this.audio);
        this.source.connect(this.analyser);
        this.analyser.connect(this.audioContext.destination);
    } catch (e) {
        // Source already connected or similar issue, usually safe to ignore if re-using element
    }
  }

  play() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    this.audio.play();
  }

  pause() {
    this.audio.pause();
  }

  getFrequencyData(): Uint8Array {
    this.analyser.getByteFrequencyData(this.dataArray);
    return this.dataArray;
  }

  // Helper to get average volume of a specific frequency range
  getAverageFrequency(lowerIndex: number, upperIndex: number): number {
    let sum = 0;
    for (let i = lowerIndex; i < upperIndex; i++) {
      sum += this.dataArray[i];
    }
    return sum / (upperIndex - lowerIndex);
  }

  // Get categorized data
  getSpectralData() {
    // FFT Size 1024 -> binCount 512. 
    // Approx: 0-20kHz. 
    // Low: 0-50 (~0-2kHz)
    // Mid: 50-200 (~2kHz-8kHz)
    // High: 200-512 (~8kHz+)
    
    return {
      low: this.getAverageFrequency(0, 40),
      mid: this.getAverageFrequency(40, 150),
      high: this.getAverageFrequency(150, 400)
    };
  }
}

export const audioManager = new AudioManager();