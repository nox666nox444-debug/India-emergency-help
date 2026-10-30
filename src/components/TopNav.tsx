import React from 'react';
import { PhoneCall, AlertTriangle, Globe, Sun, Moon, Volume2, Mic, Lock, Shield } from 'lucide-react';
import { SupportedLang, LANGUAGE_OPTIONS, TRANSLATIONS } from '../data/translations';

interface TopNavProps {
  currentLang: SupportedLang;
  onSelectLang: (lang: SupportedLang) => void;
  onOpenSos: () => void;
  onOpenSiren: () => void;
  onOpenVoice: () => void;
  onOpenLocker: () => void;
  onOpenPrivacy: () => void;
  onOpenEarthquake: () => void;
  activeSection: string;
  onNavigate: (section: string) => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({
  currentLang,
  onSelectLang,
  onOpenSos,
  onOpenSiren,
  onOpenVoice,
  onOpenLocker,
  onOpenPrivacy,
  onOpenEarthquake,
  activeSection,
  onNavigate,
  darkMode,
  onToggleDarkMode,
}) => {
  const t = TRANSLATIONS[currentLang];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Strict 3-Zone Top Bar Contract */}
        <div className="flex items-center justify-between gap-8 h-16">
          {/* Zone 1: Single element wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="#helplines"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('helplines');
              }}
              className="flex items-center gap-2.5 text-lg font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0 group"
            >
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-red-600 text-white font-extrabold text-sm shadow-sm group-hover:bg-red-700 transition-colors">
                112
              </span>
              <span>{t.appName}</span>
            </a>
          </div>

          {/* Zone 2: clean single-line text navigation links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={() => onNavigate('helplines')}
              className={`hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeSection === 'helplines'
                  ? 'border-red-600 text-red-600 dark:text-red-400 font-semibold'
                  : 'border-transparent'
              }`}
            >
              {t.emergencyDialTitle}
            </button>
            <button
              onClick={() => onNavigate('first-aid')}
              className={`hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeSection === 'first-aid'
                  ? 'border-red-600 text-red-600 dark:text-red-400 font-semibold'
                  : 'border-transparent'
              }`}
            >
              {t.firstAidBtn}
            </button>
            <button
              onClick={onOpenEarthquake}
              className="hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 border-transparent text-[#E53935] font-semibold flex items-center gap-1.5"
            >
              <span>{t.earthquakeSafetyBtn}</span>
            </button>
            <button
              onClick={() => onNavigate('ai-triage')}
              className={`hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeSection === 'ai-triage'
                  ? 'border-red-600 text-red-600 dark:text-red-400 font-semibold'
                  : 'border-transparent'
              }`}
            >
              {t.aiTriageBtn}
            </button>
            <button
              onClick={() => onNavigate('states')}
              className={`hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeSection === 'states'
                  ? 'border-red-600 text-red-600 dark:text-red-400 font-semibold'
                  : 'border-transparent'
              }`}
            >
              {t.stateDirectoryBtn}
            </button>
            <button
              onClick={() => onNavigate('nearby')}
              className={`hover:text-red-600 dark:hover:text-red-400 transition-colors whitespace-nowrap shrink-0 pb-1 border-b-2 ${
                activeSection === 'nearby'
                  ? 'border-red-600 text-red-600 dark:text-red-400 font-semibold'
                  : 'border-transparent'
              }`}
            >
              {t.nearbyBtn}
            </button>
          </nav>

          {/* Zone 3: Primary Action & Utilities */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* Earthquake Safety Quick Trigger */}
            <button
              onClick={onOpenEarthquake}
              title="Earthquake Safety Guide & Emergency Kit"
              className="p-2 text-[#E53935] hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
              aria-label="Earthquake Safety"
            >
              <AlertTriangle className="w-5 h-5" />
            </button>

            {/* Siren Quick Trigger */}
            <button
              onClick={onOpenSiren}
              title="Emergency Siren & Strobe Flash"
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
              aria-label="Siren Alarm"
            >
              <Volume2 className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </button>

            {/* Voice Emergency Trigger */}
            <button
              onClick={onOpenVoice}
              title="Voice Emergency Trigger (Help / Bachao)"
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
              aria-label="Voice Emergency Trigger"
            >
              <Mic className="w-5 h-5 text-red-600 dark:text-red-400" />
            </button>

            {/* Encrypted Document Locker */}
            <button
              onClick={onOpenLocker}
              title="Encrypted Medical & Document Locker (AES-256)"
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
              aria-label="Encrypted Document Locker"
            >
              <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </button>

            {/* Privacy & Offline Settings */}
            <button
              onClick={onOpenPrivacy}
              title="Privacy, Data Protection & Offline Mode"
              className="p-2 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center justify-center min-w-[40px] min-h-[40px]"
              aria-label="Privacy & Offline"
            >
              <Shield className="w-4 h-4 text-slate-500 hover:text-blue-500" />
            </button>

            {/* Language Dropdown */}
            <div className="relative">
              <label htmlFor="lang-select" className="sr-only">
                {t.selectLanguage}
              </label>
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                <Globe className="w-3.5 h-3.5 text-slate-500" />
                <select
                  id="lang-select"
                  value={currentLang}
                  onChange={(e) => onSelectLang(e.target.value as SupportedLang)}
                  className="bg-transparent border-none text-xs font-medium focus:ring-0 cursor-pointer pr-1"
                >
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <option key={opt.code} value={opt.code} className="dark:bg-slate-900 text-slate-900 dark:text-white">
                      {opt.nativeName} ({opt.code.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={onToggleDarkMode}
              className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* Zone 3 Primary Action CTA */}
            <button
              onClick={onOpenSos}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition-all whitespace-nowrap shrink-0 active:scale-95"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{t.sosBeaconBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
