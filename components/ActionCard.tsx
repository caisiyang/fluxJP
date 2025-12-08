import React from 'react';
import { LucideIcon } from 'lucide-react';
import { clsx } from 'clsx';

interface ActionCardProps {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    onClick: () => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary';
}

export const ActionCard: React.FC<ActionCardProps> = ({
    title,
    subtitle,
    icon: Icon,
    onClick,
    disabled = false,
    variant = 'primary'
}) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={clsx(
                "flex-1 aspect-square p-6 flex flex-col items-center justify-center text-center transition-all duration-200 transform",
                "clay-card hover:translate-y-[-2px] active:translate-y-[1px]",
                disabled && "opacity-50 cursor-not-allowed shadow-none active:shadow-none bg-[#F7F6F2] dark:bg-[#2a2a2a] border-none"
            )}
        >
            <div className={clsx(
                "mb-6 transition-transform duration-300 group-hover:scale-110",
                variant === 'primary'
                    ? "icon-3d-red"
                    : "icon-3d-brown"
            )}>
                <Icon size={64} strokeWidth={0} fill="currentColor" className="drop-shadow-md" />
            </div>
            <h3 className="text-lg font-black text-slate-700 dark:text-[#e5e5e0] tracking-tight mb-2">
                {title}
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#a5a5a0] font-bold leading-tight px-1">
                {subtitle}
            </p>
        </button>
    );
};
