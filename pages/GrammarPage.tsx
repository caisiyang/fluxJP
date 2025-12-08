import React from 'react';
import { Sparkles } from 'lucide-react';

export const GrammarPage: React.FC = () => {
    return (
        <div className="h-full flex flex-col items-center justify-center bg-[#F7F6F2] dark:bg-[#1a1a1a] p-6">
            <div className="text-center">
                <Sparkles className="text-rose-400 mx-auto mb-4" size={32} />
                <h1 className="text-2xl font-bold text-slate-700 dark:text-[#e5e5e0] mb-2">语法学习</h1>
                <p className="text-slate-500 dark:text-[#a5a5a0] text-sm">敬请期待</p>
            </div>
        </div>
    );
};
