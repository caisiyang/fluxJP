/**
 * 学习统计模块
 */
import { db } from './db';
import { DailyStats } from '../types';

/**
 * 获取今日日期字符串 (YYYY-MM-DD)
 */
export const getTodayDateString = (): string => {
    const now = new Date();
    return now.toISOString().split('T')[0];
};

/**
 * 获取或创建今日统计记录
 */
export const getOrCreateTodayStats = async (): Promise<DailyStats> => {
    const today = getTodayDateString();
    let stats = await db.dailyStats.where('date').equals(today).first();

    if (!stats) {
        const newStats: DailyStats = {
            date: today,
            newWordsLearned: 0,
            reviewCount: 0,
            correctCount: 0,
            studyTimeMinutes: 0,
        };
        const id = await db.dailyStats.add(newStats);
        stats = { ...newStats, id };
    }

    return stats;
};

/**
 * 记录一次复习
 */
export const recordReview = async (isCorrect: boolean, isNewWord: boolean): Promise<void> => {
    const stats = await getOrCreateTodayStats();

    await db.dailyStats.update(stats.id!, {
        reviewCount: stats.reviewCount + 1,
        correctCount: stats.correctCount + (isCorrect ? 1 : 0),
        newWordsLearned: stats.newWordsLearned + (isNewWord ? 1 : 0),
    });
};

/**
 * 记录学习时间
 */
export const recordStudyTime = async (minutes: number): Promise<void> => {
    const stats = await getOrCreateTodayStats();

    await db.dailyStats.update(stats.id!, {
        studyTimeMinutes: stats.studyTimeMinutes + minutes,
    });
};

/**
 * 获取最近 N 天的统计数据
 */
export const getRecentStats = async (days: number = 7): Promise<DailyStats[]> => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days + 1);

    const startStr = startDate.toISOString().split('T')[0];
    const endStr = endDate.toISOString().split('T')[0];

    return db.dailyStats
        .where('date')
        .between(startStr, endStr, true, true)
        .reverse()
        .toArray();
};

/**
 * 计算连续学习天数 (Streak)
 */
export const getStudyStreak = async (): Promise<number> => {
    const allStats = await db.dailyStats
        .orderBy('date')
        .reverse()
        .toArray();

    if (allStats.length === 0) return 0;

    const today = getTodayDateString();
    let streak = 0;
    let checkDate = new Date();

    // 如果今天没有学习记录，从昨天开始计算
    if (allStats[0].date !== today) {
        checkDate.setDate(checkDate.getDate() - 1);
    }

    for (const stat of allStats) {
        const checkStr = checkDate.toISOString().split('T')[0];
        if (stat.date === checkStr && stat.reviewCount > 0) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else if (stat.date < checkStr) {
            // 有缺失的日期，断连
            break;
        }
    }

    return streak;
};

/**
 * 获取总体统计
 */
export const getTotalStats = async (): Promise<{
    totalReviews: number;
    totalCorrect: number;
    totalStudyMinutes: number;
    averageAccuracy: number;
}> => {
    const allStats = await db.dailyStats.toArray();

    const totalReviews = allStats.reduce((sum, s) => sum + s.reviewCount, 0);
    const totalCorrect = allStats.reduce((sum, s) => sum + s.correctCount, 0);
    const totalStudyMinutes = allStats.reduce((sum, s) => sum + s.studyTimeMinutes, 0);
    const averageAccuracy = totalReviews > 0 ? (totalCorrect / totalReviews) * 100 : 0;

    return { totalReviews, totalCorrect, totalStudyMinutes, averageAccuracy };
};
