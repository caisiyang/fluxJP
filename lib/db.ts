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
/**
 * 获取词汇统计
 */
export const getVocabStats = async (level?: string): Promise<{
  total: number;
  new: number;
  learning: number;
  review: number;
  mastered: number;
  leech: number;
}> => {
  if (level) {
    // Optimization: iterate all words of that level and count manually
    // This ensures 'total' is exactly the count of words with that level
    const words = await db.words.where('level').equals(level).toArray();

    const stats = {
      total: words.length,
      new: 0,
      learning: 0,
      review: 0,
      mastered: 0,
      leech: 0
    };

    for (const w of words) {
      // Note: DB status might be stored as 'new', 'learning' etc string literals
      if (w.status === 'new') stats.new++;
      else if (w.status === 'learning') stats.learning++;
      else if (w.status === 'review') stats.review++;
      else if (w.status === 'mastered') stats.mastered++;
      else if (w.status === 'leech') stats.leech++;
    }
    return stats;
  }

  // Global stats
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

/**
 * 获取随机新词 (Random New Words)
 */
export const getNewWords = async (limit: number, level?: string): Promise<Word[]> => {
  let collection = db.words.where('status').equals('new');

  if (level) {
    // If level is specified, we must verify the level.
    // Since Dexie compound index where('status').equals('new').and(...) can be slow or complex,
    // we can query by level first if it's expected to be smaller, or just filter.
    // Given 'new' words might be many, but 'level' words are partitioned.
    // Strategy: Query by level (index), then filter by status='new'.
    const allNewLevelWords = await db.words
      .where('level').equals(level)
      .filter(w => w.status === 'new')
      .primaryKeys();

    // Shuffle primary keys
    const shuffled = shuffleArray(allNewLevelWords);
    const selectedKeys = shuffled.slice(0, limit);

    // Bulk get
    // Cast to number[] because our IDs are auto-incremented numbers, though TS definitions might vary.
    // If IDs are strings, this cast is fine or needs adjustment.
    // Based on schema '++id', they are numbers.
    return await db.words.bulkGet(selectedKeys as number[]);
  } else {
    // Global random
    const allNewWordKeys = await collection.primaryKeys();
    const shuffled = shuffleArray(allNewWordKeys);
    const selectedKeys = shuffled.slice(0, limit);
    return await db.words.bulkGet(selectedKeys as number[]);
  }
};

// Helper for shuffling
function shuffleArray<T>(array: T[]): T[] {
  const newArr = [...array];
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
  }
  return newArr;
}