/**
 * WitWand Audio Manager
 *
 * Synthesizes all music and sound effects using the Web Audio API.
 * No external audio files required — everything is generated procedurally.
 */

export type SFXType =
  | 'buttonClick'
  | 'attack'
  | 'spell'
  | 'heal'
  | 'shield'
  | 'damage'
  | 'codeCorrect'
  | 'codeIncorrect'
  | 'codeSubmit'
  | 'timerWarning'
  | 'turnStart'
  | 'characterSelect'
  | 'characterConfirm'
  | 'phaseTransition'
  | 'victory';

export type MusicTrack = 'title' | 'battle' | 'victory';

class AudioManager {
  // ---- Core audio graph ----
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;

  // ---- State ----
  private currentMusic: { stop: () => void; track: MusicTrack } | null = null;
  private desiredTrack: MusicTrack | null = null;
  private _muted = false;
  private _initialized = false;

  // =====================================================================
  //  INITIALIZATION
  // =====================================================================

  /** Call on the first user interaction (click/keydown) to unlock audio. */
  init() {
    if (this._initialized) return;
    this._initialized = true;
    const ctx = this.ensureCtx();

    const startPending = () => {
      if (this.desiredTrack && !this.currentMusic && !this._muted) {
        this.startTrack(this.desiredTrack);
      }
    };

    if (ctx.state === 'suspended') {
      ctx.resume().then(startPending);
    } else {
      startPending();
    }
  }

  private ensureCtx(): AudioContext {
    if (!this.ctx) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.masterGain = this.ctx.createGain();
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.value = 0.25;
      this.musicGain.connect(this.masterGain);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.value = 0.5;
      this.sfxGain.connect(this.masterGain);
    }
    return this.ctx;
  }

  // =====================================================================
  //  PRIMITIVE VOICES
  // =====================================================================

  /** Bell / celesta: sine + harmonics with quick decay */
  private bell(freq: number, time: number, dur: number, vol: number, dest: AudioNode) {
    const ctx = this.ensureCtx();
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(vol, time + 0.005);
    g.gain.exponentialRampToValueAtTime(Math.max(vol * 0.15, 0.0001), time + dur * 0.4);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    g.connect(dest);

    // Fundamental
    const o1 = ctx.createOscillator();
    o1.type = 'sine';
    o1.frequency.value = freq;
    o1.connect(g);
    o1.start(time);
    o1.stop(time + dur + 0.05);

    // 2nd partial (octave) for brightness
    const g2 = ctx.createGain();
    g2.gain.value = 0.25;
    g2.connect(g);
    const o2 = ctx.createOscillator();
    o2.type = 'sine';
    o2.frequency.value = freq * 2;
    o2.connect(g2);
    o2.start(time);
    o2.stop(time + dur + 0.05);

    // 3rd partial for bell shimmer
    const g3 = ctx.createGain();
    g3.gain.value = 0.08;
    g3.connect(g);
    const o3 = ctx.createOscillator();
    o3.type = 'sine';
    o3.frequency.value = freq * 3;
    o3.connect(g3);
    o3.start(time);
    o3.stop(time + Math.max(dur * 0.5, 0.05));
  }

  /** Pad: sustained filtered triangle wave */
  private pad(freq: number, time: number, dur: number, vol: number, dest: AudioNode) {
    const ctx = this.ensureCtx();
    const o = ctx.createOscillator();
    o.type = 'triangle';
    o.frequency.value = freq;
    const f = ctx.createBiquadFilter();
    f.type = 'lowpass';
    f.frequency.value = freq * 2;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(vol, time + dur * 0.15);
    g.gain.setValueAtTime(vol, time + dur * 0.7);
    g.gain.linearRampToValueAtTime(0, time + dur);
    o.connect(f);
    f.connect(g);
    g.connect(dest);
    o.start(time);
    o.stop(time + dur + 0.05);
  }

  /** Noise burst (percussion, whoosh) */
  private noise(time: number, dur: number, vol: number, hpFreq: number, dest: AudioNode) {
    const ctx = this.ensureCtx();
    const N = Math.floor(ctx.sampleRate * dur);
    const buf = ctx.createBuffer(1, N, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < N; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (N * 0.3));
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const f = ctx.createBiquadFilter();
    f.type = 'highpass';
    f.frequency.value = hpFreq;
    const g = ctx.createGain();
    g.gain.value = vol;
    src.connect(f);
    f.connect(g);
    g.connect(dest);
    src.start(time);
  }

  /** Frequency sweep with auto-decay envelope */
  private sweep(
    from: number, to: number, time: number, dur: number,
    vol: number, wave: OscillatorType, dest: AudioNode,
  ) {
    const ctx = this.ensureCtx();
    const o = ctx.createOscillator();
    o.type = wave;
    o.frequency.setValueAtTime(from, time);
    o.frequency.exponentialRampToValueAtTime(Math.max(to, 1), time + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, time);
    g.gain.linearRampToValueAtTime(vol, time + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, time + dur);
    o.connect(g);
    g.connect(dest);
    o.start(time);
    o.stop(time + dur + 0.05);
  }

  // =====================================================================
  //  MUSIC
  // =====================================================================

  playMusic(track: MusicTrack) {
    this.desiredTrack = track;
    if (this._muted || !this._initialized) return;
    if (this.currentMusic?.track === track) return;
    this.stopMusic();
    this.startTrack(track);
  }

  stopMusic() {
    if (this.currentMusic) {
      this.currentMusic.stop();
      this.currentMusic = null;
    }
  }

  private startTrack(track: MusicTrack) {
    switch (track) {
      case 'title':
        this.loopTitle();
        break;
      case 'battle':
        this.loopBattle();
        break;
      case 'victory':
        this.loopVictory();
        break;
    }
  }

  // ----- Title: Dreamy celesta arpeggios in E minor -----
  private loopTitle() {
    const notes = [
      329.63, 392.00, 493.88, 659.25,  // E4 G4 B4 E5  - ascending
      587.33, 493.88, 440.00, 392.00,   // D5 B4 A4 G4  - stepping down
      329.63, 440.00, 493.88, 587.33,   // E4 A4 B4 D5  - up again
      659.25, 587.33, 493.88, 392.00,   // E5 D5 B4 G4  - resolve down
    ];
    const bpm = 70;
    const beatDur = 60 / bpm;
    const loopDur = notes.length * beatDur;

    let stopped = false;
    let timer: number;
    const dest = this.musicGain!;

    const loop = () => {
      if (stopped) return;
      const ctx = this.ensureCtx();
      const t0 = ctx.currentTime + 0.05;

      notes.forEach((freq, i) => {
        this.bell(freq, t0 + i * beatDur, beatDur * 2, 0.1, dest);
      });
      // Pad chord underneath: Em (E3 + B3)
      this.pad(164.81, t0, loopDur, 0.04, dest);
      this.pad(246.94, t0, loopDur, 0.03, dest);

      timer = window.setTimeout(loop, (loopDur - 0.5) * 1000);
    };
    loop();

    this.currentMusic = { track: 'title', stop: () => { stopped = true; clearTimeout(timer); } };
  }

  // ----- Battle: Driving E minor arpeggios with bass pulse -----
  private loopBattle() {
    const melody = [329.63, 493.88, 392.00, 329.63, 246.94, 329.63, 392.00, 493.88];
    const bass = [164.81, 196.00, 220.00, 196.00];
    const bpm = 125;
    const eighth = 60 / bpm / 2;
    const loopDur = melody.length * eighth;

    let stopped = false;
    let timer: number;
    const dest = this.musicGain!;

    const loop = () => {
      if (stopped) return;
      const ctx = this.ensureCtx();
      const t0 = ctx.currentTime + 0.05;

      melody.forEach((freq, i) => {
        this.bell(freq, t0 + i * eighth, eighth * 1.5, 0.07, dest);
      });
      bass.forEach((freq, i) => {
        this.pad(freq, t0 + i * (loopDur / 4), loopDur / 4, 0.06, dest);
      });
      // Kick pulse on beats
      for (let i = 0; i < 4; i++) {
        this.sweep(120, 40, t0 + i * (loopDur / 4), 0.08, 0.06, 'sine', dest);
      }

      timer = window.setTimeout(loop, (loopDur - 0.2) * 1000);
    };
    loop();

    this.currentMusic = { track: 'battle', stop: () => { stopped = true; clearTimeout(timer); } };
  }

  // ----- Victory: Triumphant D major fanfare -----
  private loopVictory() {
    const fanfare = [293.66, 369.99, 440.00, 587.33, 440.00, 587.33, 739.99, 880.00];
    const bpm = 100;
    const noteDur = 60 / bpm * 0.75;
    const loopDur = fanfare.length * noteDur;

    let stopped = false;
    let timer: number;
    const dest = this.musicGain!;

    const loop = () => {
      if (stopped) return;
      const ctx = this.ensureCtx();
      const t0 = ctx.currentTime + 0.05;

      fanfare.forEach((freq, i) => {
        this.bell(freq, t0 + i * noteDur, noteDur * 1.5, 0.13, dest);
      });
      // D major pad
      this.pad(293.66, t0, loopDur, 0.05, dest);
      this.pad(369.99, t0, loopDur, 0.04, dest);
      this.pad(440.00, t0, loopDur, 0.04, dest);

      timer = window.setTimeout(loop, (loopDur - 0.3) * 1000);
    };
    loop();

    this.currentMusic = { track: 'victory', stop: () => { stopped = true; clearTimeout(timer); } };
  }

  // =====================================================================
  //  SOUND EFFECTS
  // =====================================================================

  playSFX(type: SFXType) {
    if (this._muted) return;
    try {
      const ctx = this.ensureCtx();
      if (ctx.state === 'suspended') return; // Can't play yet
      const t = ctx.currentTime;
      const dest = this.sfxGain!;

      switch (type) {
        case 'buttonClick':
          this.sweep(800, 500, t, 0.06, 0.15, 'sine', dest);
          break;

        case 'attack':
          this.noise(t, 0.15, 0.3, 2000, dest);
          this.sweep(200, 50, t + 0.05, 0.15, 0.25, 'sine', dest);
          break;

        case 'spell':
          [659.25, 783.99, 987.77, 1318.51].forEach((f, i) => {
            this.bell(f, t + i * 0.06, 0.35, 0.12, dest);
          });
          this.noise(t, 0.4, 0.08, 5000, dest);
          break;

        case 'heal':
          [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
            this.bell(f, t + i * 0.1, 0.5, 0.1, dest);
          });
          break;

        case 'shield':
          this.sweep(100, 250, t, 0.4, 0.15, 'triangle', dest);
          this.bell(600, t + 0.05, 0.35, 0.08, dest);
          break;

        case 'damage':
          this.sweep(300, 60, t, 0.15, 0.2, 'square', dest);
          this.noise(t, 0.08, 0.15, 1000, dest);
          break;

        case 'codeCorrect':
          [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
            this.bell(f, t + i * 0.08, 0.4, 0.15, dest);
          });
          break;

        case 'codeIncorrect':
          this.sweep(400, 200, t, 0.25, 0.12, 'sawtooth', dest);
          this.sweep(300, 150, t + 0.12, 0.25, 0.1, 'sawtooth', dest);
          break;

        case 'codeSubmit':
          this.bell(880, t, 0.15, 0.1, dest);
          this.bell(1108.73, t + 0.05, 0.15, 0.08, dest);
          break;

        case 'timerWarning':
          this.bell(880, t, 0.1, 0.18, dest);
          this.bell(880, t + 0.15, 0.1, 0.18, dest);
          break;

        case 'turnStart':
          this.bell(587.33, t, 0.2, 0.12, dest);
          this.bell(783.99, t + 0.1, 0.2, 0.12, dest);
          break;

        case 'characterSelect':
          this.bell(659.25, t, 0.15, 0.1, dest);
          break;

        case 'characterConfirm':
          [523.25, 659.25, 783.99].forEach((f, i) => {
            this.bell(f, t + i * 0.07, 0.3, 0.12, dest);
          });
          break;

        case 'phaseTransition':
          this.sweep(400, 800, t, 0.3, 0.1, 'sine', dest);
          this.bell(880, t + 0.2, 0.4, 0.12, dest);
          break;

        case 'victory':
          [587.33, 739.99, 880, 1174.66].forEach((f, i) => {
            this.bell(f, t + i * 0.12, 0.6, 0.18, dest);
          });
          break;
      }
    } catch {
      // Silently ignore audio errors
    }
  }

  // =====================================================================
  //  CONTROLS
  // =====================================================================

  get muted() {
    return this._muted;
  }

  toggleMute(): boolean {
    this._muted = !this._muted;
    if (this._muted) {
      this.stopMusic();
      if (this.masterGain) this.masterGain.gain.value = 0;
    } else {
      if (this.masterGain) this.masterGain.gain.value = 1;
      // Restart desired music
      if (this.desiredTrack && this._initialized) {
        this.startTrack(this.desiredTrack);
      }
    }
    return this._muted;
  }

  setMusicVolume(v: number) {
    if (this.musicGain) this.musicGain.gain.value = Math.max(0, Math.min(1, v));
  }

  setSFXVolume(v: number) {
    if (this.sfxGain) this.sfxGain.gain.value = Math.max(0, Math.min(1, v));
  }
}

export const audioManager = new AudioManager();
