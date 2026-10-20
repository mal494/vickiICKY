import { TarotCard } from '../data/tarotDeck.ts';

export interface CardInSpread {
  card: TarotCard;
  isReversed: boolean;
  positionId: string;
  positionName: string;
  positionDescription?: string;
  symbolicInsight?: string;
}

export interface SavedReading {
  id: string;
  userId: string;
  spreadType: string;
  spreadName: string;
  query: string;
  theme?: string;
  interpretation: string;
  journalPrompt?: string;
  audioBase64?: string;
  photoUrl?: string;
  notes: string;
  tags: string[];
  cards: {
    cardId: string;
    cardName: string;
    suit: string;
    arcana: string;
    element: string;
    isReversed: boolean;
    positionName: string;
  }[];
  createdAt: string;
  updatedAt?: string;
}

export interface SpreadAnalysisResult {
  detectedCards: {
    cardName: string;
    position: string;
    isReversed: boolean;
    symbolicKey?: string;
    cardInterpretation?: string;
  }[];
  overview: string;
  interpretation: string;
  integrationPrompt: string;
}
