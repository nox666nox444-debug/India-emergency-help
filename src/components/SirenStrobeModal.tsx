import React, { useState, useEffect } from 'react';
import { X, Volume2, VolumeX, AlertTriangle, Eye, ShieldAlert, Sparkles } from 'lucide-react';
import { soundManager } from '../utils/sirenAudio';

interface SirenStrobeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SirenStrobeModal: React.FC<SirenStrobeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isPlayingSound, setIsPlayingSound] = useState<boolean>(false);
  const [sirenMode, setSirenMode] = useState<'police' | 'ambulance' | 'sos'>('ambulance');
  const [volume, setVolume] = useState<number>(0.8);
  const [isStrobeActive, setIsStrobeActive] = useState<boolean>(false);
  const [strobeColorMode, setStrobeColorMode] = useState<'police_red_blue' | 'bright_white' | 'sos_flash'>('police_red_blue');
  const [strobeFlashState, setStrobeFlashState] = useState<boolean>(false);

  // Stop siren when closing modal
  useEffect(() => {
    if (!isOpen) {
      soundManager.stopSiren();
      setIsPlayingSound(false);
      setIsStrobeActive(false);
    }
  }, [isOpen]);

  // Audio siren playback loop
  const toggleSiren = () => {
    if (isPlayingSound) {
      soundManager.stopSiren();
      setIsPlayingSound(false);
    } else {
      soundManager.startSiren(sirenMode, volume);
      setIsPlayingSound(true);
    }
  };

  const handleModeChange = (mode: 'police' | 'ambulance' | 'sos') => {
    setSirenMode(mode);
    if (isPlayingSound) {
      soundManager.startSiren(mode, volume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    soundManager.setVolume(newVol);
  };

  // Strobe effect timer
  useEffect(() => {
    let interval: any = null;
    if (isStrobeActive) {
      const speed = strobeColorMode === 'sos_flash' ? 250 : 120;
      interval = setInterval(() => {
        setStrobeFlashState((prev) => !prev);
      }, speed);
    } else {
      setStrobeFlashState(false);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isStrobeActive, strobeColorMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      {/* Fullscreen Strobe Overlay if active */}
      {isStrobeActive && (
        <div
          className={`fixed inset-0 z-40 transition-colors pointer-events-none ${
            strobeColorMode === 'police_red_blue'
              ? strobeFlashState
                ? 'bg-red-600/90'
                : 'bg-blue-600/90'
              : strobeFlashState
              ? 'bg-white'
              : 'bg-black'
          }`}
        />
      )}

      <div className="relative z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-amber-500 text-slate-950 font-bold">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 fill-current" />
            <h2 className="text-base sm:text-lg tracking-tight">
              Emergency Siren & Strobe Alarm
            </h2>
          </div>
          <button
            onClick={() => {
              soundManager.stopSiren();
              setIsPlayingSound(false);
              setIsStrobeActive(false);
              onClose();
            }}
            className="p-1 rounded-lg hover:bg-amber-600/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Audio Siren Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Loud Audible Alarm
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Web Audio (Zero Download)
              </span>
            </div>

            {/* Siren Type Selection */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'ambulance', label: 'Ambulance (Hi-Lo)' },
                { id: 'police', label: 'Police (Wail)' },
                { id: 'sos', label: 'S-O-S Morse Tone' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleModeChange(m.id as any)}
                  className={`p-2.5 text-xs font-semibold rounded-xl border text-center transition-all ${
                    sirenMode === m.id
                      ? 'bg-amber-500/10 border-amber-500 text-amber-700 dark:text-amber-400'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* Siren Play Button */}
            <button
              onClick={toggleSiren}
              className={`w-full py-4 rounded-xl font-bold text-base flex items-center justify-center gap-2.5 shadow-lg transition-all active:scale-95 ${
                isPlayingSound
                  ? 'bg-red-600 text-white animate-pulse'
                  : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
              }`}
            >
              {isPlayingSound ? (
                <>
                  <VolumeX className="w-5 h-5" />
                  <span>STOP AUDIBLE SIREN</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-5 h-5" />
                  <span>START EMERGENCY SIREN NOW</span>
                </>
              )}
            </button>

            {/* Volume Slider */}
            <div className="flex items-center gap-3 pt-1">
              <Volume2 className="w-4 h-4 text-slate-400" />
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-xs font-mono text-slate-500 tabular-nums">
                {Math.round(volume * 100)}%
              </span>
            </div>
          </div>

          {/* Visual Strobe Light Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Visual Screen Strobe (Rescue Light)
              </span>
              <span className="text-xs text-red-500 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                <span>Epilepsy Notice</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'police_red_blue', label: 'Red / Blue Police Flash' },
                { id: 'bright_white', label: 'High-Lumen White Beacon' },
                { id: 'sos_flash', label: 'S-O-S Morse Flash' },
              ].map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStrobeColorMode(st.id as any)}
                  className={`p-2 text-xs font-medium rounded-lg border text-center transition-all ${
                    strobeColorMode === st.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsStrobeActive(!isStrobeActive)}
              className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 border transition-all ${
                isStrobeActive
                  ? 'bg-red-600 text-white border-red-500 shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-900 dark:text-white border-slate-200 dark:border-slate-700'
              }`}
            >
              <Eye className="w-4 h-4" />
              <span>
                {isStrobeActive ? 'TURN OFF SCREEN STROBE' : 'START SCREEN STROBE FLASH'}
              </span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            Keep screen pointed at rescuers or highway traffic.
          </p>
          <button
            onClick={() => {
              soundManager.stopSiren();
              setIsPlayingSound(false);
              setIsStrobeActive(false);
              onClose();
            }}
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
