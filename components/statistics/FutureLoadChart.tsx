import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { WordStatus } from '../../types';

interface DayLoad {
    date: Date;
    dayLabel: string;
    count: number;
    isOverload: boolean;
}

const OVERLOAD_THRESHOLD = 100;
const DAY_LABELS = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export const FutureLoadChart: React.FC = () => {
    const futureStats = useLiveQuery(async (): Promise<DayLoad[]> => {
        const now = new Date();
        now.setHours(0, 0, 0, 0);

        // 获取所有 review/learning 状态的词
        const words = await db.words
            .where('status').anyOf(WordStatus.LEARNING, WordStatus.REVIEW, 'learning', 'review')
            .toArray();

        // 未来7天的日期
        const days: DayLoad[] = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(now);
            date.setDate(date.getDate() + i);
            const dayStart = date.getTime();
            const dayEnd = dayStart + 24 * 60 * 60 * 1000;

            // 统计该天到期的单词数
            const count = words.filter(w => {
                const dueDate = w.dueDate || 0;
                return dueDate >= dayStart && dueDate < dayEnd;
            }).length;

            days.push({
                date,
                dayLabel: i === 0 ? '今天' : i === 1 ? '明天' : DAY_LABELS[date.getDay()],
                count,
                isOverload: count > OVERLOAD_THRESHOLD
            });
        }

        return days;
    }, []) || [];

    const maxCount = Math.max(...futureStats.map(d => d.count), 1);
    const totalFuture = futureStats.reduce((sum, d) => sum + d.count, 0);

    return (
        <div className="bg-[#F7F6F2] dark:bg-[#2a2a2a] rounded-2xl border border-[#E8E6E0] dark:border-[#3a3a3a] p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-bold text-slate-700 dark:text-[#e5e5e0]">未来7天压力图</h2>
                <span className="text-xs text-slate-400 dark:text-[#888]">
                    共 <span className="font-bold text-rose-500">{totalFuture}</span> 词待复习
                </span>
            </div>

            {/* Chart */}
            <div className="flex items-end justify-between gap-2 h-32 mb-3">
                {futureStats.map((day, i) => {
                    const heightPercent = maxCount > 0 ? (day.count / maxCount) * 100 : 0;

                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            {/* Count Label */}
                            {day.count > 0 && (
                                <span className={`text-[10px] font-bold ${day.isOverload ? 'text-red-500' : 'text-slate-500 dark:text-[#888]'}`}>
                                    {day.count}
                                </span>
                            )}

                            {/* Bar */}
                            <div
                                className={`w-full rounded-t-lg transition-all duration-300 ${day.isOverload
                                        ? 'bg-gradient-to-t from-red-500 to-red-400'
                                        : day.count > 0
                                            ? 'bg-gradient-to-t from-rose-400 to-rose-300'
                                            : 'bg-[#E8E6E0] dark:bg-[#3a3a3a]'
                                    }`}
                                style={{ height: `${Math.max(heightPercent, 8)}%` }}
                            />

                            {/* Day Label */}
                            <span className={`text-[10px] font-medium ${i === 0 ? 'text-rose-500 font-bold' : 'text-slate-400 dark:text-[#888]'
                                }`}>
                                {day.dayLabel}
                            </span>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-[10px] text-slate-400 dark:text-[#888] pt-3 border-t border-[#E8E6E0] dark:border-[#3a3a3a]">
                <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-rose-400" />
                    <span>正常复习</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                    <span>压力过大 (&gt;{OVERLOAD_THRESHOLD})</span>
                </div>
            </div>
        </div>
    );
};
