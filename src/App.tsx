import React, { useState, useEffect } from 'react';
import { TopNav } from './components/TopNav';
import { EmergencySpeedDial } from './components/EmergencySpeedDial';
import { FirstAidGuide } from './components/FirstAidGuide';
import { StateDirectory } from './components/StateDirectory';
import { NearbyFinder } from './components/NearbyFinder';
import { SosBeaconModal } from './components/SosBeaconModal';
import { SirenStrobeModal } from './components/SirenStrobeModal';
import { AiTriageModal } from './components/AiTriageModal';
import { VoiceEmergencyModal } from './components/VoiceEmergencyModal';
import { DocumentLockerModal } from './components/DocumentLockerModal';
import { PrivacySettingsModal } from './components/PrivacySettingsModal';
import { EarthquakeModal } from './components/EarthquakeModal';
import { SupportedLang, TRANSLATIONS } from './data/translations';
import { Phone, AlertTriangle, Siren, Sparkles, BookOpen, ShieldCheck, Mic, Lock, Shield, Activity } from 'lucide-react';

export default function App() {
  const [currentLang, setCurrentLang] = useState<SupportedLang>('en');
  const [activeSection, setActiveSection] = useState<string>('helplines');
  const [isSosOpen, setIsSosOpen] = useState<boolean>(false);
  const [isSirenOpen, setIsSirenOpen] = useState<boolean>(false);
  const [isAiTriageOpen, setIsAiTriageOpen] = useState<boolean>(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [isLockerOpen, setIsLockerOpen] = useState<boolean>(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState<boolean>(false);
  const [isEarthquakeOpen, setIsEarthquakeOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [trackSessionId, setTrackSessionId] = useState<string | null>(null);
  const [trackData, setTrackData] = useState<any | null>(null);

  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);

  // Check for online/offline events
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Check for ?track= query parameter
    const params = new URLSearchParams(window.location.search);
    const trackId = params.get('track');
    if (trackId) {
      setTrackSessionId(trackId);
      fetch(`/api/emergency-session/${trackId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.active) {
            setTrackData(data);
          }
        })
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Initialize theme from system or preference
  useEffect(() => {
    const isDark =
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleToggleDarkMode = () => {
    setDarkMode((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  const handleNavigate = (section: string) => {
    setActiveSection(section);
    if (section === 'ai-triage') {
      setIsAiTriageOpen(true);
      return;
    }
    const el = document.getElementById(section);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const t = TRANSLATIONS[currentLang];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-red-500 selection:text-white transition-colors pb-24 md:pb-12">
      {/* Offline Mode Banner if disconnected */}
      {isOffline && (
        <div className="bg-amber-600 text-white text-xs font-semibold py-2 px-4 text-center flex items-center justify-center gap-2">
          <span>⚠️ Offline Mode Active: Running with cached Indian emergency helplines & offline first-aid protocols.</span>
        </div>
      )}

      {/* Live Tracking Link Active Banner if viewing a contact's emergency session */}
      {trackData && (
        <div className="bg-red-700 text-white py-3 px-4 text-xs shadow-md">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-ping" />
              <span className="font-bold">LIVE EMERGENCY TRACKER:</span>
              <span>
                Coordinates: {trackData.latitude?.toFixed(4)}, {trackData.longitude?.toFixed(4)} (±{trackData.accuracy}m)
                {trackData.situationNote && ` — Note: ${trackData.situationNote}`}
              </span>
            </div>
            <a
              href={`https://www.google.com/maps?q=${trackData.latitude},${trackData.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1 bg-white text-red-700 font-bold rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      )}

      {/* Top Bar Navigation following 3-Zone Top Bar Contract */}
      <TopNav
        currentLang={currentLang}
        onSelectLang={(lang) => setCurrentLang(lang)}
        onOpenSos={() => setIsSosOpen(true)}
        onOpenSiren={() => setIsSirenOpen(true)}
        onOpenVoice={() => setIsVoiceOpen(true)}
        onOpenLocker={() => setIsLockerOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onOpenEarthquake={() => setIsEarthquakeOpen(true)}
        activeSection={activeSection}
        onNavigate={handleNavigate}
        darkMode={darkMode}
        onToggleDarkMode={handleToggleDarkMode}
      />

      {/* Main Content Sections */}
      <main className="space-y-4">
        {/* Priority Emergency Helplines & Speed Dial */}
        <EmergencySpeedDial
          currentLang={currentLang}
          onOpenSos={() => setIsSosOpen(true)}
          onOpenSiren={() => setIsSirenOpen(true)}
          onOpenEarthquake={() => setIsEarthquakeOpen(true)}
        />

        {/* Offline First-Aid Clinical Guide & Metronome */}
        <FirstAidGuide currentLang={currentLang} />

        {/* 28 States & 8 Union Territories Directory */}
        <StateDirectory currentLang={currentLang} />

        {/* Nearby Hospitals & Emergency Services Radar */}
        <NearbyFinder currentLang={currentLang} />
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="mt-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-7 h-7 rounded-lg bg-red-600 text-white font-bold text-xs flex items-center justify-center">
                  112
                </span>
                <span className="font-extrabold text-slate-900 dark:text-white text-base">
                  {t.appName}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Emergency response support and offline first-aid companion designed for all 28 States & 8 Union Territories across the Republic of India.
              </p>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Official Indian Portals
              </h4>
              <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                <li>
                  <a
                    href="https://112.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    112.gov.in — Emergency Response Support System (ERSS)
                  </a>
                </li>
                <li>
                  <a
                    href="https://cybercrime.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    cybercrime.gov.in — National Cyber Crime Portal (1930)
                  </a>
                </li>
                <li>
                  <a
                    href="https://ndma.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    ndma.gov.in — National Disaster Management Authority
                  </a>
                </li>
                <li>
                  <a
                    href="https://railmadad.indianrailways.gov.in"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-red-600 dark:hover:text-red-400 transition-colors"
                  >
                    railmadad.indianrailways.gov.in — Railway Security 139
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
                Good Samaritan Legal Rights
              </h4>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Supreme Court Guidelines</span>
                </div>
                <p className="text-[11px] leading-relaxed">
                  Anyone who helps an accident victim or medical emergency cannot be subjected to detention or mandatory court attendance by authorities.
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div>
              <span>India Emergency Help Platform</span>
              <span className="mx-2">·</span>
              <span>Available 24x7 Nationwide</span>
            </div>
            <div className="font-mono text-[11px]">
              Toll-Free Emergency Helpline: 112 / 108 / 100 / 101 / 1091 / 1098 / 1930
            </div>
          </div>
        </div>
      </footer>

      {/* Mobile-First Sticky Thumb Zone Bottom Bar (Pattern from 10_mobile_touch_apps.md) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex items-center justify-around gap-2 shadow-lg">
        {/* Direct Call 112 */}
        <a
          href="tel:112"
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-red-600 active:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md min-h-[44px]"
        >
          <Phone className="w-4 h-4 fill-current" />
          <span>Call 112</span>
        </a>

        {/* SOS Beacon */}
        <button
          onClick={() => setIsSosOpen(true)}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs rounded-xl min-h-[44px]"
        >
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>SOS GPS</span>
        </button>

        {/* Earthquake Safety */}
        <button
          onClick={() => setIsEarthquakeOpen(true)}
          className="p-2.5 bg-red-100 dark:bg-red-950/60 text-[#E53935] font-bold rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center border border-red-200 dark:border-red-900/60"
          aria-label="Earthquake Safety"
        >
          <Activity className="w-4 h-4" />
        </button>

        {/* Siren */}
        <button
          onClick={() => setIsSirenOpen(true)}
          className="p-2.5 bg-amber-500 active:bg-amber-600 text-slate-950 font-bold rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Sound Siren"
        >
          <Siren className="w-4 h-4" />
        </button>

        {/* Voice Trigger */}
        <button
          onClick={() => setIsVoiceOpen(true)}
          className="p-2.5 bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center border border-red-200 dark:border-red-900/60"
          aria-label="Voice Emergency"
        >
          <Mic className="w-4 h-4 animate-pulse" />
        </button>

        {/* AI Triage */}
        <button
          onClick={() => setIsAiTriageOpen(true)}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="AI Triage"
        >
          <Sparkles className="w-4 h-4 text-red-500" />
        </button>

        {/* Document Locker */}
        <button
          onClick={() => setIsLockerOpen(true)}
          className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl min-w-[44px] min-h-[44px] flex items-center justify-center"
          aria-label="Encrypted Locker"
        >
          <Lock className="w-4 h-4 text-emerald-600" />
        </button>
      </div>

      {/* Modals */}
      <SosBeaconModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        currentLang={currentLang}
      />
      <SirenStrobeModal
        isOpen={isSirenOpen}
        onClose={() => setIsSirenOpen(false)}
      />
      <EarthquakeModal
        isOpen={isEarthquakeOpen}
        onClose={() => setIsEarthquakeOpen(false)}
        currentLang={currentLang}
      />
      <AiTriageModal
        isOpen={isAiTriageOpen}
        onClose={() => setIsAiTriageOpen(false)}
        currentLang={currentLang}
      />
      <VoiceEmergencyModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        currentLang={currentLang}
        onTriggerSos={() => setIsSosOpen(true)}
        onOpenAiWithQuery={(q) => {
          setIsAiTriageOpen(true);
        }}
      />
      <DocumentLockerModal
        isOpen={isLockerOpen}
        onClose={() => setIsLockerOpen(false)}
        currentLang={currentLang}
      />
      <PrivacySettingsModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        currentLang={currentLang}
      />
    </div>
  );
}
