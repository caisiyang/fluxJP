import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Volume2, Heart, Check, RefreshCw, Swords, BrainCircuit, X } from 'lucide-react';
import { Word, ReviewGrade } from '../types';
import { speak, isTTSAvailable } from '../lib/tts';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, addFavorite, removeFavorite, isFavorite } from '../lib/db';

interface UniversalCardProps {
  word: Word;
  onEasy?: () => void;
  onKeep?: () => void;
  onLearned?: () => void;
  onReview?: (grade: ReviewGrade) => void;
  onClose?: () => void;
  progress?: { current: number; total: number };
  mode?: 'normal' | 'leech';
}

type DisclosureState = 0 | 1 | 2;

export const UniversalCard: React.FC<UniversalCardProps> = ({
  word,
  onEasy,
  onKeep,
  onLearned,
  onReview,
  onClose,
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
  const displaySentence = word.sentence || (word.examples && word.examples[0] ? word.examples[0].jp : '') || '';
  const displaySentenceMeaning = word.sentence_meaning || (word.examples && word.examples[0] ? word.examples[0].en : '') || '';

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

  // Auto-play audio on mount/word change (Step 0)
  useEffect(() => {
    if (word.id && isTTSAvailable()) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        const textToSpeak = displayReading || displayWord;
        speak(textToSpeak, settings?.audioSpeed || 0.9);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [word.id, displayReading, displayWord, settings?.audioSpeed]);

  // Auto-play for step changes (Reading / Sentence)
  useEffect(() => {
    if (!settings?.autoAudio || !isTTSAvailable()) return;

    if (step === 1) { // Reading
      const textToSpeak = displayReading || displayWord;
      speak(textToSpeak, settings.audioSpeed);
    } else if (step === 2 && displaySentence) { // Sentence
      const timer = setTimeout(() => {
        speak(displaySentence, settings.audioSpeed);
      }, 300); // Small delay for animation
      return () => clearTimeout(timer);
    }
  }, [step, displayReading, displayWord, displaySentence, settings?.autoAudio, settings?.audioSpeed]);

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
    if (mode === 'leech') {
      if (e.key === '1') handleKeep();
      if (e.key === '2') handleLearned();
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

  // 3D Button Style Class
  const buttonBaseClass = "flex-1 flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all active:translate-y-[4px] active:shadow-none bg-white relative";

  // Specific styles for 3D effect
  const getButtonStyles = (color: 'slate' | 'emerald' | 'amber') => {
    const colorMap = {
      slate: 'border-slate-200 shadow-[0_4px_0_#e2e8f0] text-slate-500 active:border-slate-300',
      emerald: 'border-emerald-200 shadow-[0_4px_0_#a7f3d0] text-emerald-600',
      amber: 'border-amber-200 shadow-[0_4px_0_#fde68a] text-amber-600'
    };
    return `${buttonBaseClass} ${colorMap[color]}`;
  };

  const renderLeechButtons = () => (
    <motion.div
      key="leech-buttons"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex w-full justify-between gap-3 px-2"
    >
      <button
        onClick={handleKeep}
        className={getButtonStyles('emerald')}
      >
        <Check size={24} className="mb-1" strokeWidth={3} />
        <span className="text-[11px] font-black tracking-wider">覚えた</span>
      </button>

      <button
        onClick={handleLearned}
        className={getButtonStyles('amber')}
      >
        <RefreshCw size={24} className="mb-1" strokeWidth={3} />
        <span className="text-[11px] font-black tracking-wider">継続</span>
      </button>
    </motion.div>
  );

  const renderNormalButtons = () => (
    <motion.div
      key="normal-buttons"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex w-full justify-between gap-3 px-2"
    >
      <button
        onClick={handleEasy}
        className={getButtonStyles('slate')}
      >
        <Swords size={24} className="mb-1" strokeWidth={2.5} />
        <span className="text-[11px] font-black tracking-wider">記憶不要</span>
      </button>

      <button
        onClick={handleKeep}
        className={getButtonStyles('slate')}
      >
        <Check size={24} className="mb-1" strokeWidth={3} />
        <span className="text-[11px] font-black tracking-wider">記憶する</span>
      </button>

      <button
        onClick={handleLearned}
        className={getButtonStyles('slate')}
      >
        <BrainCircuit size={24} className="mb-1" strokeWidth={2.5} />
        <span className="text-[11px] font-black tracking-wider">強化する</span>
      </button>
    </motion.div>
  );

  return (
    <div className="w-full h-full flex flex-col relative bg-[#F7F6F2]">
      <div className="flex-1 flex flex-col relative overflow-hidden rounded-[2rem] mx-2 my-2 bg-[#F7F6F2] shadow-sm ring-1 ring-slate-900/5">

        {/* Progress Bar Header */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 z-20">
          {progress && (
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(progress.current / progress.total) * 100}%` }}
              className="h-full bg-rose-500 rounded-r-full"
            />
          )}
        </div>

        {/* Header Content */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2 z-10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-rose-500 tracking-widest uppercase opacity-80">
              {word.level}
            </span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleToggleFavorite}
              className={`p-2 rounded-lg transition-all active:scale-95 ${isFav ? 'bg-rose-50 text-rose-500' : 'hover:bg-slate-100/80 text-slate-400'}`}
            >
              <Heart size={20} fill={isFav ? 'currentColor' : 'none'} strokeWidth={2} />
            </button>
            <button
              onClick={handleSpeak}
              className="p-2 rounded-lg hover:bg-slate-100/80 text-slate-400 transition-all active:scale-95"
            >
              <Volume2 size={20} strokeWidth={2} />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-100/80 text-slate-400 transition-all active:scale-95"
              >
                <X size={20} strokeWidth={2} />
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <motion.div
          layout
          className="flex-1 flex flex-col items-center overflow-y-auto px-4 pt-2 pb-36 no-scrollbar scrolling-touch" // Increased pb-36 for safe area
          onClick={handleCardClick}
        >
          <motion.div layout className="text-center w-full mt-4">
            {/* Word (Kanji) */}
            <h1
              className="text-6xl font-black text-slate-800 dark:text-[#f5f5f0] tracking-tight leading-tight mb-6 break-keep drop-shadow-sm"
              style={{ fontFamily: "'Shippori Mincho', serif" }}
            >
              {displayWord}
            </h1>

            {/* Reading + POS */}
            <AnimatePresence>
              {step >= 1 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col items-center gap-6"
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <span className="text-2xl text-slate-600 dark:text-[#c5c5c0] font-medium font-sans tracking-wide">
                      {displayReading}
                    </span>

                    {displayPos && (
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        {displayPos}
                      </span>
                    )}
                  </div>

                  {/* Meaning */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-center px-4 max-w-xs mx-auto"
                  >
                    <p className="text-xl font-bold text-slate-700 dark:text-[#e5e5e0] leading-normal">
                      {displayMeaning}
                    </p>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Sentence Example */}
          <AnimatePresence>
            {step >= 2 && displaySentence && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.3 }}
                className="w-full mt-8 mb-4 max-w-[90%]"
              >
                <motion.div
                  className="w-full bg-[#f0eee9] dark:bg-[#333] rounded-xl p-5 border-l-4 border-rose-400/80 relative group cursor-pointer active:scale-[0.99] transition-transform"
                  onClick={(e) => { e.stopPropagation(); handleSpeakSentence(); }}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex flex-col gap-2">
                      <p className="text-lg text-slate-800 dark:text-[#e5e5e0] font-medium leading-relaxed font-serif">
                        {displaySentence}
                      </p>
                      {displaySentenceMeaning && (
                        <p className="text-sm text-slate-500 dark:text-[#a5a5a0] font-medium leading-relaxed">
                          {displaySentenceMeaning}
                        </p>
                      )}
                    </div>
                    <Volume2 size={18} className="text-slate-400 group-hover:text-rose-500 transition-colors shrink-0 mt-1" />
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Fixed Bottom Action Area */}
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#F7F6F2] via-[#F7F6F2] to-[#F7F6F2]/0 pt-12 pb-6 px-4 z-30 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <AnimatePresence mode="wait">
              {mode === 'leech' ? renderLeechButtons() : renderNormalButtons()}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </div>
  );
};
