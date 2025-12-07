import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { clsx } from 'clsx';
import { Word, ReviewGrade } from '../types';
import { Check, BrainCircuit, Swords, Volume2, Search, BookOpen } from 'lucide-react';
import { speak, isTTSAvailable } from '../lib/tts';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';

interface UniversalCardProps {
  word: Word;
  onEasy?: () => void;
  onKeep?: () => void;
  onLearned?: () => void;
  /** @deprecated use onEasy/onKeep instead */
  onReview?: (grade: ReviewGrade) => void;
  progress?: { current: number; total: number };
}

type CardState = 'front' | 'back' | 'detail';

export const UniversalCard: React.FC<UniversalCardProps> = ({ word, onEasy, onKeep, onLearned, onReview, progress }) => {
  const [state, setState] = useState<CardState>('front');
  const settings = useLiveQuery(() => db.settings.toCollection().first());

  // Reset state on new word
  useEffect(() => {
    setState('front');
  }, [word.id]); // Strict dependency on ID

  // TTS Helper
  const handleSpeak = useCallback((text: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (isTTSAvailable()) {
      speak(text, settings?.audioSpeed || 0.9);
    }
  }, [settings?.audioSpeed]);

  // Auto Audio
  useEffect(() => {
    if (settings?.autoAudio && state === 'back' && isTTSAvailable()) {
      speak(word.kana || word.kanji, settings.audioSpeed);
    }
  }, [state, word, settings?.autoAudio, settings?.audioSpeed]);

  // Actions Wrapper
  const handleEasy = useCallback(() => {
    if (onEasy) onEasy();
    else if (onReview) onReview('kill');
  }, [onEasy, onReview]);

  const handleKeep = useCallback(() => {
    if (onKeep) onKeep();
    else if (onReview) onReview('keep');
  }, [onKeep, onReview]);

  const handleForgot = useCallback(() => {
    setState('detail');
  }, []);

  const handleLearned = useCallback(() => {
    if (onLearned) onLearned();
    else if (onReview) onReview('forge');
  }, [onLearned, onReview]);

  // Keyboard Shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (state === 'front') setState('back');
    }
    if (state === 'back') {
      if (e.key === '1') handleEasy();
      if (e.key === '2') handleKeep();
      if (e.key === '3') handleForgot();
    }
    if (state === 'detail') {
      if (e.key === 'Enter') handleLearned();
    }
  }, [state, handleEasy, handleKeep, handleForgot, handleLearned]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Gestures
  const handleDragEnd = (_: any, info: PanInfo) => {
    if (state !== 'back') return;
    const threshold = 80;
    if (info.offset.x > threshold) handleKeep();
    else if (info.offset.x < -threshold) handleForgot();
    else if (info.offset.y < -threshold) handleEasy();
  };

  const progressPercent = progress ? (progress.current / progress.total) * 100 : 33;

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 30 } },
    exit: { opacity: 0, x: -100, transition: { duration: 0.2 } }
  };

  return (
    <div className="w-full h-full flex flex-col relative perspective-1000">
      <AnimatePresence mode="wait">
        <motion.div
          key={word.id}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          drag={state === 'back'}
          dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
          dragElastic={0.7}
          onDragEnd={handleDragEnd}
          className="flex-1 clay-card overflow-hidden flex flex-col relative"
        >
          {/* Progress Bar */}
          <div className="h-2 w-full bg-black/5">
            <motion.div
              className="h-full bg-gradient-to-r from-red-400 to-rose-500"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Tags */}
          <div className="absolute top-6 left-6 flex items-center gap-2">
            <span className="px-3 py-1.5 bg-[#D45D5D]/10 text-[#D45D5D] text-xs font-black rounded-lg uppercase tracking-wide">
              {word.level}
            </span>
            {word.category && (
              <span className="px-3 py-1.5 bg-slate-200/50 text-slate-500 text-xs font-bold rounded-lg">
                {word.category}
              </span>
            )}
          </div>

          {/* TTS Button */}
          <button
            onClick={(e) => handleSpeak(word.kana || word.kanji, e)}
            className="absolute top-6 right-6 p-3 bg-white/50 hover:bg-[#D45D5D]/10 text-slate-400 hover:text-[#D45D5D] rounded-xl transition-all active:scale-95 shadow-sm"
          >
            <Volume2 size={20} />
          </button>

          {/* Main Content */}
          <div
            className="flex-1 flex flex-col items-center justify-center p-8 cursor-pointer select-none"
            onClick={() => {
              if (state === 'front') setState('back');
              // else if (state === 'back') setState('detail'); // Only "Forgot" button triggers detail from back? Or click too? Prompt says "Button 3: Forgot -> Detail". 
              // Usually clicking the card flips it. Let's allowing clicking to flip to detail as a fallback or "show more"? 
              // Prompt: "操作: 点击卡片 -> 状态变为 back"。
              // No instruction for click on Back. Let's keep it safe: Click on Back does nothing or simple toggle? 
              // Let's rely on buttons for clear flows.
            }}
          >
            {/* Kanji */}
            <motion.div layoutId="kanji" className="text-center">
              <h1
                className="text-8xl sm:text-9xl font-black text-slate-800 mb-4 tracking-tighter"
                style={{ textShadow: '4px 4px 8px rgba(0,0,0,0.1), -2px -2px 4px rgba(255,255,255,0.8)' }}
              >
                {word.kanji}
              </h1>

              {state !== 'front' && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-3xl sm:text-4xl text-[#D45D5D] font-bold"
                >
                  {word.kana}
                </motion.p>
              )}
            </motion.div>

            {/* Meaning & Examples */}
            {state !== 'front' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-10 text-center w-full px-4"
              >
                <div className="relative inline-block px-6 py-2">
                  <span className="absolute top-0 left-0 text-2xl text-slate-300/50 font-serif">"</span>
                  <p className="text-2xl sm:text-3xl text-slate-700 font-bold">{word.meaning}</p>
                  <span className="absolute bottom-0 right-0 text-2xl text-slate-300/50 font-serif">"</span>
                </div>

                {/* Example (Only in Detail state? Prompt says: "阶段 2: Back (背面/分流) 显示: 汉字 + 读音 + 意思。" "阶段 3: Detail (详情/编码) 显示: 助记、拆字、完整例句。" ) */}
                {/* So in Back, only Meaning. Detail has Example. */}
                {(state === 'detail' && word.examples && word.examples[0]) && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 p-5 bg-white/60 rounded-2xl shadow-inner border border-white/50"
                  >
                    <p
                      className="text-slate-700 text-base font-medium"
                      onClick={(e) => { e.stopPropagation(); handleSpeak(word.examples![0].jp, e); }}
                    >
                      {word.examples[0].jp} <Volume2 size={14} className="inline ml-1 text-slate-300" />
                    </p>
                    <p className="text-slate-400 text-sm mt-2 font-medium">{word.examples[0].en}</p>
                  </motion.div>
                )}
              </motion.div>
            )}

            {/* Deep Info (Detail Only) */}
            {state === 'detail' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="w-full mt-6 pt-6 border-t border-slate-200/50"
              >
                <div className="space-y-4 px-2">
                  {word.mnemonic && (
                    <div className="flex gap-3 items-start">
                      <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-amber-100 text-amber-700 font-black text-xs shadow-sm">记</span>
                      <p className="text-slate-600 text-sm leading-relaxed pt-1 font-medium text-left">{word.mnemonic}</p>
                    </div>
                  )}
                  {word.etymology && (
                    <div className="flex gap-3 items-start">
                      <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-black text-xs shadow-sm">源</span>
                      <p className="text-slate-600 text-sm leading-relaxed pt-1 font-medium text-left">{word.etymology}</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="bg-white/30 backdrop-blur-sm border-t border-white/50 px-6 py-6 pb-8">
            {state === 'front' ? (
              <div className="h-20 flex items-center justify-center text-slate-300 text-sm font-medium animate-pulse">
                点击卡片翻面
              </div>
            ) : state === 'back' ? (
              <div className="flex w-full justify-between gap-4">
                {/* Button 1: Too Easy */}
                <button
                  onClick={handleEasy}
                  className="flex-1 flex flex-col items-center justify-center py-4 px-2 rounded-[1.2rem] bg-[#F7F6F2] shadow-clay-card active:shadow-clay-pressed hover:translate-y-[-2px] hover:text-rose-500 text-slate-400 transition-all active:scale-95 group"
                >
                  <Swords size={22} className="mb-1.5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                  <span className="text-[10px] font-black tracking-wider">太简单</span>
                </button>
                {/* Button 2: Keep (Remember) */}
                <button
                  onClick={handleKeep}
                  className="flex-1 flex flex-col items-center justify-center py-4 px-2 rounded-[1.2rem] bg-[#F7F6F2] shadow-clay-card active:shadow-clay-pressed hover:translate-y-[-2px] hover:text-emerald-500 text-slate-400 transition-all active:scale-95 group"
                >
                  <Check size={22} className="mb-1.5 group-hover:scale-110 transition-transform" strokeWidth={3} />
                  <span className="text-[10px] font-black tracking-wider">记得</span>
                </button>
                {/* Button 3: Forgot */}
                <button
                  onClick={handleForgot}
                  className="flex-1 flex flex-col items-center justify-center py-4 px-2 rounded-[1.2rem] bg-[#F7F6F2] shadow-clay-card active:shadow-clay-pressed hover:translate-y-[-2px] hover:text-indigo-500 text-slate-400 transition-all active:scale-95 group"
                >
                  <BrainCircuit size={22} className="mb-1.5 group-hover:scale-110 transition-transform" strokeWidth={2.5} />
                  <span className="text-[10px] font-black tracking-wider">忘了</span>
                </button>
              </div>
            ) : (
              /* Detail State: Single Button 'I Learned' */
              <button
                onClick={handleLearned}
                className="w-full py-4 rounded-[1.2rem] bg-indigo-500 text-white font-bold text-lg shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-indigo-600"
              >
                <BookOpen size={24} strokeWidth={2.5} />
                <span>我学会了</span>
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
