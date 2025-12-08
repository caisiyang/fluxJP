import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface WarningCardProps {
    count: number;
    onClick: () => void;
}

export const WarningCard: React.FC<WarningCardProps> = ({ count, onClick }) => {
    return (
        <button
            onClick={onClick}
            disabled={count === 0}
            className={`
        w-full rounded-[2rem] p-5 flex flex-col items-center gap-3 transition-all duration-200
        clay-card hover:translate-y-[-2px] active:translate-y-[1px]
        ${count === 0 ? 'opacity-60 cursor-not-allowed shadow-none' : 'cursor-pointer'}
      `}
        >
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center">
                <div className="icon-3d-brown transform rotate-[-5deg]">
                    <AlertTriangle size={36} fill="currentColor" strokeWidth={0} />
                </div>
            </div>
            <div className="text-center">
                <h3 className="text-lg font-black text-slate-700 dark:text-[#e5e5e0]">顽固克星</h3>
                <p className="text-sm text-slate-500 dark:text-[#a5a5a0] font-bold">
                    {count > 0 ? `${count} 个难点` : '0 个难点'}
                </p>
            </div>
        </button>
    );
};
