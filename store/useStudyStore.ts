import { create } from 'zustand';
import { db } from '../lib/db';
import { Word, WordStatus, ReviewGrade, Scenario } from '../types';
import { calculateNextReview, isCorrectGrade, isNewWordLearned } from '../lib/fsrs';
import { recordReview } from '../lib/stats';

interface StudyState {
  sessionType: 'blitz' | 'forge' | 'leech' | 'scenario' | null;
  queue: Word[];
  currentIndex: number;
  isLoading: boolean;
  sessionStartTime: number | null;
  currentScenario: Scenario | null;

  // Dashboard Stats
  dueCount: number;
  newLearnedToday: number;
  leechCount: number;
  retentionRate: number;

  actions: {
    refreshStats: () => Promise<void>;
    startSession: (type: 'blitz' | 'forge' | 'leech' | 'scenario', limit?: number, scenario?: Scenario) => Promise<void>;
    markEasy: () => Promise<void>;
    markKeep: () => Promise<void>;
    markLearned: () => Promise<void>;
    submitGrade: (grade: ReviewGrade) => Promise<void>; // Deprecated but kept for type compat if needed
    endSession: () => void;
  };
}

export const useStudyStore = create<StudyState>((set, get) => ({
  sessionType: null,
  queue: [],
  currentIndex: 0,
  isLoading: false,
  sessionStartTime: null,
  currentScenario: null,
  dueCount: 0,
  newLearnedToday: 0,
  leechCount: 0,
  retentionRate: 85,

  actions: {
    refreshStats: async () => {
      const now = Date.now();
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const due = await db.words
        .where('status').anyOf(WordStatus.LEARNING, WordStatus.REVIEW)
        .and(w => w.dueDate <= now)
        .count();

      const newLearned = await db.words
        .where('status').anyOf(WordStatus.REVIEW, WordStatus.LEARNING)
        .and(w => w.reviewCount === 1 && w.dueDate >= todayStart.getTime())
        .count();

      const leech = await db.words
        .where('status').equals(WordStatus.LEECH)
        .count();

      const todayStats = await db.dailyStats
        .where('date').equals(todayStart.toISOString().split('T')[0])
        .first();

      const retention = todayStats && todayStats.reviewCount > 0
        ? Math.round((todayStats.correctCount / todayStats.reviewCount) * 100)
        : 85;

      set({
        dueCount: due,
        newLearnedToday: newLearned,
        leechCount: leech,
        retentionRate: retention
      });
    },

    startSession: async (type, limit = 20, scenario) => {
      set({ isLoading: true, sessionType: type, currentIndex: 0, sessionStartTime: Date.now(), currentScenario: scenario || null });
      const now = Date.now();
      let queue: Word[] = [];

      if (type === 'blitz') {
        // Flash Review: All due words
        queue = await db.words
          .where('status').anyOf(WordStatus.LEARNING, WordStatus.REVIEW)
          .and(w => w.dueDate <= now)
          .limit(limit * 2) // Allow larger limit for reviews
          .toArray();
      } else if (type === 'forge') {
        // New Words: Status = new
        queue = await db.words
          .where('status').equals(WordStatus.NEW)
          .limit(limit)
          .toArray();
      } else if (type === 'leech') {
        queue = await db.words
          .where('status').equals(WordStatus.LEECH)
          .limit(limit)
          .toArray();
      } else if (type === 'scenario' && scenario) {
        queue = await db.words
          .where('id').anyOf(scenario.wordIds)
          .toArray();
      }

      set({ queue, isLoading: false });
    },

    markEasy: async () => {
      const { queue, currentIndex } = get();
      const currentWord = queue[currentIndex];
      if (!currentWord || !currentWord.id) return;

      // DB Action: Mastered, archived (nextReview = null/0)
      const updates = {
        status: WordStatus.MASTERED,
        dueDate: 0,
        reviewCount: (currentWord.reviewCount || 0) + 1
      };
      await db.words.update(currentWord.id, updates);
      await recordReview(true, false); // Log stat

      // UI Action: Next card
      const nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        set({ sessionType: null, queue: [], sessionStartTime: null });
        await get().actions.refreshStats();
      } else {
        set({ currentIndex: nextIndex });
      }
    },

    markKeep: async () => {
      const { queue, currentIndex } = get();
      const currentWord = queue[currentIndex];
      if (!currentWord || !currentWord.id) return;

      // DB Action: Review, 1 day interval
      const nextDay = Date.now() + 24 * 60 * 60 * 1000;
      const updates = {
        status: WordStatus.REVIEW,
        dueDate: nextDay,
        interval: 1,
        reviewCount: (currentWord.reviewCount || 0) + 1
      };
      await db.words.update(currentWord.id, updates);
      await recordReview(true, currentWord.status === WordStatus.NEW);

      // UI Action: Next card
      const nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        set({ sessionType: null, queue: [], sessionStartTime: null });
        await get().actions.refreshStats();
      } else {
        set({ currentIndex: nextIndex });
      }
    },

    markLearned: async () => {
      const { queue, currentIndex } = get();
      const currentWord = queue[currentIndex];
      if (!currentWord || !currentWord.id) return;

      // DB Action: Learning, 10 mins interval
      const tenMins = Date.now() + 10 * 60 * 1000;
      const updates = {
        status: WordStatus.LEARNING,
        dueDate: tenMins,
        reviewCount: (currentWord.reviewCount || 0) + 1
      };
      await db.words.update(currentWord.id, updates);
      await recordReview(false, currentWord.status === WordStatus.NEW);

      // UI Action: Insert at end of queue to see again
      const newQueue = [...queue];
      newQueue.push({ ...currentWord, ...updates } as Word);

      // Move to next
      const nextIndex = currentIndex + 1;
      // Note: newQueue.length increased by 1, so nextIndex is valid even if it was the last one
      set({ queue: newQueue, currentIndex: nextIndex });
    },

    // Legacy placeholder to satisfy interface if needed, or we remove from Interface
    submitGrade: async (grade) => { console.warn("submitGrade is deprecated"); },
    endSession: () => {
      set({ sessionType: null, queue: [], currentIndex: 0, sessionStartTime: null });
      get().actions.refreshStats();
    }
  }
}));
