import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/db';
import { WordStatus } from '../../types';

interface PipelineStats {
    new: number;
    learning: number;
    shortTerm: number;
    longTerm: number;
    mastered: number;
    total: number;
}

export const MemoryPipeline: React.FC = () => {
    const stats = useLiveQuery(async (): Promise<PipelineStats> => {
        const words = await db.words.toArray();

        const newCount = words.filter(w => w.status === WordStatus.NEW || w.status === 'new').length;
        const learningCount = words.filter(w => w.status === WordStatus.LEARNING || w.status === 'learning').length;
        const leechCount = words.filter(w => w.status === WordStatus.LEECH || w.status === 'leech').length;
        const reviewWords = words.filter(w => w.status === WordStatus.REVIEW || w.status === 'review');
        const shortTermCount = reviewWords.filter(w => (w.interval || 0) < 7).length;
        const longTermCount = reviewWords.filter(w => (w.interval || 0) >= 7).length;
        const masteredCount = words.filter(w => w.status === WordStatus.MASTERED || w.status === 'mastered').length;

        return {
            new: newCount,
            learning: learningCount + leechCount,
            shortTerm: shortTermCount,
            longTerm: longTermCount,
            mastered: masteredCount,
            total: words.length
        };
    }, []) || { new: 0, learning: 0, shortTerm: 0, longTerm: 0, mastered: 0, total: 0 };

    const getPercent = (value: number) => stats.total > 0 ? (value / stats.total) * 100 : 0;

    const stages = [
        { key: 'new', label: '未学习', count: stats.new, color: 'bg-slate-400', textColor: 'text-slate-500 dark:text-[#888]' },
        { key: 'learning', label: '学习中', count: stats.learning, color: 'bg-amber-400', textColor: 'text-amber-600 dark:text-amber-400' },
        { key: 'shortTerm', label: '短期记忆', count: stats.shortTerm, color: 'bg-blue-400', textColor: 'text-blue-600 dark:text-blue-400' },
        { key: 'longTerm', label: '长期记忆', count: stats.longTerm, color: 'bg-indigo-500', textColor: 'text-indigo-600 dark:text-indigo-400' },
        { key: 'mastered', label: '已掌握', count: stats.mastered, color: 'bg-emerald-500', textColor: 'text-emerald-600 dark:text-emerald-400' },
    ];

    return (
        <div className="bg-[#F7F6F2] dark:bg-[#2a2a2a] rounded-2xl border border-[#E8E6E0] dark:border-[#3a3a3a] p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 dark:text-[#e5e5e0] mb-4">记忆漏斗</h2>

            {/* Pipeline Bar */}
            <div className="h-6 rounded-full overflow-hidden flex mb-4 bg-[#E8E6E0] dark:bg-[#3a3a3a]">
                {stages.map(stage => {
                    const percent = getPercent(stage.count);
                    if (percent <= 0) return null;
                    return (
                        <div
                            key={stage.key}
                            className={`${stage.color} transition-all duration-500 relative group`}
                            style={{ width: `${percent}%` }}
                        >
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-bold text-white drop-shadow-sm">
                                    {Math.round(percent)}%
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {stages.map(stage => (
                    <div key={stage.key} className="text-center">
                        <div className="flex items-center justify-center gap-1.5 mb-1">
                            <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                            <span className="text-[10px] font-medium text-slate-400 dark:text-[#888]">{stage.label}</span>
                        </div>
                        <p className={`text-lg font-black ${stage.textColor}`}>{stage.count}</p>
                        <p className="text-[10px] text-slate-400 dark:text-[#666]">{Math.round(getPercent(stage.count))}%</p>
                    </div>
                ))}
            </div>

            {/* Total */}
            <div className="mt-4 pt-4 border-t border-[#E8E6E0] dark:border-[#3a3a3a] text-center">
                <span className="text-xs text-slate-400 dark:text-[#888]">总词汇量：</span>
                <span className="text-sm font-bold text-slate-700 dark:text-[#e5e5e0] ml-1">{stats.total}</span>
            </div>
        </div>
    );
};
