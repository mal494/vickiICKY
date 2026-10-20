import React, { useState, useEffect } from 'react';
import { CardInSpread, SavedReading } from '../types/tarot.ts';
import { TarotCardGraphic } from './TarotCardGraphic.tsx';
import { AudioPlayerBar } from './AudioPlayerBar.tsx';
import { AudioDictaphone } from './AudioDictaphone.tsx';
import { Bookmark, Check, Share2, Sparkles, MessageSquare, Tag, ArrowLeft } from 'lucide-react';

interface ReadingPresenterProps {
  cards: CardInSpread[];
  spreadTitle: string;
  query: string;
  interpretationData?: any;
  photoUrl?: string;
  onSaveReading: (reading: Omit<SavedReading, 'id' | 'createdAt'>) => Promise<void>;
  onBackToDraw: () => void;
}

export const ReadingPresenter: React.FC<ReadingPresenterProps> = ({
  cards,
  spreadTitle,
  query,
  interpretationData,
  photoUrl,
  onSaveReading,
  onBackToDraw,
}) => {
  const [personalNotes, setPersonalNotes] = useState<string>('');
  const [tags, setTags] = useState<string[]>(['daily_insight', 'guidance']);
  const [tagInput, setTagInput] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const [isLoadingAudio, setIsLoadingAudio] = useState<boolean>(false);

  // Extract interpretation text
  const interpretationText =
    interpretationData?.interpretation ||
    interpretationData?.synthesis ||
    'Your cards reflect a potent convergence of currents. Center yourself in compassion as you integrate these lessons.';

  const themeTitle =
    interpretationData?.overview ||
    interpretationData?.theme ||
    `${spreadTitle} Insight`;

  const journalPrompt =
    interpretationData?.integrationPrompt ||
    interpretationData?.journalPrompt ||
    'What truth is seeking your conscious acknowledgement today?';

  // Automatically request TTS audio narration for the interpretation
  useEffect(() => {
    let isMounted = true;
    const fetchTts = async () => {
      setIsLoadingAudio(true);
      try {
        const response = await fetch('/api/tarot/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `${themeTitle}. ${interpretationText.slice(0, 750)}`,
            voiceName: 'Kore',
          }),
        });

        if (response.ok && isMounted) {
          const data = await response.json();
          if (data.audioUrl) {
            setAudioUrl(data.audioUrl);
          }
        }
      } catch (err) {
        console.warn('TTS fetch notice:', err);
      } finally {
        if (isMounted) setIsLoadingAudio(false);
      }
    };

    fetchTts();
    return () => {
      isMounted = false;
    };
  }, [themeTitle, interpretationText]);

  // Handle saving to journal
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSaveReading({
        userId: '',
        spreadType: spreadTitle.toLowerCase().replace(/\s+/g, '_'),
        spreadName: spreadTitle,
        query,
        theme: themeTitle,
        interpretation: interpretationText,
        journalPrompt,
        audioBase64: audioUrl,
        photoUrl,
        notes: personalNotes,
        tags,
        cards: cards.map((c) => ({
          cardId: c.card.id,
          cardName: c.card.name,
          suit: c.card.suit,
          arcana: c.card.arcana,
          element: c.card.element,
          isReversed: c.isReversed,
          positionName: c.positionName,
        })),
      });
      setIsSaved(true);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const addTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-20">
      {/* Top Bar Navigation Actions */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBackToDraw}
          className="text-xs text-[#A6AFCA] hover:text-[#EAE5D9] flex items-center gap-1.5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Draw Another Spread</span>
        </button>

        <button
          onClick={handleSave}
          disabled={isSaving || isSaved}
          className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all active:scale-95 ${
            isSaved
              ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
              : 'bg-[#D4AF37] hover:bg-[#F3C64F] text-[#0B0D13] shadow-md shadow-[#D4AF37]/20'
          }`}
        >
          {isSaved ? (
            <>
              <Check className="w-4 h-4" />
              <span>Saved in Sacred Journal</span>
            </>
          ) : (
            <>
              <Bookmark className="w-4 h-4" />
              <span>{isSaving ? 'Archiving...' : 'Save to Journal'}</span>
            </>
          )}
        </button>
      </div>

      {/* Header Banner */}
      <div className="text-center mb-8">
        <div className="text-xs uppercase font-serif-tarot tracking-widest text-[#D4AF37] mb-1">
          {spreadTitle} · Rider-Waite Reading
        </div>
        <h1 className="font-serif-tarot text-2xl sm:text-3xl lg:text-4xl font-bold text-[#EAE5D9]">
          {themeTitle}
        </h1>
        <p className="mt-2 text-sm text-[#A6AFCA] italic">
          Focus: "{query}"
        </p>
      </div>

      {/* Embedded Live TTS Audio Player */}
      <div className="mb-8">
        <AudioPlayerBar
          audioUrl={audioUrl}
          transcriptText={`${themeTitle}. ${interpretationText}`}
          voiceName="Kore (Compassionate Mentor)"
        />
      </div>

      {/* Optional Photo Snapshot if Camera Scan was used */}
      {photoUrl && (
        <div className="mb-8 p-3 rounded-2xl border border-[#D4AF37]/25 bg-[#121526]/60 backdrop-blur-sm max-w-lg mx-auto text-center">
          <div className="text-[11px] text-[#D4AF37] font-serif-tarot uppercase tracking-wider mb-2">
            Physical Altar Snapshot
          </div>
          <img
            src={photoUrl}
            alt="Physical tarot spread"
            className="w-full h-48 object-cover rounded-xl border border-white/10"
          />
        </div>
      )}

      {/* Cards Display Grid */}
      <div className="mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 justify-items-center">
          {cards.map((c, i) => (
            <div key={i} className="flex flex-col items-center max-w-[200px]">
              <div className="text-center mb-2">
                <span className="text-[11px] font-serif-tarot font-bold text-[#D4AF37] uppercase">
                  {c.positionName}
                </span>
              </div>
              <TarotCardGraphic card={c.card} isReversed={c.isReversed} size="md" />
              <div className="mt-3 text-center w-full px-1">
                <div className="text-xs font-semibold text-[#EAE5D9]">
                  {c.card.name}
                </div>
                <div className="text-[10px] text-[#A6AFCA] mt-0.5">
                  {c.isReversed ? 'Reversed' : 'Upright'} · {c.card.element}
                </div>
                {c.card.card_specific_keyword && (
                  <div className="mt-1 text-[10px] text-[#D4AF37] font-medium bg-[#D4AF37]/10 border border-[#D4AF37]/25 rounded-md px-1.5 py-0.5 inline-block">
                    ✦ {c.card.card_specific_keyword}
                  </div>
                )}
                {c.card.element_data && (
                  <div className="mt-1 text-[9px] text-[#A6AFCA]/80">
                    {c.card.element_data.qualities.join(' & ')} · {c.card.element_data.zodiac.join(', ')}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Esoteric Synthesis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
        {/* Main Interpretation Prose */}
        <div className="lg:col-span-2 p-6 rounded-2xl border border-[#D4AF37]/25 bg-[#121526]/80 backdrop-blur-sm shadow-xl">
          <h2 className="font-serif-tarot text-lg font-bold text-[#D4AF37] mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span>Spiritual Synthesis & Guidance</span>
          </h2>
          <div className="text-sm leading-relaxed text-[#EAE5D9]/90 whitespace-pre-line space-y-4 font-light">
            {interpretationText}
          </div>

          {/* Integration Journal Prompt */}
          <div className="mt-6 pt-6 border-t border-[#D4AF37]/20">
            <div className="text-xs font-serif-tarot font-bold text-[#D4AF37] uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <MessageSquare className="w-4 h-4" />
              <span>Contemplative Journal Prompt for Vicky</span>
            </div>
            <p className="text-xs sm:text-sm text-[#EAE5D9] italic bg-[#0B0D13]/70 p-3.5 rounded-xl border border-[#D4AF37]/15">
              "{journalPrompt}"
            </p>
          </div>
        </div>

        {/* Card-by-Card Symbolic Breakdown */}
        <div className="p-6 rounded-2xl border border-[#D4AF37]/25 bg-[#121526]/80 backdrop-blur-sm shadow-xl flex flex-col justify-between">
          <div>
            <h3 className="font-serif-tarot text-base font-bold text-[#D4AF37] mb-4">
              Rider-Waite Key Symbols
            </h3>
            <div className="space-y-4">
              {cards.map((c, i) => (
                <div key={i} className="pb-3 border-b border-white/5 last:border-0">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#EAE5D9]">
                    <span>{c.card.name}</span>
                    <span className="text-[10px] text-[#D4AF37]">
                      {c.isReversed ? 'Reversed' : 'Upright'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A6AFCA] mt-1 leading-snug">
                    {c.isReversed ? c.card.reversedMeaning : c.card.uprightMeaning}
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {(c.isReversed ? c.card.reversedKeywords : c.card.uprightKeywords)
                      .slice(0, 3)
                      .map((kw, idx) => (
                        <span
                          key={idx}
                          className="text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-[#A6AFCA]"
                        >
                          {kw}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Vicky's Personal Journal Reflections Input */}
      <div className="p-6 rounded-2xl border border-[#D4AF37]/25 bg-[#121526]/80 backdrop-blur-sm shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
          <h3 className="font-serif-tarot text-base font-bold text-[#D4AF37] flex items-center gap-2">
            <Bookmark className="w-4 h-4" />
            <span>Vicky's Personal Journal Entry & Reflections</span>
          </h3>
          <AudioDictaphone
            onTranscribed={(text) => {
              setPersonalNotes((prev) => (prev ? prev + ' ' + text : text));
            }}
            buttonText="Dictate Note"
          />
        </div>
        <p className="text-xs text-[#A6AFCA] mb-4">
          Record your immediate feelings, synchronicities, or speak aloud via microphone (transcribed by gemini-3.5-transcribe).
        </p>

        <textarea
          rows={4}
          value={personalNotes}
          onChange={(e) => setPersonalNotes(e.target.value)}
          placeholder="I noticed the High Priestess appeared right after my morning meditation... The feeling in my chest is one of calm release..."
          className="w-full p-3.5 rounded-xl bg-[#0B0D13] border border-[#D4AF37]/30 text-[#EAE5D9] text-sm focus:outline-none focus:border-[#D4AF37]"
        />

        {/* Tags management */}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Tag className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-xs text-[#A6AFCA]">Tags:</span>
          {tags.map((t) => (
            <span
              key={t}
              onClick={() => removeTag(t)}
              className="text-xs px-2.5 py-1 rounded-full bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/30 cursor-pointer hover:bg-red-950/40 hover:text-red-300 transition-colors"
              title="Click to remove tag"
            >
              #{t} &times;
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={addTag}
            placeholder="+ Add tag (Press Enter)"
            className="px-2 py-0.5 text-xs bg-transparent border-b border-white/20 text-[#EAE5D9] focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving || isSaved}
            className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all active:scale-95 ${
              isSaved
                ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/40'
                : 'bg-[#D4AF37] hover:bg-[#F3C64F] text-[#0B0D13] shadow-md shadow-[#D4AF37]/20'
            }`}
          >
            {isSaved ? (
              <>
                <Check className="w-4 h-4" />
                <span>Saved to Archive</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                <span>{isSaving ? 'Archiving Reading...' : 'Save Reading to Sacred Journal'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
