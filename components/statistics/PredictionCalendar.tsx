import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { WordStatus } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface DayData {
    date: string;
    count: number;
    isPast: boolean;
    isToday: boolean;
    isFuture: boolean;
}

export const PredictionCalendar: React.FC = () => {
    const [selectedDay, setSelectedDay] = useState<DayData | null>(null);

    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const todayStr = today.toISOString().split('T')[0];

    const calendarData = useLiveQuery(async () => {
        // 获取所有待复习词的 dueDate
        const reviewWords = await db.words
            .where('status').anyOf(WordStatus.LEARNING, WordStatus.REVIEW, 'learning', 'review')
            .toArray();

        // 获取每日统计
        const dailyStats = await db.dailyStats.toArray();

        // 按日期分组
        const dueDateCounts: Record<string, number> = {};
        const completedCounts: Record<string, number> = {};

        reviewWords.forEach(w => {
            if (w.dueDate) {
                const dateStr = new Date(w.dueDate).toISOString().split('T')[0];
                dueDateCounts[dateStr] = (dueDateCounts[dateStr] || 0) + 1;
            }
        });

        dailyStats.forEach(s => {
            if (s.reviewCount > 0) {
                completedCounts[s.date] = s.reviewCount;
            }
        });

        return { dueDateCounts, completedCounts };
    }, []) || { dueDateCounts: {}, completedCounts: {} };

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    const days: (DayData | null)[] = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const dayDate = new Date(currentYear, currentMonth, i);
        const isPast = dayDate < new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const isToday = dateStr === todayStr;
        const isFuture = dayDate > today;

        const count = isPast || isToday
            ? (calendarData.completedCounts[dateStr] || 0)
            : (calendarData.dueDateCounts[dateStr] || 0);

        days.push({ date: dateStr, count, isPast, isToday, isFuture });
    }

    const getIntensity = (count: number): string => {
        if (count === 0) return '';
        if (count < 10) return 'opacity-40';
        if (count < 30) return 'opacity-60';
        if (count < 50) return 'opacity-80';
        return 'opacity-100';
    };

    const handleDayClick = (day: DayData | null) => {
        if (day && day.count > 0) {
            setSelectedDay(day);
            setTimeout(() => setSelectedDay(null), 2000);
        }
    };

    return (
        <div className="bg-[#F7F6F2] dark:bg-[#2a2a2a] rounded-2xl border border-[#E8E6E0] dark:border-[#3a3a3a] p-5 shadow-sm relative">
            <h2 className="text-sm font-bold text-slate-700 dark:text-[#e5e5e0] mb-4 flex items-center justify-between">
                <span>智能预测日历</span>
                <span className="text-xs font-normal text-slate-400 dark:text-[#888]">{currentYear}年 {currentMonth + 1}月</span>
            </h2>

            {/* Week Headers */}
            <div className="grid grid-cols-7 text-center mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                    <div key={d} className="text-[10px] text-slate-400 dark:text-[#888] font-bold">{d}</div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-y-2">
                {days.map((day, idx) => {
                    if (!day) return <div key={idx} />;

                    return (
                        <div
                            key={idx}
                            className="flex flex-col items-center cursor-pointer"
                            onClick={() => handleDayClick(day)}
                        >
                            <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium relative
                transition-all duration-200 hover:scale-110
                ${day.isToday ? 'bg-rose-500 text-white shadow-md' : 'text-slate-600 dark:text-[#c5c5c0]'}
              `}>
                                {day.date.split('-')[2]}

                                {/* Past: Filled circle (completed) */}
                                {day.isPast && day.count > 0 && (
                                    <div className={`absolute -bottom-0.5 w-2 h-2 rounded-full bg-emerald-500 ${getIntensity(day.count)}`} />
                                )}

                                {/* Future: Hollow circle (predicted) */}
                                {day.isFuture && day.count > 0 && (
                                    <div className={`absolute -bottom-0.5 w-2 h-2 rounded-full border-2 border-rose-400 ${getIntensity(day.count)}`} />
                                )}

                                {/* Today with due */}
                                {day.isToday && day.count > 0 && (
                                    <div className="absolute -bottom-0.5 w-2 h-2 rounded-full bg-white" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="mt-4 pt-3 border-t border-[#E8E6E0] dark:border-[#3a3a3a] flex items-center justify-center gap-4 text-[10px] text-slate-400 dark:text-[#888]">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>已完成</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full border-2 border-rose-400" />
                    <span>预测复习</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>今日</span>
                </div>
            </div>

            {/* Toast for selected day */}
            <AnimatePresence>
                {selectedDay && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-[#1a1a1a] text-white px-4 py-2 rounded-xl text-xs font-medium shadow-lg z-10"
                    >
                        {selectedDay.isPast ? `已复习: ${selectedDay.count} 词` : `预计复习: ${selectedDay.count} 词`}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
