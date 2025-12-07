import React from 'react';
import { clsx } from 'clsx';

interface StatsPillProps {
    dueCount: number;
    newCount: number;
    retentionRate: number;
}

export const StatsPill: React.FC<StatsPillProps> = ({ dueCount, newCount, retentionRate }) => {
    return (
        <div className="w-full mx-auto max-w-sm mb-8">
            <div className="clay-card rounded-[1.5rem] px-8 py-5 flex items-center justify-between text-xs sm:text-sm font-bold tracking-widest text-slate-400">
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px]">DUE</span>
                    <span className="text-[#D45D5D] text-lg font-black leading-none">{dueCount}</span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px]">NEW</span>
                    <span className="text-[#D45D5D] text-lg font-black leading-none">{newCount}</span>
                </div>
                <div className="h-8 w-px bg-slate-200" />
                <div className="flex flex-col items-center gap-1">
                    <span className="text-[10px]">RETENTION</span>
                    <span className="text-[#D45D5D] text-lg font-black leading-none">{retentionRate}%</span>
                </div>
            </div>
        </div>
    );
};
