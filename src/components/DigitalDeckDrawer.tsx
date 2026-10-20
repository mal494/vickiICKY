import React, { useState } from 'react';
import { TAROT_DECK, TAROT_SPREADS, SpreadDefinition, TarotCard, drawRandomCards } from '../data/tarotDeck.ts';
import { TarotCardGraphic } from './TarotCardGraphic.tsx';
import { CardInSpread } from '../types/tarot.ts';
import { Shuffle, Sparkles, RefreshCw, Layers } from 'lucide-react';

interface DigitalDeckDrawerProps {
  initialSpreadId?: string;
  onReadingReady: (
    cards: CardInSpread[],
    spreadDef: SpreadDefinition,
    query: string,
    interpretation?: any
  ) => void;
}

export const DigitalDeckDrawer: React.FC<DigitalDeckDrawerProps> = ({
  initialSpreadId = 'three_card',
  onReadingReady,
}) => {
  const [selectedSpreadId, setSelectedSpreadId] = useState<string>(initialSpreadId);
  const [query, setQuery] = useState<string>('What energetic lessons are guiding my soul right now?');
  const [drawnCards, setDrawnCards] = useState<CardInSpread[]>([]);
  const [isShuffling, setIsShuffling] = useState<boolean>(false);
  const [isInterpreting, setIsInterpreting] = useState<boolean>(false);
  const [revealedIndices, setRevealedIndices] = useState<Set<number>>(new Set());

  const activeSpread = TAROT_SPREADS[selectedSpreadId] || TAROT_SPREADS.three_card;

  // Draw cards into the active spread
  const handleDrawCards = () => {
    setIsShuffling(true);
    setDrawnCards([]);
    setRevealedIndices(new Set());

    setTimeout(() => {
      const pulls = drawRandomCards(activeSpread.cardCount, true);
      const formatted: CardInSpread[] = pulls.map((pull, idx) => {
        const pos = activeSpread.positions[idx] || {
          id: `card_${idx}`,
          title: `Position ${idx + 1}`,
          description: '',
        };
        return {
          card: pull.card,
          isReversed: pull.isReversed,
          positionId: pos.id,
          positionName: pos.title,
          positionDescription: pos.description,
        };
      });

      setDrawnCards(formatted);
      setIsShuffling(false);
      // Auto-reveal first card after deal
      setRevealedIndices(new Set([0]));
    }, 700);
  };

  // Flip an individual card
  const toggleFlip = (index: number) => {
    setRevealedIndices((prev) => {
      const updated = new Set(prev);
      if (updated.has(index)) {
        // keep it revealed once flipped
      } else {
        updated.add(index);
      }
      return updated;
    });
  };

  // Reveal all cards
  const revealAllCards = () => {
    const all = new Set(drawnCards.map((_, i) => i));
    setRevealedIndices(all);
  };

  // Request AI Interpretation
  const handleInterpret = async () => {
    if (drawnCards.length === 0) return;

    // Ensure all cards are flipped
    revealAllCards();
    setIsInterpreting(true);

    try {
      const response = await fetch('/api/tarot/interpret', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cards: drawnCards.map((c) => ({
            name: c.card.name,
            positionName: c.positionName,
            isReversed: c.isReversed,
            uprightMeaning: c.card.uprightMeaning,
            reversedMeaning: c.card.reversedMeaning,
            symbolism: c.card.symbolism,
          })),
          spreadType: activeSpread.id,
          query,
        }),
      });

      let interpretation = null;
      if (response.ok) {
        interpretation = await response.json();
      }

      onReadingReady(drawnCards, activeSpread, query, interpretation);
    } catch (err) {
      console.error('Error fetching interpretation:', err);
      // Fallback passing the cards directly
      onReadingReady(drawnCards, activeSpread, query);
    } finally {
      setIsInterpreting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header and Spread Selectors */}
      <div className="text-center mb-8">
        <h1 className="font-serif-tarot text-2xl sm:text-3xl lg:text-4xl font-bold text-[#EAE5D9] tracking-wide">
          Sacred Tarot Spread Sanctuary
        </h1>
        <p className="mt-2 text-sm sm:text-base text-[#A6AFCA] max-w-xl mx-auto">
          Choose a spread layout, ground your intention, and draw cards from the authentic 78-card Rider-Waite deck.
        </p>

        {/* Spread Selector Segmented Tabs */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {Object.values(TAROT_SPREADS).map((spread) => (
            <button
              key={spread.id}
              onClick={() => {
                setSelectedSpreadId(spread.id);
                setDrawnCards([]);
                setRevealedIndices(new Set());
              }}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                selectedSpreadId === spread.id
                  ? 'bg-[#D4AF37] text-[#0B0D13] font-semibold shadow-md shadow-[#D4AF37]/20 scale-105'
                  : 'bg-[#181C2E] text-[#A6AFCA] hover:text-[#EAE5D9] hover:bg-[#20253D]'
              }`}
            >
              {spread.name} ({spread.cardCount})
            </button>
          ))}
        </div>
      </div>

      {/* Intention Input */}
      <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl border border-[#D4AF37]/25 bg-[#121526]/80 backdrop-blur-sm">
        <label htmlFor="intention-query-input" className="block text-xs font-serif-tarot font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
          Vicky's Sacred Query or Focus
        </label>
        <div className="flex gap-2">
          <input
            id="intention-query-input"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="What wisdom awaits my path today..."
            className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#0B0D13] border border-[#D4AF37]/30 text-[#EAE5D9] text-sm focus:outline-none focus:border-[#D4AF37]"
          />
          <button
            onClick={handleDrawCards}
            disabled={isShuffling}
            className="px-4 py-2.5 rounded-lg bg-[#D4AF37] hover:bg-[#F3C64F] text-[#0B0D13] font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-50 shrink-0"
          >
            <Shuffle className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`} />
            <span>{drawnCards.length > 0 ? 'Reshuffle' : 'Draw Spread'}</span>
          </button>
        </div>
        <p className="mt-2 text-[11px] text-[#A6AFCA] italic">
          {activeSpread.description}
        </p>
      </div>

      {/* Card Table Area */}
      {drawnCards.length === 0 ? (
        // Empty State: Face down deck on velvet table
        <div className="py-16 text-center border border-dashed border-[#D4AF37]/25 rounded-2xl bg-[#0D101C]/60 flex flex-col items-center justify-center">
          <div className="relative mb-6 cursor-pointer" onClick={handleDrawCards}>
            {/* Layered Deck Effect */}
            <div className="absolute top-2 left-2 opacity-40">
              <TarotCardGraphic isFaceDown size="md" />
            </div>
            <div className="absolute top-1 left-1 opacity-70">
              <TarotCardGraphic isFaceDown size="md" />
            </div>
            <div className="relative hover:scale-105 transition-transform">
              <TarotCardGraphic isFaceDown size="md" />
            </div>
          </div>
          <h3 className="font-serif-tarot text-lg text-[#EAE5D9] font-semibold mb-1">
            Deck is Cleansed & Ready
          </h3>
          <p className="text-xs text-[#A6AFCA] max-w-sm mb-4">
            78 Rider-Waite cards await your touch. Tap "Draw Spread" to deal the {activeSpread.cardCount} positions.
          </p>
          <button
            onClick={handleDrawCards}
            className="px-6 py-2.5 rounded-xl bg-[#D4AF37] hover:bg-[#F3C64F] text-[#0B0D13] font-semibold text-sm transition-all shadow-md shadow-[#D4AF37]/20 flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Deal {activeSpread.name}</span>
          </button>
        </div>
      ) : (
        // Active Spread Grid
        <div>
          <div className="flex items-center justify-between mb-4 px-2">
            <span className="text-xs text-[#A6AFCA]">
              Tap face-down cards to reveal their wisdom ({revealedIndices.size} of {drawnCards.length} revealed)
            </span>
            {revealedIndices.size < drawnCards.length && (
              <button
                onClick={revealAllCards}
                className="text-xs text-[#D4AF37] hover:underline font-medium"
              >
                Reveal All
              </button>
            )}
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 items-start justify-items-center mb-10">
            {drawnCards.map((cardInSpread, idx) => {
              const isFlipped = revealedIndices.has(idx);

              return (
                <div key={cardInSpread.card.id + idx} className="flex flex-col items-center w-full max-w-[200px]">
                  {/* Position Header Label */}
                  <div className="text-center mb-2 w-full">
                    <span className="text-[11px] font-serif-tarot font-bold uppercase tracking-wider text-[#D4AF37]">
                      {cardInSpread.positionName}
                    </span>
                    {cardInSpread.positionDescription && (
                      <div className="text-[10px] text-[#A6AFCA] truncate">
                        {cardInSpread.positionDescription}
                      </div>
                    )}
                  </div>

                  {/* Card Graphic with Click to Flip */}
                  <div
                    onClick={() => toggleFlip(idx)}
                    className="cursor-pointer transition-transform duration-300 hover:scale-102"
                  >
                    <TarotCardGraphic
                      card={cardInSpread.card}
                      isReversed={cardInSpread.isReversed}
                      isFaceDown={!isFlipped}
                      size="md"
                    />
                  </div>

                  {/* Quick Insight pill below card when revealed */}
                  {isFlipped && (
                    <div className="mt-3 text-center px-1">
                      <div className="text-[11px] font-medium text-[#EAE5D9]">
                        {cardInSpread.card.name}{' '}
                        <span className="text-[#D4AF37] text-[10px]">
                          ({cardInSpread.isReversed ? 'Rev' : 'Up'})
                        </span>
                      </div>
                      <p className="text-[10px] text-[#A6AFCA] line-clamp-2 mt-0.5">
                        {cardInSpread.isReversed
                          ? cardInSpread.card.reversedKeywords.slice(0, 3).join(', ')
                          : cardInSpread.card.uprightKeywords.slice(0, 3).join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interpret Button */}
          <div className="flex flex-col items-center justify-center pt-4">
            <button
              onClick={handleInterpret}
              disabled={isInterpreting}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3C64F] hover:from-[#F3C64F] hover:to-[#D4AF37] text-[#0B0D13] font-bold text-base transition-all shadow-xl shadow-[#D4AF37]/25 flex items-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {isInterpreting ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>Channeling Rider-Waite Wisdom & Live Voice...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  <span>Unveil Full Reading & Live Audio Guidance</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
