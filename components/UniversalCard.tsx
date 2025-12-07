import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Word, ReviewGrade } from '../types';
import { Check, BrainCircuit, Swords } from 'lucide-react';

interface UniversalCardProps {
  word: Word;
  onReview: (grade: ReviewGrade) => void;
}

type CardState = 'enigma' | 'triage' | 'encoding';

export const UniversalCard: React.FC<UniversalCardProps> = ({ word, onReview }) => {
  const [state, setState] = useState<CardState>('enigma');

  // Reset state when word changes
  useEffect(() => {
    setState('enigma');
  }, [word]);

  const handleSpace = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      if (state === 'enigma') setState('triage');
    }
    if (state === 'triage') {
        if (e.key === '1') onReview('kill');
        if (e.key === '2') onReview('keep');
        if (e.key === '3') setState('encoding');
    }
    if (state === 'encoding') {
        if (e.key === 'Enter') onReview('forge');
    }
  }, [state, onReview]);

  useEffect(() => {
    window.addEventListener('keydown', handleSpace);
    return () => window.removeEventListener('keydown', handleSpace);
  }, [handleSpace]);

  // Animation variants
  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
    exit: { opacity: 0, x: -50, transition: { duration: 0.2 } }
  };

  return (
    <div className="w-full h-full max-h-[75vh] flex flex-col relative perspective-1000 mt-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={word.id}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="flex-1 bg-white rounded-[2rem] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col relative border border-slate-50"
        >
          {/* Progress bar top decoration */}
          <div className="h-1.5 w-full bg-slate-50">
             <div className="h-full bg-indigo-500 w-1/3 rounded-r-full" /> 
          </div>

          {/* CONTENT AREA */}
          <div 
            className="flex-1 flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-slate-50/50 transition-colors"
            onClick={() => state === 'enigma' && setState('triage')}
          >
            {/* ENIGMA STATE (Always Visible) */}
            <motion.div layoutId="kanji" className="text-center">
               <h1 className="text-8xl font-black text-slate-800 mb-4 tracking-tighter">{word.kanji}</h1>
               {/* Show Kana softly only in triage/encoding */}
               {state !== 'enigma' && (
                 <motion.p 
                    initial={{ opacity: 0, y: -10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    className="text-3xl text-indigo-500 font-medium font-serif"
                  >
                    {word.kana}
                 </motion.p>
               )}
            </motion.div>

            {/* TRIAGE REVEAL */}
            {state !== 'enigma' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-10 text-center w-full"
              >
                <div className="relative inline-block px-6 py-2">
                    <span className="absolute top-0 left-0 text-2xl text-slate-200 serif">“</span>
                    <p className="text-2xl text-slate-700 font-serif relative z-10">{word.meaning}</p>
                    <span className="absolute bottom-0 right-0 text-2xl text-slate-200 serif">”</span>
                </div>
                
                {/* Minimal sentence */}
                <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-100 mx-4">
                    <p className="text-slate-600 text-sm font-medium">{word.examples[0]?.jp}</p>
                    <p className="text-slate-400 text-xs mt-1">{word.examples[0]?.en}</p>
                </div>
              </motion.div>
            )}

            {/* ENCODING EXPANSION (Slide Down Detail) */}
            {state === 'encoding' && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                className="w-full mt-6 pt-6 border-t border-slate-100 text-left bg-white px-2"
              >
                <div className="space-y-5">
                  <div className="flex gap-3">
                    <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-yellow-50 text-yellow-600 font-bold text-xs">记</span>
                    <p className="text-slate-600 text-sm leading-relaxed pt-1">{word.mnemonic || "暂无助记。"}</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-purple-50 text-purple-600 font-bold text-xs">源</span>
                    <p className="text-slate-600 text-sm leading-relaxed pt-1">{word.etymology || "暂无字源。"}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* ACTION BAR */}
          <div className="h-24 bg-white border-t border-slate-100 flex items-center justify-between px-6 pb-6 pt-4">
            {state === 'enigma' ? (
               <p className="w-full text-center text-slate-400 text-xs tracking-widest uppercase">点击查看详情</p>
            ) : state === 'triage' ? (
              <div className="flex w-full justify-between gap-4">
                 <button onClick={() => onReview('kill')} className="flex-1 flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-red-100 hover:text-red-500 text-slate-400 transition-all active:scale-95 group">
                    <Swords size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">太简单</span>
                 </button>
                 <button onClick={() => onReview('keep')} className="flex-1 flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-emerald-100 hover:text-emerald-500 text-slate-400 transition-all active:scale-95 group">
                    <Check size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">记得</span>
                 </button>
                 <button onClick={() => setState('encoding')} className="flex-1 flex flex-col items-center justify-center p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md hover:border-indigo-100 hover:text-indigo-500 text-slate-400 transition-all active:scale-95 group">
                    <BrainCircuit size={20} className="mb-1 group-hover:scale-110 transition-transform" />
                    <span className="text-[10px] font-bold">忘了</span>
                 </button>
              </div>
            ) : (
              // Encoding State Action
               <button 
                onClick={() => onReview('forge')} 
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-slate-200"
              >
                <Check className="w-5 h-5" />
                <span>我学会了</span>
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};