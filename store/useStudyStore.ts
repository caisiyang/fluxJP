import { create } from 'zustand';
import { db } from '../lib/db';
import { Word, WordStatus, ReviewGrade } from '../types';
import { calculateNextReview } from '../lib/fsrs';

interface StudyState {
  sessionType: 'blitz' | 'forge' | null;
  queue: Word[];
  currentIndex: number;
  isLoading: boolean;
  
  // Dashboard Stats
  dueCount: number;
  newLearnedToday: number;
  retentionRate: number;

  actions: {
    refreshStats: () => Promise<void>;
    startSession: (type: 'blitz' | 'forge', limit?: number) => Promise<void>;
    submitGrade: (grade: ReviewGrade) => Promise<void>;
    endSession: () => void;
  };
}

export const useStudyStore = create<StudyState>((set, get) => ({
  sessionType: null,
  queue: [],
  currentIndex: 0,
  isLoading: false,
  dueCount: 0,
  newLearnedToday: 0,
  retentionRate: 85, // Mocked for now

  actions: {
    refreshStats: async () => {
      const now = Date.now();
      const due = await db.words
        .where('status').anyOf(WordStatus.LEARNING, WordStatus.REVIEW)
        .and(w => w.dueDate <= now)
        .count();
      
      const newLearned = await db.words
        .where('status').equals(WordStatus.REVIEW)
        .and(w => w.dueDate > now && w.reviewCount === 1) // Rough proxy for today
        .count();

      set({ dueCount: due, newLearnedToday: newLearned });
    },

    startSession: async (type, limit = 20) => {
      set({ isLoading: true, sessionType: type, currentIndex: 0 });
      const now = Date.now();
      let queue: Word[] = [];

      if (type === 'blitz') {
        // Fetch Due items (Learning or Review)
        queue = await db.words
          .where('status').anyOf(WordStatus.LEARNING, WordStatus.REVIEW)
          .and(w => w.dueDate <= now)
          .limit(50) // Batch size
          .toArray();
      } else if (type === 'forge') {
        // Fetch New items
        queue = await db.words
          .where('status').equals(WordStatus.NEW)
          .limit(limit)
          .toArray();
      }

      set({ queue, isLoading: false });
    },

    submitGrade: async (grade) => {
      const { queue, currentIndex } = get();
      const currentWord = queue[currentIndex];
      if (!currentWord) return;

      const updates = calculateNextReview(currentWord, grade);
      
      // Update DB
      if (currentWord.id) {
        await db.words.update(currentWord.id, updates);
      }

      // If 'forge' (Again) and we are in a session, we might want to re-queue it at the end
      // For MVP simplicity, we just move to next, but in real FSRS we re-queue.
      // Let's implement simple re-queue for 'forge' result in learning mode
      let newQueue = [...queue];
      if (grade === 'forge') {
         // Push a copy with updated status to end of queue to see it again this session
         newQueue.push({ ...currentWord, ...updates } as Word);
      }

      const nextIndex = currentIndex + 1;
      
      if (nextIndex >= newQueue.length) {
        // Session complete
        set({ sessionType: null, queue: [] });
        await get().actions.refreshStats();
      } else {
        set({ queue: newQueue, currentIndex: nextIndex });
      }
    },

    endSession: () => {
      set({ sessionType: null, queue: [], currentIndex: 0 });
      get().actions.refreshStats();
    }
  }
}));
