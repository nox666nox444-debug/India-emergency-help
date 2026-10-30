# India Emergency Help (112 & Disaster Response)

Production-quality emergency assistance platform for the Republic of India. Available as a native Flutter mobile application (`lib/main.dart`) and a full-stack web application with an Express backend for expiring location-sharing sessions and Gemini 3.8 Flash triage intelligence.

---

## 🎨 Design System
- **Primary Navy Blue**: `#102B4D` & `#173B60`
- **Emergency Crimson**: `#C62838` & `#DC2626`
- **Canvas / Neutrals**: Soft daylight slate `#F3F6FA` / crisp white `#FFFFFF` / deep dark `#0B132B`
- **Typography**: Clean, readable system fonts with tabular numerals (`tabular-nums`) for emergency phone numbers and GPS coordinates.

---

## 🌐 Supported Languages
1. **English**
2. **Hindi (हिन्दी)**
3. **Punjabi (ਪੰਜਾਬੀ)**
*(Web companion also includes Bengali, Tamil, Telugu, Marathi, Gujarati, and Kannada).*

---

## 🚨 Core Features & Safety Protocols

### 1. Emergency SOS with Consent & Direct 112 Dialing
- Circular emergency SOS trigger with explicit consent dialog.
- Direct integration with **112 (Unified Emergency Response Support System)**, **100 (Police)**, **108 (Ambulance)**, **101 (Fire)**, **1091 (Women Safety)**, and **1930 (Cyber Fraud)**.

### 2. Consent-Based Live GPS Sharing & Expiring Sessions
- Acquires GPS coordinates via `geolocator` with accuracy radius.
- **Backend Expiring Sessions** (`POST /api/emergency-session/create`):
  - Generates secure temporary tracking links (15 min, 1 hr, 4 hr auto-expiration).
  - Users can instantly revoke or terminate live sharing anytime.
  - Zero permanent location tracking; sessions automatically self-destruct after expiry.

### 3. AI Voice Emergency Assistant (`speech_to_text`)
- Hands-free voice recognition supporting **English, Hindi, and Punjabi** emergency distress keywords:
  - **Accident / Trauma**: `accident`, `injury`, `bleeding`, `hurt`, `चोट`, `दुर्घटना`, `ਜ਼ਖ਼ਮੀ`
  - **Medical / Cardiac**: `breathing`, `chest pain`, `heart`, `सांस`, `सीने में दर्द`, `ਸਾਹ`
  - **Threat / Police**: `attack`, `follow`, `threat`, `police`, `हमला`, `पीछा`, `ਪਿੱਛਾ`
  - **Fire / Hazard**: `fire`, `smoke`, `आग`, `धुआं`, `ਅੱਗ`
- **Safety Policy**: The voice assistant **never** independently dispatches emergency calls or location messages without user confirmation.

### 4. Phone-Only Encrypted Document Locker (AES-256-GCM)
- Store vital emergency information:
  - Emergency Health Memo (Blood group, allergies, chronic medications, organ donor status)
  - Medical Insurance TPA numbers & Masked ID memo
  - Doctor prescriptions & emergency contacts
- **AES-256-GCM Encryption**: Key derived from user's 4–6 digit security PIN using PBKDF2 with 100,000 iterations and salt.
- **Biometric & PIN Authentication**: Unlocked only via device biometric prompt or master PIN. 100% client-side storage; records never touch external servers.

### 5. Cybercrime Financial Fraud (1930 & cybercrime.gov.in)
- Dedicated guidance for the **"Golden Hour"** after unauthorized UPI, debit card, or net banking transfers.
- One-tap dialer for national helpline **1930** and direct launch of `https://cybercrime.gov.in/`.

### 6. Earthquake Safety System & Disaster Kit (`EarthquakeScreen`)
- **Navy & Emergency Red Design** (`#101B35` & `#E53935`).
- **One-Tap Direct 112 Emergency Calling** via `url_launcher`.
- **During an Earthquake Protocols**:
  - **DROP**: Get down on hands and knees immediately before shaking knocks you down.
  - **COVER**: Protect head and neck under a sturdy desk or table.
  - **HOLD ON**: Hold shelter securely until violent shaking stops.
- **After an Earthquake Directives**:
  - Avoid damaged structures, cracked walls, and fallen power cables.
  - Expect aftershocks and repeat Drop-Cover-Hold On.
  - Check for injuries and administer first aid without moving non-critical casualties.
  - Coastal tsunami warnings: move to higher ground inland immediately if shaking is prolonged.
- **Interactive Emergency Disaster Kit Checklist** (9 items with local state persistence):
  - Drinking water, First aid kit, Flashlight and batteries, Power bank, Essential medicines, Dry food, Whistle, Copies of important documents, Emergency contact numbers.
- **Official Seismology & Disaster Portals**:
  - National Center for Seismology (`https://seismo.gov.in/`)
  - NDMA India (`https://ndma.gov.in/`)
  - INCOIS Indian Ocean Tsunami Warning Centre (`https://incois.gov.in/`)

### 7. Offline Mode & Cached Guides
- All primary national numbers, state control rooms (28 States & 8 UTs), and clinical first-aid cards are pre-cached locally.
- In-app offline indicator banner alerts users when operating without network connectivity.

---

## 🛠️ Backend Setup & API Specification

The full-stack Express backend (`server.ts`) powers expiring location-sharing sessions and the Gemini 3.8 Flash triage advisor.

### Running Backend:
```bash
# Install Node dependencies
npm install

# Start development server on port 3000
npm run dev

# Run automated lint & build check
npm run lint
npm run build
```

### Backend Endpoints:
- `POST /api/emergency-session/create`:
  ```json
  {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "accuracy": 12,
    "durationMinutes": 60,
    "situationNote": "Road accident on NH 44"
  }
  ```
- `GET /api/emergency-session/:id`:
  Returns active live location coordinates or `410 Gone` if expired/terminated.
- `POST /api/emergency-session/:id/terminate`:
  Immediately revokes the sharing link when the user is safe.
- `POST /api/emergency-triage`:
  AI first-aid triage guidance using `@google/genai` (Gemini 3.8 Flash) with structured 60-second actions and offline rule-based fallback.

---

## 📱 Mobile Application Build Instructions

### Dependencies (`pubspec.yaml`):
```yaml
dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8
  url_launcher: ^6.3.1
  speech_to_text: ^7.0.0
  geolocator: ^13.0.2
```

### 1. Android Release APK Build:
```bash
cd india_emergency_help
flutter clean
flutter pub get
flutter build apk --release
```
**Output File**: `build/app/outputs/flutter-apk/app-release.apk`

*(For Google Play Store distribution, build the AAB: `flutter build appbundle --release`)*.

### 2. iOS Release Build:
```bash
cd india_emergency_help
flutter clean
flutter pub get
cd ios && pod install && cd ..
flutter build ios --release --no-codesign
```

---

## 🧪 Automated Testing
Run automated widget tests:
```bash
flutter test
```
The test suite in `test/widget_test.dart` verifies:
- Rendering of App bar and emergency SOS controls.
- Presence of all verified helplines (`112`, `100`, `101`, `102`, `181`, `1930`).
- Multi-lingual keyword regex parser across English, Hindi, and Punjabi.

---

## 🔍 Real-Device Testing Instructions
1. **Microphone Permission**: Launch app -> tap **Start Assistant** -> allow microphone -> speak *"चोट लगी है"* or *"Help, severe accident"* -> verify trigger detection.
2. **Phone Dialer**: Tap **112** -> verify phone dialer opens with 112 pre-filled without auto-dialing.
3. **GPS Sharing**: Open SOS dialog -> check consent checkbox -> verify live coordinate acquisition and share via WhatsApp/SMS.
4. **Document Locker**: Set 4-digit PIN -> save medical memo -> lock -> enter wrong PIN (verify error) -> enter correct PIN (verify decryption).
5. **Offline Test**: Enable Airplane Mode -> verify offline status indicator and check that helplines, first-aid guides, and Document Locker remain fully functional.
