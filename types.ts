export enum WordStatus {
  NEW = 'new',
  LEARNING = 'learning',
  REVIEW = 'review',
  MASTERED = 'mastered',
  LEECH = 'leech'
}

export interface Word {
  id?: number;
  kanji: string;
  kana: string;
  meaning: string;
  level: 'N5' | 'N4' | 'N3' | 'N2' | 'N1' | 'Elementary';
  tags: string[];
  category?: string; // 场景分类：日常、购物、餐厅、交通等
  partOfSpeech?: string; // 词性：名词、动词、形容词等

  // Learning Data
  status: WordStatus;
  interval: number;
  easeFactor: number;
  dueDate: number;
  reviewCount: number;
  leechCount: number;

  // Rich Content
  mnemonic?: string;
  etymology?: string;
  examples: { jp: string; en: string }[];
}

export interface Sentence {
  id?: number;
  japanese: string;
  english: string;
  grammar?: string;
  wordIds: number[];
  source?: string;
}

export interface Settings {
  id?: number;
  dailyNewLimit: number;
  autoAudio: boolean;
  audioSpeed: number; // 语速 0.5 - 1.5
  theme: 'dark' | 'light';
  selectedBook?: string; // Currently selected vocab book (e.g. 'N5', 'N1')
}

export interface DailyStats {
  id?: number;
  date: string; // YYYY-MM-DD
  newWordsLearned: number;
  reviewCount: number;
  correctCount: number;
  studyTimeMinutes: number;
}

export interface VocabPack {
  id: string;
  name: string;
  description: string;
  level: string;
  wordCount: number;
  categories: string[];
}

export type ReviewGrade = 'kill' | 'keep' | 'forge';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  difficulty: number; // 1-5
  category: string;
  wordIds: number[]; // Words belonging to this scenario
  icon?: string; // Icon name for UI
}

export interface GrammarPattern {
  id: string;
  structure: string; // e.g., "{Person} wa {Place} ni ikimasu"
  level: string; // N5, N4...
  requiredParts: string[]; // partOfSpeech tags required: ['person', 'place']
  description: string;
}
