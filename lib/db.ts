import Dexie, { Table } from 'dexie';
import { Word, Sentence, Settings, DailyStats } from '../types';
import { generateMockWords, MOCK_SENTENCES } from './mockData';

class FluxDatabase extends Dexie {
  words!: Table<Word>;
  sentences!: Table<Sentence>;
  settings!: Table<Settings>;
  dailyStats!: Table<DailyStats>;

  constructor() {
    super('FluxJP_DB');
    (this as any).version(2).stores({
      words: '++id, status, level, dueDate, tags, category, [status+dueDate]',
      sentences: '++id, wordIds',
      settings: '++id',
      dailyStats: '++id, date'
    });
  }
}

export const db = new FluxDatabase();

export const initDB = async () => {
  const count = await db.words.count();
  if (count === 0) {
    console.log("Initializing DB with Mock Data...");
    await db.words.bulkAdd(generateMockWords());
    await db.sentences.bulkAdd(MOCK_SENTENCES);
    await db.settings.add({
      dailyNewLimit: 20,
      autoAudio: false,
      audioSpeed: 0.9,
      theme: 'light'
    });
  }
};

/**
 * 获取用户设置
 */
export const getSettings = async (): Promise<Settings> => {
  const settings = await db.settings.toCollection().first();
  return settings || {
    dailyNewLimit: 20,
    autoAudio: false,
    audioSpeed: 0.9,
    theme: 'light'
  };
};

/**
 * 更新用户设置
 */
export const updateSettings = async (updates: Partial<Settings>): Promise<void> => {
  const settings = await db.settings.toCollection().first();
  if (settings?.id) {
    await db.settings.update(settings.id, updates);
  }
};

/**
 * 批量导入词汇
 */
export const importVocabulary = async (words: Omit<Word, 'id'>[]): Promise<number> => {
  return db.words.bulkAdd(words as Word[]);
};

/**
 * 获取词汇统计
 */
export const getVocabStats = async (): Promise<{
  total: number;
  new: number;
  learning: number;
  review: number;
  mastered: number;
  leech: number;
}> => {
  const [total, newCount, learning, review, mastered, leech] = await Promise.all([
    db.words.count(),
    db.words.where('status').equals('new').count(),
    db.words.where('status').equals('learning').count(),
    db.words.where('status').equals('review').count(),
    db.words.where('status').equals('mastered').count(),
    db.words.where('status').equals('leech').count(),
  ]);

  return { total, new: newCount, learning, review, mastered, leech };
};