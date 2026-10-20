import React, { useState, useEffect } from 'react';
import { auth, googleAuthProvider, db, testFirestoreConnection } from './lib/firebase.ts';
import { onAuthStateChanged, signInWithPopup, signOut, User } from 'firebase/auth';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  setDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { Navigation } from './components/Navigation.tsx';
import { CameraSpreadScanner } from './components/CameraSpreadScanner.tsx';
import { DigitalDeckDrawer } from './components/DigitalDeckDrawer.tsx';
import { ReadingPresenter } from './components/ReadingPresenter.tsx';
import { JournalArchive } from './components/JournalArchive.tsx';
import { GrowthAnalytics } from './components/GrowthAnalytics.tsx';
import { LiveOracleVoice } from './components/LiveOracleVoice.tsx';
import { ArcanaQuest3D } from './components/ArcanaQuest3D.tsx';
import { EsotericCodexSection } from './components/EsotericCodexSection.tsx';
import { TarotCardGraphic } from './components/TarotCardGraphic.tsx';
import {
  CardInSpread,
  SavedReading,
  SpreadAnalysisResult,
} from './types/tarot.ts';
import {
  TAROT_SPREADS,
  TAROT_DECK,
  drawRandomCards,
  getCardById,
} from './data/tarotDeck.ts';
import {
  Sparkles,
  Camera,
  Layers,
  BookOpen,
  Volume2,
  Compass,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState<boolean>(false);
  const [currentTab, setCurrentTab] = useState<string>('daily');

  // Active Reading State for Presenter
  const [activeCards, setActiveCards] = useState<CardInSpread[]>([]);
  const [activeSpreadTitle, setActiveSpreadTitle] = useState<string>('Daily Guidance');
  const [activeQuery, setActiveQuery] = useState<string>('What energy guides my soul today?');
  const [activeInterpretation, setActiveInterpretation] = useState<any>(null);
  const [activePhotoUrl, setActivePhotoUrl] = useState<string | undefined>(undefined);

  // Journal Archive State (Firestore synced + local fallback)
  const [readings, setReadings] = useState<SavedReading[]>(() => {
    try {
      const saved = localStorage.getItem('arcana_vicky_readings');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Show auto-dismiss notification
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // 1. Firebase Auth & Firestore Connection
  useEffect(() => {
    testFirestoreConnection();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setAuthReady(true);
    });

    return () => unsubscribe();
  }, []);

  // 2. Sync Readings from Firestore when user is authenticated
  useEffect(() => {
    if (!currentUser) return;

    const readingsRef = collection(db, 'users', currentUser.uid, 'readings');
    const q = query(readingsRef, orderBy('createdAt', 'desc'));

    const unsubFirestore = onSnapshot(
      q,
      (snapshot) => {
        const cloudReadings: SavedReading[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data();
          cloudReadings.push({
            id: docSnap.id,
            userId: currentUser.uid,
            spreadType: data.spreadType || 'daily',
            spreadName: data.spreadName || 'Daily Guidance',
            query: data.query || '',
            theme: data.theme || '',
            interpretation: data.interpretation || '',
            journalPrompt: data.journalPrompt || '',
            audioBase64: data.audioBase64 || '',
            photoUrl: data.photoUrl || '',
            notes: data.notes || '',
            tags: data.tags || [],
            cards: data.cards || [],
            createdAt: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : data.createdAt || new Date().toISOString(),
          });
        });

        if (cloudReadings.length > 0) {
          setReadings(cloudReadings);
          localStorage.setItem('arcana_vicky_readings', JSON.stringify(cloudReadings));
        }
      },
      (error) => {
        console.warn('Firestore snapshot notice:', error.message);
      }
    );

    return () => unsubFirestore();
  }, [currentUser]);

  // Handle Google Sign-In
  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleAuthProvider);
      showToast('Welcome to Arcana Sanctuary, Vicky!');
    } catch (err: any) {
      console.error('Sign in error:', err);
      showToast(err.message || 'Sign in was cancelled.', 'error');
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      showToast('Signed out of sanctuary.');
    } catch (err: any) {
      console.error('Sign out error:', err);
    }
  };

  // Save reading to Firestore (and local backup)
  const handleSaveReading = async (readingData: Omit<SavedReading, 'id' | 'createdAt'>) => {
    const readingId = `reading_${Date.now()}`;
    const newEntry: SavedReading = {
      ...readingData,
      id: readingId,
      userId: currentUser?.uid || 'guest_vicky',
      createdAt: new Date().toISOString(),
    };

    // Update local state immediately
    const updated = [newEntry, ...readings];
    setReadings(updated);
    localStorage.setItem('arcana_vicky_readings', JSON.stringify(updated));

    // Save to Firestore if authenticated
    if (currentUser) {
      try {
        const docRef = doc(db, 'users', currentUser.uid, 'readings', readingId);
        await setDoc(docRef, {
          ...readingData,
          userId: currentUser.uid,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      } catch (err) {
        console.warn('Firestore save warning (persisted locally):', err);
      }
    }

    showToast('Reading saved to your central sacred journal!');
  };

  // Delete reading
  const handleDeleteReading = async (id: string) => {
    if (!confirm('Are you sure you want to remove this reading from your journal?')) return;

    const filtered = readings.filter((r) => r.id !== id);
    setReadings(filtered);
    localStorage.setItem('arcana_vicky_readings', JSON.stringify(filtered));

    if (currentUser) {
      try {
        const docRef = doc(db, 'users', currentUser.uid, 'readings', id);
        await deleteDoc(docRef);
      } catch (err) {
        console.warn('Firestore delete notice:', err);
      }
    }

    showToast('Reading removed.');
  };

  // Handle Digital Card Draw result
  const handleDigitalReadingReady = (
    cards: CardInSpread[],
    spreadDef: any,
    query: string,
    interpretation?: any
  ) => {
    setActiveCards(cards);
    setActiveSpreadTitle(spreadDef.name);
    setActiveQuery(query);
    setActiveInterpretation(interpretation);
    setActivePhotoUrl(undefined);
    setCurrentTab('presenter');
  };

  // Handle Camera Spread result
  const handleCameraSpreadAnalyzed = (
    result: SpreadAnalysisResult,
    snapshotDataUrl: string,
    query: string
  ) => {
    const mappedCards: CardInSpread[] = (result.detectedCards || []).map((dc, i) => {
      // Find matching card in deck or fallback
      const found = TAROT_DECK.find(
        (t) => t.name.toLowerCase() === dc.cardName.toLowerCase()
      ) || TAROT_DECK[i % TAROT_DECK.length];

      return {
        card: found,
        isReversed: dc.isReversed,
        positionId: `pos_${i}`,
        positionName: dc.position || `Card ${i + 1}`,
        symbolicInsight: dc.symbolicKey,
      };
    });

    setActiveCards(mappedCards);
    setActiveSpreadTitle('Physical Camera Spread');
    setActiveQuery(query);
    setActiveInterpretation({
      theme: result.overview,
      interpretation: result.interpretation,
      journalPrompt: result.integrationPrompt,
    });
    setActivePhotoUrl(snapshotDataUrl);
    setCurrentTab('presenter');
  };

  // Open past reading in presenter
  const handleOpenPastReading = (reading: SavedReading) => {
    const fullCards: CardInSpread[] = reading.cards.map((c, i) => {
      const full = getCardById(c.cardId) || TAROT_DECK.find((t) => t.name === c.cardName) || TAROT_DECK[0];
      return {
        card: full,
        isReversed: c.isReversed,
        positionId: `pos_${i}`,
        positionName: c.positionName || `Card ${i + 1}`,
      };
    });

    setActiveCards(fullCards);
    setActiveSpreadTitle(reading.spreadName || reading.spreadType);
    setActiveQuery(reading.query);
    setActiveInterpretation({
      theme: reading.theme,
      interpretation: reading.interpretation,
      journalPrompt: reading.journalPrompt,
    });
    setActivePhotoUrl(reading.photoUrl);
    setCurrentTab('presenter');
  };

  // Full-viewport Game Shell for 3D Three.js reading experience (never render website navbars or footers per craft guidelines)
  if (currentTab === 'game_3d') {
    return <ArcanaQuest3D onExitGame={() => setCurrentTab('daily')} onSaveReading={handleSaveReading} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0D13] text-[#EAE5D9] flex flex-col font-sans selection:bg-[#D4AF37]/30 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-16 right-4 z-50 flex items-center gap-2 px-4 py-2.5 rounded-xl border bg-[#121526]/95 backdrop-blur-md shadow-2xl text-xs sm:text-sm animate-in fade-in slide-in-from-top-2 duration-200">
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
          )}
          <span className="text-[#EAE5D9]">{notification.message}</span>
        </div>
      )}

      {/* Top Bar Navigation */}
      <Navigation
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        currentUser={currentUser}
        onSignIn={handleSignIn}
        onSignOut={handleSignOut}
        onNewReading={() => setCurrentTab('spread')}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentTab === 'daily' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Friendly Sanctuary Hero Banner */}
            <div className="relative rounded-3xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#181C2E] via-[#121526] to-[#0B0D13] p-6 sm:p-10 overflow-hidden shadow-2xl mb-8">
              <div className="relative z-10 max-w-xl">
                <div className="inline-flex items-center gap-2 text-xs font-serif-tarot font-bold text-[#D4AF37] uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>VICKY'S SANCTUARY · A GIFT FROM MICHAEL 💖</span>
                </div>
                <h1 className="font-serif-tarot text-2xl sm:text-4xl font-bold text-[#EAE5D9] leading-tight">
                  Welcome, Vicky ✨
                </h1>
                <p className="mt-2 text-sm text-[#EAE5D9]/90 leading-relaxed font-sans">
                  A cozy space created just for you to explore your tarot cards, hear gentle spiritual wisdom, and keep a private diary of your growth. Everything here is made to be simple and easy to use.
                </p>

                {/* 10-Second Quick Start Guide */}
                <div className="mt-5 p-3.5 rounded-2xl bg-white/5 border border-[#D4AF37]/25 flex flex-col gap-2">
                  <div className="text-xs font-serif-tarot font-bold text-[#D4AF37] flex items-center gap-1.5">
                    <span>✨ How to use your sanctuary in 3 easy steps:</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-[#A6AFCA]">
                    <div className="flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-[10px] flex items-center justify-center shrink-0">1</span>
                      <span>Pick what you want to do below (camera, table, or cards).</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-[10px] flex items-center justify-center shrink-0">2</span>
                      <span>Tap your cards to turn them over and see their meanings.</span>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] font-bold text-[10px] flex items-center justify-center shrink-0">3</span>
                      <span>Tap the speaker button anytime to listen to the reading!</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative sacred geometry in background */}
              <div className="absolute -right-16 -bottom-16 w-80 h-80 rounded-full border border-[#D4AF37]/15 pointer-events-none flex items-center justify-center opacity-30">
                <div className="w-60 h-60 rounded-full border border-[#D4AF37]/20" />
                <div className="w-40 h-40 rounded-full border border-[#D4AF37]/25" />
              </div>
            </div>

            {/* 4 Big, Friendly Action Cards */}
            <div className="mb-4">
              <h2 className="font-serif-tarot text-base sm:text-lg font-bold text-[#EAE5D9] mb-3 flex items-center gap-2">
                <span>Choose Your Activity</span>
                <span className="text-xs text-[#A6AFCA] font-sans font-normal">(Tap any box to start)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Candlelit Altar Table */}
                <div
                  onClick={() => setCurrentTab('game_3d')}
                  className="p-5 rounded-2xl border-2 border-[#D4AF37]/30 hover:border-[#D4AF37] bg-gradient-to-br from-[#1c182d] via-[#121526] to-[#0B0D13] cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-[#D4AF37]/15 border border-[#D4AF37]/35 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        🕯️
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                        Most Popular
                      </span>
                    </div>
                    <h3 className="font-serif-tarot text-lg font-bold text-[#EAE5D9] mb-1">
                      Candlelit Reading Table
                    </h3>
                    <p className="text-xs text-[#A6AFCA] leading-relaxed">
                      Sit across from your personal reader in a warm candlelit room. Hover over the cards to feel their energy, pick 3 cards, and listen to her speak your reading.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-[#D4AF37]">
                    <span>Take a Seat at the Altar</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>

                {/* 2. Camera Card Scanner */}
                <div
                  onClick={() => setCurrentTab('camera')}
                  className="p-5 rounded-2xl border-2 border-emerald-500/25 hover:border-emerald-500/60 bg-gradient-to-br from-[#122421] via-[#121526] to-[#0B0D13] cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/35 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        📷
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        Physical Deck
                      </span>
                    </div>
                    <h3 className="font-serif-tarot text-lg font-bold text-[#EAE5D9] mb-1">
                      Snap a Photo of Real Cards
                    </h3>
                    <p className="text-xs text-[#A6AFCA] leading-relaxed">
                      Have tarot cards laid out on your table? Just point your phone or laptop camera at them and tap! We'll explain your cards and read them out loud.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-emerald-400">
                    <span>Open Camera to Scan</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>

                {/* 3. Pick Cards Online */}
                <div
                  onClick={() => setCurrentTab('spread')}
                  className="p-5 rounded-2xl border-2 border-amber-500/25 hover:border-amber-500/60 bg-gradient-to-br from-[#241e12] via-[#121526] to-[#0B0D13] cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/35 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        🃏
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        Quick Draw
                      </span>
                    </div>
                    <h3 className="font-serif-tarot text-lg font-bold text-[#EAE5D9] mb-1">
                      Pick Digital Cards
                    </h3>
                    <p className="text-xs text-[#A6AFCA] leading-relaxed">
                      Pick a 1-card daily advice or 3-card past-present-future spread. Tap each card to turn it over and read authentic Rider-Waite meanings.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-amber-400">
                    <span>Draw Digital Cards</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>

                {/* 4. Voice Chat with Oracle */}
                <div
                  onClick={() => setCurrentTab('live_oracle')}
                  className="p-5 rounded-2xl border-2 border-purple-500/25 hover:border-purple-500/60 bg-gradient-to-br from-[#221533] via-[#121526] to-[#0B0D13] cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99] shadow-xl group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/35 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                        🎙️
                      </div>
                      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        Voice Talk
                      </span>
                    </div>
                    <h3 className="font-serif-tarot text-lg font-bold text-[#EAE5D9] mb-1">
                      Talk with the Oracle
                    </h3>
                    <p className="text-xs text-[#A6AFCA] leading-relaxed">
                      Ask any question on your heart out loud using your voice, just like chatting on the phone with a wise friend. Hear compassionate spoken guidance.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between text-xs font-bold text-purple-400">
                    <span>Start Voice Chat</span>
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Access: Diary & Journey */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
              <div
                onClick={() => setCurrentTab('journal')}
                className="p-4 rounded-2xl border border-white/10 bg-[#121526]/70 hover:border-[#D4AF37]/50 cursor-pointer transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/15 text-[#D4AF37] flex items-center justify-center text-xl shrink-0">
                  📖
                </div>
                <div>
                  <h4 className="font-serif-tarot text-sm font-bold text-[#EAE5D9]">
                    My Personal Diary
                  </h4>
                  <p className="text-[11px] text-[#A6AFCA]">
                    Every reading is saved here automatically. Search past advice anytime!
                  </p>
                </div>
              </div>

              <div
                onClick={() => setCurrentTab('analytics')}
                className="p-4 rounded-2xl border border-white/10 bg-[#121526]/70 hover:border-[#D4AF37]/50 cursor-pointer transition-all flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-pink-500/15 text-pink-400 flex items-center justify-center text-xl shrink-0">
                  🌸
                </div>
                <div>
                  <h4 className="font-serif-tarot text-sm font-bold text-[#EAE5D9]">
                    My Spiritual Journey
                  </h4>
                  <p className="text-[11px] text-[#A6AFCA]">
                    See your most frequent cards, lucky archetypes, and mindful streaks.
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Readings Teaser */}
            {readings.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-serif-tarot text-base font-bold text-[#EAE5D9] flex items-center gap-2">
                    <span>Recent Diary Entries</span>
                    <span className="text-xs text-[#D4AF37]">({readings.length} saved)</span>
                  </h2>
                  <button
                    onClick={() => setCurrentTab('journal')}
                    className="text-xs text-[#D4AF37] hover:underline font-medium cursor-pointer"
                  >
                    Open Full Diary →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {readings.slice(0, 2).map((r) => (
                    <div
                      key={r.id}
                      onClick={() => handleOpenPastReading(r)}
                      className="p-3.5 rounded-xl border border-white/10 bg-[#121526]/60 hover:border-[#D4AF37]/40 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="text-[10px] text-[#D4AF37] uppercase font-serif-tarot">
                          {r.spreadName || r.spreadType}
                        </div>
                        <div className="text-xs font-semibold text-[#EAE5D9] truncate max-w-[220px]">
                          {r.theme || r.query}
                        </div>
                        <div className="text-[11px] text-[#A6AFCA] line-clamp-1 mt-0.5">
                          {r.interpretation}
                        </div>
                      </div>
                      <Volume2 className="w-4 h-4 text-[#D4AF37] shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sacred Esoteric Card Codex & Archetypes */}
            <EsotericCodexSection />
          </div>
        )}

        {currentTab === 'codex' && (
          <div className="max-w-4xl mx-auto px-4 py-8">
            <EsotericCodexSection />
          </div>
        )}

        {currentTab === 'camera' && (
          <CameraSpreadScanner onSpreadAnalyzed={handleCameraSpreadAnalyzed} />
        )}

        {currentTab === 'spread' && (
          <DigitalDeckDrawer onReadingReady={handleDigitalReadingReady} />
        )}

        {currentTab === 'presenter' && (
          <ReadingPresenter
            cards={activeCards}
            spreadTitle={activeSpreadTitle}
            query={activeQuery}
            interpretationData={activeInterpretation}
            photoUrl={activePhotoUrl}
            onSaveReading={handleSaveReading}
            onBackToDraw={() => setCurrentTab('spread')}
          />
        )}

        {currentTab === 'live_oracle' && (
          <LiveOracleVoice />
        )}

        {currentTab === 'journal' && (
          <JournalArchive
            readings={readings}
            onSelectReading={handleOpenPastReading}
            onDeleteReading={handleDeleteReading}
          />
        )}

        {currentTab === 'analytics' && (
          <GrowthAnalytics readings={readings} />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D4AF37]/15 bg-[#0B0D13] py-6 px-4 text-center text-xs text-[#A6AFCA]/70 pb-safe">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-serif-tarot text-[#D4AF37] tracking-wider font-semibold">
            VICKY'S SANCTUARY · FROM MICHAEL
          </div>
          <div>
            Crafted with love for Vicky from Michael · Authentic Rider-Waite-Smith Tradition · Safari Optimized
          </div>
          <div className="text-[11px] text-[#A6AFCA]/50">
            {currentUser ? `Connected as ${currentUser.displayName || currentUser.email}` : 'Local Sanctuary Mode Active'}
          </div>
        </div>
      </footer>
    </div>
  );
}
