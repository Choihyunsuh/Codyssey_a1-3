/**
 * study with SNU - Spot Dedicated Ambient Sound Synthesizer
 * 장소 선택 시 전용 사운드 자동 송출 (Web Audio API)
 */

class SpotAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.currentSoundType = null;
    this.activeNodes = [];
    this.isMuted = false;
    this.volume = 0.6;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }

  unlock() {
    this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // 장소에 맞는 사운드 자동 전환 재생
  playSpotSound(soundType) {
    this.unlock();
    if (!this.ctx) return;
    if (this.currentSoundType === soundType && this.activeNodes.length > 0) return;

    // 1. 기존 사운드 중지
    this.stopCurrentSound();
    this.currentSoundType = soundType;

    // 2. 새 사운드 생성
    const gainNode = this.ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(1.0, this.ctx.currentTime + 0.5);
    gainNode.connect(this.masterGain);

    if (soundType === 'water_rain') {
      // 자하연: 물소리 + 빗소리 레이어드
      const waterNode = this.createWaterSynth(gainNode, 0.6);
      const rainNode = this.createRainSynth(gainNode, 0.4);
      this.activeNodes = [waterNode, rainNode];
    } else if (soundType === 'nature_wind') {
      // 잔디광장: 바람소리 & 자연 야외 노이즈
      const windNode = this.createWindSynth(gainNode, 0.7);
      this.activeNodes = [windNode];
    } else if (soundType === 'library') {
      // 관정도서관: 도서관 화이트노이즈
      const libNode = this.createLibrarySynth(gainNode, 0.7);
      this.activeNodes = [libNode];
    } else if (soundType === 'cafe') {
      // 사회대 16동: 카페 소음
      const cafeNode = this.createCafeSynth(gainNode, 0.7);
      this.activeNodes = [cafeNode];
    }
  }

  stopCurrentSound() {
    if (this.activeNodes.length > 0) {
      this.activeNodes.forEach(node => {
        try { node.stop(); } catch(e) {}
      });
      this.activeNodes = [];
    }
  }

  setVolume(vol) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx && !this.isMuted) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.unlock();
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // 1. 빗소리
  createRainSynth(dest, vol = 0.5) {
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
      output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.04 * vol;
      b6 = white * 0.115926;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(dest);
    source.start(0);
    return source;
  }

  // 2. 물소리
  createWaterSynth(dest, vol = 0.5) {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let lastOut = 0.0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = ((lastOut + (0.02 * white)) / 1.02) * vol;
      lastOut = output[i];
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(420, this.ctx.currentTime);
    filter.Q.setValueAtTime(1.8, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(dest);
    source.start(0);
    return source;
  }

  // 3. 바람소리 (잔디광장)
  createWindSynth(dest, vol = 0.5) {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let last = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = ((last + (0.01 * white)) / 1.01) * vol * 1.5;
      last = output[i];
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(260, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(dest);
    source.start(0);
    return source;
  }

  // 4. 도서관
  createLibrarySynth(dest, vol = 0.5) {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let last = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      output[i] = ((last + (0.015 * white)) / 1.015) * vol;
      last = output[i];
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(300, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(dest);
    source.start(0);
    return source;
  }

  // 5. 카페
  createCafeSynth(dest, vol = 0.5) {
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      output[i] = (Math.random() * 2 - 1) * 0.04 * vol;
    }

    const source = this.ctx.createBufferSource();
    source.buffer = noiseBuffer;
    source.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(700, this.ctx.currentTime);
    filter.Q.setValueAtTime(0.7, this.ctx.currentTime);

    source.connect(filter);
    filter.connect(dest);
    source.start(0);
    return source;
  }

  // 완료 차임벨
  playChime() {
    this.unlock();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    [523.25, 659.25, 783.99, 1046.50].forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.1);
      gain.gain.setValueAtTime(0, now + idx * 0.1);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.1 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 1.0);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now + idx * 0.1);
      osc.stop(now + idx * 0.1 + 1.1);
    });
  }
}

window.spotAudio = new SpotAudioEngine();
