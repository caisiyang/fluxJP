import { Word, WordStatus, ReviewGrade } from '../types';

/**
 * FSRS/SM-2 简化算法 - 计算下次复习时间
 * 针对高吞吐量日常学习优化
 */
export const calculateNextReview = (word: Word, grade: ReviewGrade): Partial<Word> => {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const TEN_MINUTES = 10 * 60 * 1000;

  let newStatus = word.status;
  let newInterval = word.interval;
  let newEase = word.easeFactor || 2.5;
  let newReviewCount = (word.reviewCount || 0) + 1;
  let newLeechCount = word.leechCount || 0;
  let newDueDate = now;

  // 1. Kill (太简单/已掌握)
  if (grade === 'kill') {
    return {
      status: WordStatus.MASTERED,
      interval: -1,
      dueDate: now + (365 * 10 * ONE_DAY),
      reviewCount: newReviewCount
    };
  }

  // 2. Keep (记得/正常复习)
  if (grade === 'keep') {
    if (newStatus === WordStatus.NEW || newStatus === WordStatus.LEARNING) {
      // 毕业到复习阶段
      newStatus = WordStatus.REVIEW;
      newInterval = 1 * 24 * 60; // 1天 (分钟)
    } else {
      // 指数增长 + 模糊因子防止同一天堆积
      const fuzz = 1 + (Math.random() * 0.1 - 0.05); // ±5%
      newInterval = Math.round(word.interval * newEase * fuzz);
      // 最大间隔限制 (1年)
      newInterval = Math.min(newInterval, 365 * 24 * 60);
      // 小幅增加难度因子
      newEase = Math.min(newEase + 0.1, 3.0);
    }

    newDueDate = now + (newInterval * 60 * 1000);
  }

  // 3. Forge (忘记/需要重学)
  if (grade === 'forge') {
    newStatus = WordStatus.LEARNING;
    newInterval = 10; // 10分钟
    newEase = Math.max(newEase - 0.2, 1.3); // 惩罚难度因子
    newLeechCount += 1;
    newDueDate = now + TEN_MINUTES;

    // Leech 处理 - 超过5次遗忘标记为顽固词
    if (newLeechCount > 5) {
      newStatus = WordStatus.LEECH;
    }
  }

  return {
    status: newStatus,
    interval: newInterval,
    easeFactor: newEase,
    reviewCount: newReviewCount,
    leechCount: newLeechCount,
    dueDate: newDueDate
  };
};

/**
 * 判断是否为正确回答
 */
export const isCorrectGrade = (grade: ReviewGrade): boolean => {
  return grade === 'kill' || grade === 'keep';
};

/**
 * 判断是否为新词首次学习
 */
export const isNewWordLearned = (word: Word, grade: ReviewGrade): boolean => {
  return (word.status === WordStatus.NEW || word.status === WordStatus.LEARNING)
    && grade === 'keep'
    && word.reviewCount === 0;
};
