import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Word, ReviewGrade } from '../types';
import { Check, BrainCircuit, Swords, Volume2, Heart, RefreshCw } from 'lucide-react';
import { speak, isTTSAvailable } from '../lib/tts';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addFavorite, removeFavorite, isFavorite } from '../lib/db';

interface UniversalCardProps {
  word: Word;
  onEasy?: () => void;
  onKeep?: () => void;
  onLearned?: () => void;
  onReview?: (grade: ReviewGrade) => void;
  progress?: { current: number; total: number };
  mode?: 'normal' | 'leech';  // 模式：普通或顽固克星
}

type DisclosureState = 0 | 1 | 2;

export const UniversalCard: React.FC<UniversalCardProps> = ({
  word,
  onEasy,
  onKeep,
  onLearned,
  onReview,
  progress,
  mode = 'normal'
}) => {
  const [step, setStep] = useState<DisclosureState>(0);
  const [isFav, setIsFav] = useState(false);
  const settings = useLiveQuery(() => db.settings.toCollection().first());

  const displayWord = word.word || word.kanji || '';
  const displayReading = word.reading || word.kana || '';
  const displayPos = word.pos || word.partOfSpeech || '';
  const displayMeaning = word.meaning || '';
  // Fallback to word.examples if word.sentence is missing
  const displaySentence = word.sentence || (word.examples && word.examples[0] ? word.examples[0].jp : '') || '';
  const displaySentenceMeaning = word.sentence_meaning || (word.examples && word.examples[0] ? word.examples[0].en : '') || '';

  // 检查是否已收藏
  useEffect(() => {
    if (word.id) {
      isFavorite(word.id).then(setIsFav);
    }
  }, [word.id]);

  useEffect(() => {
    setStep(0);
  }, [word.id]);

  const handleSpeak = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isTTSAvailable()) {
      const textToSpeak = displayReading || displayWord;
      speak(textToSpeak, settings?.audioSpeed || 0.9);
    }
  }, [displayReading, displayWord, settings?.audioSpeed]);

  const handleSpeakSentence = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isTTSAvailable() && displaySentence) {
      speak(displaySentence, settings?.audioSpeed || 0.9);
    }
  }, [displaySentence, settings?.audioSpeed]);

  // 自动发音：点击一次后朗读单词
  useEffect(() => {
    if (settings?.autoAudio && step === 1 && isTTSAvailable()) {
      const textToSpeak = displayReading || displayWord;
      speak(textToSpeak, settings.audioSpeed);
    }
  }, [step, displayReading, displayWord, settings?.autoAudio, settings?.audioSpeed]);

  // 自动发音：点击两次后朗读例句
  useEffect(() => {
    if (settings?.autoAudio && step === 2 && displaySentence && isTTSAvailable()) {
      const timer = setTimeout(() => {
        speak(displaySentence, settings.audioSpeed);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [step, displaySentence, settings?.autoAudio, settings?.audioSpeed]);

  const handleCardClick = useCallback(() => {
    if (step < 2) {
      setStep(prev => (prev + 1) as DisclosureState);
    }
  }, [step]);

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!word.id) return;

    if (isFav) {
      await removeFavorite(word.id);
      setIsFav(false);
    } else {
      await addFavorite(word);
      setIsFav(true);
    }
  }, [word, isFav]);

  const handleEasy = useCallback(() => {
    if (onEasy) onEasy();
    else if (onReview) onReview('kill');
  }, [onEasy, onReview]);

  const handleKeep = useCallback(() => {
    if (onKeep) onKeep();
    else if (onReview) onReview('keep');
  }, [onKeep, onReview]);

  const handleLearned = useCallback(() => {
    if (onLearned) onLearned();
    else if (onReview) onReview('forge');
  }, [onLearned, onReview]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      handleCardClick();
    }
    // Buttons are always visible now, so shortcuts should always work?
    // Or should shortcuts only work for grading?
    // Usually shortcuts work always if buttons are visible.
    if (mode === 'leech') {
      if (e.key === '1') handleKeep();  // 记住了
      if (e.key === '2') handleLearned();  // 还需强化
    } else {
      if (e.key === '1') handleEasy();
      if (e.key === '2') handleKeep();
      if (e.key === '3') handleLearned();
    }
  }, [mode, handleCardClick, handleEasy, handleKeep, handleLearned]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const progressPercent = progress ? (progress.current / progress.total) * 100 : 0;

  // 顽固克星模式的按钮
  const renderLeechButtons = () => (
    <motion.div
      key="leech-buttons"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex w-full justify-between gap-4"
    >
      <button
        onClick={handleKeep}
        className="flex-1 flex flex-col items-center justify-center py-4 px-3 rounded-2xl bg-[#F7F6F2] dark:bg-[#2a2a2a] border border-[#E8E6E0] dark:border-[#3a3a3a] shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 hover:text-emerald-500 text-slate-500 dark:text-[#a5a5a0] transition-all active:scale-95 group"
      >
        <Check size={24} className="mb-1 group-hover:scale-110 transition-transform" strokeWidth={3} />
        <span className="text-xs font-bold tracking-wide">覚えた</span>
      </button>

      <button
        onClick={handleLearned}
        className="flex-1 flex flex-col items-center justify-center py-4 px-3 rounded-2xl bg-[#F7F6F2] dark:bg-[#2a2a2a] border border-[#E8E6E0] dark:border-[#3a3a3a] shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-700 hover:text-amber-500 text-slate-500 dark:text-[#a5a5a0] transition-all active:scale-95 group"
      >
        <RefreshCw size={24} className="mb-1 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
        <span className="text-xs font-bold tracking-wide">継続</span>
      </button>
    </motion.div>
  );

  // 普通模式的按钮
  const renderNormalButtons = () => (
    <motion.div
      key="normal-buttons"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex w-full justify-between gap-3"
    >
      <button
        onClick={handleEasy}
        className="flex-1 flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl bg-[#F7F6F2] dark:bg-[#2a2a2a] border border-[#E8E6E0] dark:border-[#3a3a3a] shadow-sm hover:shadow-md hover:border-rose-200 dark:hover:border-rose-700 hover:text-rose-500 text-slate-500 dark:text-[#a5a5a0] transition-all active:scale-95 group"
      >
        <Swords size={20} className="mb-1 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
        <span className="text-[10px] font-bold tracking-wide">簡単</span>
      </button>

      <button
        onClick={handleKeep}
        className="flex-1 flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl bg-[#F7F6F2] dark:bg-[#2a2a2a] border border-[#E8E6E0] dark:border-[#3a3a3a] shadow-sm hover:shadow-md hover:border-emerald-200 dark:hover:border-emerald-700 hover:text-emerald-500 text-slate-500 dark:text-[#a5a5a0] transition-all active:scale-95 group"
      >
        <Check size={20} className="mb-1 group-hover:scale-110 transition-transform" strokeWidth={3} />
        <span className="text-[10px] font-bold tracking-wide">普通</span>
      </button>

      <button
        onClick={handleLearned}
        className="flex-1 flex flex-col items-center justify-center py-3.5 px-2 rounded-2xl bg-[#F7F6F2] dark:bg-[#2a2a2a] border border-[#E8E6E0] dark:border-[#3a3a3a] shadow-sm hover:shadow-md hover:border-amber-200 dark:hover:border-amber-700 hover:text-amber-500 text-slate-500 dark:text-[#a5a5a0] transition-all active:scale-95 group"
      >
        <BrainCircuit size={20} className="mb-1 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
        <span className="text-[10px] font-bold tracking-wide">忘れた</span>
      </button>
    </motion.div>
  );

  return (
    <div className="w-full h-full flex flex-col relative">
      <AnimatePresence mode="wait">
        <motion.div
          key={word.id}
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="flex-1 flex flex-col relative bg-[#F7F6F2] dark:bg-[#2a2a2a] rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden mx-3 border border-[#E8E6E0] dark:border-[#3a3a3a]"
        >
          {/* Progress Bar */}
          {progress && (
            <div className="h-1.5 w-full bg-[#E8E6E0] dark:bg-[#3a3a3a]">
              <motion.div
                className="h-full bg-gradient-to-r from-rose-400 to-rose-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}

          {/* Level Badge */}
          <div className="absolute top-5 left-5 z-10">
            <span className="px-3 py-1.5 bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400 text-[10px] font-black rounded-lg uppercase tracking-wide">
              {word.level}
            </span>
          </div>

          {/* Top Right Buttons */}
          <div className="absolute top-5 right-5 z-10 flex gap-2">
            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className={`p-2.5 rounded-xl transition-all active:scale-95 ${isFav
                ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-500'
                : 'bg-[#EDEBE5] dark:bg-[#3a3a3a] text-slate-400 dark:text-[#888] hover:text-rose-500'
                }`}
            >
              <Heart size={18} fill={isFav ? 'currentColor' : 'none'} />
            </button>

            {/* TTS Button */}
            <button
              onClick={handleSpeak}
              className="p-2.5 bg-[#EDEBE5] dark:bg-[#3a3a3a] hover:bg-rose-100 dark:hover:bg-rose-900/40 text-slate-500 dark:text-[#a5a5a0] hover:text-rose-500 rounded-xl transition-all active:scale-95"
            >
              <Volume2 size={18} />
            </button>
          </div>

          {/* Main Content Area */}
          <motion.div
            layout
            className="flex-1 flex flex-col items-center justify-center px-6 py-16 cursor-pointer select-none"
            onClick={handleCardClick}
          >
            <motion.div layout className="text-center w-full">
              {/* Word (Kanji) */}
              <h1
                className="text-6xl sm:text-7xl font-black text-slate-800 dark:text-[#f5f5f0] tracking-tight leading-tight"
                style={{ fontFamily: "'Noto Sans JP', sans-serif" }}
              >
                {displayWord}
              </h1>

              {/* Reading + POS (Below Kanji) */}
              <AnimatePresence>
                {step >= 1 && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="mt-4 flex flex-row items-center justify-center gap-3"
                  >
                    <span className="text-3xl text-slate-600 dark:text-[#c5c5c0] font-medium">
                      {displayReading}
                    </span>

                    {displayPos && (
                      <span className="inline-block px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:text-[#a5a5a0] border border-[#D5D3CD] dark:border-[#4a4a4a] rounded-full">
                        {displayPos}
                      </span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Full Context */}
            <AnimatePresence>
              {step >= 2 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                  className="w-full mt-8 overflow-hidden"
                >
                  {/* Meaning */}
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="text-center mb-6"
                  >
                    <p className="text-xl sm:text-2xl font-bold text-slate-700 dark:text-[#e5e5e0]">
                      {displayMeaning}
                    </p>
                  </motion.div>

                  {/* Sentence Example */}
                  {displaySentence && (
                    <motion.div
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.2 }}
                      className="border-l-4 border-rose-300 dark:border-rose-600 bg-[#EDEBE5] dark:bg-[#3a3a3a] rounded-r-xl p-4 mx-2 cursor-pointer"
                      onClick={handleSpeakSentence}
                    >
                      <p className="text-base text-slate-700 dark:text-[#e5e5e0] font-medium leading-relaxed flex items-start gap-2">
                        <span className="flex-1">{displaySentence}</span>
                        <Volume2 size={14} className="shrink-0 text-slate-400 dark:text-[#888] mt-1" />
                      </p>

                      {displaySentenceMeaning && (
                        <p className="text-sm text-slate-500 dark:text-[#a5a5a0] mt-2 leading-relaxed">
                          {displaySentenceMeaning}
                        </p>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Action Buttons Area */}
          <motion.div
            layout
            className="bg-[#EDEBE5]/80 dark:bg-[#252525]/80 backdrop-blur-sm border-t border-[#E8E6E0] dark:border-[#3a3a3a] px-5 py-5 pb-6"
          >
            <AnimatePresence mode="wait">
              {mode === 'leech' ? renderLeechButtons() : renderNormalButtons()}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
