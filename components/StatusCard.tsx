import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatusCardProps {
    title: string;
    count: number;
    icon: LucideIcon;
    iconColor: string;
    bgColor: string;
    onClick: () => void;
    disabled?: boolean;
}

export const StatusCard: React.FC<StatusCardProps> = ({
    title,
    count,
    icon: Icon,
    iconColor,
    bgColor,
    onClick,
    disabled = false
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled || count === 0}
            className={`
        flex-1 rounded-2xl p-4 flex items-center gap-3 transition-all duration-200
        clay-card hover:translate-y-[-2px] active:translate-y-[1px]
        ${(disabled || count === 0) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
        >
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${bgColor}`}>
                <Icon size={24} className={iconColor} fill="currentColor" strokeWidth={0} />
            </div>
            <div className="text-left">
                <h3 className="text-sm font-bold text-slate-700 dark:text-[#e5e5e0]">{title}</h3>
                <p className="text-xs text-slate-400 dark:text-[#888] font-medium">
                    {count} 个词
                </p>
            </div>
        </button>
    );
};
