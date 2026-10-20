import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, RefreshCw, Upload, Sparkles, CheckCircle2, AlertCircle, Eye } from 'lucide-react';
import { SpreadAnalysisResult } from '../types/tarot.ts';
import { AudioDictaphone } from './AudioDictaphone.tsx';

interface CameraSpreadScannerProps {
  onSpreadAnalyzed: (result: SpreadAnalysisResult, snapshotDataUrl: string, query: string) => void;
}

export const CameraSpreadScanner: React.FC<CameraSpreadScannerProps> = ({ onSpreadAnalyzed }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [query, setQuery] = useState<string>('What message does this spread have for my highest good today?');
  const [spreadType, setSpreadType] = useState<string>('three_card');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Start Camera Stream with Safari iOS optimization
  const startCamera = useCallback(async () => {
    setCameraError(null);
    try {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by this browser. Please use photo upload.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      };

      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(newStream);
      setCameraActive(true);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        // Required for mobile Safari
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.muted = true;
        await videoRef.current.play().catch((e) => console.log('Autoplay warning:', e));
      }
    } catch (err: any) {
      console.error('Camera access error:', err);
      setCameraError(
        err.name === 'NotAllowedError'
          ? 'Camera permission was denied. You can allow camera in Safari settings or upload a photo of your spread.'
          : err.message || 'Unable to start camera. Please upload a photo of your cards.'
      );
      setCameraActive(false);
    }
  }, [facingMode]);

  // Stop camera stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Switch camera facing mode
  const toggleCameraLens = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Capture frame from video stream to canvas
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCapturedImage(dataUrl);

      // Stop camera once captured
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setCameraActive(false);
      }
    }
  };

  // Handle file upload fallback (camera roll / files)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setCapturedImage(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Send to Gemini Vision API for identification & interpretation
  const analyzeSpreadWithAI = async () => {
    if (!capturedImage) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const response = await fetch('/api/tarot/analyze-spread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: capturedImage,
          spreadType,
          query,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to interpret spread with Gemini vision.');
      }

      const result: SpreadAnalysisResult = await response.json();
      onSpreadAnalyzed(result, capturedImage, query);
    } catch (err: any) {
      console.error('Spread analysis error:', err);
      setAnalysisError(err.message || 'Error analyzing spread. Please ensure the cards are well-lit.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header Introduction */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-xs text-emerald-400 mb-3 font-medium">
          <span>📷 Easy Camera Reading for Real Cards</span>
        </div>
        <h1 className="font-serif-tarot text-2xl sm:text-3xl lg:text-4xl font-bold text-[#EAE5D9] tracking-wide">
          Snap a Photo of Your Cards
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#A6AFCA] max-w-xl mx-auto">
          Have real tarot cards laid out on your table or bed? Take a quick picture with your phone or laptop camera, and we'll read them out loud for you!
        </p>
      </div>

      {/* Intention / Focus Input */}
      <div className="mb-6 p-4 rounded-xl border border-[#D4AF37]/20 bg-[#121526]/80 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <label htmlFor="tarot-query-input" className="block text-xs font-serif-tarot font-semibold text-[#D4AF37] uppercase tracking-wider">
            Vicky's Question or Focus Intention
          </label>
          <AudioDictaphone
            onTranscribed={(text) => setQuery(text)}
            compact={true}
          />
        </div>
        <div className="relative">
          <input
            id="tarot-query-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., Guidance for my career transition, relationship healing, or daily energy..."
            className="w-full px-3.5 py-2.5 rounded-lg bg-[#0B0D13] border border-[#D4AF37]/30 text-[#EAE5D9] text-sm focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-[#A6AFCA]">Spread Type:</span>
          {['daily_card', 'three_card', 'celtic_cross', 'custom_spread'].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setSpreadType(type)}
              className={`px-2.5 py-1 text-xs rounded-md border transition-colors ${
                spreadType === type
                  ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37] font-medium'
                  : 'border-white/10 text-[#A6AFCA] hover:border-white/20'
              }`}
            >
              {type === 'daily_card' && 'Single Card'}
              {type === 'three_card' && '3-Card Spread'}
              {type === 'celtic_cross' && 'Celtic Cross'}
              {type === 'custom_spread' && 'Freeform Spread'}
            </button>
          ))}
        </div>
      </div>

      {/* Camera Viewfinder or Preview Box */}
      <div className="relative rounded-2xl border border-[#D4AF37]/30 bg-black overflow-hidden shadow-2xl min-h-[360px] flex items-center justify-center">
        {capturedImage ? (
          // Captured Image Preview Mode
          <div className="relative w-full h-full max-h-[500px] flex items-center justify-center bg-black">
            <img
              src={capturedImage}
              alt="Captured tarot spread"
              className="max-h-[500px] w-auto object-contain"
            />
            <div className="absolute top-4 right-4 flex items-center gap-2">
              <button
                onClick={() => {
                  setCapturedImage(null);
                  startCamera();
                }}
                className="px-3 py-1.5 text-xs bg-black/70 hover:bg-black/90 text-[#EAE5D9] border border-white/20 rounded-lg backdrop-blur-md flex items-center gap-1.5 transition-all"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Retake</span>
              </button>
            </div>
          </div>
        ) : cameraActive ? (
          // Active Live Camera Stream
          <div className="relative w-full h-full min-h-[380px] sm:min-h-[460px] bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover min-h-[380px]"
            />

            {/* Viewfinder Alignment Guide Frame */}
            <div className="absolute inset-4 sm:inset-8 border border-[#D4AF37]/40 rounded-xl pointer-events-none flex flex-col items-center justify-between p-4">
              <div className="text-[11px] font-serif-tarot text-[#D4AF37] bg-black/60 px-3 py-1 rounded-full backdrop-blur-md">
                Align cards within the altar frame
              </div>

              {/* Three-box guide silhouettes */}
              <div className="flex items-center justify-center gap-3 w-full opacity-60">
                <div className="w-20 sm:w-28 h-32 sm:h-44 border border-dashed border-[#D4AF37] rounded-lg flex items-center justify-center text-[10px] text-[#D4AF37]">
                  Card 1
                </div>
                <div className="w-20 sm:w-28 h-32 sm:h-44 border border-dashed border-[#D4AF37] rounded-lg flex items-center justify-center text-[10px] text-[#D4AF37]">
                  Card 2
                </div>
                <div className="w-20 sm:w-28 h-32 sm:h-44 border border-dashed border-[#D4AF37] rounded-lg flex items-center justify-center text-[10px] text-[#D4AF37]">
                  Card 3
                </div>
              </div>

              <div className="text-[10px] text-white/70 bg-black/60 px-2 py-0.5 rounded">
                Good natural lighting ensures accurate Rider-Waite detection
              </div>
            </div>

            {/* Live Camera Controls */}
            <div className="absolute bottom-6 inset-x-0 flex items-center justify-center gap-6 px-4">
              <button
                onClick={toggleCameraLens}
                title="Switch Camera Lens"
                className="w-11 h-11 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center hover:bg-black/90 active:scale-90 transition-all backdrop-blur-md"
              >
                <RefreshCw className="w-5 h-5" />
              </button>

              <button
                onClick={captureSnapshot}
                className="w-18 h-18 rounded-full border-4 border-[#D4AF37] bg-[#D4AF37]/20 flex items-center justify-center active:scale-95 transition-all shadow-lg shadow-[#D4AF37]/40 hover:bg-[#D4AF37]/40"
              >
                <div className="w-13 h-13 rounded-full bg-[#D4AF37] flex items-center justify-center">
                  <Camera className="w-6 h-6 text-[#0B0D13]" />
                </div>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                title="Upload Photo Instead"
                className="w-11 h-11 rounded-full bg-black/70 border border-white/20 text-white flex items-center justify-center hover:bg-black/90 active:scale-90 transition-all backdrop-blur-md"
              >
                <Upload className="w-5 h-5" />
              </button>
            </div>
          </div>
        ) : (
          // Zero-State: Camera Not Started Yet
          <div className="p-8 text-center flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mb-4 text-[#D4AF37]">
              <Camera className="w-8 h-8" />
            </div>
            <h3 className="font-serif-tarot text-lg font-bold text-[#EAE5D9] mb-1">
              Ready to Scan Your Cards
            </h3>
            <p className="text-xs sm:text-sm text-[#A6AFCA] max-w-sm mb-6">
              Safari on iOS or Mac supports instant camera scanning or direct photo upload from your photo library.
            </p>

            {cameraError && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2 max-w-md text-left">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{cameraError}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={startCamera}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#F3C64F] text-[#0B0D13] font-semibold text-sm transition-all shadow-md shadow-[#D4AF37]/20 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Camera className="w-4 h-4" />
                <span>Open Safari Camera</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#EAE5D9] border border-white/20 font-medium text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Upload className="w-4 h-4 text-[#D4AF37]" />
                <span>Upload Spread Photo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Hidden File Input & Canvas */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileUpload}
      />
      <canvas ref={canvasRef} className="hidden" />

      {/* Analysis Action Bar if Image is Ready */}
      {capturedImage && (
        <div className="mt-6 flex flex-col items-center">
          {analysisError && (
            <div className="mb-3 w-full p-3 rounded-lg bg-red-950/40 border border-red-800/50 text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{analysisError}</span>
            </div>
          )}

          <button
            onClick={analyzeSpreadWithAI}
            disabled={isAnalyzing}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3C64F] hover:from-[#F3C64F] hover:to-[#D4AF37] text-[#0B0D13] font-bold text-base transition-all shadow-xl shadow-[#D4AF37]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Consulting Gemini Vision & Rider-Waite Archives...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Interpret Spread with AI & Prepare Live Voice</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
