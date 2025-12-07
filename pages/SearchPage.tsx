import React, { useState } from 'react';
import { SearchBar } from '../components/SearchBar';
import { useSearch } from '../hooks/useSearch';
import { Word, WordStatus } from '../types';
import { Volume2, BookOpen, ChevronRight } from 'lucide-react';
import { speak, isTTSAvailable } from '../lib/tts';
import { motion, AnimatePresence } from 'framer-motion';

const StatusBadge: React.FC<{ status: WordStatus }> = ({ status }) => {
    const config = {
        [WordStatus.NEW]: { bg: 'bg-slate-100', text: 'text-slate-500', label: '未学' },
        [WordStatus.LEARNING]: { bg: 'bg-amber-50', text: 'text-amber-600', label: '学习中' },
        [WordStatus.REVIEW]: { bg: 'bg-blue-50', text: 'text-blue-600', label: '复习中' },
        [WordStatus.MASTERED]: { bg: 'bg-emerald-50', text: 'text-emerald-600', label: '已掌握' },
        [WordStatus.LEECH]: { bg: 'bg-rose-50', text: 'text-rose-600', label: '顽固词' },
    };
    const c = config[status] || config[WordStatus.NEW];

    return (
        <span className={`px-2 py-0.5 ${c.bg} ${c.text} text-[10px] font-bold rounded-md`}>
            {c.label}
        </span>
    );
};

const SearchResultCard: React.FC<{ word: Word }> = ({ word }) => {
    const [expanded, setExpanded] = useState(false);

    const handleSpeak = (text: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isTTSAvailable()) speak(text);
    };

    return (
        <motion.div
            layout
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
            <div
                className="p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => setExpanded(!expanded)}
            >
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-xl font-bold text-slate-800 truncate">{word.kanji}</h3>
                        <span className="text-sm text-indigo-500">{word.kana}</span>
                        <StatusBadge status={word.status} />
                    </div>
                    <p className="text-sm text-slate-500 truncate">{word.meaning}</p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={(e) => handleSpeak(word.kana || word.kanji, e)}
                        className="p-2 rounded-xl bg-slate-50 text-slate-400 hover:bg-indigo-50 hover:text-indigo-500 transition-colors"
                    >
                        <Volume2 size={18} />
                    </button>
                    <ChevronRight
                        size={18}
                        className={`text-slate-300 transition-transform ${expanded ? 'rotate-90' : ''}`}
                    />
                </div>
            </div>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-slate-100"
                    >
                        <div className="p-4 space-y-3">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 font-bold rounded">{word.level}</span>
                                {word.category && (
                                    <span className="px-2 py-0.5 bg-slate-50 text-slate-500 rounded">{word.category}</span>
                                )}
                            </div>

                            {word.examples && word.examples[0] && (
                                <div
                                    className="p-3 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100"
                                    onClick={(e) => handleSpeak(word.examples[0].jp, e)}
                                >
                                    <p className="text-sm text-slate-700">{word.examples[0].jp}</p>
                                    <p className="text-xs text-slate-400 mt-1">{word.examples[0].en}</p>
                                </div>
                            )}

                            {word.mnemonic && (
                                <div className="flex gap-2 text-sm">
                                    <span className="text-amber-500 font-bold">记:</span>
                                    <span className="text-slate-600">{word.mnemonic}</span>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export const SearchPage: React.FC = () => {
    const [query, setQuery] = useState('');
    const results = useSearch(query);

    return (
        <div className="h-full flex flex-col bg-white">
            <header className="px-5 pt-8 pb-4">
                <h1 className="text-2xl font-black text-slate-800 mb-4">搜索词汇</h1>
                <SearchBar
                    value={query}
                    onChange={setQuery}
                    placeholder="输入汉字、假名或中文..."
                    autoFocus
                />
            </header>

            <div className="flex-1 overflow-y-auto px-5 pb-24 no-scrollbar">
                {!query ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-20">
                        <BookOpen size={48} className="text-slate-200 mb-4" />
                        <p className="text-slate-400 text-sm">输入关键词开始搜索</p>
                        <p className="text-slate-300 text-xs mt-1">支持汉字、假名、中文</p>
                    </div>
                ) : results === undefined ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : results.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <p className="text-slate-400 text-sm">未找到匹配的单词</p>
                        <p className="text-slate-300 text-xs mt-1">尝试其他关键词</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <p className="text-xs text-slate-400 mb-2">找到 {results.length} 个结果</p>
                        {results.map(word => (
                            <SearchResultCard key={word.id} word={word} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
