import Dexie, { Table } from 'dexie';
import { Word, Sentence, Settings } from '../types';
import { generateMockWords, MOCK_SENTENCES } from './mockData';

class FluxDatabase extends Dexie {
  words!: Table<Word>;
  sentences!: Table<Sentence>;
  settings!: Table<Settings>;

  constructor() {
    super('FluxJP_DB');
    (this as any).version(1).stores({
      words: '++id, status, level, dueDate, tags, [status+dueDate]',
      sentences: '++id, wordIds', // Multi-index for looking up sentences by word
      settings: '++id'
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
      theme: 'light' // Default to light
    });
  }
};