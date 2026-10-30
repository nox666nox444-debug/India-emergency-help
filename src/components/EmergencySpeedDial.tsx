import React, { useState } from 'react';
import { Phone, Copy, Check, Search, ShieldAlert, HeartPulse, Flame, Users, Landmark, Train, HelpCircle, Siren, AlertTriangle } from 'lucide-react';
import { EmergencyContact, NATIONAL_PRIMARY_NUMBERS } from '../data/emergencyNumbers';
import { SupportedLang, TRANSLATIONS } from '../data/translations';

interface EmergencySpeedDialProps {
  currentLang: SupportedLang;
  onOpenSos: () => void;
  onOpenSiren: () => void;
  onOpenEarthquake: () => void;
}

export const EmergencySpeedDial: React.FC<EmergencySpeedDialProps> = ({
  currentLang,
  onOpenSos,
  onOpenSiren,
  onOpenEarthquake,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (num: string, id: string) => {
    navigator.clipboard.writeText(num);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const filteredNumbers = NATIONAL_PRIMARY_NUMBERS.filter((item) => {
    const matchesCategory =
      selectedCategory === 'all' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      item.number.includes(q) ||
      item.description.toLowerCase().includes(q) ||
      (item.badge && item.badge.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'national':
        return <ShieldAlert className="w-4 h-4 text-red-600 dark:text-red-400" />;
      case 'police':
        return <Landmark className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'medical':
        return <HeartPulse className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'disaster':
        return <Flame className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'women_child':
        return <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'cyber_transit':
        return <Train className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <section id="helplines" className="py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Banner: India 112 Nationwide Response */}
        <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white mb-8 border border-slate-800">
          <div className="grid grid-cols-1 lg:grid-cols-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 z-10">
              <div className="flex items-center gap-2 text-xs text-red-400 font-semibold tracking-wide uppercase mb-3">
                <span>Government of India</span>
                <span aria-hidden="true">·</span>
                <span>Ministry of Home Affairs</span>
                <span aria-hidden="true">·</span>
                <span>ERSS 24x7</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white mb-3 text-balance">
                Unified Emergency Response Support System (ERSS 112)
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-xl mb-6 leading-relaxed">
                Single toll-free number across all Indian States & Union Territories. Directly connects you to Police, Ambulance, Fire, and Disaster rescue teams with GPS-enabled mobile dispatch.
              </p>

              {/* Direct Calling Hero Controls */}
              <div className="flex flex-wrap items-center gap-3">
                <a
                  href="tel:112"
                  className="flex items-center justify-center gap-2.5 px-6 py-3.5 text-base font-bold text-white bg-red-600 hover:bg-red-500 rounded-xl shadow-lg shadow-red-600/30 transition-all active:scale-95 whitespace-nowrap shrink-0 min-h-[48px]"
                >
                  <Phone className="w-5 h-5 fill-current" />
                  <span>Call 112 Now</span>
                </a>
                <button
                  onClick={onOpenSos}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all whitespace-nowrap shrink-0 min-h-[48px]"
                >
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <span>{t.sosBeaconBtn}</span>
                </button>
                <button
                  onClick={onOpenSiren}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-amber-300 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-800/60 rounded-xl transition-all whitespace-nowrap shrink-0 min-h-[48px]"
                >
                  <Siren className="w-4 h-4 text-amber-400" />
                  <span>Sound Siren</span>
                </button>
                <button
                  onClick={onOpenEarthquake}
                  className="flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-red-200 bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 rounded-xl transition-all whitespace-nowrap shrink-0 min-h-[48px]"
                >
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <span>{t.earthquakeSafetyBtn}</span>
                </button>
              </div>

              {/* Zero-Pill Quiet Micro-Metadata */}
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-6 pt-4 border-t border-slate-800">
                <span>Free from any landline or mobile</span>
                <span aria-hidden="true">·</span>
                <span>Works without SIM balance</span>
                <span aria-hidden="true">·</span>
                <span>Multi-lingual dispatch</span>
              </div>
            </div>

            {/* Right Hero Image */}
            <div className="lg:col-span-5 h-64 lg:h-full relative min-h-[260px]">
              <img
                src="/src/assets/images/hero_emergency_response_1793317695610.jpg"
                alt="Indian Emergency Services 112 response vehicle and team"
                className="w-full h-full object-cover object-center"
                referrerPolicy="no-referrer"
                loading="eager"
              />
              <div className="absolute inset-0 bg-gradient-to-t lg:bg-gradient-to-r from-slate-900 via-slate-900/40 to-transparent pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1 max-w-lg">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap self-center sm:self-auto">
              <span>Showing {filteredNumbers.length} emergency services</span>
              <span className="mx-2">·</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">All 24x7 Active</span>
            </div>
          </div>

          {/* Interactive Filter Controls (Functional button segmented group per frontend design rules) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all', label: t.filterAll },
              { id: 'national', label: t.filterNational },
              { id: 'medical', label: t.filterMedical },
              { id: 'police', label: t.filterPolice },
              { id: 'women_child', label: t.filterWomenChild },
              { id: 'disaster', label: t.filterDisaster },
              { id: 'cyber_transit', label: t.filterCyber },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setSelectedCategory(f.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 min-h-[36px] ${
                  selectedCategory === f.id
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Emergency Speed Dial Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNumbers.map((item) => (
            <div
              key={item.id}
              className={`flex flex-col justify-between p-5 rounded-xl border transition-all ${
                item.priority
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-red-300 dark:hover:border-red-900 shadow-sm'
                  : 'bg-slate-50/60 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800/80'
              }`}
            >
              <div>
                {/* Header with clean unboxed metadata */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
                      {getCategoryIcon(item.category)}
                    </div>
                    <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {item.badge || item.category}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 font-mono">
                    <span>{item.availableHours}</span>
                  </div>
                </div>

                {/* Number & Service Name */}
                <div className="my-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black tracking-tight text-slate-900 dark:text-white font-mono tabular-nums">
                      {item.number}
                    </span>
                    {item.tollFree && (
                      <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        Toll-Free
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                    {item.name}
                  </h3>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  {item.description}
                </p>
              </div>

              {/* Action Buttons: Direct Call & Copy */}
              <div className="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 mt-auto">
                <a
                  href={`tel:${item.number}`}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 active:scale-[0.98] rounded-lg transition-all min-h-[44px]"
                  title={`Call ${item.number}`}
                >
                  <Phone className="w-4 h-4 fill-current" />
                  <span>Call {item.number}</span>
                </a>
                <button
                  onClick={() => handleCopy(item.number, item.id)}
                  title="Copy number"
                  className="px-3 py-2.5 text-xs font-medium text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors flex items-center gap-1.5 min-h-[44px]"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty state if search finds nothing */}
        {filteredNumbers.length === 0 && (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6">
            <HelpCircle className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h4 className="text-base font-semibold text-slate-900 dark:text-white">
              No matching helpline found
            </h4>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Try searching with general terms or dial the master National Emergency number.
            </p>
            <a
              href="tel:112"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg"
            >
              <Phone className="w-4 h-4" />
              <span>Call Universal Emergency 112</span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
};
