import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock } from 'lucide-react';

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    autoFocus?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
    value,
    onChange,
    placeholder = "搜索单词...",
    autoFocus = false
}) => {
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (autoFocus && inputRef.current) {
            inputRef.current.focus();
        }
    }, [autoFocus]);

    return (
        <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={18} />
            </div>

            <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all shadow-sm"
            />

            {value && (
                <button
                    onClick={() => onChange('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={18} />
                </button>
            )}
        </div>
    );
};
