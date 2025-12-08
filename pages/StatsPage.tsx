import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getVocabStats } from '../lib/db';
import { getRecentStats, getStudyStreak, getTotalStats } from '../lib/stats';
import { Flame, Target, Loader2 } from 'lucide-react';
import { MemoryPipeline } from '../components/statistics/MemoryPipeline';
import { FutureLoadChart } from '../components/statistics/FutureLoadChart';
import { PredictionCalendar } from '../components/statistics/PredictionCalendar';

// 统计卡片组件
const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtext?: string;
    color?: string;
}> = ({ icon, label, value, subtext, color = 'text-rose-500' }) => (
    <div className="bg-[#F7F6F2] dark:bg-[#2a2a2a] rounded-2xl border border-[#E8E6E0] dark:border-[#3a3a3a] p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
            <div className={`${color}`}>{icon}</div>
            <span className="text-xs font-medium text-slate-500 dark:text-[#a5a5a0] uppercase tracking-wide">{label}</span>
        </div>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
        {subtext && <p className="text-xs text-slate-400 dark:text-[#888] mt-1">{subtext}</p>}
    </div>
);

export const StatsPage: React.FC = () => {
    const recentStats = useLiveQuery(() => getRecentStats(7));
    const streak = useLiveQuery(() => getStudyStreak());
    const totalStats = useLiveQuery(() => getTotalStats());

    if (streak === undefined || !totalStats || !recentStats) {
        return (
            <div className="h-full flex items-center justify-center bg-[#F7F6F2] dark:bg-[#1a1a1a]">
                <Loader2 className="animate-spin text-rose-500" size={32} />
            </div>
        );
    }

    const todayData = recentStats[0];
    const todayAccuracy = todayData && todayData.reviewCount > 0
        ? Math.round((todayData.correctCount / todayData.reviewCount) * 100)
        : 0;

    return (
        <div className="h-full overflow-y-auto no-scrollbar bg-[#F7F6F2] dark:bg-[#1a1a1a]">
            <header className="px-5 pt-8 pb-4">
                <h1 className="text-2xl font-black text-slate-800 dark:text-[#f5f5f0]">学習データ</h1>
                <p className="text-slate-500 dark:text-[#a5a5a0] text-sm mt-1">学習の進捗を確認しましょう</p>
            </header>

            <div className="px-5 pb-24 space-y-6">
                {/* Top Stats: Streak & Accuracy */}
                <div className="grid grid-cols-2 gap-3">
                    <StatCard
                        icon={<Flame size={20} />}
                        label="連続学習"
                        value={`${streak} 日`}
                        color="text-orange-500"
                    />
                    <StatCard
                        icon={<Target size={20} />}
                        label="今日の正答率"
                        value={`${todayAccuracy}%`}
                        color="text-emerald-500"
                    />
                </div>

                {/* Memory Pipeline (记忆漏斗) */}
                <MemoryPipeline />

                {/* Future Load Chart (未来7天压力图) */}
                <FutureLoadChart />

                {/* Prediction Calendar (智能预测日历) */}
                <PredictionCalendar />

                {/* Weekly Mini Chart */}
                {recentStats.length > 1 && (
                    <div className="bg-[#F7F6F2] dark:bg-[#2a2a2a] rounded-2xl border border-[#E8E6E0] dark:border-[#3a3a3a] p-5 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-700 dark:text-[#e5e5e0] mb-4">過去7日間の復習</h2>
                        <div className="flex items-end justify-between gap-2 h-20">
                            {[...Array(7)].map((_, i) => {
                                const date = new Date();
                                date.setDate(date.getDate() - (6 - i));
                                const dateStr = date.toISOString().split('T')[0];
                                const dayData = recentStats.find(s => s.date === dateStr);
                                const reviews = dayData?.reviewCount || 0;
                                const maxReviews = Math.max(...recentStats.map(s => s.reviewCount), 1);
                                const height = (reviews / maxReviews) * 100;
                                const dayNames = ['日', '月', '火', '水', '木', '金', '土'];

                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <div
                                            className={`w-full rounded-t-lg transition-all ${reviews > 0 ? 'bg-rose-400' : 'bg-[#E8E6E0] dark:bg-[#3a3a3a]'}`}
                                            style={{ height: `${Math.max(height, 4)}%` }}
                                        />
                                        <span className="text-[10px] text-slate-400 dark:text-[#888]">{dayNames[date.getDay()]}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Cumulative Stats */}
                <div className="bg-[#F7F6F2] dark:bg-[#2a2a2a] rounded-2xl border border-[#E8E6E0] dark:border-[#3a3a3a] p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-700 dark:text-[#e5e5e0] mb-3">累積データ</h2>
                    <div className="flex items-center justify-around text-center">
                        <div>
                            <p className="text-2xl font-black text-slate-700 dark:text-[#e5e5e0]">{totalStats.totalReviews}</p>
                            <p className="text-[10px] text-slate-400 dark:text-[#888]">総復習回数</p>
                        </div>
                        <div className="w-px h-10 bg-[#E8E6E0] dark:bg-[#3a3a3a]" />
                        <div>
                            <p className="text-2xl font-black text-emerald-500">{totalStats.averageAccuracy.toFixed(0)}%</p>
                            <p className="text-[10px] text-slate-400 dark:text-[#888]">平均正答率</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
