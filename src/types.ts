export type Category = 'haiwan' | 'buah' | 'objek' | 'lain';

export interface WordItem {
  id: string;
  word: string;
  syllables: string[];
  phoneticGuide: string;
  category: Category;
  categoryLabel: string;
  emoji: string;
  description: string;
  colorTheme: {
    bg: string;
    cardBg: string;
    border: string;
    accent: string;
    badgeBg: string;
    badgeText: string;
  };
  isCustom?: boolean;
  starsEarned: number; // 0, 1, 2, or 3
  isMastered: boolean;
  needsPractice: boolean;
  attemptsCount: number;
  lastScore?: number;
  lastSpokenText?: string;
  updatedAt?: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserStats {
  totalStars: number;
  streak: number;
  totalAttempts: number;
  wordsMastered: number;
}

export type AppMode = 'learn' | 'practice' | 'rewards' | 'developer';

export interface SpeechMatchResult {
  similarity: number; // 0 - 100
  recognizedText: string;
  isMatch: boolean;
  feedbackText: string;
  starsAwarded: number;
  matchedWord: string;
}
