import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Send,
  MessageSquare,
  Copy,
  Check,
  RefreshCw,
  Plus,
  Trash2,
  AlertCircle,
  ExternalLink,
  Phone,
} from 'lucide-react';
import {
  UserLocation,
  getCurrentLocation,
  formatCoordinates,
  createGoogleMapsUrl,
  composeSosMessage,
  openWhatsAppSos,
  openSmsSos,
  getSavedContacts,
  saveContacts,
  EmergencyContactPerson,
} from '../utils/geolocation';
import { SupportedLang, TRANSLATIONS } from '../data/translations';

interface SosBeaconModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLang: SupportedLang;
}

export const SosBeaconModal: React.FC<SosBeaconModalProps> = ({
  isOpen,
  onClose,
  currentLang,
}) => {
  const t = TRANSLATIONS[currentLang];
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [loadingLoc, setLoadingLoc] = useState<boolean>(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [situationNote, setSituationNote] = useState<string>('');
  const [consentGiven, setConsentGiven] = useState<boolean>(false);
  const [sessionDuration, setSessionDuration] = useState<number>(60);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [sessionExpiresAt, setSessionExpiresAt] = useState<number | null>(null);
  const [sessionLoading, setSessionLoading] = useState<boolean>(false);
  const [contacts, setContacts] = useState<EmergencyContactPerson[]>([]);
  const [newContactName, setNewContactName] = useState<string>('');
  const [newContactPhone, setNewContactPhone] = useState<string>('');
  const [showAddContact, setShowAddContact] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      setContacts(getSavedContacts());
      fetchLocation();
    }
  }, [isOpen]);

  const fetchLocation = async () => {
    setLoadingLoc(true);
    setLocationError(null);
    try {
      const loc = await getCurrentLocation();
      setLocation(loc);
    } catch (err: any) {
      setLocationError(err.message || 'Unable to retrieve location');
    } finally {
      setLoadingLoc(false);
    }
  };

  const handleCopyCoordinates = () => {
    if (!location) return;
    const msg = composeSosMessage(location, situationNote);
    navigator.clipboard.writeText(msg);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSendWhatsAppToContact = (phone?: string) => {
    const msg = composeSosMessage(location || undefined, situationNote);
    openWhatsAppSos(msg, phone);
  };

  const handleSendSmsToContact = (phone?: string) => {
    const msg = composeSosMessage(location || undefined, situationNote);
    openSmsSos(msg, phone);
  };

  const handleCreateLiveSession = async () => {
    if (!location) return;
    setSessionLoading(true);
    try {
      const res = await fetch('/api/emergency-session/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude: location.latitude,
          longitude: location.longitude,
          accuracy: location.accuracy,
          durationMinutes: sessionDuration,
          situationNote,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActiveSessionId(data.sessionId);
        setShareUrl(data.shareUrl);
        setSessionExpiresAt(data.expiresAt);
      }
    } catch (err) {
      console.error('Failed to create location session', err);
    } finally {
      setSessionLoading(false);
    }
  };

  const handleTerminateLiveSession = async () => {
    if (!activeSessionId) return;
    try {
      await fetch(`/api/emergency-session/${activeSessionId}/terminate`, {
        method: 'POST',
      });
    } catch {}
    setActiveSessionId(null);
    setShareUrl(null);
    setSessionExpiresAt(null);
  };

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContactName.trim() || !newContactPhone.trim()) return;
    const updated: EmergencyContactPerson[] = [
      ...contacts,
      {
        id: Date.now().toString(),
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        relation: 'Emergency Contact',
      },
    ];
    setContacts(updated);
    saveContacts(updated);
    setNewContactName('');
    setNewContactPhone('');
    setShowAddContact(false);
  };

  const handleDeleteContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    saveContacts(updated);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-red-600 text-white">
          <div className="flex items-center gap-2.5">
            <MapPin className="w-5 h-5 text-white" />
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight">
                {t.sosBeaconBtn} (Instant Location Dispatch)
              </h2>
              <p className="text-xs text-red-100">
                Share live GPS coordinates with family & rescue services
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white hover:bg-red-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Location Status Card */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {t.gpsActive}
                </span>
                {location && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    · Locked within ±{location.accuracy}m
                  </span>
                )}
              </div>
              <button
                onClick={fetchLocation}
                disabled={loadingLoc}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingLoc ? 'animate-spin' : ''}`} />
                <span>{loadingLoc ? 'Acquiring...' : 'Refresh GPS'}</span>
              </button>
            </div>

            {loadingLoc && (
              <div className="py-4 text-center">
                <div className="inline-block w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin mb-2" />
                <p className="text-xs text-slate-500">{t.gpsLocating}</p>
              </div>
            )}

            {locationError && !loadingLoc && (
              <div className="flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/40 text-amber-800 dark:text-amber-300 text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
                <div>
                  <p className="font-semibold">Location Access Needed</p>
                  <p className="mt-0.5">{locationError}</p>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    You can still send emergency WhatsApp/SMS messages below.
                  </p>
                </div>
              </div>
            )}

            {location && !loadingLoc && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1 p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
                  <div className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white tabular-nums">
                    {formatCoordinates(location.latitude, location.longitude)}
                  </div>
                  <a
                    href={createGoogleMapsUrl(location.latitude, location.longitude)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    <span>View on Google Maps</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyCoordinates}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors min-h-[38px]"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Coordinates Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy Coordinates & SOS Text</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Situation note (optional) */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Situation Description (Optional - will be added to SOS message)
            </label>
            <input
              type="text"
              value={situationNote}
              onChange={(e) => setSituationNote(e.target.value)}
              placeholder="e.g. Car breakdown near highway toll / Medical breathing trouble / Need urgent rescue"
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          {/* Consent Checkbox */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
            <input
              type="checkbox"
              id="sos-consent"
              checked={consentGiven}
              onChange={(e) => setConsentGiven(e.target.checked)}
              className="w-4 h-4 mt-0.5 rounded text-red-600 focus:ring-red-500 accent-red-600 cursor-pointer"
            />
            <label htmlFor="sos-consent" className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed cursor-pointer select-none">
              <span className="font-bold">Explicit Location Sharing Consent:</span> I consent to sharing my live GPS coordinates and situation notes with my selected contacts or rescue dispatchers.
            </label>
          </div>

          {/* Expiring Live Session Controls */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 border border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
                  Expiring Live Tracking Session (Backend Secured)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Generates an encrypted temporary tracking link for family. Auto-expires.
                </p>
              </div>
              {activeSessionId && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white animate-pulse">
                  LIVE ACTIVE
                </span>
              )}
            </div>

            {!activeSessionId ? (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Session Duration:</span>
                  {[15, 60, 240].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setSessionDuration(mins)}
                      className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                        sessionDuration === mins
                          ? 'bg-red-600 text-white'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  disabled={!consentGiven || !location || sessionLoading}
                  onClick={handleCreateLiveSession}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                >
                  {sessionLoading ? 'Creating Secure Session...' : 'Start Expiring Live Session'}
                </button>
                {!consentGiven && (
                  <p className="text-[10px] text-amber-400">
                    * Please check the consent box above before starting live tracking.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3 pt-1">
                <div className="p-2.5 bg-slate-800 rounded-lg text-xs font-mono break-all text-slate-200">
                  {shareUrl}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (shareUrl) {
                        navigator.clipboard.writeText(shareUrl);
                        setCopiedLink(true);
                        setTimeout(() => setCopiedLink(false), 2000);
                      }
                    }}
                    className="flex-1 py-2 bg-white text-slate-900 font-bold text-xs rounded-lg"
                  >
                    {copiedLink ? 'Link Copied!' : 'Copy Tracking Link'}
                  </button>
                  <button
                    type="button"
                    onClick={handleTerminateLiveSession}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-red-400 font-semibold text-xs rounded-lg"
                  >
                    Terminate Session
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Quick Broadcast CTAs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => {
                if (!consentGiven) {
                  alert('Please check the consent box above before dispatching your SOS location.');
                  return;
                }
                handleSendWhatsAppToContact();
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 min-h-[48px]"
            >
              <Send className="w-4 h-4" />
              <span>{t.whatsappSos}</span>
            </button>
            <button
              onClick={() => {
                if (!consentGiven) {
                  alert('Please check the consent box above before dispatching your SOS location.');
                  return;
                }
                handleSendSmsToContact();
              }}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm rounded-xl shadow-md transition-all active:scale-95 min-h-[48px]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>{t.smsSos} (Works Offline)</span>
            </button>
          </div>

          {/* Personal Emergency Contacts Section */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Personal Emergency Contacts
              </h3>
              <button
                onClick={() => setShowAddContact(!showAddContact)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400 hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddContact ? 'Cancel' : 'Add Contact'}</span>
              </button>
            </div>

            {showAddContact && (
              <form onSubmit={handleAddContact} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-3 space-y-2 border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Contact Name (e.g., Mom, Spouse)"
                    value={newContactName}
                    onChange={(e) => setNewContactName(e.target.value)}
                    className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    required
                  />
                  <input
                    type="tel"
                    placeholder="Phone number (+91...)"
                    value={newContactPhone}
                    onChange={(e) => setNewContactPhone(e.target.value)}
                    className="px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity"
                >
                  Save Emergency Contact
                </button>
              </form>
            )}

            <div className="space-y-2">
              {contacts.map((contact) => (
                <div
                  key={contact.id}
                  className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
                >
                  <div>
                    <div className="text-sm font-semibold text-slate-900 dark:text-white">
                      {contact.name}
                    </div>
                    <div className="text-xs text-slate-500 font-mono">
                      {contact.phone || 'No phone set yet'}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {contact.phone && (
                      <>
                        <a
                          href={`tel:${contact.phone}`}
                          className="p-2 text-slate-600 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400 bg-slate-100 dark:bg-slate-800 rounded-lg"
                          title="Call Contact"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => handleSendWhatsAppToContact(contact.phone)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg hover:bg-emerald-100"
                          title="WhatsApp SOS"
                        >
                          WhatsApp SOS
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDeleteContact(contact.id)}
                      className="p-2 text-slate-400 hover:text-red-500"
                      title="Remove contact"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>In acute danger, always dial 112 first.</span>
          <button
            onClick={onClose}
            className="px-4 py-2 font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
