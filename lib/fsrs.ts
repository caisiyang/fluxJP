import { Word, WordStatus, ReviewGrade } from '../types';

/**
 * Calculates the next state of a card based on the user's grade.
 * A simplified interpretation of FSRS/SM-2 for high throughput.
 */
export const calculateNextReview = (word: Word, grade: ReviewGrade): Partial<Word> => {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const TEN_MINUTES = 10 * 60 * 1000;

  let newStatus = word.status;
  let newInterval = word.interval; // stored in minutes internally for logic, but often projected to days
  let newEase = word.easeFactor || 2.5;
  let newReviewCount = (word.reviewCount || 0) + 1;
  let newLeechCount = word.leechCount || 0;
  let newDueDate = now;

  // 1. Kill (Easy/Mastered)
  if (grade === 'kill') {
    return {
      status: WordStatus.MASTERED,
      interval: -1, // Infinite
      dueDate: now + (365 * 10 * ONE_DAY), // Far future
      reviewCount: newReviewCount
    };
  }

  // 2. Keep (Good/Hard - Standard SRS)
  if (grade === 'keep') {
    if (newStatus === WordStatus.NEW || newStatus === WordStatus.LEARNING) {
      // Graduate to Review
      newStatus = WordStatus.REVIEW;
      newInterval = 1 * 24 * 60; // 1 day in minutes
    } else {
      // Exponential increase
      newInterval = Math.round(word.interval * newEase);
      // Slight ease adjustment
      newEase = Math.min(newEase + 0.1, 5.0); 
    }
    
    // Calculate Due Date
    newDueDate = now + (newInterval * 60 * 1000);
  }

  // 3. Forge (Again/Fail)
  if (grade === 'forge') {
    newStatus = WordStatus.LEARNING;
    newInterval = 10; // 10 minutes
    newEase = Math.max(newEase - 0.2, 1.3); // Penalty
    newLeechCount += 1;
    newDueDate = now + TEN_MINUTES;

    if (newLeechCount > 5) {
       // Could flag as Leech status here, but we keep it learning for now
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
