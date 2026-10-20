import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Sparkles, MessageSquare, AlertCircle, RefreshCw, Radio } from 'lucide-react';

export const LiveOracleVoice: React.FC = () => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [messages, setMessages] = useState<{ sender: 'vicky' | 'oracle'; text: string }[]>([
    {
      sender: 'oracle',
      text: 'Greetings, Vicky. The sacred veil is open. Speak freely into your microphone, and we shall explore the archetypes and energies guiding your soul.',
    },
  ]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [voiceVolume, setVoiceVolume] = useState<number>(0);

  const wsRef = useRef<WebSocket | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef<number>(0);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  // Convert Float32Array to 16-bit PCM Base64 for Live API
  const floatTo16BitPCMBase64 = (float32Array: Float32Array): string => {
    const buffer = new ArrayBuffer(float32Array.length * 2);
    const view = new DataView(buffer);
    for (let i = 0; i < float32Array.length; i++) {
      let s = Math.max(-1, Math.min(1, float32Array[i]));
      view.setInt16(i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
    }
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // Play incoming 24kHz PCM chunk from Gemini Live
  const playPcmChunk = (base64Audio: string) => {
    try {
      if (!outputAudioCtxRef.current) {
        outputAudioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 24000,
        });
      }
      const ctx = outputAudioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const binary = atob(base64Audio);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      const int16View = new Int16Array(bytes.buffer);
      const float32 = new Float32Array(int16View.length);
      for (let i = 0; i < int16View.length; i++) {
        float32[i] = int16View[i] / 32768.0;
      }

      const audioBuffer = ctx.createBuffer(1, float32.length, 24000);
      audioBuffer.getChannelData(0).set(float32);

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);

      const now = ctx.currentTime;
      const startTime = Math.max(now, nextPlayTimeRef.current);
      source.start(startTime);
      nextPlayTimeRef.current = startTime + audioBuffer.duration;

      // Animate volume aura
      setVoiceVolume(Math.min(100, Math.floor(Math.random() * 40 + 60)));
      setTimeout(() => setVoiceVolume(0), (audioBuffer.duration * 1000) || 300);
    } catch (e) {
      console.warn('Error playing PCM audio:', e);
    }
  };

  // Start Live Audio Session
  const startLiveSession = async () => {
    setIsConnecting(true);
    setErrorMsg(null);

    try {
      // 1. Get user mic stream
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      mediaStreamRef.current = stream;

      // 2. Connect WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/live`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsConnecting(false);

        // 3. Setup Audio Capture at 16kHz
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
          sampleRate: 16000,
        });
        inputAudioCtxRef.current = inputCtx;
        const source = inputCtx.createMediaStreamSource(stream);
        const processor = inputCtx.createScriptProcessor(4096, 1, 1);

        processor.onaudioprocess = (e) => {
          if (isMicMuted) return;
          const inputData = e.inputBuffer.getChannelData(0);

          // Calculate approximate input mic volume for visualizer
          let sum = 0;
          for (let i = 0; i < inputData.length; i++) {
            sum += Math.abs(inputData[i]);
          }
          const avg = sum / inputData.length;
          if (avg > 0.02) {
            setVoiceVolume(Math.min(100, Math.floor(avg * 400)));
          }

          const base64 = floatTo16BitPCMBase64(inputData);
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ audio: base64 }));
          }
        };

        source.connect(processor);
        processor.connect(inputCtx.destination);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.audio) {
            playPcmChunk(data.audio);
          }
          if (data.text) {
            setMessages((prev) => {
              const last = prev[prev.length - 1];
              if (last && last.sender === 'oracle') {
                return [...prev.slice(0, -1), { sender: 'oracle', text: last.text + ' ' + data.text }];
              }
              return [...prev, { sender: 'oracle', text: data.text }];
            });
          }
          if (data.interrupted) {
            // Stop scheduled audio
            if (outputAudioCtxRef.current) {
              nextPlayTimeRef.current = outputAudioCtxRef.current.currentTime;
            }
          }
          if (data.error) {
            setErrorMsg(data.error);
          }
        } catch (err) {
          console.error('Error handling WebSocket message:', err);
        }
      };

      ws.onerror = (err) => {
        console.error('Live WebSocket error:', err);
        setErrorMsg('Could not establish real-time connection. Check server status.');
        setIsConnecting(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsConnecting(false);
      };
    } catch (err: any) {
      console.error('Start live session error:', err);
      setErrorMsg(err.message || 'Microphone access failed. Please allow microphone in Safari.');
      setIsConnecting(false);
    }
  };

  const endLiveSession = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (inputAudioCtxRef.current) {
      inputAudioCtxRef.current.close();
      inputAudioCtxRef.current = null;
    }
    if (outputAudioCtxRef.current) {
      outputAudioCtxRef.current.close();
      outputAudioCtxRef.current = null;
    }
    setIsConnected(false);
    setVoiceVolume(0);
  };

  useEffect(() => {
    return () => {
      endLiveSession();
    };
  }, []);

  const sendQuickText = (prompt: string) => {
    if (wsRef.current && isConnected) {
      setMessages((prev) => [...prev, { sender: 'vicky', text: prompt }]);
      wsRef.current.send(JSON.stringify({ text: prompt }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 text-xs text-purple-300 mb-3 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>🎙️ Live Voice Chat with Your Guide</span>
        </div>
        <h1 className="font-serif-tarot text-2xl sm:text-3xl lg:text-4xl font-bold text-[#EAE5D9]">
          Talk with the Oracle
        </h1>
        <p className="mt-2 text-sm text-[#A6AFCA] max-w-lg mx-auto">
          Just like talking on the phone with a wise, spiritual friend. Tap the gold button below, ask any question out loud, and listen to her comforting advice!
        </p>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2 max-w-xl mx-auto">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Central Visualizer Altar */}
      <div className="relative rounded-3xl border border-[#D4AF37]/30 bg-gradient-to-b from-[#141829] via-[#0E111F] to-[#0A0D18] p-8 sm:p-12 shadow-2xl flex flex-col items-center justify-center text-center overflow-hidden mb-8 min-h-[380px]">
        {/* Animated Sacred Geometry Aura Rings */}
        <div
          className="w-48 h-48 sm:w-60 sm:h-60 rounded-full border-2 border-[#D4AF37]/40 flex items-center justify-center relative transition-all duration-300"
          style={{
            transform: `scale(${1 + voiceVolume * 0.003})`,
            boxShadow: isConnected
              ? `0 0 ${20 + voiceVolume}px rgba(212, 175, 55, ${0.2 + voiceVolume * 0.006})`
              : 'none',
          }}
        >
          {/* Inner ring */}
          <div
            className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border border-dashed border-[#D4AF37]/60 flex items-center justify-center transition-all duration-200"
            style={{
              transform: `rotate(${voiceVolume * 2}deg)`,
            }}
          >
            {/* Center Eye / Sun Orb */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#F3C64F] flex items-center justify-center shadow-lg shadow-[#D4AF37]/30">
              {isConnected ? (
                <Volume2 className="w-8 h-8 text-[#0B0D13]" />
              ) : (
                <Sparkles className="w-8 h-8 text-[#0B0D13]" />
              )}
            </div>
          </div>
        </div>

        {/* Status Text */}
        <div className="mt-6">
          <div className="text-sm font-serif-tarot font-bold text-[#EAE5D9]">
            {isConnected
              ? 'The Oracle is listening — speak whenever you are ready'
              : isConnecting
              ? 'Connecting to your guide...'
              : 'Voice Chat is Ready'}
          </div>
          <div className="text-xs text-[#A6AFCA] mt-1">
            {isConnected
              ? isMicMuted
                ? 'Your microphone is paused'
                : 'Speak naturally, and she will reply warmly.'
              : 'Tap the button below to start your conversation.'}
          </div>
        </div>

        {/* Live Controls */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          {!isConnected ? (
            <button
              onClick={startLiveSession}
              disabled={isConnecting}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3C64F] hover:from-[#F3C64F] hover:to-[#D4AF37] text-[#0B0D13] font-bold text-sm shadow-xl shadow-[#D4AF37]/25 flex items-center gap-2 active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Connecting...</span>
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  <span>Start Talking with the Oracle</span>
                </>
              )}
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMicMuted(!isMicMuted)}
                className={`px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  isMicMuted
                    ? 'bg-red-950/60 border-red-500 text-red-300'
                    : 'bg-white/10 border-white/20 text-[#EAE5D9] hover:bg-white/15'
                }`}
              >
                {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-[#D4AF37]" />}
                <span>{isMicMuted ? 'Unmute Mic' : 'Mute Mic'}</span>
              </button>

              <button
                onClick={endLiveSession}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                End Communion
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Prompts to spark conversation */}
      {isConnected && (
        <div className="mb-8">
          <div className="text-xs text-[#A6AFCA] uppercase font-serif-tarot tracking-wider mb-2 text-center">
            Or tap a spiritual spark:
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {[
              'What energy does The High Priestess bring to my week?',
              'How can I integrate reversed cards without fear?',
              'What should I focus on in my meditation today?',
              'Explain the elemental meaning of the Queen of Cups.',
            ].map((prompt) => (
              <button
                key={prompt}
                onClick={() => sendQuickText(prompt)}
                className="px-3 py-1.5 rounded-lg bg-[#181C2E] hover:bg-[#20253D] text-[#A6AFCA] hover:text-[#EAE5D9] text-xs border border-white/5 transition-colors"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Real-time Transcription Stream */}
      <div className="p-6 rounded-2xl border border-[#D4AF37]/25 bg-[#121526]/80 backdrop-blur-sm shadow-xl">
        <h3 className="font-serif-tarot text-base font-bold text-[#D4AF37] mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4" />
          <span>Communion Dialogue Stream</span>
        </h3>
        <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-3 rounded-xl text-xs sm:text-sm leading-relaxed ${
                m.sender === 'oracle'
                  ? 'bg-[#0B0D13]/80 border border-[#D4AF37]/20 text-[#EAE5D9]'
                  : 'bg-[#D4AF37]/15 border border-[#D4AF37]/30 text-[#F3C64F] ml-8'
              }`}
            >
              <div className="text-[10px] uppercase font-serif-tarot tracking-wider font-bold mb-1 opacity-70">
                {m.sender === 'oracle' ? 'Tarot Spirit Guide (Live)' : 'Vicky'}
              </div>
              <div>{m.text}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
