import React, { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Sentence } from '../types';
import { Volume2, Share2, Sparkles, Plus } from 'lucide-react';
import { speak } from '../lib/tts';
import { motion, AnimatePresence } from 'framer-motion';

export const GrammarPage: React.FC = () => {
    // We are repurposing "GrammarPage" to be the "Context Gallery" as requested.
    // In a real refactor we might rename the file, but to keep router config simple we edit content.

    const sentences = useLiveQuery(() =>
        db.sentences.orderBy('id').reverse().limit(50).toArray()
    );

    const [activeIndex, setActiveIndex] = useState(0);

    // Scroll listener to update active index for animations
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const index = Math.round(e.currentTarget.scrollTop / e.currentTarget.clientHeight);
        if (index !== activeIndex) {
            setActiveIndex(index);
        }
    };

    if (!sentences || sentences.length === 0) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-[#F7F6F2]">
                <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
                    <Sparkles className="text-indigo-400" size={32} />
                </div>
                <h2 className="text-xl font-black text-slate-800 mb-2">语境画廊空空如也</h2>
                <p className="text-slate-400 text-sm mb-8">在这里，你学过的单词将汇聚成生动的句子。</p>
            </div>
        );
    }

    return (
        <div
            className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth"
            onScroll={handleScroll}
        >
            {sentences.map((sent, index) => (
                <ContextCard
                    key={sent.id || index}
                    sentence={sent}
                    isActive={index === activeIndex}
                />
            ))}

            {/* Spacer for bottom tab bar */}
            <div className="h-20 snap-end" />
        </div>
    );
};

interface ContextCardProps {
    sentence: Sentence;
    isActive: boolean;
}

const ContextCard: React.FC<ContextCardProps> = ({ sentence, isActive }) => {
    return (
        <div className="h-full w-full snap-center flex flex-col p-6 bg-[#F7F6F2] relative overflow-hidden">
            {/* Background Decor (Optional) */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-200/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex-1 flex flex-col justify-center items-center text-center z-10">
                <AnimatePresence mode="wait">
                    {isActive && (
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -30 }}
                            transition={{ duration: 0.5, delay: 0.1 }}
                            className="w-full"
                        >
                            {/* Grammar Tag */}
                            {sentence.grammar && (
                                <span className="inline-block px-3 py-1 mb-8 rounded-full bg-white/60 backdrop-blur-sm border border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {sentence.grammar}
                                </span>
                            )}

                            {/* Japanese Sentence */}
                            <h2
                                className="text-3xl sm:text-4xl font-black text-slate-800 leading-tight mb-8 tracking-tight"
                                style={{ textShadow: '0px 2px 0px rgba(255,255,255,0.5)' }}
                            >
                                {sentence.japanese.split('').map((char, i) => (
                                    <span key={i} className="inline-block hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => speak(char)}>
                                        {char}
                                    </span>
                                ))}
                            </h2>

                            {/* English Translation */}
                            <div className="relative inline-block px-8 py-4 bg-white shadow-xl shadow-slate-200/50 rounded-2xl">
                                <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                    {sentence.english}
                                </p>
                                <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white rotate-45" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Actions Bar */}
            <div className="w-full flex items-center justify-between pb-24 px-4 z-10">
                <button
                    className="p-4 bg-white rounded-full text-slate-400 shadow-sm hover:text-rose-500 hover:scale-110 transition-all active:scale-95"
                    onClick={() => console.log('Like')}
                >
                    <Plus size={24} />
                </button>

                <button
                    className="p-6 bg-indigo-500 rounded-full text-white shadow-lg shadow-indigo-300 hover:bg-indigo-600 hover:scale-110 active:scale-95 transition-all"
                    onClick={() => speak(sentence.japanese)}
                >
                    <Volume2 size={32} />
                </button>

                <button
                    className="p-4 bg-white rounded-full text-slate-400 shadow-sm hover:text-indigo-500 hover:scale-110 transition-all active:scale-95"
                    onClick={() => console.log('Share')}
                >
                    <Share2 size={24} />
                </button>
            </div>
        </div>
    );
};
