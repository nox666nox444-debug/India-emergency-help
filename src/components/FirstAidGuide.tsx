import React, { useState, useEffect } from 'react';
import {
  Heart,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Play,
  Square,
  ShieldCheck,
  Phone,
  Activity,
  Flame,
  Search,
} from 'lucide-react';
import { FIRST_AID_TOPICS, FirstAidTopic } from '../data/firstAidData';
import { SupportedLang, TRANSLATIONS } from '../data/translations';
import { soundManager } from '../utils/sirenAudio';

interface FirstAidGuideProps {
  currentLang: SupportedLang;
}

export const FirstAidGuide: React.FC<FirstAidGuideProps> = ({ currentLang }) => {
  const t = TRANSLATIONS[currentLang];
  const [selectedTopicId, setSelectedTopicId] = useState<string>('cpr');
  const [isMetronomeActive, setIsMetronomeActive] = useState<boolean>(false);
  const [metronomePulse, setMetronomePulse] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');

  const currentTopic =
    FIRST_AID_TOPICS.find((top) => top.id === selectedTopicId) ||
    FIRST_AID_TOPICS[0];

  // Stop metronome if switching away or unmounting
  useEffect(() => {
    return () => {
      soundManager.stopMetronome();
    };
  }, []);

  const toggleMetronome = () => {
    if (isMetronomeActive) {
      soundManager.stopMetronome();
      setIsMetronomeActive(false);
    } else {
      soundManager.startMetronome(110, () => {
        setMetronomePulse(true);
        setTimeout(() => setMetronomePulse(false), 80);
      });
      setIsMetronomeActive(true);
    }
  };

  const filteredTopics = FIRST_AID_TOPICS.filter((top) => {
    const q = searchFilter.toLowerCase().trim();
    return (
      !q ||
      top.title.toLowerCase().includes(q) ||
      top.subtitle.toLowerCase().includes(q) ||
      top.summary.toLowerCase().includes(q)
    );
  });

  return (
    <section id="first-aid" className="py-8 sm:py-12 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-1">
              <span>Offline First-Aid Directory</span>
              <span aria-hidden="true">·</span>
              <span>100% Client-Side Knowledge</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t.firstAidTitle}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
              Standard clinical triage protocols adapted for Indian conditions. Always dial 112 / 108 while initiating these steps.
            </p>
          </div>

          {/* Quick Search */}
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Filter topics (e.g., snakebite, burn)..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* 2-Column Split: Topic Selector on Left, Detailed Guide on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Topics List */}
          <div className="lg:col-span-4 space-y-2">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Medical Protocol
            </div>
            <div className="flex flex-col gap-1.5 max-h-[580px] overflow-y-auto pr-1">
              {filteredTopics.map((top) => (
                <button
                  key={top.id}
                  onClick={() => setSelectedTopicId(top.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all min-h-[52px] ${
                    selectedTopicId === top.id
                      ? 'bg-red-50/80 dark:bg-red-950/30 border-red-300 dark:border-red-900 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-sm font-bold truncate ${
                        selectedTopicId === top.id
                          ? 'text-red-700 dark:text-red-400'
                          : 'text-slate-900 dark:text-white'
                      }`}
                    >
                      {top.title}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400 shrink-0">
                      {top.recommendedHelpline}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {top.subtitle}
                  </p>
                </button>
              ))}
            </div>

            {/* Indian Good Samaritan Protection Highlight */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 mt-4 space-y-1.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Supreme Court Good Samaritan Law</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                You are legally protected when helping victims. Police cannot force you to register as a witness, and hospitals cannot demand advance payment before emergency treatment.
              </p>
            </div>
          </div>

          {/* Right Column: Detailed Topic Sheet */}
          <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6">
            {/* Header Lockup */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div>
                <div className="flex items-center gap-2 text-xs text-red-600 dark:text-red-400 font-semibold uppercase mb-1">
                  <span>{currentTopic.category} Emergency</span>
                  <span aria-hidden="true">·</span>
                  <span>Triage Protocol</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {currentTopic.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  {currentTopic.summary}
                </p>
              </div>

              {/* Dial Helpline CTA */}
              <a
                href={`tel:${currentTopic.recommendedHelpline.split('/')[0].trim()}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all whitespace-nowrap self-start min-h-[44px]"
              >
                <Phone className="w-4 h-4 fill-current" />
                <span>Call {currentTopic.recommendedHelpline}</span>
              </a>
            </div>

            {/* CPR Metronome Tool (If CPR topic is selected) */}
            {currentTopic.id === 'cpr' && (
              <div className="p-4 rounded-xl bg-slate-950 text-white border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${
                      metronomePulse ? 'scale-125 bg-red-500' : 'bg-red-600/30'
                    }`}
                  >
                    <Heart className={`w-6 h-6 text-red-400 ${metronomePulse ? 'fill-current' : ''}`} />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <span>Interactive CPR Metronome</span>
                      <span className="text-xs font-mono text-red-400">110 BPM</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      Rhythm matches recommended chest compression rate (Push to the beat)
                    </p>
                  </div>
                </div>

                <button
                  onClick={toggleMetronome}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all min-h-[40px] ${
                    isMetronomeActive
                      ? 'bg-red-600 hover:bg-red-500 text-white animate-pulse'
                      : 'bg-white hover:bg-slate-200 text-slate-900'
                  }`}
                >
                  {isMetronomeActive ? (
                    <>
                      <Square className="w-4 h-4 fill-current" />
                      <span>Stop Rhythm</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 fill-current" />
                      <span>Start Rhythm Beat</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Illustrated Medical Diagram (if available) */}
            {currentTopic.image && (
              <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
                <img
                  src={currentTopic.image}
                  alt={currentTopic.title}
                  className="w-full max-h-72 object-contain bg-slate-50 dark:bg-slate-950"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            {/* Step-by-Step Action Steps */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
                Immediate Action Steps
              </h4>
              <div className="space-y-3">
                {currentTopic.steps.map((step) => (
                  <div
                    key={step.order}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex gap-3.5"
                  >
                    <div className="w-6 h-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {step.order}
                    </div>
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-slate-900 dark:text-white">
                        {step.title}
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                        {step.description}
                      </p>
                      {step.crucialNote && (
                        <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-900/40 mt-2">
                          ⚠️ {step.crucialNote}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Do's and Don'ts Split Matrix */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Do List */}
              <div className="p-4 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{t.dos}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-emerald-950 dark:text-emerald-200">
                  {currentTopic.doList.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don't List */}
              <div className="p-4 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-red-800 dark:text-red-400 mb-2.5">
                  <XCircle className="w-4 h-4 text-red-600" />
                  <span>{t.donts}</span>
                </div>
                <ul className="space-y-1.5 text-xs text-red-950 dark:text-red-200">
                  {currentTopic.dontList.map((d, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-red-600 font-bold">✕</span>
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Samaritan Tip if applicable */}
            {currentTopic.goodSamaritanTip && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300">
                <span className="font-semibold text-slate-900 dark:text-white">Legal Protection: </span>
                {currentTopic.goodSamaritanTip}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
