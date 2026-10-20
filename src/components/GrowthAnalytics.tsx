import React from 'react';
import { SavedReading } from '../types/tarot.ts';
import { BarChart3, Sparkles, Flame, Droplets, Wind, Mountain, Compass, Calendar, Award } from 'lucide-react';
import { TarotCardGraphic } from './TarotCardGraphic.tsx';
import { getCardById } from '../data/tarotDeck.ts';

interface GrowthAnalyticsProps {
  readings: SavedReading[];
}

export const GrowthAnalytics: React.FC<GrowthAnalyticsProps> = ({ readings }) => {
  if (readings.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center mx-auto mb-4 text-[#D4AF37]">
          <BarChart3 className="w-8 h-8" />
        </div>
        <h2 className="font-serif-tarot text-2xl font-bold text-[#EAE5D9] mb-2">
          Spiritual Growth & Patterns Await
        </h2>
        <p className="text-sm text-[#A6AFCA] max-w-md mx-auto mb-6">
          As Vicky completes and saves her tarot readings, this sanctuary will illuminate recurring archetypes, elemental balances, and personal evolutions.
        </p>
      </div>
    );
  }

  // Aggregate Card Frequencies
  const cardCounts: Record<string, { count: number; name: string; cardId: string; reversedCount: number }> = {};
  let totalCardsPulled = 0;
  let reversedTotal = 0;
  let uprightTotal = 0;

  // Suit Counts
  const suitCounts: Record<string, number> = {
    major: 0,
    wands: 0,
    cups: 0,
    swords: 0,
    pentacles: 0,
  };

  readings.forEach((reading) => {
    (reading.cards || []).forEach((c) => {
      totalCardsPulled++;
      if (c.isReversed) {
        reversedTotal++;
      } else {
        uprightTotal++;
      }

      // Suit
      const suitKey = c.suit?.toLowerCase() || (c.arcana === 'major' ? 'major' : 'wands');
      if (suitCounts[suitKey] !== undefined) {
        suitCounts[suitKey]++;
      } else {
        suitCounts.major++;
      }

      // Card count
      if (!cardCounts[c.cardName]) {
        cardCounts[c.cardName] = {
          count: 0,
          name: c.cardName,
          cardId: c.cardId,
          reversedCount: 0,
        };
      }
      cardCounts[c.cardName].count++;
      if (c.isReversed) cardCounts[c.cardName].reversedCount++;
    });
  });

  // Top 5 Recurring Cards
  const sortedCards = Object.values(cardCounts)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Percentages for Elemental Balance
  const totalSuits = totalCardsPulled || 1;
  const majorPct = Math.round((suitCounts.major / totalSuits) * 100);
  const wandsPct = Math.round((suitCounts.wands / totalSuits) * 100);
  const cupsPct = Math.round((suitCounts.cups / totalSuits) * 100);
  const swordsPct = Math.round((suitCounts.swords / totalSuits) * 100);
  const pentaclesPct = Math.round((suitCounts.pentacles / totalSuits) * 100);

  const uprightPct = Math.round((uprightTotal / totalSuits) * 100);
  const reversedPct = Math.round((reversedTotal / totalSuits) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 pb-20">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 text-xs text-[#D4AF37] font-serif-tarot uppercase tracking-widest mb-2">
          <Compass className="w-3.5 h-3.5" />
          <span>Your Spiritual Journey 🌸</span>
        </div>
        <h1 className="font-serif-tarot text-2xl sm:text-3xl lg:text-4xl font-bold text-[#EAE5D9]">
          Vicky's Spiritual Growth & Lucky Cards
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-[#A6AFCA] max-w-lg mx-auto">
          See the cards that keep appearing in your life, your element energies, and your daily reading streaks across your {readings.length} recorded readings.
        </p>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        <div className="p-4 rounded-2xl border border-[#D4AF37]/25 bg-[#121526]/80 backdrop-blur-sm text-center">
          <div className="text-[11px] font-serif-tarot uppercase tracking-wider text-[#A6AFCA] mb-1">
            Total Sessions
          </div>
          <div className="font-mono text-3xl font-bold text-[#D4AF37]">
            {readings.length}
          </div>
          <div className="text-[10px] text-[#A6AFCA] mt-1">Archived in PostgreSQL</div>
        </div>

        <div className="p-4 rounded-2xl border border-[#D4AF37]/25 bg-[#121526]/80 backdrop-blur-sm text-center">
          <div className="text-[11px] font-serif-tarot uppercase tracking-wider text-[#A6AFCA] mb-1">
            Cards Consulted
          </div>
          <div className="font-mono text-3xl font-bold text-[#EAE5D9]">
            {totalCardsPulled}
          </div>
          <div className="text-[10px] text-[#A6AFCA] mt-1">Rider-Waite pulls</div>
        </div>

        <div className="p-4 rounded-2xl border border-[#D4AF37]/25 bg-[#121526]/80 backdrop-blur-sm text-center">
          <div className="text-[11px] font-serif-tarot uppercase tracking-wider text-[#A6AFCA] mb-1">
            Major Arcana
          </div>
          <div className="font-mono text-3xl font-bold text-[#9D72FF]">
            {majorPct}%
          </div>
          <div className="text-[10px] text-[#A6AFCA] mt-1">Deep Soul Lessons</div>
        </div>

        <div className="p-4 rounded-2xl border border-[#D4AF37]/25 bg-[#121526]/80 backdrop-blur-sm text-center">
          <div className="text-[11px] font-serif-tarot uppercase tracking-wider text-[#A6AFCA] mb-1">
            Shadow Integration
          </div>
          <div className="font-mono text-3xl font-bold text-amber-400">
            {reversedPct}%
          </div>
          <div className="text-[10px] text-[#A6AFCA] mt-1">Reversals Processed</div>
        </div>
      </div>

      {/* Top Recurring Archetypes (Most frequent cards) */}
      <div className="mb-10 p-6 rounded-2xl border border-[#D4AF37]/25 bg-[#121526]/80 backdrop-blur-sm shadow-xl">
        <h2 className="font-serif-tarot text-lg font-bold text-[#D4AF37] mb-2 flex items-center gap-2">
          <Award className="w-5 h-5" />
          <span>Vicky's Most Recurring Archetypes & Guides</span>
        </h2>
        <p className="text-xs text-[#A6AFCA] mb-6">
          These cards have appeared most frequently in your spread pulls, signaling active soul lessons and guardian energies.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-6 justify-items-center">
          {sortedCards.map((c, idx) => {
            const fullCard = getCardById(c.cardId);
            const frequencyPct = Math.round((c.count / readings.length) * 100);

            return (
              <div
                key={c.name}
                className="flex flex-col items-center p-3 rounded-xl bg-[#0B0D13]/60 border border-white/5 w-full max-w-[190px] text-center"
              >
                <div className="text-[10px] font-serif-tarot text-[#D4AF37] font-semibold mb-2">
                  #{idx + 1} Guide ({c.count} pulls · {frequencyPct}%)
                </div>
                <TarotCardGraphic card={fullCard} size="sm" showDetails={false} />
                <div className="mt-2 text-xs font-bold text-[#EAE5D9]">
                  {c.name}
                </div>
                <div className="text-[10px] text-[#A6AFCA] mt-0.5">
                  {fullCard?.element} · {fullCard?.arcana === 'major' ? 'Major Arcana' : fullCard?.suit}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Elemental & Suit Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
        {/* Elemental Distribution */}
        <div className="p-6 rounded-2xl border border-[#D4AF37]/25 bg-[#121526]/80 backdrop-blur-sm shadow-xl">
          <h3 className="font-serif-tarot text-base font-bold text-[#D4AF37] mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            <span>Elemental Energy Balance</span>
          </h3>

          <div className="space-y-4">
            {/* Spirit / Major Arcana */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-[#EAE5D9]">
                  <Sparkles className="w-3.5 h-3.5 text-[#9D72FF]" />
                  <span>Spirit & Higher Calling (Major Arcana)</span>
                </span>
                <span className="font-mono text-[#9D72FF]">{majorPct}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-[#9D72FF] rounded-full" style={{ width: `${majorPct}%` }} />
              </div>
            </div>

            {/* Fire / Wands */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-[#EAE5D9]">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>Fire (Passion, Willpower, Wands)</span>
                </span>
                <span className="font-mono text-orange-400">{wandsPct}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 rounded-full" style={{ width: `${wandsPct}%` }} />
              </div>
            </div>

            {/* Water / Cups */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-[#EAE5D9]">
                  <Droplets className="w-3.5 h-3.5 text-sky-400" />
                  <span>Water (Emotion, Love, Intuition, Cups)</span>
                </span>
                <span className="font-mono text-sky-400">{cupsPct}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ width: `${cupsPct}%` }} />
              </div>
            </div>

            {/* Air / Swords */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-[#EAE5D9]">
                  <Wind className="w-3.5 h-3.5 text-blue-300" />
                  <span>Air (Mind, Truth, Boundaries, Swords)</span>
                </span>
                <span className="font-mono text-blue-300">{swordsPct}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-blue-300 rounded-full" style={{ width: `${swordsPct}%` }} />
              </div>
            </div>

            {/* Earth / Pentacles */}
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="flex items-center gap-1.5 text-[#EAE5D9]">
                  <Mountain className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Earth (Body, Health, Abundance, Pentacles)</span>
                </span>
                <span className="font-mono text-emerald-400">{pentaclesPct}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pentaclesPct}%` }} />
              </div>
            </div>
          </div>
        </div>

        {/* Upright vs Reversed Posture */}
        <div className="p-6 rounded-2xl border border-[#D4AF37]/25 bg-[#121526]/80 backdrop-blur-sm shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-serif-tarot text-base font-bold text-[#D4AF37] mb-2">
              Conscious vs. Internalized Flow
            </h3>
            <p className="text-xs text-[#A6AFCA] mb-6">
              Upright cards manifest directly in your outer world. Reversed cards indicate deep internal introspection, delayed fruition, or private shadow integration.
            </p>

            <div className="flex items-center justify-center gap-8 my-6">
              <div className="text-center">
                <div className="font-mono text-4xl font-bold text-[#10B981]">
                  {uprightPct}%
                </div>
                <div className="text-xs font-serif-tarot font-semibold text-[#EAE5D9] mt-1">
                  Upright Energy
                </div>
                <div className="text-[10px] text-[#A6AFCA]">Direct Manifestation</div>
              </div>

              <div className="w-px h-16 bg-white/10" />

              <div className="text-center">
                <div className="font-mono text-4xl font-bold text-amber-400">
                  {reversedPct}%
                </div>
                <div className="text-xs font-serif-tarot font-semibold text-[#EAE5D9] mt-1">
                  Reversed Energy
                </div>
                <div className="text-[10px] text-[#A6AFCA]">Internal Alchemy</div>
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#0B0D13]/70 border border-[#D4AF37]/15 text-xs text-[#EAE5D9] italic">
            "Your readings show a harmonious equilibrium between outward manifestation and quiet internal calibration."
          </div>
        </div>
      </div>
    </div>
  );
};
