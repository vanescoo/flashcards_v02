
export const LANGUAGES = ['Dutch', 'Italian', 'French', 'Spanish', 'German'] as const;
export type Language = typeof LANGUAGES[number];

export const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type CEFRLevel = typeof CEFR_LEVELS[number];

export interface Word {
  id: string;
  word: string;
  translation: string;
  exampleSentence: string;
  cefrLevel: CEFRLevel;
  srsLevel: number;
  lastReviewed: string; // ISO Date string
  nextReview: string; // ISO Date string
}

export interface RevisionStat {
  lastRevised: string;
  revisionLength: string;
  totalWords: number;
  newWords: number;
  endCEFRLevel: CEFRLevel;
}

export type View = 'practice' | 'wordbank' | 'stats' | 'settings';

export type WordStatus = 'easy' | 'known' | 'new';
