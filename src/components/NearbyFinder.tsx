import React from 'react';
import { Hospital, Shield, Pill, Droplet, Flame, MapPin, ExternalLink, Navigation } from 'lucide-react';
import { SupportedLang, TRANSLATIONS } from '../data/translations';

interface NearbyFinderProps {
  currentLang: SupportedLang;
}

const NEARBY_CATEGORIES = [
  {
    id: 'hospitals',
    title: '24x7 Emergency Hospitals',
    description: 'Find nearest multi-specialty hospitals with ICU, trauma wards, and casualty facilities.',
    query: '24 hour emergency hospital casualty near me',
    icon: Hospital,
    color: 'text-red-600 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
  },
  {
    id: 'govt_phc',
    title: 'Govt Hospital & Primary Health Centre (PHC)',
    description: 'District civil hospitals stocking free Anti-Snake Venom (ASV), anti-rabies, and emergency maternity care.',
    query: 'government district hospital PHC near me',
    icon: Hospital,
    color: 'text-emerald-600 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
  },
  {
    id: 'police',
    title: 'Police Stations & Chowkis',
    description: 'Find local jurisdictional police station, traffic aid post, or women assistance booth.',
    query: 'police station near me',
    icon: Shield,
    color: 'text-blue-600 dark:text-blue-400',
    bg: 'bg-blue-50 dark:bg-blue-950/30',
  },
  {
    id: 'blood_bank',
    title: 'Blood Banks & Transfusion Centers',
    description: 'Locate certified Red Cross, government, and charitable blood banks for urgent plasma and RBC units.',
    query: 'blood bank near me open now',
    icon: Droplet,
    color: 'text-rose-600 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-950/30',
  },
  {
    id: 'pharmacy',
    title: '24-Hour Chemists & Pharmacies',
    description: 'Night medical stores for urgent emergency prescription drugs, inhalers, insulin, and dressings.',
    query: '24 hour chemist medical store near me open now',
    icon: Pill,
    color: 'text-purple-600 dark:text-purple-400',
    bg: 'bg-purple-50 dark:bg-purple-950/30',
  },
  {
    id: 'fire',
    title: 'Fire & Rescue Stations',
    description: 'Find municipal fire brigade stations for structural collapse or hazardous gas leak rescues.',
    query: 'fire station brigade near me',
    icon: Flame,
    color: 'text-amber-600 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
  },
];

export const NearbyFinder: React.FC<NearbyFinderProps> = ({ currentLang }) => {
  const t = TRANSLATIONS[currentLang];

  const openSearch = (query: string) => {
    const url = `https://www.google.com/maps/search/${encodeURIComponent(query)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <section id="nearby" className="py-8 sm:py-12 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
            <span>Instant GPS Radius Search</span>
            <span aria-hidden="true">·</span>
            <span>Google Maps Integration</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {t.nearbyBtn} & Critical Facilities
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            One-tap direct search navigation that automatically routes you to the nearest verified emergency centers around your live GPS coordinates.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {NEARBY_CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <div
                key={cat.id}
                className="flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`p-2.5 rounded-xl ${cat.bg}`}>
                      <Icon className={`w-5 h-5 ${cat.color}`} />
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                      {cat.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                    {cat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
                  <button
                    onClick={() => openSearch(cat.query)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold rounded-xl transition-all min-h-[44px]"
                  >
                    <Navigation className="w-3.5 h-3.5 text-red-600" />
                    <span>Find Nearest in Maps</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
