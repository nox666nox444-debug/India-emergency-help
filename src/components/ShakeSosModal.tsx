import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Smartphone,
  AlertTriangle,
  Phone,
  MessageSquare,
  ShieldAlert,
  Settings,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  CheckCircle2,
  MapPin,
  RefreshCw,
  ExternalLink,
  Volume2,
  AlertCircle,
  Activity,
  Sliders,
  Check,
} from 'lucide-react';
import {
  ShakeSettings,
  ShakeSensitivity,
  SENSITIVITY_THRESHOLDS,
  getShakeSettings,
  saveShakeSettings,
  isMotionPermissionRequired,
  requestMotionPermission,
  playCountdownBeep,
  LiveMotionData,
} from '../utils/shakeDetector';
import {
  EmergencyContactPerson,
  getSavedContacts,
  saveContacts,
  reorderContacts,
  formatFullPhoneNumber,
  getCurrentLocation,
  UserLocation,
  createGoogleMapsUrl,
  formatCoordinates,
  openSmsSos,
} from '../utils/geolocation';
import { SupportedLang, TRANSLATIONS } from '../data/translations';

interface ShakeSosModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLang;
  initialCountdownActive?: boolean; // When triggered directly by physical shake
}

export const ShakeSosModal: React.FC<ShakeSosModalProps> = ({
  isOpen,
  onClose,
  currentLang,
  initialCountdownActive = false,
}) => {
  const t = TRANSLATIONS[currentLang];

  // Settings State
  const [settings, setSettings] = useState<ShakeSettings>(getShakeSettings);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'prompt' | 'unsupported'>('prompt');
  
  // Emergency Contacts
  const [contacts, setContacts] = useState<EmergencyContactPerson[]>(getSavedContacts);
  const [showAddContact, setShowAddContact] = useState<boolean>(false);
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [newContactRelation, setNewContactRelation] = useState<string>('Family');
  const [newContactCc, setNewContactCc] = useState<string>('+91');

  // Emergency Trigger & Countdown State
  const [isCountingDown, setIsCountingDown] = useState<boolean>(initialCountdownActive);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(5);
  const [sosActivated, setSosActivated] = useState<boolean>(false);
  const [cancelledNotice, setCancelledNotice] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Police 112 Confirmation state
  const [policeConfirmCountdown, setPoliceConfirmCountdown] = useState<number | null>(null);

  // Location State
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationLoading, setLocationLoading] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // Active Tab: 'countdown' | 'action' | 'settings' | 'contacts'
  const [activeTab, setActiveTab] = useState<'action' | 'settings' | 'contacts'>(
    initialCountdownActive ? 'action' : 'action'
  );

  // Live motion meter for sensitivity test
  const [liveMotion, setLiveMotion] = useState<LiveMotionData | null>(null);
  const [testingSensor, setTestingSensor] = useState<boolean>(false);

  const countdownIntervalRef = useRef<any>(null);
  const policeIntervalRef = useRef<any>(null);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setSettings(getShakeSettings());
      setContacts(getSavedContacts());
      setCancelledNotice(false);

      if (initialCountdownActive) {
        startCountdown();
      }

      // Check iOS motion permission status
      if (isMotionPermissionRequired()) {
        setPermissionStatus('prompt');
      } else if (typeof window !== 'undefined' && 'DeviceMotionEvent' in window) {
        setPermissionStatus('granted');
      } else {
        setPermissionStatus('unsupported');
      }
    } else {
      stopCountdown();
      stopPoliceCountdown();
      setTestingSensor(false);
    }
  }, [isOpen, initialCountdownActive]);

  // Handle countdown timer
  const startCountdown = () => {
    setIsCountingDown(true);
    setSosActivated(false);
    setCancelledNotice(false);
    setCountdownSeconds(5);

    // Initial audio alert & haptic
    playCountdownBeep(false);
    if ('vibrate' in navigator) {
      try {
        navigator.vibrate([300, 150, 300]);
      } catch {}
    }

    // Start location fetch immediately in parallel so coordinates are ready
    fetchEmergencyLocation();

    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);

    let count = 5;
    countdownIntervalRef.current = setInterval(() => {
      count -= 1;
      setCountdownSeconds(count);

      if (count > 0) {
        playCountdownBeep(false);
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate(200);
          } catch {}
        }
      } else {
        // Countdown expired -> activate SOS
        clearInterval(countdownIntervalRef.current);
        setIsCountingDown(false);
        setSosActivated(true);
        playCountdownBeep(true);
        if ('vibrate' in navigator) {
          try {
            navigator.vibrate([500, 200, 500, 200, 500]);
          } catch {}
        }
      }
    }, 1000);
  };

  const stopCountdown = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    setIsCountingDown(false);
  };

  const handleCancelSos = () => {
    stopCountdown();
    setSosActivated(false);
    setCancelledNotice(true);
    setTimeout(() => {
      setCancelledNotice(false);
    }, 4000);
  };

  // Location retrieval with proper permission error handling
  const fetchEmergencyLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);
    try {
      const loc = await getCurrentLocation();
      setUserLocation(loc);
    } catch (err: any) {
      setLocationError(err.message || 'Location access denied or unavailable. Emergency calling is still active.');
    } finally {
      setLocationLoading(false);
    }
  };

  // Police 112 Confirmation with 3-second safeguard
  const handleInitiate112Call = () => {
    setPoliceConfirmCountdown(3);
    if (policeIntervalRef.current) clearInterval(policeIntervalRef.current);

    let sec = 3;
    policeIntervalRef.current = setInterval(() => {
      sec -= 1;
      setPoliceConfirmCountdown(sec);
      if (sec <= 0) {
        clearInterval(policeIntervalRef.current);
        setPoliceConfirmCountdown(null);
        // Open native dialer for 112
        window.location.href = 'tel:112';
        setActionNotice('Opening phone dialer for 112... Please tap call to confirm.');
        setTimeout(() => setActionNotice(null), 6000);
      }
    }, 1000);
  };

  const handleImmediate112Call = () => {
    stopPoliceCountdown();
    window.location.href = 'tel:112';
    setActionNotice('Opening phone dialer for 112... Please tap call to confirm.');
    setTimeout(() => setActionNotice(null), 6000);
  };

  const stopPoliceCountdown = () => {
    if (policeIntervalRef.current) {
      clearInterval(policeIntervalRef.current);
      policeIntervalRef.current = null;
    }
    setPoliceConfirmCountdown(null);
  };

  // Family Contact Call
  const handleCallContact = (contact: EmergencyContactPerson) => {
    const fullNumber = formatFullPhoneNumber(contact.countryCode, contact.phone);
    if (!fullNumber) return;
    window.location.href = `tel:${fullNumber.replace(/\s+/g, '')}`;
    setActionNotice(`Opening phone dialer for ${contact.name}... Please confirm call on your phone.`);
    setTimeout(() => setActionNotice(null), 6000);
  };

  // SMS SOS Composition
  const handleSendSmsToContact = (contact: EmergencyContactPerson) => {
    const fullNumber = formatFullPhoneNumber(contact.countryCode, contact.phone);
    let msg = `🚨 EMERGENCY SOS! I need immediate help in India.\n`;
    if (userLocation) {
      msg += `📍 Live Location: ${createGoogleMapsUrl(userLocation.latitude, userLocation.longitude)}\n`;
      msg += `Coordinates: ${formatCoordinates(userLocation.latitude, userLocation.longitude)} (±${userLocation.accuracy}m)\n`;
    } else {
      msg += `📍 Location could not be retrieved. Please call me immediately!\n`;
    }
    msg += `Official Emergency Helpline: 112`;

    openSmsSos(msg, fullNumber);
    setActionNotice(`Opening SMS composer for ${contact.name}... Please review GPS link and tap Send in your SMS app.`);
    setTimeout(() => setActionNotice(null), 6000);
  };

  // Handle Motion Permission Request (iOS)
  const handleRequestPermission = async () => {
    const res = await requestMotionPermission();
    setPermissionStatus(res);
  };

  // Sensitivity Change
  const handleSensitivityChange = (sens: ShakeSensitivity) => {
    const updated: ShakeSettings = { ...settings, sensitivity: sens };
    setSettings(updated);
    saveShakeSettings(updated);
  };

  // Toggle Shake Enabled
  const handleToggleEnabled = () => {
    const updated: ShakeSettings = { ...settings, enabled: !settings.enabled };
    setSettings(updated);
    saveShakeSettings(updated);
  };

  // Contact Operations
  const handleAddContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;

    const newContact: EmergencyContactPerson = {
      id: Date.now().toString(),
      name: newContactName.trim(),
      phone: newContactPhone.trim(),
      relation: newContactRelation,
      countryCode: newContactCc,
      priority: contacts.length + 1,
      enabledForSos: true,
    };

    const updated = [...contacts, newContact];
    setContacts(updated);
    saveContacts(updated);
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContact(false);
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts
      .filter((c) => c.id !== id)
      .map((c, i) => ({ ...c, priority: i + 1 }));
    setContacts(updated);
    saveContacts(updated);
  };

  const handleReorder = (index: number, direction: 'up' | 'down') => {
    const updated = reorderContacts(contacts, index, direction);
    setContacts(updated);
    saveContacts(updated);
  };

  const handleToggleContactEnabled = (id: string) => {
    const updated = contacts.map((c) =>
      c.id === id ? { ...c, enabledForSos: !c.enabledForSos } : c
    );
    setContacts(updated);
    saveContacts(updated);
  };

  // Live motion test listener
  useEffect(() => {
    if (!testingSensor || typeof window === 'undefined') return;

    let lastT = Date.now();
    let lastX = 0, lastY = 0, lastZ = 0;

    const onMotion = (event: DeviceMotionEvent) => {
      const acc = event.acceleration || event.accelerationIncludingGravity;
      if (!acc) return;
      const now = Date.now();
      const dt = now - lastT;
      if (dt < 60) return;

      const x = acc.x || 0;
      const y = acc.y || 0;
      const z = acc.z || 0;
      const dx = Math.abs(x - lastX);
      const dy = Math.abs(y - lastY);
      const dz = Math.abs(z - lastZ);
      const magnitude = (dx + dy + dz) / (dt / 100);

      setLiveMotion({
        x,
        y,
        z,
        magnitude: Math.min(magnitude, 50),
        threshold: SENSITIVITY_THRESHOLDS[settings.sensitivity],
      });

      lastX = x;
      lastY = y;
      lastZ = z;
      lastT = now;
    };

    window.addEventListener('devicemotion', onMotion, false);
    return () => {
      window.removeEventListener('devicemotion', onMotion, false);
    };
  }, [testingSensor, settings.sensitivity]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shake-sos-modal-title"
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4"
    >
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* ======================================================== */}
        {/* 1. CRITICAL 5-SECOND COUNTDOWN OVERLAY                    */}
        {/* ======================================================== */}
        {isCountingDown && (
          <div className="absolute inset-0 z-30 bg-red-600 dark:bg-red-700 text-white flex flex-col items-center justify-between p-6 sm:p-8 animate-in fade-in duration-200">
            {/* Header info */}
            <div className="w-full flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-6 h-6 animate-pulse" />
                <span className="font-extrabold uppercase tracking-wider text-sm sm:text-base">
                  {t.shakeDetected || 'Emergency Shake Detected!'}
                </span>
              </div>
              <span className="text-xs font-mono bg-white/20 px-2.5 py-1 rounded-full">
                Accidental Trigger Safeguard
              </span>
            </div>

            {/* Huge Circular Animated Countdown */}
            <div className="flex flex-col items-center justify-center my-auto py-6">
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center rounded-full border-4 border-white/30 bg-black/20 shadow-2xl">
                {/* Pulsing ring */}
                <div className="absolute inset-0 rounded-full border-4 border-white animate-ping opacity-40" />
                <span className="text-6xl sm:text-7xl font-black font-mono tracking-tighter drop-shadow-md">
                  {countdownSeconds}
                </span>
              </div>
              <p className="mt-4 text-center text-sm sm:text-base font-semibold max-w-sm text-red-50">
                {t.countdownNotice || 'Emergency SOS activating in 5 seconds. Tap below immediately if this was accidental.'}
              </p>
            </div>

            {/* Cancel Button - Large, Prominent, Easy to hit */}
            <div className="w-full max-w-md space-y-3">
              <button
                onClick={handleCancelSos}
                className="w-full py-4 px-6 bg-white active:bg-slate-100 text-red-600 font-black text-lg sm:text-xl rounded-xl shadow-2xl transition-transform active:scale-95 flex items-center justify-center gap-3"
              >
                <X className="w-6 h-6 stroke-[3]" />
                <span>{t.cancelSos || 'CANCEL SOS (FALSE ALARM)'}</span>
              </button>
              <p className="text-center text-xs text-red-100/90">
                Pressing cancel immediately aborts calling and SMS alerts.
              </p>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. MODAL HEADER                                          */}
        {/* ======================================================== */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-sm">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2
                id="shake-sos-modal-title"
                className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2"
              >
                <span>{t.shakeSosTitle || 'Shake-to-Emergency SOS'}</span>
                {settings.enabled ? (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-full">
                    Active
                  </span>
                ) : (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-full">
                    Disabled
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Firm device shake triggers 112 police emergency and family GPS dispatch.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close Shake SOS modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ======================================================== */}
        {/* 3. NAVIGATION TABS                                       */}
        {/* ======================================================== */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-5 bg-white dark:bg-slate-900 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('action')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors ${
              activeTab === 'action'
                ? 'border-red-600 text-red-600 dark:text-red-400 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Emergency Dispatch & 112
          </button>
          <button
            onClick={() => setActiveTab('contacts')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'contacts'
                ? 'border-red-600 text-red-600 dark:text-red-400 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Family Contacts</span>
            <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded-full text-[10px]">
              {contacts.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`py-3 px-4 border-b-2 font-medium transition-colors flex items-center gap-1.5 ${
              activeTab === 'settings'
                ? 'border-red-600 text-red-600 dark:text-red-400 font-bold'
                : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Sensitivity & Sensor</span>
          </button>
        </div>

        {/* Cancel Confirmation Banner */}
        {cancelledNotice && (
          <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>SOS Cancelled. No emergency calls or messages were placed.</span>
          </div>
        )}

        {/* User Action Feedback Banner */}
        {actionNotice && (
          <div className="bg-blue-600 text-white text-xs font-bold py-2.5 px-4 text-center flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>{actionNotice}</span>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-5 space-y-6 flex-1">
          {/* ======================================================== */}
          {/* TAB 1: EMERGENCY DISPATCH & POLICE 112                   */}
          {/* ======================================================== */}
          {activeTab === 'action' && (
            <div className="space-y-6">
              {/* Test Trigger / Status Banner */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white text-sm">
                    <Smartphone className="w-4 h-4 text-red-600" />
                    <span>Shake SOS Protection Status</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Sensitivity: <strong className="capitalize text-slate-700 dark:text-slate-300">{settings.sensitivity}</strong> (Debounce: 10s cooldown).
                  </p>
                </div>
                <button
                  onClick={startCountdown}
                  className="px-3.5 py-2 text-xs font-bold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 rounded-lg hover:bg-red-100 transition-colors whitespace-nowrap"
                >
                  Test 5-Second SOS Trigger
                </button>
              </div>

              {/* SECTION: POLICE EMERGENCY 112 */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950/40 dark:to-orange-950/20 border-2 border-red-200 dark:border-red-900/60">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-red-600 text-white font-extrabold text-xs flex items-center justify-center">
                      112
                    </span>
                    <div>
                      <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                        {t.policeEmergency112 || 'Official Police Emergency 112'}
                      </h3>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        National ERSS toll-free helpline across all Indian States & Union Territories.
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/50 px-2 py-0.5 rounded">
                    Toll-Free 24x7
                  </span>
                </div>

                {/* 3-Second Confirmation Countdown for 112 Dialing */}
                {policeConfirmCountdown !== null ? (
                  <div className="bg-red-600 text-white p-4 rounded-xl text-center space-y-2 animate-in fade-in">
                    <div className="text-xs font-bold uppercase tracking-wider">
                      Opening Phone Emergency Dialer in:
                    </div>
                    <div className="text-4xl font-black font-mono">
                      {policeConfirmCountdown}
                    </div>
                    <div className="flex justify-center gap-2 pt-1">
                      <button
                        onClick={stopPoliceCountdown}
                        className="px-4 py-1.5 bg-white text-red-600 text-xs font-extrabold rounded-lg hover:bg-slate-100"
                      >
                        Cancel Call
                      </button>
                      <button
                        onClick={handleImmediate112Call}
                        className="px-4 py-1.5 bg-black/30 hover:bg-black/50 text-white text-xs font-bold rounded-lg"
                      >
                        Call Now (Skip)
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleInitiate112Call}
                    className="w-full py-3.5 px-4 bg-red-600 hover:bg-red-700 text-white font-black text-sm rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  >
                    <Phone className="w-5 h-5 fill-current" />
                    <span>Call Police 112 (With Confirmation)</span>
                  </button>
                )}

                <p className="mt-2 text-[11px] text-slate-500 dark:text-slate-400 text-center">
                  In compliance with OS policies, calls open your phone's official dialer with confirmation. No repeated automated dialing.
                </p>
              </div>

              {/* SECTION: LIVE LOCATION SOS */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    <MapPin className="w-4 h-4 text-red-600" />
                    <span>Emergency GPS Coordinates</span>
                  </div>
                  <button
                    onClick={fetchEmergencyLocation}
                    disabled={locationLoading}
                    className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 flex items-center gap-1"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${locationLoading ? 'animate-spin' : ''}`} />
                    <span>Refresh GPS</span>
                  </button>
                </div>

                {locationLoading ? (
                  <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs text-slate-500 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin text-red-600" />
                    <span>Acquiring satellite GPS lock...</span>
                  </div>
                ) : userLocation ? (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-xl space-y-1.5 text-xs">
                    <div className="flex items-center justify-between font-bold text-emerald-900 dark:text-emerald-300">
                      <span>Coordinates Locked:</span>
                      <span className="font-mono">{formatCoordinates(userLocation.latitude, userLocation.longitude)}</span>
                    </div>
                    <div className="text-[11px] text-emerald-700 dark:text-emerald-400 flex items-center justify-between">
                      <span>Accuracy: ±{userLocation.accuracy} meters</span>
                      <a
                        href={createGoogleMapsUrl(userLocation.latitude, userLocation.longitude)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline flex items-center gap-1 font-semibold"
                      >
                        Preview Map <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <AlertCircle className="w-4 h-4 text-amber-600" />
                      <span>{locationError || 'Location not locked yet.'}</span>
                    </div>
                    <p className="text-[11px] text-amber-700 dark:text-amber-400">
                      If location permission is denied, emergency phone calling remains 100% active.
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION: FAMILY EMERGENCY CONTACTS DISPATCH */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    {t.familyContacts || 'Family Emergency Contacts'}
                  </h4>
                  <button
                    onClick={() => setActiveTab('contacts')}
                    className="text-xs text-red-600 dark:text-red-400 font-semibold hover:underline"
                  >
                    Manage Contacts & Priority
                  </button>
                </div>

                {contacts.length === 0 ? (
                  <div className="p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 text-center text-xs text-slate-500">
                    No family emergency contacts configured yet.
                    <button
                      onClick={() => setActiveTab('contacts')}
                      className="mt-2 block mx-auto text-red-600 font-bold"
                    >
                      + Add Family Contacts
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {contacts.map((contact, idx) => (
                      <div
                        key={contact.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center">
                            #{contact.priority || idx + 1}
                          </span>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                              {contact.name}
                              <span className="ml-1.5 text-[11px] font-normal text-slate-500">
                                ({contact.relation})
                              </span>
                            </div>
                            <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
                              {formatFullPhoneNumber(contact.countryCode, contact.phone) || 'No phone set'}
                            </div>
                          </div>
                        </div>

                        {/* Direct Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleCallContact(contact)}
                            disabled={!contact.phone}
                            title="Call Contact"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5 fill-current" />
                            <span>Call</span>
                          </button>
                          <button
                            onClick={() => handleSendSmsToContact(contact)}
                            disabled={!contact.phone}
                            title="Send Location SOS SMS"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold text-xs rounded-lg transition-colors"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>SMS SOS</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: EMERGENCY CONTACTS MANAGEMENT                     */}
          {/* ======================================================== */}
          {activeTab === 'contacts' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">
                    Trusted Family Emergency Contacts
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Add family members with country codes. Reorder to configure calling priority.
                  </p>
                </div>
                <button
                  onClick={() => setShowAddContact(!showAddContact)}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Contact</span>
                </button>
              </div>

              {/* Add Contact Form */}
              {showAddContact && (
                <form
                  onSubmit={handleAddContactSubmit}
                  className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/50 dark:bg-red-950/20 space-y-3"
                >
                  <h4 className="font-bold text-xs uppercase tracking-wider text-red-700 dark:text-red-400">
                    Add New Emergency Contact
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={newContactName}
                        onChange={(e) => setNewContactName(e.target.value)}
                        placeholder="e.g. Papa / Priya Sharma"
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Relationship
                      </label>
                      <select
                        value={newContactRelation}
                        onChange={(e) => setNewContactRelation(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        <option value="Father">Father</option>
                        <option value="Mother">Mother</option>
                        <option value="Spouse">Spouse</option>
                        <option value="Sibling">Brother / Sister</option>
                        <option value="Child">Son / Daughter</option>
                        <option value="Friend">Trusted Friend</option>
                        <option value="Doctor">Family Doctor</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    <div className="col-span-1">
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Country Code
                      </label>
                      <select
                        value={newContactCc}
                        onChange={(e) => setNewContactCc(e.target.value)}
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      >
                        <option value="+91">🇮🇳 +91 (India)</option>
                        <option value="+1">🇺🇸 +1 (US/CA)</option>
                        <option value="+44">🇬🇧 +44 (UK)</option>
                        <option value="+971">🇦🇪 +971 (UAE)</option>
                        <option value="+65">🇸🇬 +65 (SG)</option>
                        <option value="+61">🇦🇺 +61 (AU)</option>
                      </select>
                    </div>
                    <div className="col-span-2 sm:col-span-3">
                      <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        required
                        value={newContactPhone}
                        onChange={(e) => setNewContactPhone(e.target.value)}
                        placeholder="e.g. 9876543210"
                        className="w-full text-xs p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddContact(false)}
                      className="px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 rounded-lg"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-1.5 text-xs font-bold bg-red-600 text-white rounded-lg hover:bg-red-700"
                    >
                      Save Contact
                    </button>
                  </div>
                </form>
              )}

              {/* Contacts List with Priority Ordering */}
              <div className="space-y-2">
                {contacts.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-500">
                    No contacts saved. Add at least one family member so Shake SOS can alert them.
                  </div>
                ) : (
                  contacts.map((contact, index) => (
                    <div
                      key={contact.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3"
                    >
                      {/* Priority and Details */}
                      <div className="flex items-center gap-3">
                        {/* Priority indicator */}
                        <div className="flex flex-col items-center justify-center">
                          <button
                            onClick={() => handleReorder(index, 'up')}
                            disabled={index === 0}
                            className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                            aria-label="Move priority up"
                          >
                            <ChevronUp className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                            #{contact.priority || index + 1}
                          </span>
                          <button
                            onClick={() => handleReorder(index, 'down')}
                            disabled={index === contacts.length - 1}
                            className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-20"
                            aria-label="Move priority down"
                          >
                            <ChevronDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div>
                          <div className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{contact.name}</span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                              {contact.relation}
                            </span>
                          </div>
                          <div className="text-xs font-mono text-slate-500">
                            {formatFullPhoneNumber(contact.countryCode, contact.phone)}
                          </div>
                        </div>
                      </div>

                      {/* Delete */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteContact(contact.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete contact"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: SHAKE SENSITIVITY & SENSOR SETTINGS               */}
          {/* ======================================================== */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Enable / Disable Master Toggle */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white text-sm">
                    Shake-to-Emergency Detection
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Continuously monitor device accelerometer for deliberate emergency shaking.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleEnabled}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                    settings.enabled ? 'bg-red-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                  aria-label="Toggle shake detection"
                >
                  <div
                    className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      settings.enabled ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* iOS Sensor Permission if required */}
              {isMotionPermissionRequired() && (
                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                      iOS Safari Motion Sensor Permission:
                    </span>
                    <span className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-400">
                      {permissionStatus}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-800 dark:text-blue-300">
                    Apple iOS 13+ requires user permission to access motion sensors in Safari.
                  </p>
                  <button
                    onClick={handleRequestPermission}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg"
                  >
                    Grant Sensor Access
                  </button>
                </div>
              )}

              {/* Sensitivity Selector */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  {t.sensitivityLabel || 'Shake Sensitivity'}
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['low', 'medium', 'high'] as ShakeSensitivity[]).map((level) => {
                    const isSelected = settings.sensitivity === level;
                    const threshold = SENSITIVITY_THRESHOLDS[level];
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => handleSensitivityChange(level)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-red-600 bg-red-50/60 dark:bg-red-950/40 text-red-900 dark:text-red-200 shadow-sm'
                            : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-xs capitalize">{level}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-red-600" />}
                        </div>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">
                          {level === 'low'
                            ? 'Firm, vigorous shake'
                            : level === 'medium'
                            ? 'Standard deliberate shake'
                            : 'Light deliberate shake'}
                        </p>
                        <div className="text-[10px] font-mono mt-1 opacity-75">
                          ~{threshold} m/s²
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accidental Protection Details */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-600" />
                  <span>Accidental Trigger Safeguards</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                  <li><strong>Multi-Peak Confirmation:</strong> Requires at least two distinct directional motion peaks within 800ms. A single bump or phone drop will not activate SOS.</li>
                  <li><strong>5-Second Cancellation Window:</strong> Full-screen audible countdown allows cancelling before calls or SMS are dispatched.</li>
                  <li><strong>10-Second Cooldown Debounce:</strong> Prevents repeated triggers and duplicate emergency dials.</li>
                </ul>
              </div>

              {/* Live Sensor Calibration Tool */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-amber-500" />
                    <span>Live Sensor Calibration Gauge</span>
                  </div>
                  <button
                    onClick={() => setTestingSensor(!testingSensor)}
                    className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300"
                  >
                    {testingSensor ? 'Stop Gauge' : 'Start Live Gauge'}
                  </button>
                </div>

                {testingSensor && liveMotion ? (
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-mono">
                      <span>Acceleration: {liveMotion.magnitude.toFixed(1)} m/s²</span>
                      <span>Trigger Threshold: {liveMotion.threshold} m/s²</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-75 ${
                          liveMotion.magnitude >= liveMotion.threshold ? 'bg-red-600' : 'bg-emerald-500'
                        }`}
                        style={{
                          width: `${Math.min(100, (liveMotion.magnitude / 40) * 100)}%`,
                        }}
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 text-center">
                      Shake your phone gently or firmly to observe the gauge.
                    </p>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500">
                    Tap "Start Live Gauge" to test real-time phone acceleration and adjust your sensitivity without triggering SOS.
                  </p>
                )}
              </div>

              {/* Operating System & Background Clarification */}
              <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-xs space-y-1.5">
                <div className="font-bold text-slate-900 dark:text-white">
                  Platform Compatibility & Background Limitations:
                </div>
                <p className="text-[11px] leading-relaxed">
                  Web browsers allow accelerometer detection while this application is open and active in the foreground. For 24/7 background shake detection with screen locked, native Android/iOS background service is required (included in the companion Flutter mobile app).
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between text-xs">
          <div className="text-slate-500 text-[11px]">
            National Emergency: <strong className="text-red-600">112</strong> · Toll-Free 24x7
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
