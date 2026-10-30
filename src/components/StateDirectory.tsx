import React, { useState } from 'react';
import { Search, MapPin, Phone, Shield, HeartPulse, Flame, Users, Car, LifeBuoy } from 'lucide-react';
import { ALL_INDIA_STATES, StateHelpline } from '../data/emergencyNumbers';
import { SupportedLang, TRANSLATIONS } from '../data/translations';

interface StateDirectoryProps {
  currentLang: SupportedLang;
}

export const StateDirectory: React.FC<StateDirectoryProps> = ({ currentLang }) => {
  const t = TRANSLATIONS[currentLang];
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStateCode, setSelectedStateCode] = useState<string>('DL');

  const filteredStates = ALL_INDIA_STATES.filter((s) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      !q ||
      s.state.toLowerCase().includes(q) ||
      s.capital.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q)
    );
  });

  const activeState =
    ALL_INDIA_STATES.find((s) => s.code === selectedStateCode) ||
    filteredStates[0] ||
    ALL_INDIA_STATES[0];

  return (
    <section id="states" className="py-8 sm:py-12 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
              <span>State & Union Territory Directory</span>
              <span aria-hidden="true">·</span>
              <span>28 States & 8 UTs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t.stateDirectoryBtn} & Local Control Rooms
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Direct contacts for State Disaster Management Authorities (SDMA), local police headquarters, and state-specific safety initiatives.
            </p>
          </div>

          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search state (e.g. Maharashtra, Delhi, Tamil Nadu)..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>
        </div>

        {/* State Quick Selector Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {filteredStates.map((st) => (
            <button
              key={st.code}
              onClick={() => setSelectedStateCode(st.code)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                activeState.code === st.code
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {st.state}
            </button>
          ))}
        </div>

        {/* Active State Detailed Helpline Card */}
        {activeState && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm">
            {/* Title Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-600/10 text-red-600 dark:text-red-400 flex items-center justify-center font-bold text-lg font-mono">
                  {activeState.code}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                    {activeState.state}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Capital: {activeState.capital}</span>
                    <span aria-hidden="true">·</span>
                    <span>State Control Room Active</span>
                  </div>
                </div>
              </div>

              {/* Universal 112 Dial */}
              <a
                href="tel:112"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap self-start sm:self-auto min-h-[44px]"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>Call State ERSS 112</span>
              </a>
            </div>

            {/* Helpline Grid for this State */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-6">
              {/* Police */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-1">
                    <Shield className="w-4 h-4" />
                    <span>Police Control Room</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {activeState.policeControl}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Direct central police dispatch & law enforcement.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700">
                  <a
                    href={`tel:${activeState.policeControl.split('/')[0].trim()}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Police</span>
                  </a>
                </div>
              </div>

              {/* Ambulance */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-1">
                    <HeartPulse className="w-4 h-4" />
                    <span>Medical Ambulance</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {activeState.ambulance}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    GVK EMRI / State free medical transport network.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700">
                  <a
                    href={`tel:${activeState.ambulance.split('/')[0].trim()}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Ambulance</span>
                  </a>
                </div>
              </div>

              {/* Disaster */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1">
                    <LifeBuoy className="w-4 h-4" />
                    <span>Disaster Management (SDMA)</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {activeState.disasterControl}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Floods, cyclones, earthquake relief, and SDRF rescue.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700">
                  <a
                    href={`tel:${activeState.disasterControl.split('/')[0].trim()}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Disaster Control</span>
                  </a>
                </div>
              </div>

              {/* Women Safety */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider mb-1">
                    <Users className="w-4 h-4" />
                    <span>Women Safety & Stalking</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {activeState.womenHelpline}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Dedicated patrol units, 1090/181, and domestic abuse aid.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700">
                  <a
                    href={`tel:${activeState.womenHelpline.split('/')[0].trim()}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Women Helpline</span>
                  </a>
                </div>
              </div>

              {/* Traffic Police */}
              {activeState.trafficPolice && (
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-bold text-cyan-700 dark:text-cyan-400 uppercase tracking-wider mb-1">
                      <Car className="w-4 h-4" />
                      <span>Traffic Police / Towing</span>
                    </div>
                    <div className="text-lg font-mono font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                      {activeState.trafficPolice}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Highway collision assistance, gridlock, and emergency towing.
                    </p>
                  </div>
                  <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700">
                    <a
                      href={`tel:${activeState.trafficPolice.split('/')[0].trim()}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-600 dark:text-cyan-400 hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Traffic Control</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Fire */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-red-700 dark:text-red-400 uppercase tracking-wider mb-1">
                    <Flame className="w-4 h-4" />
                    <span>Fire & Rescue</span>
                  </div>
                  <div className="text-lg font-mono font-bold text-slate-900 dark:text-white mt-1 tabular-nums">
                    {activeState.fire}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Commercial & residential fire breakout rescue.
                  </p>
                </div>
                <div className="pt-3 mt-3 border-t border-slate-200/60 dark:border-slate-700">
                  <a
                    href={`tel:${activeState.fire.split('/')[0].trim()}`}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Fire 101</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
