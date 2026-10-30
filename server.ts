import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize Gemini client if API key is provided
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  aiClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Emergency Triage Guidance API
app.post('/api/emergency-triage', async (req: Request, res: Response) => {
  const { query, language = 'English', situationType } = req.body;

  if (!query && !situationType) {
    return res.status(400).json({ error: 'Emergency query or situation is required' });
  }

  // Fallback if no Gemini client or API key
  if (!aiClient) {
    return res.json({
      isAi: false,
      message: 'AI Assistant running in offline protocol mode. In any acute emergency, immediately call 112 (National Emergency) or 108 (Ambulance).',
      immediateSteps: [
        'Check patient responsiveness and airway breathing.',
        'Call 112 or 108 immediately for professional emergency ambulance dispatch.',
        'Keep the victim calm, still, and do not offer solid food or liquid if unconscious.',
        'Ensure the scene is safe for you and the patient before administering first aid.'
      ],
      warnings: ['Do not move patients with suspected spinal injury unless in immediate danger.', 'Do not apply ice directly or make cuts on snakebites.'],
      relevantNumbers: [
        { label: 'National All-in-One Emergency', number: '112' },
        { label: 'Free Ambulance / Medical Emergency', number: '108' }
      ]
    });
  }

  try {
    const prompt = `You are a high-stress emergency first-aid triage advisor for India.
The user is facing an emergency situation: "${query || situationType}".
The response MUST be in ${language}.

Format your response as a strictly valid JSON object with the following fields:
{
  "summary": "Short 1-sentence assessment of the emergency and urgency level (e.g. Critical / High / Moderate)",
  "immediateSteps": ["Step 1: exact physical action for next 30-60 seconds", "Step 2", "Step 3", "Step 4"],
  "whatNotToDo": ["Critical dangerous mistake 1 to avoid", "Mistake 2"],
  "recommendedIndianHelpline": "112 / 108 / 101 / 100 / 1091 / 1098 / 1930 / etc.",
  "goodSamaritanNote": "Brief reassurance regarding Good Samaritan protection or ambulance arrival tips in India"
}

Guidelines:
1. Prioritize immediate life-saving actions (airway, CPR, pressure on bleeding, immobilize snakebite, cooling burns).
2. Avoid generic platitudes; provide clear, unambiguous, bulleted actions.
3. Recommend specific Indian emergency numbers (112, 108 for ambulance, 101 fire, 1098 childline, 1930 cyber fraud, 1091 women helpline, etc.).
4. Do not include markdown code block backticks if possible, return raw json.`;

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('AI response timed out')), 6000)
    );

    const generatePromise = aiClient.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const response: any = await Promise.race([generatePromise, timeoutPromise]);

    const rawText = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(rawText);
    } catch {
      // Clean possible fences
      const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleaned);
    }

    return res.json({
      isAi: true,
      ...parsedData,
    });
  } catch (error: any) {
    console.error('Error or timeout querying Gemini emergency triage:', error?.message || error);
    return res.json({
      isAi: false,
      summary: `Emergency Triage Guidance for: "${query || situationType}". Urgency: HIGH.`,
      immediateSteps: [
        'Call 112 (National Emergency) or 108 (Ambulance) immediately.',
        'Keep the victim lying completely still and calm; do not let them walk or exert.',
        'Ensure the victim airway is open and breathing is unhindered.',
        'If external bleeding is present, apply firm continuous pressure with a clean cloth.'
      ],
      whatNotToDo: [
        'Do not give oral fluids or food if the person is dizzy, semi-conscious, or vomiting.',
        'Do not make cuts on bite marks, apply ice directly, or tie restrictive wire tourniquets.',
        'Do not leave the victim alone.'
      ],
      recommendedIndianHelpline: '112 / 108',
      goodSamaritanNote: 'Good Samaritans in India are legally protected by the Supreme Court of India from harassment, hospital deposit demands, or police witness compulsion.'
    });
  }
});

// In-Memory Expiring Location Sharing Store
interface LocationSession {
  id: string;
  latitude: number;
  longitude: number;
  accuracy: number;
  situationNote?: string;
  contactName?: string;
  createdAt: number;
  expiresAt: number;
  terminated: boolean;
}

const activeSessions = new Map<string, LocationSession>();

// Cleanup expired sessions every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [id, session] of activeSessions.entries()) {
    if (now > session.expiresAt || session.terminated) {
      activeSessions.delete(id);
    }
  }
}, 5 * 60 * 1000);

// Create Expiring Location Sharing Session
app.post('/api/emergency-session/create', (req: Request, res: Response) => {
  const { latitude, longitude, accuracy = 15, durationMinutes = 60, situationNote, contactName } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Valid latitude and longitude are required.' });
  }

  // Cap max duration between 5 minutes and 24 hours (default 60 mins)
  const duration = Math.max(5, Math.min(1440, Number(durationMinutes) || 60));
  const sessionId = Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
  const now = Date.now();
  const expiresAt = now + duration * 60 * 1000;

  const session: LocationSession = {
    id: sessionId,
    latitude: Number(latitude),
    longitude: Number(longitude),
    accuracy: Number(accuracy),
    situationNote: situationNote ? String(situationNote).substring(0, 200) : undefined,
    contactName: contactName ? String(contactName).substring(0, 50) : undefined,
    createdAt: now,
    expiresAt,
    terminated: false,
  };

  activeSessions.set(sessionId, session);

  const appUrl = process.env.APP_URL || `http://localhost:${PORT}`;
  const shareUrl = `${appUrl}?track=${sessionId}`;

  return res.json({
    success: true,
    sessionId,
    shareUrl,
    expiresAt,
    durationMinutes: duration,
  });
});

// Get Live Location by Session ID (Public Tracker Link for Trusted Contacts)
app.get('/api/emergency-session/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const session = activeSessions.get(id);

  if (!session) {
    return res.status(404).json({ error: 'Emergency sharing session not found or has expired.' });
  }

  if (session.terminated) {
    return res.status(410).json({ error: 'This emergency location sharing session has been ended by the user.' });
  }

  const now = Date.now();
  if (now > session.expiresAt) {
    activeSessions.delete(id);
    return res.status(410).json({ error: 'This location session has expired for user safety and privacy.' });
  }

  const remainingSeconds = Math.max(0, Math.round((session.expiresAt - now) / 1000));

  return res.json({
    active: true,
    latitude: session.latitude,
    longitude: session.longitude,
    accuracy: session.accuracy,
    situationNote: session.situationNote,
    contactName: session.contactName,
    remainingSeconds,
    expiresAt: session.expiresAt,
  });
});

// Update Live Coordinates for Ongoing Session
app.post('/api/emergency-session/:id/update', (req: Request, res: Response) => {
  const { id } = req.params;
  const { latitude, longitude, accuracy } = req.body;
  const session = activeSessions.get(id);

  if (!session || session.terminated || Date.now() > session.expiresAt) {
    return res.status(404).json({ error: 'Session is inactive or expired.' });
  }

  if (latitude !== undefined && longitude !== undefined) {
    session.latitude = Number(latitude);
    session.longitude = Number(longitude);
    if (accuracy !== undefined) session.accuracy = Number(accuracy);
  }

  return res.json({ success: true, updated: true });
});

// Terminate Session (Revoke Sharing Immediately)
app.post('/api/emergency-session/:id/terminate', (req: Request, res: Response) => {
  const { id } = req.params;
  const session = activeSessions.get(id);

  if (session) {
    session.terminated = true;
    activeSessions.delete(id);
  }

  return res.json({ success: true, message: 'Emergency location session terminated.' });
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    activeLocationSessions: activeSessions.size,
    time: new Date().toISOString()
  });
});

async function startServer() {
  // Mount Vite middleware in development
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  app.listen(PORT, () => {
    console.log(`India Emergency Help app server running on http://localhost:${PORT}`);
  });
}

startServer();
