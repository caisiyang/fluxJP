export enum WordStatus {
  NEW = 'new',
  LEARNING = 'learning',
  REVIEW = 'review',
  MASTERED = 'mastered', // "Kill" result
  LEECH = 'leech' // Hard to remember
}

export interface Word {
  id?: number;
  kanji: string;
  kana: string;
  meaning: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1';
  tags: string[];
  
  // Learning Data
  status: WordStatus;
  interval: number; // In minutes. 0 means learning queue.
  easeFactor: number; // Multiplier, default 2.5
  dueDate: number; // Timestamp
  reviewCount: number;
  leechCount: number;

  // Rich Content (for State 3)
  mnemonic?: string;
  etymology?: string; // Character breakdown
  examples: { jp: string; en: string }[];
}

export interface Sentence {
  id?: number;
  japanese: string;
  english: string; // Used for translation (Chinese)
  grammar?: string; // New field for grammar analysis
  wordIds: number[]; // Foreign keys to Words
  source?: string;
}

export interface Settings {
  id?: number;
  dailyNewLimit: number;
  autoAudio: boolean;
  theme: 'dark' | 'light';
}

export type ReviewGrade = 'kill' | 'keep' | 'forge'; // Easy | Good | Again