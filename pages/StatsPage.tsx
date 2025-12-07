import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getVocabStats } from '../lib/db';
import { getRecentStats, getStudyStreak, getTotalStats } from '../lib/stats';
import { Flame, Target, Clock, TrendingUp, BookOpen, Loader2 } from 'lucide-react';

// 简易进度条组件
const ProgressBar: React.FC<{ value: number; max: number; color: string }> = ({ value, max, color }) => {
    const percent = max > 0 ? (value / max) * 100 : 0;
    return (
        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
                className={`h-full ${color} rounded-full transition-all duration-500`}
                style={{ width: `${Math.min(percent, 100)}%` }}
            />
        </div>
    );
};

// 统计卡片组件
const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    subtext?: string;
    color?: string;
}> = ({ icon, label, value, subtext, color = 'text-indigo-500' }) => (
    <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-2">
            <div className={`${color}`}>{icon}</div>
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wide">{label}</span>
        </div>
        <p className={`text-2xl font-black ${color}`}>{value}</p>
        {subtext && <p className="text-xs text-slate-400 mt-1">{subtext}</p>}
    </div>
);

// 简易日历组件
const CalendarView: React.FC<{ dueDates: Record<string, number> }> = ({ dueDates }) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();

    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay(); // 0 is Sunday

    // Create grid array
    const days = [];
    for (let i = 0; i < firstDay; i++) {
        days.push(null); // padding
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i);
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h2 className="text-sm font-bold text-slate-700 mb-4 flex items-center justify-between">
                <span>学习日历</span>
                <span className="text-xs font-normal text-slate-400">{currentYear}年 {currentMonth + 1}月</span>
            </h2>
            <div className="grid grid-cols-7 text-center mb-2">
                {['日', '一', '二', '三', '四', '五', '六'].map(d => (
                    <div key={d} className="text-[10px] text-slate-300 font-bold">{d}</div>
                ))}
            </div>
            <div className="grid grid-cols-7 gap-y-2">
                {days.map((day, idx) => {
                    if (!day) return <div key={idx} />;

                    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const count = dueDates[dateStr] || 0;
                    const isToday = day === today.getDate();

                    return (
                        <div key={idx} className="flex flex-col items-center">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium relative
                                ${isToday ? 'bg-indigo-500 text-white shadow-md' : 'text-slate-600'}
                                ${count > 0 && !isToday ? 'bg-indigo-50 text-indigo-600 font-bold' : ''}
                            `}>
                                {day}
                                {count > 0 && (
                                    <div className="absolute bottom-0.5 w-1 h-1 rounded-full bg-rose-500"></div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            <div className="mt-4 flex items-center justify-center gap-4 text-[10px] text-slate-400">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-rose-500"></div> 待复习</div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-indigo-500"></div> 今日</div>
            </div>
        </div>
    );
};

export const StatsPage: React.FC = () => {
    const settings = useLiveQuery(() => db.settings.toCollection().first()); // Fetch settings
    const vocabStats = useLiveQuery(() => getVocabStats(settings?.selectedBook), [settings?.selectedBook]); // Pass selectedBook
    const recentStats = useLiveQuery(() => getRecentStats(7));
    const streak = useLiveQuery(() => getStudyStreak());
    const totalStats = useLiveQuery(() => getTotalStats());

    // Future due dates forecast (simplified: check next 30 days)
    const dueDates = useLiveQuery(async () => {
        const result: Record<string, number> = {};
        const now = new Date();
        // Check next 30 days
        const words = await db.words.where('status').anyOf('learning', 'review').toArray();
        words.forEach(w => {
            if (w.dueDate) {
                const d = new Date(w.dueDate);
                if (d > now) {
                    const dateStr = d.toISOString().split('T')[0];
                    // Only count for current month logic roughly
                    result[dateStr] = (result[dateStr] || 0) + 1;
                }
            }
        });
        return result;
    }) || {};

    if (!vocabStats || !recentStats || streak === undefined || !totalStats) {
        return (
            <div className="h-full flex items-center justify-center">
                <Loader2 className="animate-spin text-indigo-500" size={32} />
            </div>
        );
    }

    // 计算今日数据
    const todayData = recentStats[0];
    const todayReviews = todayData?.reviewCount || 0;
    const todayNew = todayData?.newWordsLearned || 0;
    const todayAccuracy = todayData && todayData.reviewCount > 0
        ? Math.round((todayData.correctCount / todayData.reviewCount) * 100)
        : 0;

    return (
        <div className="h-full overflow-y-auto no-scrollbar bg-white">
            <header className="px-5 pt-8 pb-4">
                <h1 className="text-2xl font-black text-slate-800">学习统计</h1>
                <p className="text-slate-400 text-sm mt-1">追踪你的学习进度</p>
            </header>

            <div className="px-5 pb-24 space-y-6">
                {/* 连续学习 & 今日概览 */}
                <div className="grid grid-cols-2 gap-3">
                    <StatCard
                        icon={<Flame size={20} />}
                        label="连续学习"
                        value={`${streak} 天`}
                        color="text-orange-500"
                    />
                    <StatCard
                        icon={<Target size={20} />}
                        label="今日正确率"
                        value={`${todayAccuracy}%`}
                        color="text-emerald-500"
                    />
                </div>

                {/* Calendar View */}
                <CalendarView dueDates={dueDates} />

                {/* 今日详情 */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-700 mb-4">今日学习</h2>
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div>
                            <p className="text-2xl font-black text-indigo-500">{todayNew}</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">新词</p>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-blue-500">{todayReviews}</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">复习</p>
                        </div>
                        <div>
                            <p className="text-2xl font-black text-emerald-500">{todayAccuracy}%</p>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">正确率</p>
                        </div>
                    </div>
                </div>

                {/* 词汇分布 */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-sm font-bold text-slate-700">词汇分布</h2>
                        <span className="text-xs text-slate-400">共 {vocabStats.total} 词</span>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-slate-500">未学习</span>
                                <span className="font-bold text-slate-400">{vocabStats.new}</span>
                            </div>
                            <ProgressBar value={vocabStats.new} max={vocabStats.total} color="bg-slate-300" />
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-amber-600">学习中</span>
                                <span className="font-bold text-amber-600">{vocabStats.learning}</span>
                            </div>
                            <ProgressBar value={vocabStats.learning} max={vocabStats.total} color="bg-amber-400" />
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-blue-600">复习中</span>
                                <span className="font-bold text-blue-600">{vocabStats.review}</span>
                            </div>
                            <ProgressBar value={vocabStats.review} max={vocabStats.total} color="bg-blue-400" />
                        </div>

                        <div>
                            <div className="flex justify-between text-xs mb-1">
                                <span className="text-emerald-600">已掌握</span>
                                <span className="font-bold text-emerald-600">{vocabStats.mastered}</span>
                            </div>
                            <ProgressBar value={vocabStats.mastered} max={vocabStats.total} color="bg-emerald-400" />
                        </div>

                        {vocabStats.leech > 0 && (
                            <div>
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="text-rose-600">顽固词</span>
                                    <span className="font-bold text-rose-600">{vocabStats.leech}</span>
                                </div>
                                <ProgressBar value={vocabStats.leech} max={vocabStats.total} color="bg-rose-400" />
                            </div>
                        )}
                    </div>
                </div>

                {/* 累计统计 */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                    <h2 className="text-sm font-bold text-slate-700 mb-4">累计数据</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center">
                                <BookOpen size={18} className="text-indigo-500" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-800">{totalStats.totalReviews}</p>
                                <p className="text-[10px] text-slate-400">总复习次数</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                                <TrendingUp size={18} className="text-emerald-500" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-slate-800">{totalStats.averageAccuracy.toFixed(0)}%</p>
                                <p className="text-[10px] text-slate-400">平均正确率</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 最近7天 */}
                {recentStats.length > 1 && (
                    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
                        <h2 className="text-sm font-bold text-slate-700 mb-4">最近7天</h2>
                        <div className="flex items-end justify-between gap-2 h-24">
                            {[...Array(7)].map((_, i) => {
                                const date = new Date();
                                date.setDate(date.getDate() - (6 - i));
                                const dateStr = date.toISOString().split('T')[0];
                                const dayData = recentStats.find(s => s.date === dateStr);
                                const reviews = dayData?.reviewCount || 0;
                                const maxReviews = Math.max(...recentStats.map(s => s.reviewCount), 1);
                                const height = (reviews / maxReviews) * 100;
                                const dayNames = ['日', '一', '二', '三', '四', '五', '六'];

                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <div
                                            className={`w-full rounded-t-lg transition-all ${reviews > 0 ? 'bg-indigo-400' : 'bg-slate-100'
                                                }`}
                                            style={{ height: `${Math.max(height, 4)}%` }}
                                        />
                                        <span className="text-[10px] text-slate-400">{dayNames[date.getDay()]}</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
