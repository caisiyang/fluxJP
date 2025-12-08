import React from 'react';
import { BookOpen, RefreshCw, AlertTriangle } from 'lucide-react';

interface StatsPillProps {
    learnedToday: number;
    reviewedToday: number;
    leechCount: number;
}

export const StatsPill: React.FC<StatsPillProps> = ({ learnedToday, reviewedToday, leechCount }) => {
    return (
        <div className="flex gap-4 mb-6 clay-card p-4 rounded-2xl">
            <div className="flex-1 flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-[#888] mb-1">
                    <BookOpen size={12} />
                    <span className="text-[10px] font-medium uppercase tracking-wide">新規学習</span>
                </div>
                <span className="text-rose-500 text-lg font-black leading-none">{learnedToday}</span>
            </div>

            <div className="w-px bg-[#E8E6E0] dark:bg-[#3a3a3a]" />

            <div className="flex-1 flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-[#888] mb-1">
                    <RefreshCw size={12} />
                    <span className="text-[10px] font-medium uppercase tracking-wide">本日の復習</span>
                </div>
                <span className="text-blue-500 text-lg font-black leading-none">{reviewedToday}</span>
            </div>

            <div className="w-px bg-[#E8E6E0] dark:bg-[#3a3a3a]" />

            <div className="flex-1 flex flex-col items-center">
                <div className="flex items-center gap-1.5 text-slate-400 dark:text-[#888] mb-1">
                    <AlertTriangle size={12} />
                    <span className="text-[10px] font-medium uppercase tracking-wide">苦手な単語</span>
                </div>
                <span className="text-amber-500 text-lg font-black leading-none">{leechCount}</span>
            </div>
        </div>
    );
};
