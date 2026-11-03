export type ShakeSensitivity = 'low' | 'medium' | 'high';

export interface ShakeSettings {
  enabled: boolean;
  sensitivity: ShakeSensitivity;
  cooldownMs: number;
}

export const SENSITIVITY_THRESHOLDS: Record<ShakeSensitivity, number> = {
  low: 26,     // Firm, deliberate shake required
  medium: 18,  // Standard deliberate shake
  high: 12,    // Lighter shake
};

const STORAGE_KEY = 'india_emergency_shake_settings_v1';

export const DEFAULT_SHAKE_SETTINGS: ShakeSettings = {
  enabled: true,
  sensitivity: 'medium',
  cooldownMs: 10000,
};

export function getShakeSettings(): ShakeSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_SHAKE_SETTINGS;
    return { ...DEFAULT_SHAKE_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SHAKE_SETTINGS;
  }
}

export function saveShakeSettings(settings: ShakeSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('emergency-shake-settings-changed', { detail: settings }));
    }
  } catch (err) {
    console.error('Failed to save shake settings', err);
  }
}

/**
 * Checks if the browser requires explicit user permission for DeviceMotionEvent (e.g. iOS Safari 13+).
 */
export function isMotionPermissionRequired(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof (DeviceMotionEvent as any) !== 'undefined' &&
    typeof (DeviceMotionEvent as any).requestPermission === 'function'
  );
}

/**
 * Request device motion permission on supported platforms.
 */
export async function requestMotionPermission(): Promise<'granted' | 'denied' | 'unsupported'> {
  if (!isMotionPermissionRequired()) {
    if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
      return 'granted';
    }
    return 'unsupported';
  }

  try {
    const response = await (DeviceMotionEvent as any).requestPermission();
    return response === 'granted' ? 'granted' : 'denied';
  } catch (err) {
    console.error('Error requesting DeviceMotion permission:', err);
    return 'denied';
  }
}

export interface LiveMotionData {
  x: number;
  y: number;
  z: number;
  magnitude: number;
  threshold: number;
}

export class ShakeDetector {
  private lastX: number = 0;
  private lastY: number = 0;
  private lastZ: number = 0;
  private lastTime: number = 0;
  private peakCount: number = 0;
  private lastPeakTime: number = 0;
  private lastTriggerTime: number = 0;
  private isListening: boolean = false;
  private onShakeCallback: (() => void) | null = null;
  private onMotionUpdate: ((data: LiveMotionData) => void) | null = null;

  constructor(
    private settings: ShakeSettings = getShakeSettings()
  ) {}

  public updateSettings(settings: ShakeSettings) {
    this.settings = settings;
  }

  public getSettings(): ShakeSettings {
    return this.settings;
  }

  public start(
    onShake: () => void,
    onMotion?: (data: LiveMotionData) => void
  ): boolean {
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) {
      return false;
    }

    this.onShakeCallback = onShake;
    this.onMotionUpdate = onMotion || null;

    if (!this.isListening) {
      window.addEventListener('devicemotion', this.handleMotion, false);
      this.isListening = true;
    }
    return true;
  }

  public stop() {
    if (typeof window !== 'undefined' && this.isListening) {
      window.removeEventListener('devicemotion', this.handleMotion, false);
      this.isListening = false;
    }
    this.onShakeCallback = null;
    this.onMotionUpdate = null;
  }

  private handleMotion = (event: DeviceMotionEvent) => {
    if (!this.settings.enabled) return;

    // Use linear acceleration if available; fallback to accelerationIncludingGravity
    // Important on Android: event.acceleration may be an object {x: null, y: null, z: null}
    // if linear acceleration sensor fusion is unavailable on the hardware.
    let acc = event.acceleration;
    if (!acc || acc.x === null || acc.y === null || acc.z === null) {
      acc = event.accelerationIncludingGravity;
    }
    if (!acc || acc.x === null || acc.y === null || acc.z === null) return;

    const currentTime = Date.now();
    if (this.lastTime === 0) {
      this.lastX = acc.x || 0;
      this.lastY = acc.y || 0;
      this.lastZ = acc.z || 0;
      this.lastTime = currentTime;
      return;
    }

    const timeDiff = currentTime - this.lastTime;
    if (timeDiff < 50) return; // Sample at ~20Hz

    const x = acc.x || 0;
    const y = acc.y || 0;
    const z = acc.z || 0;

    // Calculate motion delta magnitude
    const deltaX = Math.abs(x - this.lastX);
    const deltaY = Math.abs(y - this.lastY);
    const deltaZ = Math.abs(z - this.lastZ);
    const magnitude = (deltaX + deltaY + deltaZ) / (timeDiff / 100);

    const threshold = SENSITIVITY_THRESHOLDS[this.settings.sensitivity];

    if (this.onMotionUpdate) {
      this.onMotionUpdate({
        x,
        y,
        z,
        magnitude: Math.min(magnitude, 50),
        threshold,
      });
    }

    this.lastX = x;
    this.lastY = y;
    this.lastZ = z;
    this.lastTime = currentTime;

    // Ignore if within cooldown period
    if (currentTime - this.lastTriggerTime < this.settings.cooldownMs) {
      return;
    }

    // Check if delta exceeds sensitivity threshold
    if (magnitude > threshold) {
      // Deliberate shake detection: require at least 2 distinct direction reversal peaks within 800ms
      // This prevents a single bump, drop, or car jerk from triggering SOS
      if (currentTime - this.lastPeakTime < 800) {
        this.peakCount++;
      } else {
        this.peakCount = 1;
      }
      this.lastPeakTime = currentTime;

      if (this.peakCount >= 2) {
        this.peakCount = 0;
        this.lastTriggerTime = currentTime;

        // Vibrate if supported
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([200, 100, 200]);
          } catch {}
        }

        if (this.onShakeCallback) {
          this.onShakeCallback();
        }
      }
    } else {
      // Reset peaks if no motion within 900ms
      if (currentTime - this.lastPeakTime > 900) {
        this.peakCount = 0;
      }
    }
  };
}

/**
 * Play emergency countdown beep using Web Audio API oscillator
 */
export function playCountdownBeep(isFinal: boolean = false): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = isFinal ? 'sawtooth' : 'sine';
    osc.frequency.setValueAtTime(isFinal ? 880 : 540, ctx.currentTime);

    gain.gain.setValueAtTime(0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (isFinal ? 0.4 : 0.15));

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    const duration = isFinal ? 0.45 : 0.2;
    osc.stop(ctx.currentTime + duration);

    // Safely close context after sound finishes to prevent browser audio resource exhaustion
    setTimeout(() => {
      try {
        ctx.close().catch(() => {});
      } catch {}
    }, (duration + 0.1) * 1000);
  } catch {}
}
