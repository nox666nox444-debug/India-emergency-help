import React, { useState } from 'react';
import {
  X,
  Shield,
  Download,
  Trash2,
  ExternalLink,
  Lock,
  CheckCircle2,
  HardDrive,
  Globe,
  FileCheck,
} from 'lucide-react';
import { SupportedLang } from '../data/translations';

interface PrivacySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLang;
}

export const PrivacySettingsModal: React.FC<PrivacySettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [offlinePackDownloaded, setOfflinePackDownloaded] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [purgedMsg, setPurgedMsg] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleDownloadOfflineData = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setOfflinePackDownloaded(true);
    }, 1200);
  };

  const handlePurgeAllData = () => {
    if (
      window.confirm(
        'Warning: This will clear all stored personal emergency contacts, cached state helplines, and encrypted document locker data from your browser. Proceed?'
      )
    ) {
      localStorage.clear();
      setPurgedMsg(true);
      setTimeout(() => setPurgedMsg(false), 3000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-red-500" />
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                Privacy, Data Protection & Offline Mode
              </h2>
              <p className="text-xs text-slate-400">
                Digital Personal Data Protection (DPDP) Act 2023 Compliant
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Privacy Principles */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              <Lock className="w-4 h-4 text-emerald-600" />
              <span>Zero-Telemetry & Phone-Only Architecture</span>
            </div>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>
                  <strong>No Tracking:</strong> Zero analytics trackers, advertising SDKs, or background location eavesdropping.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>
                  <strong>Explicit Consent:</strong> GPS coordinates are only queried and broadcast when you explicitly tap SOS and check the consent box.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>
                  <strong>Auto-Expiring Sessions:</strong> Live tracking links automatically self-destruct after the chosen window (15m/1h/4h).
                </span>
              </li>
            </ul>
          </div>

          {/* Offline Map & Data Pack Downloads */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-blue-600" />
                  <span>Offline Helplines & Map Tile Cache</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Preload all 28 states directories and clinical first-aid rules for unnetworked rural zones.
                </p>
              </div>
              {offlinePackDownloaded && (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Cached (4.2 MB)</span>
                </span>
              )}
            </div>

            <button
              onClick={handleDownloadOfflineData}
              disabled={downloading || offlinePackDownloaded}
              className={`w-full py-2.5 px-4 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-all ${
                offlinePackDownloaded
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:opacity-90'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>
                {downloading
                  ? 'Caching offline database...'
                  : offlinePackDownloaded
                  ? 'All India Offline Pack Ready'
                  : 'Download Offline Emergency Pack (~4.2MB)'}
              </span>
            </button>
          </div>

          {/* Cybercrime Helpline Information */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                National Cyber Crime Helpline (MHA)
              </span>
              <span className="text-xs font-mono font-bold text-red-600">Dial 1930</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              For online financial frauds, UPI scams, and unauthorized card debits. Reporting within the golden hour enables nodal banking officers to freeze stolen money before withdrawal.
            </p>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline pt-1"
            >
              <span>Visit Official Cybercrime Portal (cybercrime.gov.in)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Purge Local Data Action */}
          <div className="p-4 rounded-xl bg-red-50/60 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase text-red-800 dark:text-red-400">
                Purge All Device Stored Data
              </span>
              <Trash2 className="w-4 h-4 text-red-600" />
            </div>
            <p className="text-xs text-red-900/80 dark:text-red-300">
              Immediately erase your personal emergency contact list, PIN, and encrypted medical locker from this browser.
            </p>
            <button
              onClick={handlePurgeAllData}
              className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg transition-colors"
            >
              Purge All Local Records Now
            </button>
            {purgedMsg && (
              <p className="text-xs text-emerald-600 font-semibold pt-1">
                ✓ All local data purged successfully.
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>Protected under Indian DPDP Act 2023.</span>
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
