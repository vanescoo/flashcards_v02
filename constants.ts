
import { CEFRLevel, Language } from './types.ts';

export const LANGUAGES_CONFIG: { [key in Language]: string } = {
  Dutch: '🇳🇱',
  Italian: '🇮🇹',
  French: '🇫🇷',
  Spanish: '🇪🇸',
  German: '🇩🇪',
};

export const CEFR_DESCRIPTIONS: { [key in CEFRLevel]: string } = {
  A1: 'Beginner',
  A2: 'Elementary',
  B1: 'Intermediate',
  B2: 'Upper-Intermediate',
  C1: 'Advanced',
  C2: 'Proficient',
};

export const NEW_WORDS_PER_SESSION = 5;
export const KNOWN_WORDS_TO_LEVEL_UP = 5;

// Spaced Repetition System intervals in hours
export const SRS_INTERVALS_HOURS: { [key: number]: number } = {
  1: 12,    // 12 hours
  2: 48,    // 2 days
  3: 96,    // 4 days
  4: 240,   // 10 days
  5: 336,   // 2 weeks
  6: 720,   // 1 month (approx)
  7: 4380,  // 6 months (approx)
  8: 8760,  // 1 year (approx)
};
