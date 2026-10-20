import React from 'react';
import { TarotCard } from '../data/tarotDeck.ts';

interface TarotCardGraphicProps {
  card?: TarotCard;
  isReversed?: boolean;
  isFaceDown?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  showDetails?: boolean;
}

export const TarotCardGraphic: React.FC<TarotCardGraphicProps> = ({
  card,
  isReversed = false,
  isFaceDown = false,
  size = 'md',
  className = '',
  onClick,
  showDetails = true,
}) => {
  // Dimensions
  const sizeClasses = {
    sm: 'w-24 h-40 text-[10px]',
    md: 'w-36 h-60 text-xs',
    lg: 'w-48 h-80 text-sm',
    xl: 'w-64 h-[26rem] text-base',
  };

  if (isFaceDown || !card) {
    return (
      <div
        onClick={onClick}
        className={`relative ${sizeClasses[size]} rounded-xl border border-[#D4AF37]/40 bg-gradient-to-b from-[#141829] via-[#0E111F] to-[#0A0D18] shadow-xl shadow-black/60 p-2 flex flex-col items-center justify-between cursor-pointer select-none overflow-hidden group hover:border-[#D4AF37] transition-all duration-300 ${className}`}
      >
        {/* Ornate corner borders */}
        <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]/50 rounded-tl" />
        <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]/50 rounded-tr" />
        <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37]/50 rounded-bl" />
        <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37]/50 rounded-br" />

        {/* Sacred Geometry SVG Emblem */}
        <div className="w-full h-full border border-[#D4AF37]/20 rounded-lg flex flex-col items-center justify-center p-2 relative bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-transparent to-transparent">
          <svg
            className="w-12 h-12 text-[#D4AF37] opacity-80 group-hover:scale-110 group-hover:opacity-100 transition-all duration-500"
            viewBox="0 0 100 100"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            {/* Concentric rings and 8-point sun star */}
            <circle cx="50" cy="50" r="42" strokeDasharray="3 3" />
            <circle cx="50" cy="50" r="34" />
            <circle cx="50" cy="50" r="24" strokeWidth="1" />
            <polygon points="50,12 60,38 88,50 60,62 50,88 40,62 12,50 40,38" fill="rgba(212,175,55,0.15)" />
            <polygon points="50,22 58,42 78,50 58,58 50,78 42,58 22,50 42,42" strokeWidth="1" />
            <circle cx="50" cy="50" r="6" fill="#D4AF37" />
          </svg>
          <div className="mt-3 font-serif-tarot text-[11px] tracking-widest text-[#D4AF37]/70 uppercase">
            RWS Tarot
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={`relative ${sizeClasses[size]} rounded-xl border border-[#D4AF37]/35 bg-gradient-to-b from-[#181C2E] via-[#121526] to-[#0A0D18] shadow-2xl shadow-black/80 flex flex-col justify-between p-2.5 cursor-pointer select-none overflow-hidden transition-all duration-300 hover:border-[#D4AF37] hover:shadow-[#D4AF37]/15 hover:-translate-y-1 ${
        isReversed ? 'rotate-180' : ''
      } ${className}`}
    >
      {/* Decorative Ornate Corners */}
      <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-[#D4AF37]/60" />
      <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-[#D4AF37]/60" />
      <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-[#D4AF37]/60" />
      <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-[#D4AF37]/60" />

      {/* Top Header: Roman Numeral or Card Number & Element */}
      <div className="flex items-center justify-between px-1 text-[10px] text-[#D4AF37] font-serif-tarot font-bold">
        <span>{card.romanNumeral || card.number}</span>
        <span className="text-[11px] opacity-80">{card.iconSymbol}</span>
      </div>

      {/* Card Center Illustration Artwork Frame */}
      <div className="relative flex-1 my-1.5 rounded border border-[#D4AF37]/25 bg-gradient-to-b from-[#21263E] to-[#111425] p-2 flex flex-col items-center justify-center overflow-hidden">
        {/* Ambient Halo */}
        <div
          className="absolute inset-0 opacity-20 pointer-events-none"
          style={{
            background: `radial-gradient(circle at center, ${card.accentColor} 0%, transparent 70%)`,
          }}
        />

        {/* Central Card Icon / Emblem */}
        <div className="text-3xl md:text-4xl mb-1 filter drop-shadow-[0_2px_8px_rgba(212,175,55,0.4)]">
          {card.iconSymbol}
        </div>

        {/* Major / Minor Suit Element Tag */}
        <div className="text-[9px] uppercase tracking-wider text-[#D4AF37]/80 font-medium">
          {card.arcana === 'major' ? 'Major Arcana' : card.suit}
        </div>

        {/* Astrology / Elemental Correspondence */}
        <div className="text-[9px] text-[#A6AFCA] italic mt-0.5">
          {card.astrology} · {card.element}
        </div>
      </div>

      {/* Bottom Title Banner */}
      <div className="text-center px-1">
        <div className="font-serif-tarot font-bold text-[#EAE5D9] text-[11px] leading-tight truncate">
          {card.name}
        </div>
        {showDetails && (
          <div className="text-[9px] text-[#D4AF37] uppercase tracking-wider mt-0.5">
            {isReversed ? 'Reversed' : 'Upright'}
          </div>
        )}
      </div>
    </div>
  );
};
