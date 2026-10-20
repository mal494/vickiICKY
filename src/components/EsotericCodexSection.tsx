import React, { useState, useMemo } from 'react';
import { ESOTERIC_CARD_DATA, EsotericCardRecord } from '../data/esotericCardData.ts';
import { Search, Sparkles, Flame, Droplets, Wind, Mountain, Moon, Sun, X, Volume2 } from 'lucide-react';
import { TAROT_DECK } from '../data/tarotDeck.ts';
import { TarotCardGraphic } from './TarotCardGraphic.tsx';

interface EsotericCodexSectionProps {
  onSpeakCard?: (text: string) => void;
}

export const EsotericCodexSection: React.FC<EsotericCodexSectionProps> = ({ onSpeakCard }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSuit, setSelectedSuit] = useState<string>('all');
  const [inspectedCard, setInspectedCard] = useState<EsotericCardRecord | null>(null);

  const filteredCards = useMemo(() => {
    return ESOTERIC_CARD_DATA.filter((card) => {
      const matchesSuit =
        selectedSuit === 'all' ||
        (selectedSuit === 'major' && card.suit === 'Major Arcana') ||
        (selectedSuit === 'wands' && card.suit === 'Wands') ||
        (selectedSuit === 'swords' && card.suit === 'Swords') ||
        (selectedSuit === 'cups' && card.suit === 'Cups') ||
        (selectedSuit === 'pentacles' && card.suit === 'Pentacles');

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        card.name.toLowerCase().includes(q) ||
        card.card_specific_keyword.toLowerCase().includes(q) ||
        card.numerology_meaning.toLowerCase().includes(q) ||
        card.element_data.element.toLowerCase().includes(q) ||
        card.element_data.zodiac.some((z) => z.toLowerCase().includes(q)) ||
        card.element_data.core_representation.toLowerCase().includes(q) ||
        card.element_data.qualities.some((qual) => qual.toLowerCase().includes(q));

      return matchesSuit && matchesSearch;
    });
  }, [searchQuery, selectedSuit]);

  const getElementBadge = (element: string, qualities: string[]) => {
    const qualText = qualities.join(' & ');
    switch (element.toLowerCase()) {
      case 'fire':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-500/15 text-red-400 border border-red-500/30">
            <Flame className="w-2.5 h-2.5" />
            <span>Fire · {qualText}</span>
          </span>
        );
      case 'water':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
            <Droplets className="w-2.5 h-2.5" />
            <span>Water · {qualText}</span>
          </span>
        );
      case 'air':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <Wind className="w-2.5 h-2.5" />
            <span>Air · {qualText}</span>
          </span>
        );
      case 'earth':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <Mountain className="w-2.5 h-2.5" />
            <span>Earth · {qualText}</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30">
            <span>{element} · {qualText}</span>
          </span>
        );
    }
  };

  const handleSpeak = (card: EsotericCardRecord) => {
    const speechText = `${card.name}. Specific vibration: ${card.card_specific_keyword}. Numerological essence: ${card.numerology_meaning}. Governed by ${card.element_data.element}, ${card.element_data.energy.toLowerCase()} energy, with qualities ${card.element_data.qualities.join(' and ')}. Astrological ruler: ${card.element_data.zodiac.join(', ')}.`;
    if (onSpeakCard) {
      onSpeakCard(speechText);
    } else if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(speechText);
      u.rate = 0.92;
      u.pitch = 0.98;
      window.speechSynthesis.speak(u);
    }
  };

  // Find corresponding TarotCard in TAROT_DECK for graphic display
  const inspectedTarotCard = useMemo(() => {
    if (!inspectedCard) return null;
    return TAROT_DECK.find(
      (c) => c.name.toLowerCase().trim() === inspectedCard.name.toLowerCase().trim()
    );
  }, [inspectedCard]);

  return (
    <div className="mt-12 pt-8 border-t border-[#D4AF37]/20">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-serif-tarot font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Sacred Esoteric Codex & Archetypes</span>
          </div>
          <h2 className="font-serif-tarot text-xl sm:text-2xl font-bold text-[#EAE5D9]">
            Vicky's Tarot Grimoire
          </h2>
          <p className="text-xs text-[#A6AFCA] mt-1 max-w-xl">
            Explore the Hermetic qualities (hot, wet, dry, cold), planetary zodiac rulers, and numerology secrets woven into your cards.
          </p>
        </div>

        <div className="text-xs text-[#A6AFCA] bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl self-start sm:self-auto">
          <span className="text-[#D4AF37] font-bold font-mono text-sm mr-1">
            {filteredCards.length}
          </span>
          Archetypes in Codex
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl border border-[#D4AF37]/25 bg-[#121526]/80 backdrop-blur-sm mb-6 flex flex-col md:flex-row items-stretch md:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A6AFCA] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by card name, keyword, zodiac (e.g. Uranus, Aries), or quality (wet, hot)..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0B0D13] border border-[#D4AF37]/30 text-[#EAE5D9] text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Suit & Element Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'all', label: 'All Cards' },
            { id: 'major', label: 'Major Arcana' },
            { id: 'wands', label: 'Wands 🔥' },
            { id: 'swords', label: 'Swords 💨' },
            { id: 'cups', label: 'Cups 💧' },
            { id: 'pentacles', label: 'Pentacles 🌿' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setSelectedSuit(item.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedSuit === item.id
                  ? 'bg-[#D4AF37] text-[#0B0D13] font-bold shadow-md shadow-[#D4AF37]/20'
                  : 'bg-white/5 text-[#A6AFCA] hover:text-[#EAE5D9] hover:bg-white/10'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map((card) => (
          <div
            key={card.card_id}
            onClick={() => setInspectedCard(card)}
            className="p-4 rounded-2xl border border-white/10 bg-[#121526]/60 hover:border-[#D4AF37]/50 hover:bg-[#121526]/90 transition-all cursor-pointer group flex flex-col justify-between shadow-lg hover:shadow-[#D4AF37]/10"
          >
            <div>
              {/* Header Badges */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-mono text-[#D4AF37] px-1.5 py-0.5 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/30 font-bold">
                    {typeof card.rank === 'number' ? `#${card.rank}` : card.rank}
                  </span>
                  <span className="text-[10px] text-[#A6AFCA] uppercase tracking-wider font-semibold">
                    {card.suit}
                  </span>
                </div>
                {getElementBadge(card.element_data.element, card.element_data.qualities)}
              </div>

              {/* Title & Specific Keyword */}
              <h3 className="font-serif-tarot text-base font-bold text-[#EAE5D9] group-hover:text-[#D4AF37] transition-colors">
                {card.name}
              </h3>
              <div className="text-xs text-[#D4AF37] font-medium mt-0.5 flex items-center gap-1">
                <span>✦</span>
                <span>{card.card_specific_keyword}</span>
              </div>

              {/* Numerology Essence */}
              <div className="mt-2.5 p-2 rounded-xl bg-black/40 border border-white/5 text-[11px] text-[#A6AFCA] leading-relaxed">
                <span className="text-[#EAE5D9] font-medium">Numerology: </span>
                <span>{card.numerology_meaning}</span>
              </div>
            </div>

            {/* Bottom Meta Pill Bar */}
            <div className="mt-3 pt-2.5 border-t border-white/5 flex items-center justify-between text-[10px] text-[#A6AFCA]">
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10">
                  {card.element_data.energy === 'Masculine' ? '⚡ Active' : '🌙 Receptive'}
                </span>
                {card.element_data.playing_card_suit !== 'N/A' && (
                  <span className="px-1.5 py-0.5 rounded bg-white/5 border border-white/10 font-mono">
                    {card.element_data.playing_card_suit}
                  </span>
                )}
              </div>
              <span className="text-[#D4AF37] font-medium group-hover:translate-x-0.5 transition-transform">
                {card.element_data.zodiac.join(', ')} →
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Up-Close Detailed Esoteric Modal */}
      {inspectedCard && (
        <div className="fixed inset-0 z-50 bg-[#0B0D13]/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-[#121526] border-2 border-[#D4AF37]/50 rounded-3xl p-6 sm:p-7 shadow-2xl animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => setInspectedCard(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-[#A6AFCA] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Badges */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono text-[#D4AF37] px-2 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 font-bold">
                {inspectedCard.card_id}
              </span>
              <span className="text-xs uppercase tracking-wider text-[#A6AFCA] font-serif-tarot font-semibold">
                {inspectedCard.suit}
              </span>
              {getElementBadge(inspectedCard.element_data.element, inspectedCard.element_data.qualities)}
            </div>

            <h2 className="font-serif-tarot text-2xl font-bold text-[#EAE5D9] mb-1">
              {inspectedCard.name}
            </h2>
            <div className="text-sm font-semibold text-[#D4AF37] mb-4">
              "{inspectedCard.card_specific_keyword}"
            </div>

            {/* Graphic Preview if TarotCard exists */}
            {inspectedTarotCard && (
              <div className="flex justify-center mb-5">
                <div className="scale-90 transform-origin-center">
                  <TarotCardGraphic card={inspectedTarotCard} isReversed={false} size="md" />
                </div>
              </div>
            )}

            {/* Deep Esoteric Breakdown Matrix */}
            <div className="space-y-3 mb-5">
              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                <div className="text-[11px] font-serif-tarot font-bold text-[#D4AF37] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Numerological Essence</span>
                </div>
                <p className="text-xs text-[#EAE5D9] leading-relaxed">
                  {inspectedCard.numerology_meaning}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <div className="text-[10px] text-[#A6AFCA] uppercase font-semibold mb-0.5">
                    Hermetic Qualities
                  </div>
                  <div className="text-[#EAE5D9] font-medium capitalize">
                    {inspectedCard.element_data.qualities.join(' & ')}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <div className="text-[10px] text-[#A6AFCA] uppercase font-semibold mb-0.5">
                    Polarity Energy
                  </div>
                  <div className="text-[#EAE5D9] font-medium">
                    {inspectedCard.element_data.energy === 'Masculine' ? '⚡ Masculine (Active)' : '🌙 Feminine (Receptive)'}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <div className="text-[10px] text-[#A6AFCA] uppercase font-semibold mb-0.5">
                    Planetary / Zodiac Ruler
                  </div>
                  <div className="text-[#EAE5D9] font-medium">
                    {inspectedCard.element_data.zodiac.join(', ')}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-black/30 border border-white/5">
                  <div className="text-[10px] text-[#A6AFCA] uppercase font-semibold mb-0.5">
                    Playing Card Suit
                  </div>
                  <div className="text-[#EAE5D9] font-medium">
                    {inspectedCard.element_data.playing_card_suit}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-black/40 border border-white/10">
                <div className="text-[11px] font-serif-tarot font-bold text-[#D4AF37] uppercase tracking-wider mb-1">
                  Core Representation
                </div>
                <p className="text-xs text-[#A6AFCA] leading-relaxed">
                  {inspectedCard.element_data.core_representation}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handleSpeak(inspectedCard)}
                className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-[#D4AF37] border border-[#D4AF37]/35 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Volume2 className="w-4 h-4" />
                <span>Hear Esoteric Meaning</span>
              </button>

              <button
                onClick={() => setInspectedCard(null)}
                className="flex-1 py-3 rounded-xl bg-[#D4AF37] hover:bg-[#F3C64F] text-[#0B0D13] font-bold text-xs cursor-pointer transition-colors"
              >
                Close Codex
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
