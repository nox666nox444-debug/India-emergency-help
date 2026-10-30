import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  AlertTriangle,
  Phone,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Loader2,
} from 'lucide-react';
import { SupportedLang, TRANSLATIONS, LANGUAGE_OPTIONS } from '../data/translations';

interface AiTriageModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLang;
}

interface TriageResult {
  isAi: boolean;
  summary: string;
  immediateSteps: string[];
  whatNotToDo: string[];
  recommendedIndianHelpline: string;
  goodSamaritanNote?: string;
}

const PRESET_SCENARIOS = [
  'Unresponsive person not breathing',
  'Snakebite on foot or leg',
  'Severe bleeding from limb cut',
  'Victim choking, unable to speak',
  'Boiling liquid or deep thermal burn',
  'Unauthorized UPI bank debit in last hour',
];

export const AiTriageModal: React.FC<AiTriageModalProps> = ({
  isOpen,
  onClose,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang];
  const langName =
    LANGUAGE_OPTIONS.find((l) => l.code === currentLang)?.label || 'English';

  const [promptInput, setPromptInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (queryText?: string) => {
    const query = queryText || promptInput;
    if (!query.trim()) return;

    setLoading(true);
    setErrorMsg(null);
    setResult(null);

    try {
      const response = await fetch('/api/emergency-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: query.trim(),
          language: langName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned error status ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      console.warn('AI Triage network request failed, falling back to local rule-based engine:', err);
      // Seamless offline fallback
      setResult({
        isAi: false,
        summary: `Standard Emergency Protocol for "${query}". Urgency Level: HIGH. Immediately dial 112 / 108.`,
        immediateSteps: [
          'Verify that the surrounding environment is safe from oncoming traffic, live electrical wires, or fire.',
          'Call 112 (National Emergency) or 108 (Free Medical Ambulance) immediately.',
          'Keep the patient calm, lying down, and monitor their airway and normal chest rise.',
          'Apply direct clean pressure on bleeding or start Hands-Only CPR if completely unresponsive.',
        ],
        whatNotToDo: [
          'Do NOT give liquids or water to any semi-conscious or unconscious person.',
          'Do NOT make cuts on snakebites or tie tight ropes.',
          'Do NOT leave the patient alone until paramedics arrive.',
        ],
        recommendedIndianHelpline: '112 / 108',
        goodSamaritanNote: 'Good Samaritans in India are legally protected by the Supreme Court of India from harassment, hospital deposit demands, or police witness compulsion.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-red-600">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {t.aiAdvisorTitle}
              </h2>
              <p className="text-xs text-slate-400">
                Gemini 3.8 Flash Emergency First-Aid & Triage Intelligence
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Quick preset scenario buttons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Select Quick Emergency Scenario
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_SCENARIOS.map((scenario) => (
                <button
                  key={scenario}
                  onClick={() => {
                    setPromptInput(scenario);
                    handleSubmit(scenario);
                  }}
                  className="px-3 py-1.5 text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg transition-colors min-h-[32px] text-left"
                >
                  {scenario}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmit();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Or describe the emergency (e.g., patient fell down, head wound bleeding)..."
              className="flex-1 px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
            <button
              type="submit"
              disabled={loading || !promptInput.trim()}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shrink-0 min-h-[44px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Get Advice</span>
                </>
              )}
            </button>
          </form>

          {/* Results Area */}
          {result && (
            <div className="p-5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-4">
              {/* Summary Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-700">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400">
                    Triage Assessment ({langName})
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {result.summary}
                  </h3>
                </div>

                {result.recommendedIndianHelpline && (
                  <a
                    href={`tel:${result.recommendedIndianHelpline.split('/')[0].trim()}`}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg whitespace-nowrap shrink-0 min-h-[40px]"
                  >
                    <Phone className="w-3.5 h-3.5 fill-current" />
                    <span>Dial {result.recommendedIndianHelpline}</span>
                  </a>
                )}
              </div>

              {/* Immediate 60-Second Steps */}
              {result.immediateSteps && result.immediateSteps.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                    Immediate Physical Actions (Next 60 Seconds)
                  </h4>
                  <div className="space-y-2">
                    {result.immediateSteps.map((step, idx) => (
                      <div
                        key={idx}
                        className="flex items-start gap-2.5 p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed"
                      >
                        <span className="w-5 h-5 rounded-full bg-red-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* What NOT to do */}
              {result.whatNotToDo && result.whatNotToDo.length > 0 && (
                <div className="p-3.5 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/40">
                  <div className="flex items-center gap-1.5 text-xs font-bold uppercase text-red-700 dark:text-red-400 mb-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span>Critical Mistakes to Avoid</span>
                  </div>
                  <ul className="space-y-1 text-xs text-red-900 dark:text-red-200">
                    {result.whatNotToDo.map((warn, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-red-600 font-bold shrink-0">✕</span>
                        <span>{warn}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Good Samaritan reassurance */}
              {result.goodSamaritanNote && (
                <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Note:
                  </span>{' '}
                  {result.goodSamaritanNote}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>{t.disclaimer}</span>
          <button
            onClick={onClose}
            className="font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
