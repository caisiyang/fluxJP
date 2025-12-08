import { create } from 'zustand';
import { db, getNewWords, getSettings, getFavoriteWords } from '../lib/db';
import { Word, WordStatus, ReviewGrade, Scenario } from '../types';
import { recordReview } from '../lib/stats';

// 获取明天凌晨0点的时间戳（本地时间）
const getTomorrowMidnight = (): number => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  return tomorrow.getTime();
};

// 获取今天凌晨0点的时间戳（本地时间）
const getTodayMidnight = (): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today.getTime();
};

// SRS 间隔升级策略 (天数)
const INTERVAL_STEPS = [1, 2, 4, 7, 14, 30, 60, 120];

const getNextInterval = (currentInterval: number): number => {
  const currentIndex = INTERVAL_STEPS.indexOf(currentInterval);
  if (currentIndex === -1) {
    // 如果当前间隔不在列表中，找到最接近的更大值
    for (const step of INTERVAL_STEPS) {
      if (step > currentInterval) return step;
    }
    return INTERVAL_STEPS[INTERVAL_STEPS.length - 1]; // 返回最大值
  }
  if (currentIndex < INTERVAL_STEPS.length - 1) {
    return INTERVAL_STEPS[currentIndex + 1];
  }
  return currentInterval; // 已达最大间隔
};

interface StudyState {
  sessionType: 'blitz' | 'forge' | 'leech' | 'scenario' | 'favorites' | 'mastered' | null;
  queue: Word[];
  currentIndex: number;
  isLoading: boolean;
  sessionStartTime: number | null;
  currentScenario: Scenario | null;
  showCompletionMessage: string | null;

  // Dashboard Stats
  dueCount: number;           // 真正到期的数量
  reviewAheadCount: number;   // 可提前复习的数量 (未到期)
  newLearnedToday: number;
  leechCount: number;
  masteredCount: number;
  retentionRate: number;

  actions: {
    refreshStats: () => Promise<void>;
    startSession: (type: 'blitz' | 'forge' | 'leech' | 'scenario' | 'favorites' | 'mastered', limit?: number, scenario?: Scenario) => Promise<void>;
    startMasteredSession: (words: Word[]) => void;
    markEasy: () => Promise<void>;
    markKeep: () => Promise<void>;
    markLearned: () => Promise<void>;
    submitGrade: (grade: ReviewGrade) => Promise<void>;
    endSession: () => void;
    clearCompletionMessage: () => void;
  };
}

export const useStudyStore = create<StudyState>((set, get) => ({
  sessionType: null,
  queue: [],
  currentIndex: 0,
  isLoading: false,
  sessionStartTime: null,
  currentScenario: null,
  showCompletionMessage: null,
  dueCount: 0,
  reviewAheadCount: 0,
  newLearnedToday: 0,
  leechCount: 0,
  masteredCount: 0,
  retentionRate: 85,

  actions: {
    refreshStats: async () => {
      const now = Date.now();
      const todayStart = getTodayMidnight();

      // 已到期的复习词 (dueDate <= now)
      const dueWords = await db.words
        .where('status').anyOf(WordStatus.LEARNING, WordStatus.REVIEW)
        .filter(w => w.dueDate <= now)
        .count();

      // 未到期但可提前复习的词 (dueDate > now)
      const aheadWords = await db.words
        .where('status').anyOf(WordStatus.LEARNING, WordStatus.REVIEW)
        .filter(w => w.dueDate > now)
        .count();

      const newLearned = await db.words
        .where('status').anyOf(WordStatus.REVIEW, WordStatus.LEARNING)
        .filter(w => w.reviewCount === 1 && w.dueDate >= todayStart)
        .count();

      const leech = await db.words
        .where('status').equals(WordStatus.LEECH)
        .count();

      const mastered = await db.words
        .where('status').equals(WordStatus.MASTERED)
        .count();

      const todayStr = new Date().toISOString().split('T')[0];
      const todayStats = await db.dailyStats
        .where('date').equals(todayStr)
        .first();

      const retention = todayStats && todayStats.reviewCount > 0
        ? Math.round((todayStats.correctCount / todayStats.reviewCount) * 100)
        : 85;

      set({
        dueCount: dueWords,
        reviewAheadCount: aheadWords,
        newLearnedToday: newLearned,
        leechCount: leech,
        masteredCount: mastered,
        retentionRate: retention
      });
    },

    startSession: async (type, limit = 20, scenario) => {
      set({
        isLoading: true,
        sessionType: type,
        currentIndex: 0,
        sessionStartTime: Date.now(),
        currentScenario: scenario || null,
        showCompletionMessage: null
      });
      const now = Date.now();
      let queue: Word[] = [];

      const settings = await getSettings();
      const selectedBook = settings.selectedBook;

      if (type === 'blitz') {
        // 闪击复习：获取所有 review/learning 状态的词
        // 按 dueDate 排序，到期的排在前面
        const allReviewWords = await db.words
          .where('status').anyOf(WordStatus.LEARNING, WordStatus.REVIEW)
          .toArray();

        // 排序：已到期的在前，未到期的在后
        allReviewWords.sort((a, b) => a.dueDate - b.dueDate);

        queue = allReviewWords.slice(0, limit * 2);
      } else if (type === 'forge') {
        queue = await getNewWords(limit, selectedBook);
      } else if (type === 'leech') {
        queue = await db.words
          .where('status').equals(WordStatus.LEECH)
          .limit(limit)
          .toArray();
      } else if (type === 'favorites') {
        queue = await getFavoriteWords();
      } else if (type === 'scenario' && scenario) {
        queue = await db.words
          .where('id').anyOf(scenario.wordIds)
          .toArray();
      }

      set({ queue, isLoading: false });
    },

    // 已掌握复习会话 (直接传入单词列表)
    startMasteredSession: (words: Word[]) => {
      set({
        isLoading: false,
        sessionType: 'mastered',
        queue: words,
        currentIndex: 0,
        sessionStartTime: Date.now(),
        currentScenario: null,
        showCompletionMessage: null
      });
    },

    // 太简单 -> 已掌握 (mastered)
    markEasy: async () => {
      const { queue, currentIndex } = get();
      const currentWord = queue[currentIndex];
      if (!currentWord || !currentWord.id) return;

      const updates = {
        status: WordStatus.MASTERED,
        dueDate: 0,
        reviewCount: (currentWord.reviewCount || 0) + 1
      };
      await db.words.update(currentWord.id, updates);
      await recordReview(true, false);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        set({ sessionType: null, queue: [], sessionStartTime: null });
        await get().actions.refreshStats();
      } else {
        set({ currentIndex: nextIndex });
      }
    },

    // 需强化/记住了 -> review (有条件升级)
    markKeep: async () => {
      const { queue, currentIndex, sessionType } = get();
      const currentWord = queue[currentIndex];
      if (!currentWord || !currentWord.id) return;

      const now = Date.now();
      const isDue = currentWord.dueDate <= now;

      let updates: Partial<Word>;
      let completionMsg: string;

      if (isDue) {
        // Case A: 真正到期了 - 执行 SRS 升级
        const currentInterval = currentWord.interval || 1;
        const nextInterval = getNextInterval(currentInterval);
        const nextDueDate = now + nextInterval * 24 * 60 * 60 * 1000;

        updates = {
          status: WordStatus.REVIEW,
          dueDate: nextDueDate,
          interval: nextInterval,
          reviewCount: (currentWord.reviewCount || 0) + 1
        };
        completionMsg = '🎉 学习完成！记得按时回来复习';
      } else {
        // Case B: 提前复习 - 不改变间隔，仅记录
        // 保持原有的 dueDate 和 interval 不变
        updates = {
          reviewCount: (currentWord.reviewCount || 0) + 1
          // 注意：不更新 dueDate 和 interval
        };
        completionMsg = '✨ 提前复习完成！进度保持不变';
      }

      await db.words.update(currentWord.id, updates);
      await recordReview(true, currentWord.status === WordStatus.NEW);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        set({
          sessionType: null,
          queue: [],
          sessionStartTime: null,
          showCompletionMessage: completionMsg
        });
        await get().actions.refreshStats();
      } else {
        set({ currentIndex: nextIndex });
      }
    },

    // 不认识/还需强化 -> leech 或重置
    markLearned: async () => {
      const { queue, currentIndex, sessionType } = get();
      const currentWord = queue[currentIndex];
      if (!currentWord || !currentWord.id) return;

      // Case C: 忘了 - 无论是否到期，都打回原形
      // 对于新词：进入 leech
      // 对于复习词：重置间隔，重新开始
      const updates = {
        status: WordStatus.LEECH,
        interval: 0,  // 重置间隔
        leechCount: (currentWord.leechCount || 0) + 1,
        reviewCount: (currentWord.reviewCount || 0) + 1
      };
      await db.words.update(currentWord.id, updates);
      await recordReview(false, currentWord.status === WordStatus.NEW);

      const nextIndex = currentIndex + 1;
      if (nextIndex >= queue.length) {
        set({
          sessionType: null,
          queue: [],
          sessionStartTime: null,
          showCompletionMessage: '🎯 学习完成！顽固词需要重点攻克'
        });
        await get().actions.refreshStats();
      } else {
        set({ currentIndex: nextIndex });
      }
    },

    submitGrade: async (grade) => {
      console.warn("submitGrade is deprecated, use markEasy/markKeep/markLearned");
    },

    endSession: () => {
      set({ sessionType: null, queue: [], currentIndex: 0, sessionStartTime: null });
      get().actions.refreshStats();
    },

    clearCompletionMessage: () => {
      set({ showCompletionMessage: null });
    }
  }
}));
