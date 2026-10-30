/**
 * Web Audio API synthesizer for emergency sirens and CPR metronome.
 * Zero external audio file dependencies; completely functional offline.
 */

class SoundSynthesizer {
  private ctx: AudioContext | null = null;
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private sirenInterval: any = null;
  private metronomeTimer: any = null;
  private isSirenRunning = false;
  private isMetronomeRunning = false;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public startSiren(type: 'police' | 'ambulance' | 'sos' = 'ambulance', volume = 0.8) {
    this.stopSiren();
    const ctx = this.getContext();

    this.osc = ctx.createOscillator();
    this.gain = ctx.createGain();

    this.osc.type = 'sawtooth';
    this.gain.gain.setValueAtTime(volume * 0.4, ctx.currentTime);

    this.osc.connect(this.gain);
    this.gain.connect(ctx.destination);
    this.osc.start();
    this.isSirenRunning = true;

    if (type === 'police') {
      // Rapid wailing siren 600Hz to 1200Hz
      let freq = 650;
      let rising = true;
      this.sirenInterval = setInterval(() => {
        if (!this.osc || !this.ctx) return;
        if (rising) {
          freq += 35;
          if (freq >= 1200) rising = false;
        } else {
          freq -= 35;
          if (freq <= 650) rising = true;
        }
        this.osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      }, 40);
    } else if (type === 'ambulance') {
      // Classic Hi-Lo alternating siren (960Hz / 770Hz)
      let hi = true;
      this.osc.frequency.setValueAtTime(960, ctx.currentTime);
      this.sirenInterval = setInterval(() => {
        if (!this.osc || !this.ctx) return;
        hi = !hi;
        this.osc.frequency.setValueAtTime(hi ? 960 : 770, this.ctx.currentTime);
      }, 550);
    } else if (type === 'sos') {
      // SOS Beeps: 3 short, 3 long, 3 short
      this.stopSiren();
      this.playSosSequence(volume);
    }
  }

  private playSosSequence(volume: number) {
    const ctx = this.getContext();
    this.isSirenRunning = true;

    const playBeep = (durationSec: number): Promise<void> => {
      return new Promise((resolve) => {
        if (!this.isSirenRunning) return resolve();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(volume * 0.5, ctx.currentTime);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
          } catch {}
          resolve();
        }, durationSec * 1000);
      });
    };

    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

    const loop = async () => {
      while (this.isSirenRunning) {
        // 3 short
        for (let i = 0; i < 3; i++) {
          if (!this.isSirenRunning) return;
          await playBeep(0.15);
          await sleep(150);
        }
        await sleep(300);
        // 3 long
        for (let i = 0; i < 3; i++) {
          if (!this.isSirenRunning) return;
          await playBeep(0.45);
          await sleep(200);
        }
        await sleep(300);
        // 3 short
        for (let i = 0; i < 3; i++) {
          if (!this.isSirenRunning) return;
          await playBeep(0.15);
          await sleep(150);
        }
        await sleep(1000); // pause before repeat
      }
    };

    loop();
  }

  public setVolume(volume: number) {
    if (this.gain && this.ctx) {
      this.gain.gain.setValueAtTime(Math.max(0, Math.min(1, volume * 0.5)), this.ctx.currentTime);
    }
  }

  public stopSiren() {
    this.isSirenRunning = false;
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
    if (this.osc) {
      try {
        this.osc.stop();
        this.osc.disconnect();
      } catch {}
      this.osc = null;
    }
    if (this.gain) {
      try {
        this.gain.disconnect();
      } catch {}
      this.gain = null;
    }
  }

  public isSirenActive(): boolean {
    return this.isSirenRunning;
  }

  // CPR Metronome
  public startMetronome(bpm = 110, onTick?: () => void) {
    this.stopMetronome();
    this.isMetronomeRunning = true;
    const intervalMs = (60 / bpm) * 1000;

    const tick = () => {
      if (!this.isMetronomeRunning) return;
      const ctx = this.getContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High pitch click
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.09);

      if (onTick) onTick();
    };

    tick();
    this.metronomeTimer = setInterval(tick, intervalMs);
  }

  public stopMetronome() {
    this.isMetronomeRunning = false;
    if (this.metronomeTimer) {
      clearInterval(this.metronomeTimer);
      this.metronomeTimer = null;
    }
  }

  public isMetronomeActive(): boolean {
    return this.isMetronomeRunning;
  }
}

export const soundManager = new SoundSynthesizer();
