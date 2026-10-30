/**
 * Phone-only AES-256-GCM encryption utility using standard Web Crypto API.
 * All sensitive medical identity documents and notes remain strictly client-side.
 */

export interface LockerItem {
  id: string;
  category: 'health_id' | 'blood_group' | 'insurance' | 'prescription' | 'organ_donor' | 'custom';
  title: string;
  content: string; // Plaintext when decrypted
  lastUpdated: number;
}

const STORAGE_LOCKER_KEY = 'india_emergency_doc_locker_v1';
const STORAGE_PIN_HASH_KEY = 'india_emergency_locker_pinhash_v1';
const STORAGE_SALT_KEY = 'india_emergency_locker_salt_v1';

// Convert string to Uint8Array
function strToBuf(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

// Convert ArrayBuffer to string
function bufToStr(buf: ArrayBuffer): string {
  return new TextDecoder().decode(buf);
}

// Convert ArrayBuffer or Uint8Array to hex string
function bufToHex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

// Convert hex string to Uint8Array
function hexToBuf(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

// Get or generate a persistent salt
function getSalt(): Uint8Array {
  let saltHex = localStorage.getItem(STORAGE_SALT_KEY);
  if (!saltHex) {
    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    saltHex = bufToHex(salt);
    localStorage.setItem(STORAGE_SALT_KEY, saltHex);
    return salt;
  }
  return hexToBuf(saltHex);
}

// Derive AES-GCM 256-bit key from user PIN using PBKDF2
async function deriveKey(pin: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    strToBuf(pin) as unknown as BufferSource,
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return window.crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt as unknown as BufferSource,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

export function isPinConfigured(): boolean {
  return !!localStorage.getItem(STORAGE_PIN_HASH_KEY);
}

export async function setupLockerPin(pin: string): Promise<boolean> {
  const salt = getSalt();
  // Hash the pin with salt to verify later
  const hashBuf = await window.crypto.subtle.digest(
    'SHA-256',
    strToBuf(pin + bufToHex(salt)) as unknown as BufferSource
  );
  localStorage.setItem(STORAGE_PIN_HASH_KEY, bufToHex(hashBuf));

  // Initialize with starter emergency health template
  const starterItems: LockerItem[] = [
    {
      id: '1',
      category: 'health_id',
      title: 'Emergency Medical Profile',
      content: 'Blood Group: O+ Positive\nAllergies: Penicillin, Sulfa drugs\nEmergency Contact: +91 98765 43210',
      lastUpdated: Date.now(),
    },
    {
      id: '2',
      category: 'insurance',
      title: 'Health Insurance TPA Info',
      content: 'Provider: National Health Insurance\nPolicy No: NHI-2026-IND-9988\n24x7 TPA Helpline: 1800-425-4033',
      lastUpdated: Date.now(),
    },
  ];

  await saveLockerItems(starterItems, pin);
  return true;
}

export async function verifyPin(pin: string): Promise<boolean> {
  const storedHash = localStorage.getItem(STORAGE_PIN_HASH_KEY);
  if (!storedHash) return false;

  const salt = getSalt();
  const hashBuf = await window.crypto.subtle.digest(
    'SHA-256',
    strToBuf(pin + bufToHex(salt)) as unknown as BufferSource
  );
  return bufToHex(hashBuf) === storedHash;
}

// Encrypt and save items using AES-GCM
export async function saveLockerItems(items: LockerItem[], pin: string): Promise<void> {
  const salt = getSalt();
  const key = await deriveKey(pin, salt);
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for AES-GCM

  const plaintext = JSON.stringify(items);
  const encrypted = await window.crypto.subtle.encrypt(
    { name: 'AES-GCM', iv: iv as unknown as BufferSource },
    key,
    strToBuf(plaintext) as unknown as BufferSource
  );

  const payload = {
    iv: bufToHex(iv),
    data: bufToHex(encrypted),
  };

  localStorage.setItem(STORAGE_LOCKER_KEY, JSON.stringify(payload));
}

// Decrypt items using AES-GCM
export async function loadLockerItems(pin: string): Promise<LockerItem[]> {
  const raw = localStorage.getItem(STORAGE_LOCKER_KEY);
  if (!raw) return [];

  try {
    const { iv, data } = JSON.parse(raw);
    const salt = getSalt();
    const key = await deriveKey(pin, salt);

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: hexToBuf(iv) as unknown as BufferSource },
      key,
      hexToBuf(data) as unknown as BufferSource
    );

    return JSON.parse(bufToStr(decrypted));
  } catch (err) {
    console.error('Failed to decrypt locker items', err);
    throw new Error('Decryption failed. Incorrect PIN.');
  }
}

export function purgeLockerData() {
  localStorage.removeItem(STORAGE_LOCKER_KEY);
  localStorage.removeItem(STORAGE_PIN_HASH_KEY);
  localStorage.removeItem(STORAGE_SALT_KEY);
}
