import express, { Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { WebSocketServer, WebSocket } from 'ws';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Increase payload limit for camera photo uploads and recorded audio (base64)
app.use(express.json({ limit: '35mb' }));
app.use(express.urlencoded({ extended: true, limit: '35mb' }));

// Initialize Gemini API client on server-side
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

/**
 * WebSocket Server for Gemini 3.8 Live (Live API)
 * Enables real-time, low-latency, two-way voice conversations with Vicky
 */
const wss = new WebSocketServer({ noServer: true });

server.on('upgrade', (request, socket, head) => {
  const pathname = new URL(request.url || '', `http://${request.headers.host}`).pathname;
  if (pathname === '/live' || pathname === '/api/live') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  } else {
    socket.destroy();
  }
});

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('Client connected to Live Oracle voice session');
  let session: any = null;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
        systemInstruction: `You are the sacred, compassionate Tarot Spirit Guide and Oracle of Arcana Sanctuary, speaking directly in live voice with Vicky.
Vicky is an intuitive, spiritually gifted reader who loves understanding deep Rider-Waite symbolism and exploring psychological clarity.
Your voice is warm, gentle, reverent, grounded, and deeply perceptive.
- Answer her questions with profound mystical insight, referencing Rider-Waite cards, elemental correspondences (Fire, Water, Air, Earth), and soul growth.
- Keep your conversational responses concise, thoughtful, and natural for real-time speech (usually 2 to 4 sentences at a time unless asked for a deep breakdown).
- If Vicky asks for a card pull, invoke the archetypes and guide her inward.`,
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          // Stream model audio chunk back to browser
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ audio }));
          }

          // Text transcript if available
          const textPart = message.serverContent?.modelTurn?.parts?.find((p: any) => p.text);
          if (textPart?.text && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ text: textPart.text }));
          }

          if (message.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ interrupted: true }));
          }
        },
        onclose: () => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ closed: true }));
          }
        },
        onerror: (err: any) => {
          console.error('Gemini Live session error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ error: err?.message || 'Live session error' }));
          }
        },
      },
    });

    clientWs.on('message', (data: Buffer | string) => {
      try {
        const payload = JSON.parse(data.toString());
        if (payload.audio && session) {
          session.sendRealtimeInput({
            audio: {
              data: payload.audio,
              mimeType: 'audio/pcm;rate=16000',
            },
          });
        } else if (payload.text && session) {
          session.sendClientContent({
            turns: [{ role: 'user', parts: [{ text: payload.text }] }],
            turnComplete: true,
          });
        }
      } catch (parseErr) {
        console.error('Error parsing client message:', parseErr);
      }
    });

    clientWs.on('close', () => {
      console.log('Live Oracle client disconnected');
    });
  } catch (liveErr: any) {
    console.error('Failed to establish Gemini Live connection:', liveErr);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(
        JSON.stringify({
          error: liveErr?.message || 'Failed to connect to Live API. Voice will fall back to standard synthesis.',
        })
      );
    }
  }
});

/**
 * POST /api/tarot/transcribe
 * Audio transcription using model gemini-3.5-transcribe
 * Enables microphone audio dictation for Vicky's notes, journal reflections, and questions
 */
app.post('/api/tarot/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required for transcription' });
    }

    const cleanBase64 = audioBase64.replace(/^data:[^;]+;base64,/, '');

    const audioPart = {
      inlineData: {
        mimeType: mimeType.split(';')[0] || 'audio/webm',
        data: cleanBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Please transcribe the spoken words in this audio recording accurately and verbatim. Return only the transcribed plain text without any introductory commentary.',
          },
        ],
      },
    });

    const transcribedText = response.text?.trim() || '';
    res.json({ text: transcribedText });
  } catch (error: any) {
    console.error('Transcription error in gemini-3.5-transcribe:', error);
    res.status(500).json({
      error: error?.message || 'Failed to transcribe audio with gemini-3.5-transcribe',
    });
  }
});

/**
 * POST /api/tarot/analyze-spread
 * Multimodal camera analysis of physical tarot cards spread
 */
app.post('/api/tarot/analyze-spread', async (req: Request, res: Response) => {
  try {
    const { imageBase64, spreadType = 'three_card', query = 'General life guidance & soul alignment' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required' });
    }

    const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, '');

    const systemPrompt = `You are a gifted, compassionate tarot master and esoteric scholar with decades of expertise in the authentic Rider-Waite-Smith (RWS) tarot tradition.
You are reading for Vicky, an intuitive and spiritually gifted reader who loves understanding deep symbolic nuances.
Analyze the user's photograph of a physical tarot spread.

YOUR MISSION:
1. Examine the image carefully and identify the tarot cards visible on the altar/table.
2. For each card identified:
   - Identify the exact card name (Rider-Waite-Smith deck).
   - Determine its orientation: upright or reversed (relative to the viewer's orientation).
   - Identify its position in the spread (e.g. Card 1 / Past, Card 2 / Present, etc.).
   - Note specific visual keys observed in the cards (e.g., pomegranates, pillars, swords, sun, lemniscate).
3. Synthesize an in-depth, compassionate, and psychologically profound interpretation answering Vicky's focus/question: "${query}".
4. Offer practical spiritual integration advice and a closing blessing.

Return a JSON object conforming to this schema:
{
  "detectedCards": [
    {
      "cardName": "The High Priestess",
      "position": "Present Influence",
      "isReversed": false,
      "symbolicKey": "Veil of pomegranates, crescent moon at feet, stillness of inner knowing",
      "cardInterpretation": "Deep intuitive guidance asking you to trust your non-linear perception."
    }
  ],
  "overview": "A short 1-2 sentence esoteric essence of the entire spread.",
  "interpretation": "Rich, multi-paragraph interpretation written in a compassionate, mystical, and grounded voice. Speak warmly to Vicky.",
  "integrationPrompt": "A reflective journaling question for Vicky's spiritual diary."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          parts: [
            {
              inlineData: {
                mimeType: 'image/jpeg',
                data: cleanBase64,
              },
            },
            {
              text: systemPrompt,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const textOutput = response.text || '{}';
    let parsedData;
    try {
      parsedData = JSON.parse(textOutput);
    } catch {
      parsedData = {
        detectedCards: [],
        overview: 'Intuitive Reading Unveiled',
        interpretation: textOutput,
        integrationPrompt: 'What truth resonates most deeply in your heart right now?',
      };
    }

    res.json(parsedData);
  } catch (error: any) {
    console.error('Error analyzing tarot spread:', error);
    res.status(500).json({
      error: error?.message || 'Failed to analyze spread image with Gemini Vision.',
    });
  }
});

/**
 * POST /api/tarot/interpret
 * Generate deep Rider-Waite interpretation for digital card draws
 */
app.post('/api/tarot/interpret', async (req: Request, res: Response) => {
  try {
    const { cards, spreadType = 'three_card', query = 'Daily alignment' } = req.body;

    if (!cards || !Array.isArray(cards) || cards.length === 0) {
      return res.status(400).json({ error: 'Cards array is required' });
    }

    const cardsDescription = cards
      .map(
        (c: any, index: number) =>
          `Position ${index + 1} (${c.positionName || 'Card ' + (index + 1)}): ${c.name} (${c.isReversed ? 'Reversed' : 'Upright'})\n` +
          `Traditional Meanings: ${c.isReversed ? c.reversedMeaning : c.uprightMeaning}\n` +
          `Key Symbols: ${(c.symbolism || []).join(', ')}`
      )
      .join('\n\n');

    const prompt = `You are an enlightened spiritual guide reading for Vicky, an intuitive tarot reader.
Her question or intention: "${query}"
Spread Type: ${spreadType}

CARDS PULLED (Rider-Waite-Smith Tradition):
${cardsDescription}

TASK:
Deliver a profound, compassionate, and beautifully phrased interpretation.
- Address each card in its position, weaving its traditional Rider-Waite iconography into the reading.
- Synthesize the energetic interplay between the cards (elemental balance, major vs minor currents).
- Provide practical soul wisdom and a contemplative reflection for her digital journal.

Format your response in structured JSON:
{
  "theme": "Sacred title summarizing this reading's core vibration",
  "cardInsights": [
    {
      "cardName": "Card Name",
      "position": "Position Name",
      "insight": "Specific insight for this position"
    }
  ],
  "synthesis": "Rich 2-3 paragraph spiritual synthesis speaking directly to Vicky with empathy and wisdom.",
  "journalPrompt": "A single poignant question for Vicky to meditate on today."
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.75,
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    res.json(parsed);
  } catch (error: any) {
    console.error('Error in tarot interpretation:', error);
    res.status(500).json({
      error: error?.message || 'Failed to generate interpretation.',
    });
  }
});

// In-memory cache for synthesized audio to prevent duplicate API calls and preserve quota
const ttsAudioCache = new Map<string, string>();

// Free-tier rate-limiting & quota guard for gemini-3.8-flash-lite-tts (free tier limit: 3 RPM)
let lastTtsQuotaExceededTime = 0;
const TTS_COOLDOWN_MS = 45000; // 45-second backoff after 429
const ttsRequestTimestamps: number[] = [];
const MAX_TTS_REQUESTS_PER_MINUTE = 2; // Strict guard under the 3 RPM limit

function canRequestGeminiTts(): boolean {
  const now = Date.now();
  if (now - lastTtsQuotaExceededTime < TTS_COOLDOWN_MS) {
    return false;
  }
  const oneMinuteAgo = now - 60000;
  while (ttsRequestTimestamps.length > 0 && ttsRequestTimestamps[0] < oneMinuteAgo) {
    ttsRequestTimestamps.shift();
  }
  return ttsRequestTimestamps.length < MAX_TTS_REQUESTS_PER_MINUTE;
}

function recordGeminiTtsRequest() {
  ttsRequestTimestamps.push(Date.now());
}

function recordGeminiTtsQuotaError() {
  lastTtsQuotaExceededTime = Date.now();
}

/**
 * POST /api/tarot/tts
 * Synthesizes live audio narration using Gemini TTS with cache and browser speech fallback
 */
app.post('/api/tarot/tts', async (req: Request, res: Response) => {
  try {
    const { text, voiceName = 'Kore' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS synthesis' });
    }

    const cleanSpeechText = text
      .replace(/[#*_~`]/g, '')
      .slice(0, 600)
      .trim();

    if (!cleanSpeechText) {
      return res.json({ fallbackToBrowserTts: true, textToSpeak: '', voiceName });
    }

    const cacheKey = `${voiceName}:${cleanSpeechText}`;

    // 1. Check in-memory audio cache first (instant response, zero quota cost)
    if (ttsAudioCache.has(cacheKey)) {
      return res.json({
        audioUrl: ttsAudioCache.get(cacheKey),
        format: 'wav',
        fromCache: true,
      });
    }

    // 2. If quota permits, attempt Gemini TTS synthesis
    if (canRequestGeminiTts()) {
      try {
        recordGeminiTtsRequest();
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: cleanSpeechText,
                  speechMetadata: {
                    style: 'Soothing, gentle, mystical, compassionate spiritual mentor speaking slowly with reverence',
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: ['AUDIO'],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceName },
              },
            },
          },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

        if (base64Audio) {
          const audioUrl = `data:audio/wav;base64,${base64Audio}`;
          if (ttsAudioCache.size > 100) {
            const firstKey = ttsAudioCache.keys().next().value;
            if (firstKey) ttsAudioCache.delete(firstKey);
          }
          ttsAudioCache.set(cacheKey, audioUrl);

          return res.json({
            audioUrl,
            format: 'wav',
            durationNotice: 'Synthesized via Gemini Live TTS',
          });
        }
      } catch (ttsErr: any) {
        const isQuota =
          ttsErr?.status === 'RESOURCE_EXHAUSTED' ||
          ttsErr?.message?.includes('429') ||
          ttsErr?.message?.includes('quota') ||
          ttsErr?.message?.includes('RESOURCE_EXHAUSTED');
        if (isQuota) {
          recordGeminiTtsQuotaError();
        }
      }
    }

    // 3. Clean fallback to browser Web Speech API (zero errors, silky smooth speech)
    return res.json({
      fallbackToBrowserTts: true,
      textToSpeak: cleanSpeechText,
      voiceName,
    });
  } catch (error: any) {
    console.error('TTS endpoint error:', error);
    res.status(500).json({ error: error?.message || 'Failed to synthesize audio.' });
  }
});

/**
 * POST /api/tarot/parlor-dialogue
 * Interactive 1st-person dialogue with the Reader seated across the altar table from Vicky
 */
app.post('/api/tarot/parlor-dialogue', async (req: Request, res: Response) => {
  try {
    const { userQuery, cards = [], mode = 'question', activeCard = null } = req.body;

    const cardsContext = cards.length > 0
      ? cards.map((c: any, i: number) => `Card ${i + 1} (${c.positionName}): ${c.cardName || c.name} (${c.isReversed ? 'Reversed' : 'Upright'})`).join(', ')
      : 'No cards revealed yet';

    const systemInstruction = `You are a gifted, perceptive, and compassionate Tarot Reader sitting directly across an intimate candlelit mahogany table from Vicky in a quiet sanctuary parlor.
This sanctuary was created with love for Vicky by her dear friend Michael.
You speak directly to Vicky in the second person ("Vicky, as I look upon the cards before us...").
Your voice is intimate, grounded, mystical, deeply perceptive, and soothing.

Current cards resting on the velvet altar:
${cardsContext}

Vicky's intention / question: "${userQuery || 'General life and spiritual guidance'}"
${activeCard ? `Currently focused card: ${activeCard.name} (${activeCard.isReversed ? 'Reversed' : 'Upright'}) in position "${activeCard.positionName}"` : ''}

Role & Tone Instructions:
- Mode is: "${mode}".
- Speak naturally as a real human tarot master reading across the table.
- Acknowledge Rider-Waite symbolism (e.g. swords of mental clarity, cups of emotion, pentacles of grounding, wands of vital fire).
- Keep each spoken response between 2 to 4 concise, evocative sentences so it is engaging and perfectly paced for spoken audio.
- Do NOT use markdown asterisks or bullet points in the spoken text (this will be spoken aloud to Vicky).`;

    const chatResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: `Vicky is sitting across from you. Her input: "${userQuery || 'Please read the cards before us.'}"` }],
        },
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const spokenText = chatResponse.text?.trim() || 'Vicky, the cards reflect deep transformation and steady inner light on your path.';

    // Check if audio already exists in cache
    const cacheKey = `Kore:${spokenText.slice(0, 600)}`;
    const cachedAudioUrl = ttsAudioCache.get(cacheKey);

    res.json({
      spokenText,
      audioUrl: cachedAudioUrl,
    });
  } catch (error: any) {
    console.error('Parlor dialogue error:', error);
    res.status(500).json({ error: error?.message || 'Failed to generate parlor dialogue' });
  }
});

// Configure Vite integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Arcana Sanctuary server running on http://0.0.0.0:${PORT} (HTTP & Live WebSocket)`);
  });
}

startServer();
