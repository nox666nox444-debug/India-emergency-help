import React, { useState, useEffect } from 'react';
import { 
  X, 
  Phone, 
  ShieldAlert, 
  ArrowDownToLine, 
  Shield, 
  Hand, 
  AlertTriangle, 
  Activity, 
  HeartPulse, 
  Waves, 
  ExternalLink, 
  CheckSquare, 
  Square, 
  RotateCcw, 
  Info,
  CheckCircle2
} from 'lucide-react';
import { SupportedLang } from '../data/translations';

interface EarthquakeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLang;
}

const DEFAULT_CHECKLIST_ITEMS = [
  { id: 'water', label: 'Drinking water', desc: 'At least 3-4 litres per person per day (3-day supply)' },
  { id: 'firstaid', label: 'First aid kit', desc: 'Antiseptics, bandages, gauze, scissors, burn ointment' },
  { id: 'torch', label: 'Flashlight and batteries', desc: 'LED torch plus spare heavy-duty alkaline batteries' },
  { id: 'powerbank', label: 'Power bank', desc: 'Fully charged battery bank with mobile charging cables' },
  { id: 'meds', label: 'Essential medicines', desc: 'Prescription medicines for 7 days, ORS, pain relievers' },
  { id: 'food', label: 'Dry food', desc: 'Non-perishable energy bars, roasted chana, dry fruits' },
  { id: 'whistle', label: 'Whistle', desc: 'For signalling rescue workers if trapped under debris' },
  { id: 'docs', label: 'Copies of important documents', desc: 'Aadhaar, insurance, property records in waterproof pouch' },
  { id: 'contacts', label: 'Emergency contact numbers', desc: 'Written list of family, hospital, local control room' },
];

export const EarthquakeModal: React.FC<EarthquakeModalProps> = ({
  isOpen,
  onClose,
  currentLang,
}) => {
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('earthquake_kit_checked_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return {};
  });

  useEffect(() => {
    try {
      localStorage.setItem('earthquake_kit_checked_v1', JSON.stringify(checkedItems));
    } catch {
      // ignore storage failure
    }
  }, [checkedItems]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleItem = (id: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAll = () => {
    const allChecked: Record<string, boolean> = {};
    DEFAULT_CHECKLIST_ITEMS.forEach((item) => {
      allChecked[item.id] = true;
    });
    setCheckedItems(allChecked);
  };

  const handleResetChecklist = () => {
    setCheckedItems({});
  };

  const completedCount = DEFAULT_CHECKLIST_ITEMS.filter((item) => checkedItems[item.id]).length;
  const progressPercent = Math.round((completedCount / DEFAULT_CHECKLIST_ITEMS.length) * 100);

  // Localization labels
  const isHi = currentLang === 'hi';
  const isPa = currentLang === 'pa';

  const t = {
    title: isHi ? 'भूकंप सुरक्षा प्रणाली' : isPa ? 'ਭੂਚਾਲ ਸੁਰੱਖਿਆ ਪ੍ਰਣਾਲੀ' : 'EARTHQUAKE SAFETY SYSTEM',
    subtitle: isHi 
      ? 'शांत रहें। अपनी सुरक्षा करें। आधिकारिक निर्देशों का पालन करें।' 
      : isPa 
      ? 'ਸ਼ਾਂਤ ਰਹੋ। ਆਪਣਾ ਬਚਾਅ ਕਰੋ। ਅਧਿਕਾਰਤ ਨਿਰਦੇਸ਼ਾਂ ਦੀ ਪਾਲਣਾ ਕਰੋ।' 
      : 'Stay calm. Protect yourself. Follow official instructions.',
    call112: isHi ? 'आपातकालीन 112 पर कॉल करें' : isPa ? 'ਐਮਰਜੈਂਸੀ 112 ਤੇ ਕਾਲ ਕਰੋ' : 'CALL EMERGENCY 112',
    duringTitle: isHi ? 'भूकंप के दौरान (DURING AN EARTHQUAKE)' : isPa ? 'ਭੂਚਾਲ ਦੌਰਾਨ' : 'During an Earthquake',
    afterTitle: isHi ? 'भूकंप के बाद (AFTER AN EARTHQUAKE)' : isPa ? 'ਭੂਚਾਲ ਤੋਂ ਬਾਅਦ' : 'After an Earthquake',
    checklistTitle: isHi ? 'आपदा किट चेकलिस्ट (EMERGENCY KIT)' : isPa ? 'ਐਮਰਜੈਂਸੀ ਕਿੱਟ ਚੈੱਕਲਿਸਟ' : 'Emergency Kit Checklist',
    officialTitle: isHi ? 'आधिकारिक भूकंप सूचना एवं पोर्टल' : isPa ? 'ਅਧਿਕਾਰਤ ਭੂਚਾਲ ਜਾਣਕਾਰੀ' : 'Official Earthquake Information',
    disclaimer: isHi
      ? 'महत्वपूर्ण: यह स्क्रीन एक सुरक्षा मार्गदर्शिका है। यह भूकंप का पता नहीं लगाती है और न ही सत्यापित लाइव अलर्ट उत्पन्न करती है।'
      : isPa
      ? 'ਮਹੱਤਵਪੂਰਨ: ਇਹ ਸਕ੍ਰੀਨ ਇੱਕ ਸੁਰੱਖਿਆ ਗਾਈਡ ਹੈ। ਇਹ ਭੂਚਾਲ ਦਾ ਪਤਾ ਨਹੀਂ ਲਗਾਉਂਦੀ ਅਤੇ ਨਾ ਹੀ ਲਾਈਵ ਅਲਰਟ ਦਿੰਦੀ ਹੈ।'
      : 'Important: This screen is a safety guide. It does not detect earthquakes or generate verified live alerts.',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="earthquake-title"
      >
        {/* Navy Header Card */}
        <div className="bg-[#101B35] text-white p-6 sm:p-7 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors min-w-[40px] min-h-[40px] flex items-center justify-center"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4 pr-10">
            <div className="w-12 h-12 rounded-xl bg-red-600/20 border border-red-500/40 text-red-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400 mb-1">
                <span>NDMA & Seismology Guidelines</span>
                <span aria-hidden="true">·</span>
                <span>Disaster Protocol</span>
              </div>
              <h2 id="earthquake-title" className="text-xl sm:text-2xl font-black tracking-tight text-white">
                {t.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                {t.subtitle}
              </p>
            </div>
          </div>

          {/* Call 112 Hero Button */}
          <div className="mt-5">
            <a
              href="tel:112"
              className="w-full flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm sm:text-base font-black tracking-wide text-white bg-[#E53935] hover:bg-red-700 active:scale-[0.99] rounded-xl shadow-lg shadow-red-900/40 transition-all min-h-[50px]"
            >
              <Phone className="w-5 h-5 fill-current" />
              <span>{t.call112}</span>
            </a>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 text-slate-800 dark:text-slate-100">
          {/* Section: During an Earthquake */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-5 h-5 text-[#E53935]" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.duringTitle}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* DROP */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#E53935] flex items-center justify-center font-black text-sm">
                      1
                    </span>
                    <ArrowDownToLine className="w-5 h-5 text-[#E53935]" />
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    DROP
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Get down on your hands and knees immediately before the shaking knocks you down.
                  </p>
                </div>
              </div>

              {/* COVER */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#E53935] flex items-center justify-center font-black text-sm">
                      2
                    </span>
                    <Shield className="w-5 h-5 text-[#E53935]" />
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    COVER
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Protect head & neck under a sturdy table or desk. If unavailable, crouch near an interior wall.
                  </p>
                </div>
              </div>

              {/* HOLD ON */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#E53935] flex items-center justify-center font-black text-sm">
                      3
                    </span>
                    <Hand className="w-5 h-5 text-[#E53935]" />
                  </div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    HOLD ON
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                    Hold your shelter until the shaking stops. Be prepared to move with your shelter if it shifts.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: After an Earthquake */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.afterTitle}
              </h3>
            </div>

            <div className="space-y-2.5">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#E53935] flex items-center justify-center shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Avoid damaged buildings
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Stay away from damaged structures, cracked walls, glass windows, and fallen electrical wires. Never use elevators.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#E53935] flex items-center justify-center shrink-0 mt-0.5">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Expect aftershocks
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Secondary shockwaves can occur minutes, hours, or days later. If shaking starts again, immediately Drop, Cover, and Hold On.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#E53935] flex items-center justify-center shrink-0 mt-0.5">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Check for injuries
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Administer first aid for bleeding and fractures if safe to do so. Do not move seriously injured persons unless in immediate danger.
                  </p>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/70 flex items-start gap-3.5">
                <div className="w-9 h-9 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#E53935] flex items-center justify-center shrink-0 mt-0.5">
                  <Waves className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    Coastal safety (Tsunami Alert)
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    If you are near the coastline and experience strong or long shaking, move inland to higher ground immediately without waiting for sirens.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Emergency Kit Checklist */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.checklistTitle}
                </h3>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500">
                <button
                  onClick={handleSelectAll}
                  className="hover:text-slate-900 dark:hover:text-white underline font-medium"
                >
                  Select All
                </button>
                <button
                  onClick={handleResetChecklist}
                  className="hover:text-red-600 underline font-medium flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset
                </button>
              </div>
            </div>

            {/* Checklist Progress Bar */}
            <div className="mb-4 p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                <span>Preparedness Kit Readiness</span>
                <span>{completedCount} of {DEFAULT_CHECKLIST_ITEMS.length} packed ({progressPercent}%)</span>
              </div>
              <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-300 rounded-full ${
                    progressPercent === 100 
                      ? 'bg-emerald-600' 
                      : progressPercent > 50 
                      ? 'bg-blue-600' 
                      : 'bg-[#E53935]'
                  }`}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* Checklist Items */}
            <div className="space-y-2">
              {DEFAULT_CHECKLIST_ITEMS.map((item) => {
                const isChecked = !!checkedItems[item.id];
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleItem(item.id)}
                    className={`w-full text-left p-3 rounded-xl border transition-all flex items-start gap-3 min-h-[44px] ${
                      isChecked
                        ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                        : 'bg-white dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="mt-0.5 shrink-0">
                      {isChecked ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-sm font-semibold ${
                          isChecked ? 'line-through text-slate-500 dark:text-slate-400' : 'text-slate-900 dark:text-white'
                        }`}>
                          {item.label}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        {item.desc}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section: Official Earthquake Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <ExternalLink className="w-5 h-5 text-[#101B35] dark:text-blue-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t.officialTitle}
              </h3>
            </div>

            <div className="space-y-2">
              <a
                href="https://seismo.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors group min-h-[48px]"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    National Center for Seismology (NCS)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Ministry of Earth Sciences · Real-time seismic monitoring & earthquake bulletins
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
              </a>

              <a
                href="https://ndma.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors group min-h-[48px]"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    NDMA India (National Disaster Management Authority)
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Government of India · Guidelines for earthquake resistant construction & safety
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
              </a>

              <a
                href="https://incois.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 transition-colors group min-h-[48px]"
              >
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                    INCOIS Indian Tsunami Early Warning Centre
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Indian Ocean oceanic earthquake & coastal tsunami bulletins
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0 ml-2" />
              </a>
            </div>
          </div>

          {/* Important safety notice */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
            <Info className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t.disclaimer}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between shrink-0">
          <div className="text-[11px] text-slate-500">
            Emergency Hotline: <span className="font-bold text-red-600">112</span> · Disaster Helpline: <span className="font-bold text-slate-700 dark:text-slate-300">1070 / 1077</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors min-h-[40px]"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
