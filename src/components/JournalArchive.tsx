import React, { useState } from 'react';
import { SavedReading } from '../types/tarot.ts';
import { Search, Calendar, Tag, Trash2, Volume2, Sparkles, BookOpen, ChevronRight, Filter } from 'lucide-react';
import { TarotCardGraphic } from './TarotCardGraphic.tsx';
import { getCardById } from '../data/tarotDeck.ts';

interface JournalArchiveProps {
  readings: SavedReading[];
  onSelectReading: (reading: SavedReading) => void;
  onDeleteReading: (id: string) => void;
}

export const JournalArchive: React.FC<JournalArchiveProps> = ({
  readings,
  onSelectReading,
  onDeleteReading,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTag, setSelectedTag] = useState<string>('all');
  const [selectedSpreadType, setSelectedSpreadType] = useState<string>('all');

  // Collect all unique tags
  const allTags = Array.from(
    new Set(readings.flatMap((r) => r.tags || []).filter(Boolean))
  );

  // Filtered readings
  const filteredReadings = readings.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.query.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.theme && r.theme.toLowerCase().includes(searchQuery.toLowerCase())) ||
      r.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.cards.some((c) => c.cardName.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTag =
      selectedTag === 'all' || (r.tags && r.tags.includes(selectedTag));

    const matchesSpread =
      selectedSpreadType === 'all' || r.spreadType === selectedSpreadType;

    return matchesSearch && matchesTag && matchesSpread;
  });

  const formatDate = (dateString: string) => {
    try {
      const d = new Date(dateString);
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs text-[#D4AF37] font-serif-tarot uppercase tracking-widest mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Your Personal Diary 💖</span>
          </div>
          <h1 className="font-serif-tarot text-2xl sm:text-3xl font-bold text-[#EAE5D9]">
            Vicky's Private Diary
          </h1>
          <p className="text-xs sm:text-sm text-[#A6AFCA] mt-1">
            Every reading, card pull, and audio voice message is saved here for you automatically.
          </p>
        </div>

        <div className="text-xs text-[#A6AFCA] bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl">
          <span className="text-[#D4AF37] font-bold font-mono text-base mr-1">
            {readings.length}
          </span>
          Saved Diary Entries
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="mb-8 p-4 rounded-2xl border border-[#D4AF37]/25 bg-[#121526]/80 backdrop-blur-sm shadow-lg flex flex-col md:flex-row items-stretch md:items-center gap-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#A6AFCA] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by question, card name, reflection note, or theme..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0B0D13] border border-[#D4AF37]/30 text-[#EAE5D9] text-xs sm:text-sm focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Spread Type Filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
          <select
            value={selectedSpreadType}
            onChange={(e) => setSelectedSpreadType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-[#0B0D13] border border-[#D4AF37]/30 text-xs text-[#EAE5D9] focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">All Spread Types</option>
            <option value="daily">Daily Card</option>
            <option value="three_card">3-Card Spread</option>
            <option value="mind_body_spirit">Mind, Body, Spirit</option>
            <option value="cross_of_guidance">5-Card Cross</option>
          </select>
        </div>

        {/* Tag Pills */}
        {allTags.length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setSelectedTag('all')}
              className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                selectedTag === 'all'
                  ? 'bg-[#D4AF37] text-[#0B0D13] font-semibold'
                  : 'bg-white/5 text-[#A6AFCA] hover:text-[#EAE5D9]'
              }`}
            >
              All Tags
            </button>
            {allTags.slice(0, 6).map((t) => (
              <button
                key={t}
                onClick={() => setSelectedTag(t)}
                className={`px-2.5 py-1 text-xs rounded-lg whitespace-nowrap transition-colors ${
                  selectedTag === t
                    ? 'bg-[#D4AF37] text-[#0B0D13] font-semibold'
                    : 'bg-white/5 text-[#A6AFCA] hover:text-[#EAE5D9]'
                }`}
              >
                #{t}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Readings Grid / List */}
      {filteredReadings.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-[#D4AF37]/20 rounded-2xl bg-[#0D101C]/60 flex flex-col items-center justify-center">
          <BookOpen className="w-12 h-12 text-[#D4AF37]/40 mb-3" />
          <h3 className="font-serif-tarot text-base font-bold text-[#EAE5D9] mb-1">
            No Sanctuary Readings Found
          </h3>
          <p className="text-xs text-[#A6AFCA] max-w-sm mb-4">
            {readings.length === 0
              ? 'Your digital journal is waiting for its first reading. Draw cards or scan a physical spread to begin archiving!'
              : 'Try clearing your search query or tag filters to view all entries.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredReadings.map((r) => (
            <div
              key={r.id}
              className="p-5 rounded-2xl border border-[#D4AF37]/20 bg-[#121526]/80 backdrop-blur-sm shadow-xl hover:border-[#D4AF37]/50 transition-all group flex flex-col justify-between"
            >
              <div>
                {/* Header row: Spread Name & Date */}
                <div className="flex items-center justify-between text-xs text-[#A6AFCA] mb-2">
                  <span className="font-serif-tarot font-bold text-[#D4AF37] uppercase tracking-wider">
                    {r.spreadName || r.spreadType}
                  </span>
                  <div className="flex items-center gap-1.5 text-[11px]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{formatDate(r.createdAt)}</span>
                  </div>
                </div>

                {/* Theme Title */}
                <h3 className="font-serif-tarot text-base font-bold text-[#EAE5D9] group-hover:text-[#D4AF37] transition-colors mb-1.5 line-clamp-1">
                  {r.theme || r.query}
                </h3>

                {/* Query Quote */}
                <p className="text-xs text-[#A6AFCA] italic line-clamp-1 mb-3">
                  "{r.query}"
                </p>

                {/* Mini Card Thumbnails Row */}
                <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-1">
                  {r.cards.map((c, idx) => {
                    const fullCard = getCardById(c.cardId);
                    return (
                      <div
                        key={idx}
                        className="flex flex-col items-center shrink-0 w-16 text-center"
                      >
                        <TarotCardGraphic
                          card={fullCard}
                          isReversed={c.isReversed}
                          size="sm"
                          showDetails={false}
                          className="!w-14 !h-22 !p-1"
                        />
                        <span className="text-[9px] text-[#A6AFCA] truncate max-w-[56px] mt-1">
                          {c.cardName}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Interpretation excerpt */}
                <p className="text-xs text-[#EAE5D9]/80 line-clamp-2 leading-relaxed mb-3">
                  {r.interpretation}
                </p>

                {/* Personal Notes preview if present */}
                {r.notes && (
                  <div className="p-2.5 rounded-lg bg-[#0B0D13]/70 border border-white/5 text-[11px] text-[#A6AFCA] italic line-clamp-2 mb-3">
                    <span className="text-[#D4AF37] font-serif-tarot not-italic font-semibold mr-1">
                      Vicky's Note:
                    </span>
                    {r.notes}
                  </div>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {r.audioBase64 && (
                    <span className="text-[10px] text-[#D4AF37] flex items-center gap-1 border border-[#D4AF37]/30 px-2 py-0.5 rounded-full">
                      <Volume2 className="w-3 h-3" />
                      <span>Voiced</span>
                    </span>
                  )}
                  {r.tags && r.tags.length > 0 && (
                    <span className="text-[10px] text-[#A6AFCA]">
                      #{r.tags[0]}
                      {r.tags.length > 1 && ` +${r.tags.length - 1}`}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onDeleteReading(r.id)}
                    title="Delete reading"
                    className="p-1.5 text-[#A6AFCA] hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => onSelectReading(r)}
                    className="px-3 py-1.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/30 text-[#D4AF37] text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <span>View Reading</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
