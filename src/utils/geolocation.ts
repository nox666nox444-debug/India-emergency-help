export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  altitude?: number | null;
  speed?: number | null;
  address?: string;
}

export interface EmergencyContactPerson {
  id: string;
  name: string;
  phone: string;
  relation: string;
  countryCode?: string; // e.g. '+91'
  priority?: number;
  enabledForSos?: boolean;
}

const CONTACTS_STORAGE_KEY = 'india_emergency_personal_contacts_v1';

export function formatFullPhoneNumber(countryCode?: string, phone?: string): string {
  if (!phone) return '';
  const clean = phone.trim();
  if (clean.startsWith('+')) return clean;
  const cc = countryCode && countryCode.trim() ? countryCode.trim() : '+91';
  return `${cc}${clean.replace(/^0+/, '')}`;
}

export function getSavedContacts(): EmergencyContactPerson[] {
  try {
    const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!raw) {
      return [
        {
          id: '1',
          name: 'Primary Family Contact',
          phone: '',
          relation: 'Family',
          countryCode: '+91',
          priority: 1,
          enabledForSos: true,
        },
      ];
    }
    const list: EmergencyContactPerson[] = JSON.parse(raw);
    return list.map((c, i) => ({
      countryCode: c.countryCode || '+91',
      priority: c.priority ?? i + 1,
      enabledForSos: c.enabledForSos ?? true,
      ...c,
    }));
  } catch {
    return [];
  }
}

export function saveContacts(contacts: EmergencyContactPerson[]) {
  try {
    localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(contacts));
  } catch (err) {
    console.error('Failed to save contacts', err);
  }
}

export function reorderContacts(
  contacts: EmergencyContactPerson[],
  index: number,
  direction: 'up' | 'down'
): EmergencyContactPerson[] {
  const targetIndex = direction === 'up' ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= contacts.length) return contacts;
  const copy = [...contacts];
  const [removed] = copy.splice(index, 1);
  copy.splice(targetIndex, 0, removed);
  return copy.map((c, i) => ({ ...c, priority: i + 1 }));
}

export function getCurrentLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      return reject(new Error('Geolocation is not supported by your browser or device.'));
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy),
          timestamp: pos.timestamp,
          altitude: pos.coords.altitude,
          speed: pos.coords.speed,
        });
      },
      (err) => {
        // If high-accuracy GPS satellite lock times out (common indoors), attempt fallback with network/Wi-Fi positioning
        if (err.code === err.TIMEOUT) {
          navigator.geolocation.getCurrentPosition(
            (fallbackPos) => {
              resolve({
                latitude: fallbackPos.coords.latitude,
                longitude: fallbackPos.coords.longitude,
                accuracy: Math.round(fallbackPos.coords.accuracy),
                timestamp: fallbackPos.timestamp,
                altitude: fallbackPos.coords.altitude,
                speed: fallbackPos.coords.speed,
              });
            },
            () => {
              reject(
                new Error(
                  'Location request timed out. Please check that GPS / Location Services are turned on in your device settings.'
                )
              );
            },
            {
              enableHighAccuracy: false,
              timeout: 6000,
              maximumAge: 60000,
            }
          );
          return;
        }

        let msg = 'Failed to retrieve location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser or app settings to dispatch your SOS coordinates.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is currently unavailable on your device.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 9000,
        maximumAge: 0,
      }
    );
  });
}

export function formatCoordinates(lat: number, lng: number): string {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(5)}° ${latDir}, ${Math.abs(lng).toFixed(5)}° ${lngDir}`;
}

export function createGoogleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function composeSosMessage(location?: UserLocation, customNotes?: string): string {
  let text = '🚨 EMERGENCY SOS ALERT! I need immediate help in India.\n\n';
  if (customNotes && customNotes.trim()) {
    text += `Situation: ${customNotes.trim()}\n\n`;
  }
  if (location) {
    text += `📍 My Exact Live Location:\n`;
    text += `${createGoogleMapsUrl(location.latitude, location.longitude)}\n`;
    text += `Coordinates: ${formatCoordinates(location.latitude, location.longitude)} (Accuracy: ~${location.accuracy}m)\n\n`;
  } else {
    text += `📍 Location could not be locked. Please call me or send help immediately!\n\n`;
  }
  text += `Call National Emergency: 112 | Ambulance: 108 | Police: 100`;
  return text;
}

export function openWhatsAppSos(message: string, phoneNumber?: string) {
  const cleanPhone = (phoneNumber || '').replace(/[^0-9]/g, '');
  const target = cleanPhone ? `phone=${cleanPhone}&` : '';
  const url = `https://api.whatsapp.com/send?${target}text=${encodeURIComponent(message)}`;
  const win = window.open(url, '_blank', 'noopener,noreferrer');
  if (!win) {
    window.location.href = url;
  }
}

export function openSmsSos(message: string, phoneNumber?: string) {
  const cleanPhone = (phoneNumber || '').replace(/[^0-9+]/g, '');
  // iOS Safari (including iPadOS requesting desktop site) requires '&body='
  const isIos =
    typeof navigator !== 'undefined' &&
    (/iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
  const separator = isIos ? '&' : '?';
  const url = `sms:${cleanPhone}${separator}body=${encodeURIComponent(message)}`;
  window.location.href = url;
}
