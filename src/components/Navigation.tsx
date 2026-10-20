import React from 'react';
import { Sparkles, Camera, BookOpen, BarChart3, LogIn, LogOut, User as UserIcon, Radio, Compass } from 'lucide-react';
import { User } from 'firebase/auth';

interface NavigationProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User | null;
  onSignIn: () => void;
  onSignOut: () => void;
  onNewReading: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onSignIn,
  onSignOut,
  onNewReading,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D4AF37]/25 bg-[#0B0D13]/95 backdrop-blur-md shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 py-3">
        {/* Zone 1: Vicky's Sanctuary From Michael Wordmark */}
        <button
          onClick={() => onSelectTab('daily')}
          className="text-left group cursor-pointer focus:outline-none flex flex-col justify-center"
          title="Vicky's Sanctuary — A Gift From Michael"
        >
          <span className="font-serif-tarot text-base sm:text-xl font-bold tracking-wider text-[#EAE5D9] group-hover:text-[#D4AF37] transition-colors whitespace-nowrap shrink-0 flex items-center gap-2">
            <span>VICKY'S SANCTUARY</span>
            <span className="text-[10px] sm:text-xs font-sans font-medium px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#D4AF37] tracking-normal shadow-sm">
              From Michael 💖
            </span>
          </span>
          <span className="text-[9px] tracking-widest uppercase font-serif-tarot text-[#A6AFCA]/70 font-medium">
            Your Sacred Tarot Space & Diary
          </span>
        </button>

        {/* Zone 2: Friendly, non-technical navigation links */}
        <nav className="hidden lg:flex items-center gap-4 text-xs font-medium text-[#A6AFCA]">
          <button
            onClick={() => onSelectTab('daily')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#EAE5D9] pb-0.5 ${
              currentTab === 'daily'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-semibold'
                : ''
            }`}
          >
            ✨ Home
          </button>
          <button
            onClick={() => onSelectTab('game_3d')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#EAE5D9] pb-0.5 ${
              currentTab === 'game_3d'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-semibold'
                : ''
            }`}
          >
            🕯️ Candlelit Altar
          </button>
          <button
            onClick={() => onSelectTab('camera')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#EAE5D9] pb-0.5 ${
              currentTab === 'camera'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-semibold'
                : ''
            }`}
          >
            📷 Snap My Cards
          </button>
          <button
            onClick={() => onSelectTab('spread')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#EAE5D9] pb-0.5 ${
              currentTab === 'spread'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-semibold'
                : ''
            }`}
          >
            🃏 Pick Cards
          </button>
          <button
            onClick={() => onSelectTab('live_oracle')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#EAE5D9] pb-0.5 ${
              currentTab === 'live_oracle'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-semibold'
                : ''
            }`}
          >
            🎙️ Voice Guide
          </button>
          <button
            onClick={() => onSelectTab('journal')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#EAE5D9] pb-0.5 ${
              currentTab === 'journal'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-semibold'
                : ''
            }`}
          >
            📖 My Diary
          </button>
          <button
            onClick={() => onSelectTab('codex')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#EAE5D9] pb-0.5 ${
              currentTab === 'codex'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-semibold'
                : ''
            }`}
          >
            📜 Codex
          </button>
          <button
            onClick={() => onSelectTab('analytics')}
            className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#EAE5D9] pb-0.5 ${
              currentTab === 'analytics'
                ? 'text-[#D4AF37] border-b-2 border-[#D4AF37] font-semibold'
                : ''
            }`}
          >
            🌸 My Journey
          </button>
        </nav>

        {/* Zone 3: 1 primary action + Auth */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <div className="flex items-center gap-2">
              <span className="hidden sm:inline text-xs text-[#A6AFCA] truncate max-w-[120px]">
                {currentUser.displayName || currentUser.email}
              </span>
              <button
                onClick={onSignOut}
                title="Sign Out"
                className="p-2 rounded-lg text-[#A6AFCA] hover:text-[#EAE5D9] hover:bg-white/5 transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={onSignIn}
              className="px-3 py-1.5 text-xs font-medium text-[#EAE5D9] bg-white/10 rounded-lg hover:bg-white/15 transition-colors whitespace-nowrap flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Sign In</span>
            </button>
          )}

          <button
            onClick={onNewReading}
            className="px-4 py-2 text-xs font-semibold text-[#0B0D13] bg-[#D4AF37] rounded-lg hover:bg-[#F3C64F] active:scale-95 transition-all shadow-md shadow-[#D4AF37]/20 whitespace-nowrap shrink-0 flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New Reading</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Bar (Thumb Zone) */}
      <div className="lg:hidden flex items-center justify-around border-t border-[#D4AF37]/15 bg-[#0B0D13]/95 py-2 px-1">
        <button
          onClick={() => onSelectTab('daily')}
          className={`flex flex-col items-center py-1 px-1.5 text-[9px] font-medium ${
            currentTab === 'daily' ? 'text-[#D4AF37] font-bold' : 'text-[#828BA2]'
          }`}
        >
          <Sparkles className="w-4 h-4 mb-0.5" />
          <span>Home</span>
        </button>
        <button
          onClick={() => onSelectTab('game_3d')}
          className={`flex flex-col items-center py-1 px-1.5 text-[9px] font-medium ${
            currentTab === 'game_3d' ? 'text-[#D4AF37] font-bold' : 'text-[#828BA2]'
          }`}
        >
          <Compass className="w-4 h-4 mb-0.5" />
          <span>Altar</span>
        </button>
        <button
          onClick={() => onSelectTab('camera')}
          className={`flex flex-col items-center py-1 px-1.5 text-[9px] font-medium ${
            currentTab === 'camera' ? 'text-[#D4AF37] font-bold' : 'text-[#828BA2]'
          }`}
        >
          <Camera className="w-4 h-4 mb-0.5" />
          <span>Camera</span>
        </button>
        <button
          onClick={() => onSelectTab('spread')}
          className={`flex flex-col items-center py-1 px-1.5 text-[9px] font-medium ${
            currentTab === 'spread' ? 'text-[#D4AF37] font-bold' : 'text-[#828BA2]'
          }`}
        >
          <Radio className="w-4 h-4 mb-0.5" />
          <span>Cards</span>
        </button>
        <button
          onClick={() => onSelectTab('journal')}
          className={`flex flex-col items-center py-1 px-1.5 text-[9px] font-medium ${
            currentTab === 'journal' ? 'text-[#D4AF37] font-bold' : 'text-[#828BA2]'
          }`}
        >
          <BookOpen className="w-4 h-4 mb-0.5" />
          <span>Diary</span>
        </button>
      </div>
    </header>
  );
};
