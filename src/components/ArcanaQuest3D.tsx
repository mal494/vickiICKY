import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  Volume2,
  VolumeX,
  ArrowLeft,
  Bookmark,
  Sparkles,
  Check,
  Send,
  Eye,
  RotateCw,
  X,
  Compass,
  MessageCircle,
  Play,
  Square,
} from 'lucide-react';
import { TAROT_DECK, TarotCard, drawRandomCards } from '../data/tarotDeck.ts';
import { AudioDictaphone } from './AudioDictaphone.tsx';
import { SavedReading } from '../types/tarot.ts';

interface FirstPersonTarotProps {
  onExitGame: () => void;
  onSaveReading?: (reading: Omit<SavedReading, 'id' | 'createdAt'>) => Promise<void>;
}

interface CardSlot {
  mesh: THREE.Mesh;
  targetPos: THREE.Vector3;
  targetRot: THREE.Euler;
  currentPos: THREE.Vector3;
  currentRot: THREE.Euler;
  cardData: TarotCard;
  isReversed: boolean;
  isFlipped: boolean;
  isHovered: boolean;
  positionName: string;
  positionDesc: string;
}

interface FanCardSlot {
  mesh: THREE.Mesh;
  targetPos: THREE.Vector3;
  targetRot: THREE.Euler;
  cardData: TarotCard;
  isReversed: boolean;
  isHovered: boolean;
  isSelected: boolean;
  slotIndex: number;
}

export const ArcanaQuest3D: React.FC<FirstPersonTarotProps> = ({ onExitGame, onSaveReading }) => {
  // Reading Ritual Phases:
  // 'welcome' -> 'intention' -> 'shuffling' -> 'picking' -> 'reading' -> 'synthesis'
  const [phase, setPhase] = useState<'welcome' | 'intention' | 'shuffling' | 'picking' | 'reading' | 'synthesis'>('welcome');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [userQuery, setUserQuery] = useState<string>('What spiritual guidance awaits me today?');
  const [spokenSubtitle, setSpokenSubtitle] = useState<string>(
    "Welcome to your sanctuary, Vicky. Michael had this created for your sacred intuition. Click 'Hear Welcome' or take a seat to begin."
  );
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [pickedCount, setPickedCount] = useState<number>(0);
  const [inspectedCard, setInspectedCard] = useState<CardSlot | null>(null);

  // Follow-up consultation state
  const [followupText, setFollowupText] = useState<string>('');
  const [isAskingFollowup, setIsAskingFollowup] = useState<boolean>(false);
  const [showConsultBox, setShowConsultBox] = useState<boolean>(false);

  const canvasMountRef = useRef<HTMLDivElement>(null);

  // Strict Single-Voice Audio References
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceAbortRef = useRef<AbortController | null>(null);

  // Mutable 3D and Web Audio Simulation Ref
  const simRef = useRef<{
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    raycaster: THREE.Raycaster;
    mouse: THREE.Vector2;
    lookYaw: number;
    lookPitch: number;
    targetLookYaw: number;
    targetLookPitch: number;
    isPointerDown: boolean;
    lastPointerX: number;
    lastPointerY: number;
    spreadSlots: CardSlot[];
    fanSlots: FanCardSlot[];
    candleLights: THREE.PointLight[];
    smokeParticles: THREE.Points | null;
    smokeGeo: THREE.BufferGeometry | null;
    audioCtx: AudioContext | null;
    ambientDroneGain: GainNode | null;
    deckMesh: THREE.Mesh | null;
    readerGroup: THREE.Group | null;
    clock: THREE.Clock;
    animId: number;
    isMuted: boolean;
    activePhase: string;
    lastHoveredObjectId: string | null;
    interactiveObjects: Array<{ mesh: THREE.Object3D; type: 'fan_card' | 'spread_card' | 'crystal' | 'candle' | 'incense'; id: string }>;
  }>({
    scene: null,
    camera: null,
    renderer: null,
    raycaster: new THREE.Raycaster(),
    mouse: new THREE.Vector2(-1000, -1000),
    lookYaw: 0,
    lookPitch: 0,
    targetLookYaw: 0,
    targetLookPitch: 0,
    isPointerDown: false,
    lastPointerX: 0,
    lastPointerY: 0,
    spreadSlots: [],
    fanSlots: [],
    candleLights: [],
    smokeParticles: null,
    smokeGeo: null,
    audioCtx: null,
    ambientDroneGain: null,
    deckMesh: null,
    readerGroup: null,
    clock: new THREE.Clock(),
    animId: 0,
    isMuted: false,
    activePhase: 'welcome',
    lastHoveredObjectId: null,
    interactiveObjects: [],
  });

  // Stop any and all ongoing voices immediately
  const stopAllVoice = useCallback(() => {
    if (voiceAbortRef.current) {
      voiceAbortRef.current.abort();
      voiceAbortRef.current = null;
    }
    if (voiceAudioRef.current) {
      voiceAudioRef.current.pause();
      voiceAudioRef.current.currentTime = 0;
      voiceAudioRef.current = null;
    }
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllVoice();
      if (simRef.current.audioCtx) {
        simRef.current.audioCtx.close().catch(() => {});
      }
    };
  }, [stopAllVoice]);

  useEffect(() => {
    simRef.current.isMuted = isMuted;
    if (simRef.current.ambientDroneGain) {
      simRef.current.ambientDroneGain.gain.setTargetAtTime(
        isMuted ? 0 : 0.025,
        simRef.current.audioCtx?.currentTime || 0,
        0.1
      );
    }
    if (isMuted) {
      stopAllVoice();
    }
  }, [isMuted, stopAllVoice]);

  useEffect(() => {
    simRef.current.activePhase = phase;
  }, [phase]);

  // Procedural Web Audio Synth Sounds (Zero external URLs)
  const initAudioCtx = useCallback(() => {
    if (!simRef.current.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        simRef.current.audioCtx = ctx;

        // Ambient 432Hz Tibetan Singing Bowl / Altar Drone
        try {
          const droneGain = ctx.createGain();
          droneGain.gain.setValueAtTime(simRef.current.isMuted ? 0 : 0.025, ctx.currentTime);
          droneGain.connect(ctx.destination);
          simRef.current.ambientDroneGain = droneGain;

          const osc1 = ctx.createOscillator();
          osc1.type = 'sine';
          osc1.frequency.setValueAtTime(216, ctx.currentTime); // 432Hz sub-octave
          osc1.connect(droneGain);
          osc1.start();

          const osc2 = ctx.createOscillator();
          osc2.type = 'triangle';
          osc2.frequency.setValueAtTime(432, ctx.currentTime); // Sacred harmonic
          const osc2Gain = ctx.createGain();
          osc2Gain.gain.setValueAtTime(0.25, ctx.currentTime);
          osc2.connect(osc2Gain);
          osc2Gain.connect(droneGain);
          osc2.start();
        } catch {
          // autoplay restrictions
        }
      }
    }
    if (simRef.current.audioCtx?.state === 'suspended') {
      simRef.current.audioCtx.resume();
    }
  }, []);

  // Ambient Hover Acoustics (Triggered only when hovering over altar elements)
  const playHoverAmbient = useCallback((type: 'card' | 'crystal' | 'candle' | 'incense') => {
    if (simRef.current.isMuted) return;
    try {
      initAudioCtx();
      const ctx = simRef.current.audioCtx;
      if (!ctx) return;
      const now = ctx.currentTime;

      if (type === 'card') {
        // Soft velvet card shimmer / paper brush
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(390, now + 0.09);
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'crystal') {
        // Pure crystalline glass harmonic chime
        [792, 1056].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.02);
          gain.gain.setValueAtTime(0.035, now + idx * 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.02);
          osc.stop(now + 0.4);
        });
      } else if (type === 'candle') {
        // Soft warm flame movement
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(95, now + 0.12);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.12);
      } else if (type === 'incense') {
        // Soft sacred breath
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(220, now);
        gain.gain.setValueAtTime(0.02, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      }
    } catch {
      //
    }
  }, [initAudioCtx]);

  // Click Sound Effects
  const playSfx = useCallback((type: 'deal' | 'flip' | 'chime' | 'fan' | 'pick') => {
    if (simRef.current.isMuted) return;
    try {
      initAudioCtx();
      const ctx = simRef.current.audioCtx;
      if (!ctx) return;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'deal') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.16);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
        osc.start(now);
        osc.stop(now + 0.16);
      } else if (type === 'fan') {
        [160, 210, 260, 310, 360].forEach((freq, idx) => {
          const fOsc = ctx.createOscillator();
          const fGain = ctx.createGain();
          fOsc.type = 'triangle';
          fOsc.frequency.setValueAtTime(freq, now + idx * 0.04);
          fGain.gain.setValueAtTime(0.035, now + idx * 0.04);
          fGain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.04 + 0.12);
          fOsc.connect(fGain);
          fGain.connect(ctx.destination);
          fOsc.start(now + idx * 0.04);
          fOsc.stop(now + idx * 0.04 + 0.12);
        });
      } else if (type === 'pick') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(380, now);
        osc.frequency.exponentialRampToValueAtTime(540, now + 0.14);
        gain.gain.setValueAtTime(0.07, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === 'flip') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(300, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.22);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.22);
      } else if (type === 'chime') {
        [528, 660, 792, 1056].forEach((freq, idx) => {
          const cOsc = ctx.createOscillator();
          const cGain = ctx.createGain();
          cOsc.type = 'sine';
          cOsc.frequency.setValueAtTime(freq, now + idx * 0.03);
          cGain.gain.setValueAtTime(0.07, now + idx * 0.03);
          cGain.gain.exponentialRampToValueAtTime(0.001, now + 1.1);
          cOsc.connect(cGain);
          cGain.connect(ctx.destination);
          cOsc.start(now + idx * 0.03);
          cOsc.stop(now + 1.1);
        });
      }
    } catch {
      //
    }
  }, [initAudioCtx]);

  // Click-To-Speak Handler (Strictly 1 voice at a time, cancels any existing)
  const speakOnClick = useCallback(async (text: string) => {
    // 1. Instantly stop all existing audio/speech
    stopAllVoice();

    setSpokenSubtitle(text);
    setIsSpeaking(true);

    const abortCtrl = new AbortController();
    voiceAbortRef.current = abortCtrl;

    try {
      const res = await fetch('/api/tarot/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceName: 'Kore' }),
        signal: abortCtrl.signal,
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioUrl && !abortCtrl.signal.aborted) {
          const audio = new Audio(data.audioUrl);
          voiceAudioRef.current = audio;
          audio.onended = () => {
            setIsSpeaking(false);
            voiceAudioRef.current = null;
          };
          audio.onerror = () => {
            if (!abortCtrl.signal.aborted) speakBrowserFallback(text);
          };
          try {
            await audio.play();
          } catch (playErr) {
            console.warn('Audio playback notice:', playErr);
            if (!abortCtrl.signal.aborted) speakBrowserFallback(text);
          }
          return;
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') return;
      console.warn('Speech request notice:', err);
    }

    if (!abortCtrl.signal.aborted) {
      speakBrowserFallback(text);
    }
  }, [stopAllVoice]);

  const speakBrowserFallback = (text: string) => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.rate = 0.92;
      u.pitch = 0.98;

      const voices = window.speechSynthesis.getVoices();
      const preferred = voices.find(
        (v) =>
          v.name.includes('Samantha') ||
          v.name.includes('Karen') ||
          v.name.includes('Google UK English Female') ||
          v.name.includes('Serena') ||
          v.name.includes('Victoria') ||
          v.name.includes('Moira') ||
          (v.lang.startsWith('en') && v.name.toLowerCase().includes('female'))
      );
      if (preferred) u.voice = preferred;

      u.onstart = () => setIsSpeaking(true);
      u.onend = () => setIsSpeaking(false);
      u.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(u);
    } else {
      setIsSpeaking(false);
    }
  };

  // High-Resolution Procedural Card Texture (Authentic Rider-Waite-Smith styling)
  const createCardFaceTexture = (card: TarotCard, isReversed: boolean) => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d')!;

    // Rich parchment background
    const grad = ctx.createLinearGradient(0, 0, 0, 768);
    grad.addColorStop(0, '#1c2035');
    grad.addColorStop(0.5, '#12162a');
    grad.addColorStop(1, '#0b0e1c');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 768);

    // Gilded antique gold border with double inlay
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 12;
    ctx.strokeRect(18, 18, 476, 732);
    ctx.lineWidth = 2;
    ctx.strokeRect(32, 32, 448, 704);

    // Corner rosettes
    const drawRosette = (x: number, y: number) => {
      ctx.fillStyle = '#D4AF37';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
    };
    drawRosette(32, 32);
    drawRosette(480, 32);
    drawRosette(32, 736);
    drawRosette(480, 736);

    // Number / Roman Numeral at top
    ctx.fillStyle = '#D4AF37';
    ctx.font = 'bold 36px Cinzel, serif';
    ctx.textAlign = 'center';
    ctx.fillText(card.romanNumeral || String(card.number), 256, 82);

    // Inner Illustration Box
    ctx.fillStyle = '#0f1322';
    ctx.fillRect(48, 110, 416, 480);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.45)';
    ctx.lineWidth = 2;
    ctx.strokeRect(48, 110, 416, 480);

    // Card Symbol Emblem
    ctx.font = '120px sans-serif';
    ctx.fillText(card.iconSymbol, 256, 370);

    // Arcana & Element Subtitle
    ctx.fillStyle = 'rgba(212, 175, 55, 0.9)';
    ctx.font = 'bold 20px Cinzel, serif';
    ctx.fillText(
      `${card.arcana === 'major' ? 'MAJOR ARCANA' : card.suit.toUpperCase()} · ${card.element.toUpperCase()}`,
      256,
      550
    );

    // Card Name Banner
    ctx.fillStyle = '#EAE5D9';
    ctx.font = 'bold 30px Cinzel, serif';
    ctx.fillText(card.name.toUpperCase(), 256, 645);

    // Orientation Indicator
    ctx.fillStyle = isReversed ? '#F59E0B' : '#D4AF37';
    ctx.font = 'italic 20px serif';
    ctx.fillText(isReversed ? '— REVERSED —' : '— UPRIGHT —', 256, 690);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  // Card Back Texture: Sacred Celestial Mandala
  const createCardBackTexture = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 768;
    const ctx = canvas.getContext('2d')!;

    // Midnight navy gradient
    ctx.fillStyle = '#080a14';
    ctx.fillRect(0, 0, 512, 768);

    // Gold borders
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 10;
    ctx.strokeRect(16, 16, 480, 736);
    ctx.lineWidth = 2;
    ctx.strokeRect(28, 28, 456, 712);

    // Concentric celestial mandala
    ctx.save();
    ctx.translate(256, 384);
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.75)';
    ctx.lineWidth = 2;

    for (let r = 40; r <= 180; r += 32) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 8-Pointed Star
    ctx.fillStyle = 'rgba(212, 175, 55, 0.25)';
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4;
      const r1 = 180;
      const r2 = 65;
      const x1 = Math.cos(angle) * r1;
      const y1 = Math.sin(angle) * r1;
      const x2 = Math.cos(angle + Math.PI / 8) * r2;
      const y2 = Math.sin(angle + Math.PI / 8) * r2;
      if (i === 0) ctx.moveTo(x1, y1);
      else ctx.lineTo(x1, y1);
      ctx.lineTo(x2, y2);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  };

  // Setup WebGL First-Person Sanctuary Scene
  useEffect(() => {
    const container = canvasMountRef.current;
    if (!container) return;

    // 1. Scene & Seated First-Person Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06080f);
    scene.fog = new THREE.FogExp2(0x06080f, 0.1);

    // First person seated height: Y = 1.34m, looking down slightly at table
    const camera = new THREE.PerspectiveCamera(54, container.clientWidth / container.clientHeight, 0.05, 30);
    camera.position.set(0, 1.34, 0.95);
    camera.rotation.x = -0.22;

    const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // 2. Studio PBR Environment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Ambient Room Lighting & Candle Lights
    const hemiLight = new THREE.HemisphereLight(0x353d5a, 0x0f121d, 0.55);
    scene.add(hemiLight);

    // Soft cool moonlight through high arched window
    const moonLight = new THREE.DirectionalLight(0x7088b0, 0.65);
    moonLight.position.set(-3.5, 6, -3);
    moonLight.castShadow = true;
    scene.add(moonLight);

    // Warm Beeswax Candle Point Lights on Table
    const candle1 = new THREE.PointLight(0xffa540, 2.3, 5.0, 1.8);
    candle1.position.set(-0.65, 1.15, -0.1);
    candle1.castShadow = true;
    candle1.shadow.bias = -0.002;
    scene.add(candle1);

    const candle2 = new THREE.PointLight(0xffa540, 2.3, 5.0, 1.8);
    candle2.position.set(0.65, 1.15, -0.1);
    candle2.castShadow = true;
    candle2.shadow.bias = -0.002;
    scene.add(candle2);

    simRef.current.candleLights = [candle1, candle2];

    // 4. Room Floor & Gothic Wall Paneling
    const roomFloorMat = new THREE.MeshStandardMaterial({ color: 0x090c15, roughness: 0.9, metalness: 0.1 });
    const roomFloor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), roomFloorMat);
    roomFloor.rotation.x = -Math.PI / 2;
    roomFloor.receiveShadow = true;
    scene.add(roomFloor);

    // Back Wall
    const backWallMat = new THREE.MeshStandardMaterial({ color: 0x080a12, roughness: 0.95 });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), backWallMat);
    backWall.position.set(0, 4, -3.5);
    scene.add(backWall);

    // 5. The Mahogany Tarot Table (3-Part Composite)
    const tableGroup = new THREE.Group();
    const tableTopMat = new THREE.MeshStandardMaterial({ color: 0x1a120c, roughness: 0.35, metalness: 0.1 });
    const tableTop = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.08, 1.15), tableTopMat);
    tableTop.position.set(0, 0.8, 0);
    tableTop.receiveShadow = true;
    tableTop.castShadow = true;
    tableGroup.add(tableTop);

    // Velvet Ritual Altar Cloth with Gold Borders
    const clothMat = new THREE.MeshStandardMaterial({ color: 0x161026, roughness: 0.85, metalness: 0.15 });
    const altarCloth = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.015, 0.9), clothMat);
    altarCloth.position.set(0, 0.845, 0);
    altarCloth.receiveShadow = true;
    tableGroup.add(altarCloth);

    // Table Legs
    const legGeo = new THREE.CylinderGeometry(0.04, 0.05, 0.8, 12);
    [[-0.85, 0.45], [0.85, 0.45], [-0.85, -0.45], [0.85, -0.45]].forEach(([lx, lz]) => {
      const leg = new THREE.Mesh(legGeo, tableTopMat);
      leg.position.set(lx, 0.4, lz);
      tableGroup.add(leg);
    });
    scene.add(tableGroup);

    // 6. Altar Props: Candelabras, Natural Crystals, Incense Burner
    const brassMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.85, roughness: 0.25 });
    const waxMat = new THREE.MeshStandardMaterial({ color: 0xf5eedb, roughness: 0.4 });
    const flameMat = new THREE.MeshBasicMaterial({ color: 0xffcc33 });

    // Interactive Registry for Hover Sound Detection
    const interactiveList: Array<{ mesh: THREE.Object3D; type: 'fan_card' | 'spread_card' | 'crystal' | 'candle' | 'incense'; id: string }> = [];

    // Left Candle
    const c1Group = new THREE.Group();
    c1Group.position.set(-0.65, 0.85, -0.1);
    const c1Base = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.05, 12), brassMat);
    c1Group.add(c1Base);
    const c1Stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 12), waxMat);
    c1Stem.position.y = 0.11;
    c1Group.add(c1Stem);
    const flame1 = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.05, 8), flameMat);
    flame1.position.y = 0.24;
    c1Group.add(flame1);
    scene.add(c1Group);
    interactiveList.push({ mesh: c1Stem, type: 'candle', id: 'candle_left' });

    // Right Candle
    const c2Group = new THREE.Group();
    c2Group.position.set(0.65, 0.85, -0.1);
    const c2Base = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.05, 12), brassMat);
    c2Group.add(c2Base);
    const c2Stem = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.22, 12), waxMat);
    c2Stem.position.y = 0.11;
    c2Group.add(c2Stem);
    const flame2 = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.05, 8), flameMat);
    flame2.position.y = 0.24;
    c2Group.add(flame2);
    scene.add(c2Group);
    interactiveList.push({ mesh: c2Stem, type: 'candle', id: 'candle_right' });

    // Incense Burner
    const incenseGroup = new THREE.Group();
    incenseGroup.position.set(0.55, 0.85, 0.15);
    const incenseDish = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.03, 0.015, 12), brassMat);
    incenseGroup.add(incenseDish);
    const incenseStick = new THREE.Mesh(
      new THREE.CylinderGeometry(0.002, 0.002, 0.14, 6),
      new THREE.MeshStandardMaterial({ color: 0x3d2817 })
    );
    incenseStick.position.set(0, 0.07, 0);
    incenseStick.rotation.z = 0.15;
    incenseGroup.add(incenseStick);
    const ember = new THREE.Mesh(new THREE.SphereGeometry(0.004, 6, 6), new THREE.MeshBasicMaterial({ color: 0xff3300 }));
    ember.position.set(-0.01, 0.14, 0);
    incenseGroup.add(ember);
    scene.add(incenseGroup);
    interactiveList.push({ mesh: incenseDish, type: 'incense', id: 'incense_dish' });

    // Procedural Rising Incense Smoke Particle System
    const smokeCount = 50;
    const smokePositions = new Float32Array(smokeCount * 3);
    for (let i = 0; i < smokeCount; i++) {
      smokePositions[i * 3] = 0.54 + (Math.random() - 0.5) * 0.02;
      smokePositions[i * 3 + 1] = 0.99 + (i / smokeCount) * 0.45;
      smokePositions[i * 3 + 2] = 0.15 + (Math.random() - 0.5) * 0.02;
    }
    const smokeGeo = new THREE.BufferGeometry();
    smokeGeo.setAttribute('position', new THREE.BufferAttribute(smokePositions, 3));
    const smokeMat = new THREE.PointsMaterial({
      color: 0xaaaaaa,
      size: 0.035,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const smokeParticles = new THREE.Points(smokeGeo, smokeMat);
    scene.add(smokeParticles);
    simRef.current.smokeParticles = smokeParticles;
    simRef.current.smokeGeo = smokeGeo;

    // Natural Altar Crystals
    const quartzMesh = new THREE.Mesh(
      new THREE.ConeGeometry(0.035, 0.15, 6),
      new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.85, roughness: 0.1, ior: 1.54 })
    );
    quartzMesh.position.set(0.5, 0.92, -0.15);
    scene.add(quartzMesh);
    interactiveList.push({ mesh: quartzMesh, type: 'crystal', id: 'crystal_quartz' });

    const amethystMesh = new THREE.Mesh(
      new THREE.DodecahedronGeometry(0.045),
      new THREE.MeshPhysicalMaterial({ color: 0x9333ea, transmission: 0.7, roughness: 0.2, ior: 1.55 })
    );
    amethystMesh.position.set(-0.5, 0.885, -0.15);
    scene.add(amethystMesh);
    interactiveList.push({ mesh: amethystMesh, type: 'crystal', id: 'crystal_amethyst' });

    // 7. The Tarot Reader Sitting Opposite You in First-Person
    const readerGroup = new THREE.Group();
    readerGroup.position.set(0, 0, -1.25);

    // Robed Body
    const robeMat = new THREE.MeshStandardMaterial({ color: 0x111424, roughness: 0.95 });
    const readerBody = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.45, 1.1, 16), robeMat);
    readerBody.position.y = 0.65;
    readerGroup.add(readerBody);

    // Mystical Hood
    const hoodMat = new THREE.MeshStandardMaterial({ color: 0x0f1220, roughness: 0.9 });
    const readerHood = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.42, 12), hoodMat);
    readerHood.position.y = 1.38;
    readerHood.rotation.x = 0.1;
    readerGroup.add(readerHood);

    // Gold Amulet
    const amulet = new THREE.Mesh(new THREE.TorusGeometry(0.04, 0.008, 6, 16), brassMat);
    amulet.position.set(0, 1.05, 0.22);
    readerGroup.add(amulet);

    // Reader Hands resting on table edge
    const handMat = new THREE.MeshStandardMaterial({ color: 0xd9b38c, roughness: 0.6 });
    const leftHand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), handMat);
    leftHand.position.set(-0.25, 0.87, 0.55);
    readerGroup.add(leftHand);

    const rightHand = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 8), handMat);
    rightHand.position.set(0.25, 0.87, 0.55);
    readerGroup.add(rightHand);

    scene.add(readerGroup);
    simRef.current.readerGroup = readerGroup;

    // 8. The Deck Mesh Resting on Table
    const cardBackTex = createCardBackTexture();
    const deckMat = new THREE.MeshStandardMaterial({ color: 0x0d101e, roughness: 0.5, metalness: 0.3 });
    const deckMesh = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.07, 0.28), deckMat);
    deckMesh.position.set(-0.52, 0.885, -0.05);
    scene.add(deckMesh);
    simRef.current.deckMesh = deckMesh;

    // 9. Prepare 14 Fanned Cards across front of table for Vicky to interactively pick
    const randomPicks = drawRandomCards(14, true);
    const fanSlots: FanCardSlot[] = [];
    const edgeMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.9, roughness: 0.3 });
    const backMat = new THREE.MeshStandardMaterial({ map: cardBackTex, roughness: 0.4, metalness: 0.2 });

    const totalFanCards = 14;
    for (let i = 0; i < totalFanCards; i++) {
      const pull = randomPicks[i];
      const cardFrontTex = createCardFaceTexture(pull.card, pull.isReversed);
      const frontMat = new THREE.MeshStandardMaterial({ map: cardFrontTex, roughness: 0.4, metalness: 0.1 });

      const materials = [edgeMat, edgeMat, edgeMat, edgeMat, frontMat, backMat];
      const cardGeo = new THREE.BoxGeometry(0.22, 0.004, 0.34);
      const fanMesh = new THREE.Mesh(cardGeo, materials);

      // Curved Arc across Vicky's view
      const angle = ((i - (totalFanCards - 1) / 2) / (totalFanCards - 1)) * 0.7; // ~40 deg fan
      const radius = 0.75;
      const arcX = Math.sin(angle) * radius;
      const arcZ = 0.22 + (1 - Math.cos(angle)) * 0.15;

      fanMesh.position.set(arcX, 0.852 + i * 0.001, arcZ);
      fanMesh.rotation.set(0, -angle, Math.PI); // Face down
      fanMesh.castShadow = true;
      fanMesh.receiveShadow = true;
      scene.add(fanMesh);

      fanSlots.push({
        mesh: fanMesh,
        targetPos: new THREE.Vector3(arcX, 0.852 + i * 0.001, arcZ),
        targetRot: new THREE.Euler(0, -angle, Math.PI),
        cardData: pull.card,
        isReversed: pull.isReversed,
        isHovered: false,
        isSelected: false,
        slotIndex: i,
      });

      interactiveList.push({ mesh: fanMesh, type: 'fan_card', id: `fan_${i}` });
    }
    simRef.current.fanSlots = fanSlots;

    // 10. Spread Slots Configuration (The 3 Designated Altar Positions)
    const slotConfigs = [
      { name: '1. Past Foundation', desc: 'The ancestral root & recent energies shaping you', x: -0.38, z: -0.05 },
      { name: '2. Present Crossroads', desc: 'Your current energetic center & immediate choice', x: 0.0, z: -0.05 },
      { name: '3. Emerging Horizon', desc: 'The spiritual path & outcome coming into form', x: 0.38, z: -0.05 },
    ];

    simRef.current.spreadSlots = slotConfigs.map((cfg, idx) => ({
      mesh: null as any,
      targetPos: new THREE.Vector3(cfg.x, 0.855, cfg.z),
      targetRot: new THREE.Euler(0, 0, Math.PI),
      currentPos: new THREE.Vector3(cfg.x, 0.855, cfg.z),
      currentRot: new THREE.Euler(0, 0, Math.PI),
      cardData: null as any,
      isReversed: false,
      isFlipped: false,
      isHovered: false,
      positionName: cfg.name,
      positionDesc: cfg.desc,
    }));

    simRef.current.interactiveObjects = interactiveList;
    simRef.current.scene = scene;
    simRef.current.camera = camera;
    simRef.current.renderer = renderer;

    // 11. Mouse & Touch Controls (First-Person Look around Table)
    const onPointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      if (simRef.current.isPointerDown) {
        const dx = (clientX - simRef.current.lastPointerX) * 0.003;
        const dy = (clientY - simRef.current.lastPointerY) * 0.003;

        simRef.current.targetLookYaw = Math.max(-0.45, Math.min(0.45, simRef.current.targetLookYaw - dx));
        simRef.current.targetLookPitch = Math.max(-0.35, Math.min(0.25, simRef.current.targetLookPitch - dy));
      }

      simRef.current.lastPointerX = clientX;
      simRef.current.lastPointerY = clientY;

      // Update Normalized Mouse for Raycasting
      const rect = container.getBoundingClientRect();
      simRef.current.mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      simRef.current.mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      initAudioCtx();
      simRef.current.isPointerDown = true;
      let clientX = 0;
      let clientY = 0;
      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }
      simRef.current.lastPointerX = clientX;
      simRef.current.lastPointerY = clientY;
    };

    const onPointerUp = () => {
      simRef.current.isPointerDown = false;
    };

    container.addEventListener('mousemove', onPointerMove);
    container.addEventListener('mousedown', onPointerDown);
    window.addEventListener('mouseup', onPointerUp);
    container.addEventListener('touchmove', onPointerMove);
    container.addEventListener('touchstart', onPointerDown);
    window.addEventListener('touchend', onPointerUp);

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    // 12. Main 60fps Animation Loop with Raycast Hover Detection
    const animate = () => {
      const dt = Math.min(simRef.current.clock.getDelta(), 0.05);
      const time = simRef.current.clock.getElapsedTime();

      // Gentle candle flicker
      simRef.current.candleLights.forEach((candle, idx) => {
        candle.intensity = 2.1 + Math.sin(time * 7 + idx * 3.1) * 0.25 + (Math.random() - 0.5) * 0.08;
      });

      // Incense Smoke Particle Drift
      if (simRef.current.smokeGeo) {
        const posAttr = simRef.current.smokeGeo.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        for (let i = 0; i < smokeCount; i++) {
          arr[i * 3 + 1] += 0.003; // rise
          arr[i * 3] += Math.sin(time * 2 + i) * 0.0006; // curl wobble
          if (arr[i * 3 + 1] > 1.45) {
            arr[i * 3 + 1] = 0.99;
            arr[i * 3] = 0.54 + (Math.random() - 0.5) * 0.02;
          }
        }
        posAttr.needsUpdate = true;
      }

      // Smooth camera look damping
      simRef.current.lookYaw = THREE.MathUtils.damp(simRef.current.lookYaw, simRef.current.targetLookYaw, 8, dt);
      simRef.current.lookPitch = THREE.MathUtils.damp(simRef.current.lookPitch, simRef.current.targetLookPitch, 8, dt);

      camera.rotation.y = simRef.current.lookYaw;
      camera.rotation.x = -0.22 + simRef.current.lookPitch;
      camera.position.y = 1.34 + Math.sin(time * 1.4) * 0.003;

      // Reader subtle breathing
      if (simRef.current.readerGroup) {
        simRef.current.readerGroup.position.y = Math.sin(time * 1.5) * 0.005;
      }

      const activeP = simRef.current.activePhase;

      // Raycast to detect hover for ambient noise & visuals
      simRef.current.raycaster.setFromCamera(simRef.current.mouse, camera);

      // Collect all raycast targets
      const allRayTargets: THREE.Object3D[] = [];
      simRef.current.interactiveObjects.forEach((item) => allRayTargets.push(item.mesh));
      simRef.current.spreadSlots.forEach((s) => {
        if (s.mesh) allRayTargets.push(s.mesh);
      });

      const intersects = simRef.current.raycaster.intersectObjects(allRayTargets, true);

      if (intersects.length > 0) {
        // Find which object was hovered
        const hitObj = intersects[0].object;
        let matchedItem = simRef.current.interactiveObjects.find(
          (item) => item.mesh === hitObj || item.mesh.children.includes(hitObj)
        );

        let hoveredId = matchedItem?.id;
        let hoveredType = matchedItem?.type || 'card';

        // Check if it's one of the spread slots
        const matchedSpread = simRef.current.spreadSlots.find((s) => s.mesh === hitObj);
        if (matchedSpread) {
          hoveredId = `spread_${matchedSpread.positionName}`;
          hoveredType = 'spread_card';
        }

        // Trigger edge-triggered ambient noise on NEW hover!
        if (hoveredId && hoveredId !== simRef.current.lastHoveredObjectId) {
          simRef.current.lastHoveredObjectId = hoveredId;
          playHoverAmbient(
            hoveredType === 'crystal'
              ? 'crystal'
              : hoveredType === 'candle'
              ? 'candle'
              : hoveredType === 'incense'
              ? 'incense'
              : 'card'
          );
        }
      } else {
        simRef.current.lastHoveredObjectId = null;
      }

      // Fan card hover elevation
      if (activeP === 'picking') {
        const fanMeshes = simRef.current.fanSlots.filter((f) => !f.isSelected).map((f) => f.mesh);
        const fanIntersects = simRef.current.raycaster.intersectObjects(fanMeshes);

        simRef.current.fanSlots.forEach((f) => (f.isHovered = false));
        if (fanIntersects.length > 0) {
          const hit = fanIntersects[0].object as THREE.Mesh;
          const matching = simRef.current.fanSlots.find((f) => f.mesh === hit);
          if (matching && !matching.isSelected) matching.isHovered = true;
        }

        simRef.current.fanSlots.forEach((slot) => {
          if (!slot.isSelected) {
            slot.mesh.position.lerp(slot.targetPos, 0.1);
            slot.mesh.quaternion.slerp(new THREE.Quaternion().setFromEuler(slot.targetRot), 0.1);

            if (slot.isHovered) {
              slot.mesh.position.y = THREE.MathUtils.damp(slot.mesh.position.y, slot.targetPos.y + 0.03, 10, dt);
            }
          }
        });
      }

      // Altar spread cards hover elevation
      simRef.current.spreadSlots.forEach((slot) => {
        if (slot.mesh) {
          slot.mesh.position.lerp(slot.targetPos, 0.1);
          slot.mesh.quaternion.slerp(new THREE.Quaternion().setFromEuler(slot.targetRot), 0.1);

          if (slot.isHovered && !slot.isFlipped) {
            slot.mesh.position.y = THREE.MathUtils.damp(slot.mesh.position.y, slot.targetPos.y + 0.02, 10, dt);
          }
        }
      });

      if (activeP === 'reading') {
        const spreadMeshes = simRef.current.spreadSlots.filter((s) => s.mesh).map((s) => s.mesh);
        const spreadIntersects = simRef.current.raycaster.intersectObjects(spreadMeshes);

        simRef.current.spreadSlots.forEach((s) => (s.isHovered = false));
        if (spreadIntersects.length > 0) {
          const hit = spreadIntersects[0].object as THREE.Mesh;
          const matching = simRef.current.spreadSlots.find((s) => s.mesh === hit);
          if (matching) matching.isHovered = true;
        }
      }

      renderer.render(scene, camera);
      simRef.current.animId = requestAnimationFrame(animate);
    };

    simRef.current.animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(simRef.current.animId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', onPointerMove);
      container.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('mouseup', onPointerUp);
      container.removeEventListener('touchmove', onPointerMove);
      container.removeEventListener('touchstart', onPointerDown);
      window.removeEventListener('touchend', onPointerUp);
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [playHoverAmbient]);

  // Step 1: Start Reading & Shuffle (Silent shuffle, visual update only)
  const handleStartShuffle = () => {
    initAudioCtx();
    stopAllVoice();
    setPhase('shuffling');
    playSfx('fan');

    setSpokenSubtitle(
      "The cards are being shuffled across the velvet altar, Vicky. The spread is opening before you."
    );

    setTimeout(() => {
      setPhase('picking');
      playSfx('deal');
      setSpokenSubtitle(
        "Run your hand across the spread, Vicky. Hover to feel their energy, and click three cards to place them on your altar."
      );
    }, 2400);
  };

  // Step 2: Vicky Picks a Card from the Fan (Only SFX, no auto-speech)
  const pickCardFromFan = (fanSlot: FanCardSlot) => {
    if (phase !== 'picking' || fanSlot.isSelected || pickedCount >= 3) return;

    fanSlot.isSelected = true;
    const currentPickIndex = pickedCount;
    setPickedCount((prev) => prev + 1);

    playSfx('pick');
    playSfx('deal');

    const spreadSlot = simRef.current.spreadSlots[currentPickIndex];
    spreadSlot.cardData = fanSlot.cardData;
    spreadSlot.isReversed = fanSlot.isReversed;
    spreadSlot.mesh = fanSlot.mesh;

    // Slide card into altar position
    fanSlot.targetPos.set(spreadSlot.targetPos.x, spreadSlot.targetPos.y, spreadSlot.targetPos.z);
    fanSlot.targetRot.set(0, 0, Math.PI); // face down initially

    if (currentPickIndex === 0) {
      setSpokenSubtitle("First card set in Past Foundation. Choose your second card from the fan.");
    } else if (currentPickIndex === 1) {
      setSpokenSubtitle("Second card set at the Crossroads. Choose your third card for the Emerging Horizon.");
    } else if (currentPickIndex === 2) {
      setSpokenSubtitle(
        "Your three cards are resting on the altar. Click each card with your mouse to reveal and hear its guidance."
      );
      setTimeout(() => {
        simRef.current.fanSlots.forEach((f) => {
          if (!f.isSelected) {
            f.targetPos.set(-0.52, 0.885, -0.05); // return to deck
          }
        });
        setPhase('reading');
      }, 1000);
    }
  };

  // Step 3: Flip Card on Table (Explicit mouse click triggers voice for THIS card)
  const flipCard = async (index: number) => {
    const slot = simRef.current.spreadSlots[index];
    if (!slot) return;

    // If already flipped, clicking it re-reads that card aloud!
    if (slot.isFlipped) {
      const orientation = slot.isReversed ? 'Reversed' : 'Upright';
      const meaning = slot.isReversed ? slot.cardData.reversedMeaning : slot.cardData.uprightMeaning;
      speakOnClick(
        `In your ${slot.positionName}, rests ${slot.cardData.name}, ${orientation}. ${meaning}`
      );
      return;
    }

    slot.isFlipped = true;
    playSfx('flip');
    playSfx('chime');

    slot.targetPos.y = 0.875;
    slot.targetRot.set(0, 0, 0); // Face Up

    const orientation = slot.isReversed ? 'Reversed' : 'Upright';
    const meaning = slot.isReversed ? slot.cardData.reversedMeaning : slot.cardData.uprightMeaning;
    const cardText = `In your ${slot.positionName}, we reveal ${slot.cardData.name}, ${orientation}. ${meaning}`;

    // Click triggers voice exclusively
    speakOnClick(cardText);

    // Fetch dynamic personalized reading in background
    try {
      const res = await fetch('/api/tarot/parlor-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery,
          cards: simRef.current.spreadSlots.filter((s) => s.isFlipped).map((s) => ({
            positionName: s.positionName,
            cardName: s.cardData.name,
            isReversed: s.isReversed,
          })),
          activeCard: {
            name: slot.cardData.name,
            positionName: slot.positionName,
            isReversed: slot.isReversed,
          },
          mode: 'reveal_card',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.spokenText) {
          setSpokenSubtitle(data.spokenText);
        }
      }
    } catch {
      //
    }

    checkAllFlipped();
  };

  const checkAllFlipped = () => {
    const allDone = simRef.current.spreadSlots.every((s) => s.isFlipped);
    if (allDone) {
      setTimeout(() => {
        setPhase('synthesis');
        setSpokenSubtitle(
          "All three currents are unveiled across the altar, Vicky. Click 'Hear Synthesis' to listen to the unified reading."
        );
      }, 2500);
    }
  };

  // Step 4: Complete Spread Synthesis (Only triggered when user clicks 'Hear Synthesis')
  const handleHearSynthesis = async () => {
    try {
      const cardsPayload = simRef.current.spreadSlots.map((s) => ({
        positionName: s.positionName,
        cardName: s.cardData.name,
        isReversed: s.isReversed,
      }));

      const res = await fetch('/api/tarot/parlor-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery,
          cards: cardsPayload,
          mode: 'synthesis',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.spokenText) {
          speakOnClick(data.spokenText);
          return;
        }
      }
    } catch {
      // fallback
    }

    speakOnClick(
      "Vicky, your past foundation has fortified your inner sight, your present calls for grounded truth, and your horizon opens with renewed clarity. You are guided and protected."
    );
  };

  // Step 5: Interactive Follow-Up with Reader (Triggered by form click)
  const handleSendFollowup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!followupText.trim() || isAskingFollowup) return;

    setIsAskingFollowup(true);
    const question = followupText.trim();
    setFollowupText('');

    try {
      const cardsPayload = simRef.current.spreadSlots.map((s) => ({
        positionName: s.positionName,
        cardName: s.cardData.name,
        isReversed: s.isReversed,
      }));

      const res = await fetch('/api/tarot/parlor-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userQuery: question,
          cards: cardsPayload,
          mode: 'followup',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.spokenText) {
          speakOnClick(data.spokenText);
        }
      }
    } catch {
      speakOnClick("Trust what your heart already knows, Vicky. The cards affirm your inner wisdom.");
    } finally {
      setIsAskingFollowup(false);
      setShowConsultBox(false);
    }
  };

  // Handle Canvas Click (Pick card from fan or flip spread card)
  const handleCanvasClick = () => {
    initAudioCtx();

    if (phase === 'picking') {
      const hoveredFan = simRef.current.fanSlots.find((f) => f.isHovered && !f.isSelected);
      if (hoveredFan) {
        pickCardFromFan(hoveredFan);
      }
    } else if (phase === 'reading' || phase === 'synthesis') {
      const hoveredSpreadIndex = simRef.current.spreadSlots.findIndex((s) => s.isHovered);
      if (hoveredSpreadIndex !== -1) {
        flipCard(hoveredSpreadIndex);
      }
    }
  };

  // Save Reading to Vicky's Central Journal
  const handleSaveToJournal = async () => {
    if (!onSaveReading) return;

    const cardsData = simRef.current.spreadSlots.map((s) => ({
      cardId: s.cardData.id,
      cardName: s.cardData.name,
      suit: s.cardData.suit,
      arcana: s.cardData.arcana,
      element: s.cardData.element,
      isReversed: s.isReversed,
      positionName: s.positionName,
    }));

    await onSaveReading({
      userId: '',
      spreadType: 'first_person_3d',
      spreadName: 'First-Person Parlor Reading',
      query: userQuery,
      theme: 'First-Person Altar Experience',
      interpretation: `Three-card first-person sanctuary reading conducted with the Reader. Cards pulled: ${cardsData
        .map((c) => `${c.positionName}: ${c.cardName} (${c.isReversed ? 'Rev' : 'Up'})`)
        .join(', ')}. Guidance received: "${spokenSubtitle}"`,
      journalPrompt: 'How did the candlelit communion illuminate your immediate next step?',
      notes: 'Experienced from the first-person perspective seated across the altar table.',
      tags: ['3D_parlor', 'first_person', 'sacred_altar', 'rider_waite'],
      cards: cardsData,
    });

    setIsSaved(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none font-sans">
      {/* 3D WebGL Canvas Viewport */}
      <div
        ref={canvasMountRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing"
      />

      {/* World-Matched, Low-Occlusion HUD Overlay (<15% viewport footprint) */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 z-20">
        {/* Top Bar: Navigation, Voice Status & Audio Controls */}
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                stopAllVoice();
                onExitGame();
              }}
              className="pointer-events-auto p-2.5 rounded-xl bg-[#0B0D13]/90 border border-[#D4AF37]/35 text-[#EAE5D9] hover:bg-[#D4AF37] hover:text-[#0B0D13] transition-all shadow-lg active:scale-95 cursor-pointer"
              title="Return to Main Sanctuary"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="bg-[#0B0D13]/90 border border-[#D4AF37]/35 px-3.5 py-1.5 rounded-xl text-xs font-serif-tarot font-bold text-[#EAE5D9] shadow-lg flex items-center gap-2">
              <span className="text-[#D4AF37]">VICKY'S SANCTUARY</span>
              <span className="text-[#A6AFCA]/70 text-[10px]">· 1ST-PERSON PARLOR</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {phase === 'synthesis' && (
              <>
                <button
                  onClick={handleHearSynthesis}
                  className="px-3.5 py-1.5 rounded-xl bg-[#D4AF37] text-[#0B0D13] text-xs font-bold flex items-center gap-1.5 hover:bg-[#F3C64F] transition-all shadow-lg active:scale-95 cursor-pointer"
                  title="Click to hear the Reader speak full synthesis"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Hear Synthesis</span>
                </button>

                <button
                  onClick={() => setShowConsultBox(!showConsultBox)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#9D72FF]/20 border border-[#9D72FF]/40 text-[#EAE5D9] text-xs font-semibold flex items-center gap-1.5 hover:bg-[#9D72FF]/30 transition-all shadow-lg cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5 text-[#9D72FF]" />
                  <span>Ask Reader</span>
                </button>
              </>
            )}

            {/* Voice Active Indicator / Click to Stop Voice */}
            {isSpeaking && (
              <button
                onClick={stopAllVoice}
                className="px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-200 text-xs font-semibold flex items-center gap-1.5 hover:bg-red-900 transition-all shadow-lg cursor-pointer animate-pulse"
                title="Click to Stop Voice immediately"
              >
                <Square className="w-3 h-3 fill-current" />
                <span>Stop Voice</span>
              </button>
            )}

            <button
              onClick={() => {
                initAudioCtx();
                setIsMuted(!isMuted);
              }}
              className="p-2.5 rounded-xl bg-[#0B0D13]/90 border border-[#D4AF37]/35 text-[#D4AF37] hover:bg-[#D4AF37]/20 transition-all shadow-lg cursor-pointer"
              title="Toggle Audio & Ambient Shimmer"
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Central Spoken Subtitle Banner with Dedicated Click-to-Speak Button */}
        <div className="self-center max-w-xl w-full text-center px-4">
          <div className="bg-[#0B0D13]/95 border border-[#D4AF37]/45 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-sm pointer-events-auto">
            <div className="flex items-center justify-between mb-1.5 gap-2">
              <div className="text-[10px] font-serif-tarot font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>The Reader Speaks:</span>
              </div>

              {/* Explicit Mouse Click to Hear or Stop Reader */}
              <button
                onClick={() => {
                  if (isSpeaking) {
                    stopAllVoice();
                  } else {
                    speakOnClick(spokenSubtitle);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                  isSpeaking
                    ? 'bg-red-900/60 text-red-300 border border-red-500/40 hover:bg-red-800'
                    : 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-[#D4AF37] hover:text-[#0B0D13]'
                }`}
                title="Click to have Reader speak aloud or pause voice"
              >
                {isSpeaking ? (
                  <>
                    <Square className="w-2.5 h-2.5 fill-current" />
                    <span>Pause</span>
                  </>
                ) : (
                  <>
                    <Play className="w-2.5 h-2.5 fill-current" />
                    <span>Click to Listen</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-[#EAE5D9] italic leading-relaxed text-left">
              "{spokenSubtitle}"
            </p>
          </div>
        </div>

        {/* Bottom Control Dock: Card Status, Picking Helper & Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 w-full">
          {/* Card Status & Selection Tracker */}
          <div className="bg-[#0B0D13]/90 border border-[#D4AF37]/35 px-4 py-2 rounded-2xl flex items-center gap-3 sm:gap-5 shadow-xl text-xs pointer-events-auto">
            {phase === 'picking' ? (
              <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-serif-tarot">
                <Sparkles className="w-4 h-4 animate-spin text-[#D4AF37]" />
                <span>Hover over fan for card rustle · Click 3 cards ({pickedCount}/3 chosen)</span>
              </div>
            ) : (
              simRef.current.spreadSlots.map((slot, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <button
                    onClick={() => flipCard(i)}
                    className={`flex items-center gap-1.5 transition-all cursor-pointer px-2 py-1 rounded-lg hover:bg-white/5 ${
                      slot.isFlipped ? 'text-[#D4AF37] font-semibold' : 'text-[#A6AFCA] hover:text-[#EAE5D9]'
                    }`}
                    title="Click with mouse to flip and hear reading"
                  >
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${
                        slot.isFlipped ? 'bg-[#D4AF37]' : slot.mesh ? 'bg-amber-400/50' : 'bg-white/20'
                      }`}
                    />
                    <span className="text-[11px] whitespace-nowrap">
                      {slot.cardData ? `${slot.cardData.name.split(' ')[0]} (${slot.isReversed ? 'Rev' : 'Up'})` : slot.positionName.split('.')[1] || `Card ${i + 1}`}
                    </span>
                  </button>

                  {slot.isFlipped && (
                    <button
                      onClick={() => setInspectedCard(slot)}
                      className="p-1 text-[#D4AF37] hover:text-white transition-colors cursor-pointer"
                      title="Inspect card up close in 3D"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Action Button: Save / Interactive prompt */}
          <div className="flex items-center gap-2 pointer-events-auto">
            {phase === 'synthesis' && (
              <button
                onClick={handleSaveToJournal}
                disabled={isSaved}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all active:scale-95 cursor-pointer ${
                  isSaved
                    ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                    : 'bg-[#D4AF37] hover:bg-[#F3C64F] text-[#0B0D13]'
                }`}
              >
                {isSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
                <span>{isSaved ? 'Archived in Sacred Journal' : 'Save to Sacred Journal'}</span>
              </button>
            )}

            <div className="bg-[#0B0D13]/85 border border-white/10 px-3.5 py-1.5 rounded-xl text-[11px] text-[#A6AFCA]">
              Hover altar items for ambient noise · Click cards for voice
            </div>
          </div>
        </div>
      </div>

      {/* Welcome Screen Modal (Super Friendly & Welcoming) */}
      {phase === 'welcome' && (
        <div className="absolute inset-0 z-30 bg-[#0B0D13]/85 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#121526] border-2 border-[#D4AF37]/50 rounded-3xl p-8 shadow-2xl flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border border-[#D4AF37]/40 bg-[#D4AF37]/15 flex items-center justify-center text-3xl mb-3 shadow-inner">
              🕯️
            </div>

            <h1 className="font-serif-tarot text-2xl sm:text-3xl font-bold text-[#EAE5D9] tracking-wider mb-1">
              Welcome to Your Altar, Vicky ✨
            </h1>
            <p className="text-xs uppercase tracking-widest text-[#D4AF37] font-semibold mb-3">
              A Sacred Gift From Michael with Love 💖
            </p>

            <div className="w-full text-left bg-white/5 border border-white/10 rounded-2xl p-3.5 mb-5 space-y-1.5 text-xs text-[#EAE5D9]">
              <div className="font-bold text-[#D4AF37] text-[11px] uppercase tracking-wider mb-1">
                How your reading works (easy as 1-2-3):
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-[11px] flex items-center justify-center shrink-0">1</span>
                <span>Choose any question on your heart.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-[11px] flex items-center justify-center shrink-0">2</span>
                <span>Hover over the cards and tap 3 to place on the table.</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-[11px] flex items-center justify-center shrink-0">3</span>
                <span>Tap cards to turn them over & hear your reader speak!</span>
              </div>
            </div>

            <div className="w-full space-y-2.5">
              <button
                onClick={() => {
                  stopAllVoice();
                  setPhase('intention');
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3C64F] hover:from-[#F3C64F] hover:to-[#D4AF37] text-[#0B0D13] font-bold text-sm tracking-wide shadow-xl shadow-[#D4AF37]/25 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Take a Seat at the Altar</span>
                <span>✨</span>
              </button>

              <button
                onClick={() => speakOnClick(spokenSubtitle)}
                className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-xs text-[#D4AF37] border border-[#D4AF37]/35 transition-colors flex items-center justify-center gap-1.5 cursor-pointer font-semibold"
              >
                <Volume2 className="w-4 h-4" />
                <span>Hear Reader's Welcome Voice</span>
              </button>

              <button
                onClick={() => {
                  stopAllVoice();
                  onExitGame();
                }}
                className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs text-[#A6AFCA] transition-colors cursor-pointer"
              >
                Back to Home Menu
              </button>
            </div>

            <div className="mt-4 text-[10px] text-[#A6AFCA]/70">
              💡 Tip: Touch or drag your mouse across the screen to look around the table!
            </div>
          </div>
        </div>
      )}

      {/* Intention Modal: Set question / speech dictation */}
      {phase === 'intention' && (
        <div className="absolute inset-0 z-30 bg-[#0B0D13]/80 flex flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md w-full bg-[#121526] border-2 border-[#D4AF37]/50 rounded-3xl p-7 shadow-2xl flex flex-col items-center text-left">
            <div className="text-xs uppercase tracking-widest text-[#D4AF37] font-bold mb-1">
              Step 1 of 3
            </div>
            <h2 className="font-serif-tarot text-xl font-bold text-[#EAE5D9] mb-1">
              What's on your heart today, Vicky? 🌸
            </h2>
            <p className="text-xs text-[#A6AFCA] mb-3">
              Tap any theme below, or type/speak your own question:
            </p>

            {/* Quick 1-Tap Themes */}
            <div className="w-full grid grid-cols-2 gap-2 mb-3">
              {[
                { emoji: '💖', label: 'Love & Connection', q: 'What does my heart need to know about love and connection right now?' },
                { emoji: '🌟', label: 'My Path & Career', q: 'Where should I focus my creative energy and next steps?' },
                { emoji: '🌿', label: 'Peace & Healing', q: 'What emotional release and inner peace is waiting for me?' },
                { emoji: '🔮', label: 'Universe Message', q: 'What message does the universe have for my soul today?' },
              ].map((item, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setUserQuery(item.q)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-all cursor-pointer flex items-center gap-2 ${
                    userQuery === item.q
                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#EAE5D9] font-bold'
                      : 'border-white/10 bg-white/5 text-[#A6AFCA] hover:border-[#D4AF37]/40 hover:text-white'
                  }`}
                >
                  <span className="text-base">{item.emoji}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>

            <div className="w-full mb-4">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] font-serif-tarot font-bold text-[#D4AF37] uppercase">
                  Your Question
                </label>
                <AudioDictaphone
                  onTranscribed={(text) => setUserQuery(text)}
                  compact={true}
                />
              </div>
              <input
                type="text"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Type anything on your mind..."
                className="w-full p-3 rounded-xl bg-[#0B0D13] border border-[#D4AF37]/35 text-[#EAE5D9] text-xs focus:outline-none focus:border-[#D4AF37]"
              />
            </div>

            <button
              onClick={handleStartShuffle}
              className="w-full py-3.5 rounded-xl bg-[#D4AF37] hover:bg-[#F3C64F] text-[#0B0D13] font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-[#D4AF37]/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Shuffle & Spread the Cards</span>
              <span>→</span>
            </button>
          </div>
        </div>
      )}

      {/* Up-Close Card Inspection Modal Lens */}
      {inspectedCard && (
        <div className="absolute inset-0 z-40 bg-[#0B0D13]/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-sm w-full bg-[#121526] border border-[#D4AF37]/60 rounded-3xl p-6 shadow-2xl text-center animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setInspectedCard(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#A6AFCA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="text-[11px] font-serif-tarot font-bold text-[#D4AF37] uppercase tracking-widest mb-1">
              {inspectedCard.positionName}
            </div>

            {/* Card Graphic Preview */}
            <div className="my-4 mx-auto w-40 h-64 rounded-2xl border-2 border-[#D4AF37] bg-gradient-to-b from-[#1c2035] via-[#12162a] to-[#0b0e1c] p-3 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="text-right text-[#D4AF37] font-serif-tarot font-bold text-sm">
                {inspectedCard.cardData.romanNumeral || inspectedCard.cardData.number}
              </div>
              <div className="text-center text-5xl">
                {inspectedCard.cardData.iconSymbol}
              </div>
              <div className="text-center">
                <div className="font-serif-tarot font-bold text-xs text-[#EAE5D9] truncate">
                  {inspectedCard.cardData.name}
                </div>
                <div className="text-[9px] text-[#D4AF37] uppercase">
                  {inspectedCard.isReversed ? 'Reversed' : 'Upright'}
                </div>
              </div>
            </div>

            <h3 className="font-serif-tarot text-lg font-bold text-[#EAE5D9] mb-1">
              {inspectedCard.cardData.name} ({inspectedCard.isReversed ? 'Reversed' : 'Upright'})
            </h3>
            {inspectedCard.cardData.card_specific_keyword && (
              <div className="text-xs text-[#D4AF37] font-semibold mb-1">
                ✦ {inspectedCard.cardData.card_specific_keyword}
              </div>
            )}
            <p className="text-[11px] text-[#A6AFCA] mb-3">
              {inspectedCard.cardData.suit.toUpperCase()} · Element: {inspectedCard.cardData.element}
              {inspectedCard.cardData.element_data && ` (${inspectedCard.cardData.element_data.qualities.join(', ')})`}
            </p>
            {inspectedCard.cardData.numerology_meaning && (
              <div className="text-[11px] text-[#D4AF37] mb-2 p-2 rounded-lg bg-black/40 border border-[#D4AF37]/20 text-left">
                <span className="font-bold">Numerology: </span>
                <span>{inspectedCard.cardData.numerology_meaning}</span>
              </div>
            )}
            <p className="text-xs text-[#A6AFCA] leading-relaxed mb-4 text-left p-3 rounded-xl bg-black/40 border border-white/5">
              {inspectedCard.isReversed
                ? inspectedCard.cardData.reversedMeaning
                : inspectedCard.cardData.uprightMeaning}
            </p>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  const orientation = inspectedCard.isReversed ? 'Reversed' : 'Upright';
                  const meaning = inspectedCard.isReversed ? inspectedCard.cardData.reversedMeaning : inspectedCard.cardData.uprightMeaning;
                  speakOnClick(`In your ${inspectedCard.positionName}, appears ${inspectedCard.cardData.name}, ${orientation}. ${meaning}`);
                }}
                className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#D4AF37] border border-[#D4AF37]/30 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Volume2 className="w-3.5 h-3.5" />
                <span>Hear Card Spoken</span>
              </button>

              <button
                onClick={() => setInspectedCard(null)}
                className="flex-1 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#F3C64F] text-[#0B0D13] font-bold text-xs cursor-pointer"
              >
                Return to Altar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Follow-up Interactive Consultation Drawer */}
      {showConsultBox && (
        <div className="absolute top-16 right-4 sm:right-6 z-30 max-w-sm w-full bg-[#121526]/95 border border-[#9D72FF]/50 rounded-2xl p-4 shadow-2xl pointer-events-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-serif-tarot font-bold text-[#9D72FF]">
              Ask the Reader a Follow-Up
            </span>
            <button
              onClick={() => setShowConsultBox(false)}
              className="text-[#A6AFCA] hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <form onSubmit={handleSendFollowup} className="space-y-2">
            <input
              type="text"
              value={followupText}
              onChange={(e) => setFollowupText(e.target.value)}
              placeholder="e.g. How do I integrate the reversed card?"
              className="w-full p-2.5 rounded-xl bg-[#0B0D13] border border-white/20 text-[#EAE5D9] text-xs focus:outline-none focus:border-[#9D72FF]"
            />
            <div className="flex items-center justify-between">
              <AudioDictaphone
                onTranscribed={(text) => setFollowupText(text)}
                compact={true}
              />
              <button
                type="submit"
                disabled={isAskingFollowup || !followupText.trim()}
                className="px-3 py-1.5 rounded-lg bg-[#9D72FF] hover:bg-[#A880FF] text-white font-semibold text-xs flex items-center gap-1 disabled:opacity-50 cursor-pointer"
              >
                {isAskingFollowup ? <RotateCw className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                <span>Click to Ask & Hear</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
