import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, Volume2, RotateCcw, Sparkles } from 'lucide-react';

interface AudioPlayerBarProps {
  audioUrl?: string;
  transcriptText?: string;
  voiceName?: string;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  audioUrl,
  transcriptText = '',
  voiceName = 'Kore (Compassionate Guide)',
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [isBrowserSpeaking, setIsBrowserSpeaking] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize HTML5 Audio Element for Safari
  useEffect(() => {
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onloadedmetadata = () => {
        setDuration(audio.duration || 0);
      };

      audio.ontimeupdate = () => {
        setCurrentTime(audio.currentTime || 0);
      };

      audio.onended = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };

      return () => {
        audio.pause();
        audioRef.current = null;
      };
    }
  }, [audioUrl]);

  // Handle Play/Pause
  const togglePlay = () => {
    if (audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.playbackRate = playbackSpeed;
        audioRef.current.play().then(() => setIsPlaying(true)).catch((err) => {
          console.warn('Audio play restricted by browser policy:', err);
        });
      }
    } else if (window.speechSynthesis && transcriptText) {
      // Client-side Web Speech fallback for Safari
      if (isBrowserSpeaking) {
        window.speechSynthesis.cancel();
        setIsBrowserSpeaking(false);
      } else {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(transcriptText);
        utterance.rate = playbackSpeed * 0.95;
        utterance.pitch = 1.0;
        
        // Find gentle natural voice if possible
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(
          (v) => v.name.includes('Samantha') || v.name.includes('Karen') || v.name.includes('Google UK English Female') || v.name.includes('Serena')
        );
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => setIsBrowserSpeaking(false);
        utterance.onerror = () => setIsBrowserSpeaking(false);

        window.speechSynthesis.speak(utterance);
        setIsBrowserSpeaking(true);
      }
    }
  };

  const handleSpeedChange = () => {
    const nextSpeed = playbackSpeed === 1 ? 1.2 : playbackSpeed === 1.2 ? 0.85 : 1;
    setPlaybackSpeed(nextSpeed);
    if (audioRef.current) {
      audioRef.current.playbackRate = nextSpeed;
    }
  };

  const handleRestart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      if (!isPlaying) {
        audioRef.current.play().then(() => setIsPlaying(true));
      }
    } else if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsBrowserSpeaking(false);
      togglePlay();
    }
  };

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = Math.floor(secs % 60);
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const currentlyActive = isPlaying || isBrowserSpeaking;

  return (
    <div className="w-full p-4 rounded-2xl border border-[#D4AF37]/30 bg-[#121526]/90 backdrop-blur-md shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
      {/* Voice Badge & Title */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shrink-0">
          <Volume2 className={`w-5 h-5 ${currentlyActive ? 'animate-pulse' : ''}`} />
        </div>
        <div>
          <div className="text-xs font-serif-tarot font-bold text-[#EAE5D9] flex items-center gap-1.5">
            <span>Live Spiritual Narration</span>
            <span className="text-[10px] text-[#D4AF37] border border-[#D4AF37]/30 px-1.5 py-0.2 rounded">
              TTS
            </span>
          </div>
          <div className="text-[11px] text-[#A6AFCA]">
            Voiced by {voiceName}
          </div>
        </div>
      </div>

      {/* Progress & Waveform Animation */}
      <div className="flex-1 w-full max-w-md flex items-center gap-3 px-2">
        <span className="text-[10px] text-[#A6AFCA] font-mono tabular-nums">
          {formatTime(currentTime)}
        </span>
        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
          <div
            className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F3C64F] transition-all"
            style={{
              width: duration > 0 ? `${(currentTime / duration) * 100}%` : currentlyActive ? '65%' : '0%',
            }}
          />
        </div>
        <span className="text-[10px] text-[#A6AFCA] font-mono tabular-nums">
          {duration > 0 ? formatTime(duration) : 'Live'}
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        <button
          onClick={handleRestart}
          title="Restart Audio"
          className="p-2 rounded-lg text-[#A6AFCA] hover:text-[#EAE5D9] hover:bg-white/5 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>

        <button
          onClick={handleSpeedChange}
          title="Playback Speed"
          className="px-2 py-1 rounded-md text-[11px] font-mono font-medium text-[#D4AF37] hover:bg-[#D4AF37]/10 transition-colors border border-[#D4AF37]/20"
        >
          {playbackSpeed}x
        </button>

        <button
          onClick={togglePlay}
          className="px-4 py-2 rounded-xl bg-[#D4AF37] hover:bg-[#F3C64F] text-[#0B0D13] font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shadow-[#D4AF37]/20 active:scale-95 cursor-pointer"
        >
          {currentlyActive ? (
            <>
              <Pause className="w-4 h-4" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-current" />
              <span>Listen</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
