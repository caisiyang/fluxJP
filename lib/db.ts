import Dexie, { Table } from 'dexie';
import { Word, Sentence, Settings, DailyStats, WordStatus, Favorite } from '../types';
import { generateMockWords, MOCK_SENTENCES } from './mockData';

class FluxDatabase extends Dexie {
  words!: Table<Word>;
  sentences!: Table<Sentence>;
  settings!: Table<Settings>;
  dailyStats!: Table<DailyStats>;
  favorites!: Table<Favorite>;

  constructor() {
    super('FluxJP_DB');
    (this as any).version(3).stores({
      words: '++id, status, level, dueDate, tags, category, [status+dueDate]',
      sentences: '++id, wordIds',
      settings: '++id',
      dailyStats: '++id, date',
      favorites: '++id, wordId, addedAt'
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
      autoAudio: true,  // 默认开启自动发音
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
    autoAudio: true,
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
export const getVocabStats = async (level?: string): Promise<{
  total: number;
  new: number;
  learning: number;
  review: number;
  mastered: number;
  leech: number;
}> => {
  if (level) {
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
      if (w.status === 'new' || w.status === WordStatus.NEW) stats.new++;
      else if (w.status === 'learning' || w.status === WordStatus.LEARNING) stats.learning++;
      else if (w.status === 'review' || w.status === WordStatus.REVIEW) stats.review++;
      else if (w.status === 'mastered' || w.status === WordStatus.MASTERED) stats.mastered++;
      else if (w.status === 'leech' || w.status === WordStatus.LEECH) stats.leech++;
    }
    return stats;
  }

  const [total, newCount, learning, review, mastered, leech] = await Promise.all([
    db.words.count(),
    db.words.where('status').equals(WordStatus.NEW).count(),
    db.words.where('status').equals(WordStatus.LEARNING).count(),
    db.words.where('status').equals(WordStatus.REVIEW).count(),
    db.words.where('status').equals(WordStatus.MASTERED).count(),
    db.words.where('status').equals(WordStatus.LEECH).count(),
  ]);

  return { total, new: newCount, learning, review, mastered, leech };
};

/**
 * 获取随机新词 (Random New Words)
 * 只从 status=NEW 的词中抽取，排除 review/leech/mastered
 */
export const getNewWords = async (limit: number, level?: string): Promise<Word[]> => {
  console.log(`[getNewWords] Fetching ${limit} new words, level filter: ${level || 'ALL'}`);

  if (level) {
    // 只获取 status='new' 的词
    const allNewLevelWords = await db.words
      .where('level').equals(level)
      .filter(w => w.status === WordStatus.NEW || w.status === 'new')
      .toArray();

    console.log(`[getNewWords] Found ${allNewLevelWords.length} new words in level ${level}`);

    if (allNewLevelWords.length === 0) {
      console.log(`[getNewWords] No new words found in level ${level}`);
      return [];
    }

    const shuffled = shuffleArray(allNewLevelWords);
    return shuffled.slice(0, limit);
  } else {
    const allNewWords = await db.words
      .filter(w => w.status === 'new' || w.status === WordStatus.NEW)
      .toArray();

    console.log(`[getNewWords] Found ${allNewWords.length} new words globally`);

    if (allNewWords.length === 0) {
      return [];
    }

    const shuffled = shuffleArray(allNewWords);
    return shuffled.slice(0, limit);
  }
};

/**
 * 获取待复习的词
 */
export const getDueWords = async (limit: number): Promise<Word[]> => {
  const now = Date.now();
  return db.words
    .where('status').anyOf(WordStatus.LEARNING, WordStatus.REVIEW)
    .filter(w => w.dueDate <= now)
    .limit(limit)
    .toArray();
};

/**
 * 获取顽固词
 */
export const getLeechWords = async (limit: number): Promise<Word[]> => {
  return db.words
    .where('status').equals(WordStatus.LEECH)
    .limit(limit)
    .toArray();
};

// ============ 收藏夹功能 ============

/**
 * 添加收藏
 */
export const addFavorite = async (word: Word): Promise<number> => {
  // 检查是否已收藏
  const existing = await db.favorites.where('wordId').equals(word.id!).first();
  if (existing) {
    return existing.id!;
  }

  return db.favorites.add({
    wordId: word.id!,
    word: word.word || word.kanji || '',
    reading: word.reading || word.kana || '',
    meaning: word.meaning,
    addedAt: Date.now()
  });
};

/**
 * 移除收藏
 */
export const removeFavorite = async (wordId: number): Promise<void> => {
  await db.favorites.where('wordId').equals(wordId).delete();
};

/**
 * 批量移除收藏
 */
export const removeFavorites = async (wordIds: number[]): Promise<void> => {
  await db.favorites.where('wordId').anyOf(wordIds).delete();
};

/**
 * 获取所有收藏
 */
export const getFavorites = async (): Promise<Favorite[]> => {
  return db.favorites.orderBy('addedAt').reverse().toArray();
};

/**
 * 清空收藏
 */
export const clearFavorites = async (): Promise<void> => {
  await db.favorites.clear();
};

/**
 * 检查是否已收藏
 */
export const isFavorite = async (wordId: number): Promise<boolean> => {
  const count = await db.favorites.where('wordId').equals(wordId).count();
  return count > 0;
};

/**
 * 获取收藏的单词详情（用于复习）
 */
export const getFavoriteWords = async (): Promise<Word[]> => {
  const favorites = await getFavorites();
  const wordIds = favorites.map(f => f.wordId);
  return db.words.where('id').anyOf(wordIds).toArray();
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