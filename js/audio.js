/**
 * Ambient Sound Synthesizer & Audio Mixer
 * Web Audio API를 활용한 무중단 화이트노이즈/사운드 합성 엔진
 */

class AmbientAudioEngine {
  constructor() {
    this.ctx = null;
    this.sounds = {
      water: { active: false, volume: 0.5, node: null, gain: null },
      rain: { active: false, volume: 0.5, node: null, gain: null },
      cafe: { active: false, volume: 0.5, node: null, gain: null },
      library: { active: false, volume: 0.5, node: null, gain: null }
    };
    this.masterGain = null;
    this.isMuted = false;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    
    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  // 모바일 브라우저 오디오 언락
  unlock() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound(soundKey) {
    this.unlock();
    const sound = this.sounds[soundKey];
    if (!sound) return false;

    if (sound.active) {
      this.stopSound(soundKey);
      return false;
    } else {
      this.startSound(soundKey);
      return true;
    }
  }

  startSound(soundKey) {
    if (!this.ctx) this.init();
    const sound = this.sounds[soundKey];
    if (sound.node) return;

    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(sound.volume, this.ctx.currentTime);
    gainNode.connect(this.masterGain);
    sound.gain = gainNode;

    // Web Audio 노이즈 생성기 연결
    let sourceNode = null;
    if (soundKey === 'rain') {
      sourceNode = this.createRainSynthesizer(gainNode);
    } else if (soundKey === 'water') {
      sourceNode = this.createWaterSynthesizer(gainNode);
    } else if (soundKey === 'library') {
      sourceNode = this.createLibrarySynthesizer(gainNode);
    } else if (soundKey === 'cafe') {
      sourceNode = this.createCafeSynthesizer(gainNode);
    }

    sound.node = sourceNode;
    sound.active = true;
  }

  stopSound(soundKey) {
    const sound = this.sounds[soundKey];
    if (!sound || !sound.active) return;

    if (sound.gain && this.ctx) {
      // 부드러운 페이드아웃
      sound.gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3);
      setTimeout(() => {
        if (sound.node && sound.node.stop) {
          try { sound.node.stop(); } catch (e) {}
        }
        sound.node = null;
        sound.gain = null;
        sound.active = false;
      }, 350);
    } else {
      sound.node = null;
      sound.gain = null;
      sound.active = false;
    }
  }

  setVolume(soundKey, volume) {
    const sound = this.sounds[soundKey];
    if (!sound) return;
    sound.volume = Math.max(0, Math.min(1, volume));
    if (sound.gain && this.ctx) {
      sound.gain.gain.setValueAtTime(sound.volume, this.ctx.currentTime);
    }
  }

  // 빗소리 시뮬레이터 (핑크 노이즈 + 로우패스 필터)
  createRainSynthesizer(dest) {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04;
      b6 = white * 0.115926;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(900, this.ctx.currentTime);

    whiteNoise.connect(filter);
    filter.connect(dest);
    whiteNoise.start(0);
    return whiteNoise;
  }

  // 자하연 물소리 시뮬레이터 (브라운 노이즈 + LFO 모듈레이션)
  createWaterSynthesizer(dest) {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.02 * white)) / 1.02;
      lastOut = output[i];
      output[i] *= 1.8;
    }

    const brownNoise = this.ctx.createBufferSource();
    brownNoise.buffer = noiseBuffer;
    brownNoise.loop = true;

    const bandpass = this.ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.setValueAtTime(450, this.ctx.currentTime);
    bandpass.Q.setValueAtTime(1.5, this.ctx.currentTime);

    // 물결 출렁임 효과 (LFO)
    const lfo = this.ctx.createOscillator();
    const lfoGain = this.ctx.createGain();
    lfo.frequency.setValueAtTime(0.25, this.ctx.currentTime);
    lfoGain.gain.setValueAtTime(180, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(bandpass.frequency);
    lfo.start();

    brownNoise.connect(bandpass);
    bandpass.connect(dest);
    brownNoise.start(0);
    return brownNoise;
  }

  // 도서관 딥 화이트노이즈 (깊은 로우패스 럼블)
  createLibrarySynthesizer(dest) {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = (lastOut + (0.015 * white)) / 1.015;
      lastOut = output[i];
      output[i] *= 1.2;
    }

    const libraryNoise = this.ctx.createBufferSource();
    libraryNoise.buffer = noiseBuffer;
    libraryNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, this.ctx.currentTime);

    libraryNoise.connect(filter);
    filter.connect(dest);
    libraryNoise.start(0);
    return libraryNoise;
  }

  // 카페 백색소음 (따뜻한 중음역대 핑크 노이즈)
  createCafeSynthesizer(dest) {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.05;
    }

    const cafeNoise = this.ctx.createBufferSource();
    cafeNoise.buffer = noiseBuffer;
    cafeNoise.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(750, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.8, this.ctx.currentTime);

    cafeNoise.connect(filter);
    filter.connect(dest);
    cafeNoise.start(0);
    return cafeNoise;
  }

  // 완료 알림 차임벨 사운드
  playChime() {
    this.unlock();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (맑은 아르페지오)

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.12);

      gain.gain.setValueAtTime(0, now + idx * 0.12);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.12 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.2);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now + idx * 0.12);
      osc.stop(now + idx * 0.12 + 1.3);
    });
  }
}

window.ambientAudio = new AmbientAudioEngine();

