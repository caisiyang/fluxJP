import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Trophy, Volume2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Word, WordStatus } from '../types';
import { speak, isTTSAvailable } from '../lib/tts';

interface MasteredDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onStartReview: (words: Word[]) => void;
}

export const MasteredDialog: React.FC<MasteredDialogProps> = ({
    isOpen,
    onClose,
    onStartReview
}) => {
    const [selectedWord, setSelectedWord] = useState<Word | null>(null);

    const masteredWords = useLiveQuery(async () => {
        return db.words
            .where('status').equals(WordStatus.MASTERED)
            .toArray();
    }, []) || [];

    const handleSpeak = (word: Word, e: React.MouseEvent) => {
        e.stopPropagation();
        if (isTTSAvailable()) {
            const text = word.reading || word.kana || word.word || word.kanji || '';
            speak(text, 0.9);
        }
    };

    const handleWordClick = (word: Word) => {
        setSelectedWord(selectedWord?.id === word.id ? null : word);
    };

    const handleStartReview = () => {
        if (masteredWords.length === 0) return;
        onStartReview(masteredWords);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Dialog */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-lg max-h-[80vh] bg-[#F7F6F2] dark:bg-[#1a1a1a] rounded-3xl shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-5 border-b border-[#E8E6E0] dark:border-[#3a3a3a]">
                            <div className="flex items-center gap-2">
                                <Trophy size={20} className="text-emerald-500" />
                                <h2 className="text-lg font-bold text-slate-800 dark:text-[#f5f5f0]">習得済み</h2>
                                <span className="text-xs text-slate-400 dark:text-[#888]">({masteredWords.length})</span>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-[#E8E6E0] dark:hover:bg-[#2a2a2a] rounded-xl transition-colors"
                            >
                                <X size={20} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            {masteredWords.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Trophy size={48} className="text-slate-200 dark:text-[#3a3a3a] mb-4" />
                                    <p className="text-slate-400 dark:text-[#888] text-sm">習得済みの単語はありません</p>
                                    <p className="text-slate-300 dark:text-[#555] text-xs mt-1">
                                        学習を進めてマスターしましょう！
                                    </p>
                                </div>
                            ) : (
                                <>
                                    {/* Word Capsules */}
                                    <div className="flex flex-wrap gap-2">
                                        {masteredWords.map((word) => {
                                            const displayWord = word.word || word.kanji || '';
                                            const displayReading = word.reading || word.kana || '';
                                            const isSelected = selectedWord?.id === word.id;

                                            return (
                                                <motion.button
                                                    key={word.id}
                                                    onClick={() => handleWordClick(word)}
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${isSelected
                                                        ? 'bg-emerald-500 text-white'
                                                        : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-200 dark:hover:bg-emerald-900/50'
                                                        }`}
                                                >
                                                    {displayWord}
                                                </motion.button>
                                            );
                                        })}
                                    </div>

                                    {/* Selected Word Detail */}
                                    <AnimatePresence>
                                        {selectedWord && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className="mt-4 p-4 bg-white dark:bg-[#2a2a2a] rounded-2xl border border-[#E8E6E0] dark:border-[#3a3a3a] overflow-hidden"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-slate-800 dark:text-[#f5f5f0]">
                                                            {selectedWord.word || selectedWord.kanji}
                                                        </h3>
                                                        <p className="text-sm text-slate-500 dark:text-[#a5a5a0]">
                                                            {selectedWord.reading || selectedWord.kana}
                                                            {(selectedWord.pos || selectedWord.partOfSpeech) && (
                                                                <span className="ml-2 text-xs text-slate-400 dark:text-[#888]">
                                                                    [{selectedWord.pos || selectedWord.partOfSpeech}]
                                                                </span>
                                                            )}
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={(e) => handleSpeak(selectedWord, e)}
                                                        className="p-2 bg-[#EDEBE5] dark:bg-[#3a3a3a] rounded-xl text-slate-500 dark:text-[#888] hover:text-emerald-500 transition-colors"
                                                    >
                                                        <Volume2 size={18} />
                                                    </button>
                                                </div>
                                                <p className="mt-2 text-slate-700 dark:text-[#e5e5e0] text-sm">
                                                    {selectedWord.meaning}
                                                </p>
                                                {selectedWord.sentence && (
                                                    <p className="mt-2 text-xs text-slate-500 dark:text-[#888] italic">
                                                        {selectedWord.sentence}
                                                    </p>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </>
                            )}
                        </div>

                        {/* Footer Actions */}
                        {masteredWords.length > 0 && (
                            <div className="p-4 border-t border-[#E8E6E0] dark:border-[#3a3a3a]">
                                <button
                                    onClick={handleStartReview}
                                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                                >
                                    <Play size={18} />
                                    習得済みを復習 ({masteredWords.length})
                                </button>

                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
