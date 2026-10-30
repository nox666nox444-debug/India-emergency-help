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
}

const CONTACTS_STORAGE_KEY = 'india_emergency_personal_contacts_v1';

export function getSavedContacts(): EmergencyContactPerson[] {
  try {
    const raw = localStorage.getItem(CONTACTS_STORAGE_KEY);
    if (!raw) {
      return [
        { id: '1', name: 'Primary Family Contact', phone: '', relation: 'Family' },
      ];
    }
    return JSON.parse(raw);
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

export function getCurrentLocation(): Promise<UserLocation> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
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
        let msg = 'Failed to retrieve location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access to dispatch your SOS coordinates.';
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          msg = 'Location information is unavailable on your device.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again.';
        }
        reject(new Error(msg));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
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
  window.open(url, '_blank', 'noopener,noreferrer');
}

export function openSmsSos(message: string, phoneNumber?: string) {
  const cleanPhone = (phoneNumber || '').replace(/[^0-9]/g, '');
  // iOS and Android sms link compatibility
  const separator = navigator.userAgent.match(/iPhone|iPad|iPod/i) ? '&' : '?';
  const url = `sms:${cleanPhone}${separator}body=${encodeURIComponent(message)}`;
  window.location.href = url;
}
