import React, { useState, useRef } from 'react';
import { Mic, MicOff, RefreshCw } from 'lucide-react';

interface AudioDictaphoneProps {
  onTranscribed: (text: string) => void;
  className?: string;
  buttonText?: string;
  compact?: boolean;
}

export const AudioDictaphone: React.FC<AudioDictaphoneProps> = ({
  onTranscribed,
  className = '',
  buttonText = 'Dictate Reflection',
  compact = false,
}) => {
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        // Stop all mic tracks
        stream.getTracks().forEach((track) => track.stop());
        await sendAudioToTranscribe(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone error:', err);
      alert('Microphone permission is required to transcribe audio with gemini-3.5-transcribe.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const sendAudioToTranscribe = async (blob: Blob) => {
    setIsTranscribing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        const response = await fetch('/api/tarot/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            audioBase64: base64Data,
            mimeType: blob.type || 'audio/webm',
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.text) {
            onTranscribed(result.text);
          }
        } else {
          console.error('Failed to transcribe audio with gemini-3.5-transcribe');
        }
        setIsTranscribing(false);
      };
      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Transcription error:', error);
      setIsTranscribing(false);
    }
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isTranscribing}
        title={isRecording ? 'Stop Recording' : 'Voice Dictation (gemini-3.5-transcribe)'}
        className={`p-2 rounded-lg border transition-all active:scale-95 flex items-center justify-center ${
          isRecording
            ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
            : 'bg-white/5 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/15'
        } ${className}`}
      >
        {isTranscribing ? (
          <RefreshCw className="w-4 h-4 animate-spin text-[#D4AF37]" />
        ) : isRecording ? (
          <MicOff className="w-4 h-4" />
        ) : (
          <Mic className="w-4 h-4" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={isRecording ? stopRecording : startRecording}
      disabled={isTranscribing}
      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all active:scale-95 flex items-center gap-1.5 ${
        isRecording
          ? 'bg-red-950/80 border-red-500 text-red-300 animate-pulse'
          : 'bg-[#D4AF37]/10 border-[#D4AF37]/30 text-[#D4AF37] hover:bg-[#D4AF37]/20'
      } ${className}`}
    >
      {isTranscribing ? (
        <>
          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
          <span>Transcribing via gemini-3.5-transcribe...</span>
        </>
      ) : isRecording ? (
        <>
          <MicOff className="w-3.5 h-3.5" />
          <span>Tap to Finish Speaking</span>
        </>
      ) : (
        <>
          <Mic className="w-3.5 h-3.5" />
          <span>{buttonText} (gemini-3.5-transcribe)</span>
        </>
      )}
    </button>
  );
};
