import React, { useEffect, useState } from 'react';
import { useStudyStore } from '../store/useStudyStore';
import { UniversalCard } from '../components/UniversalCard';
import { StatsPill } from '../components/StatsPill';
import { ActionCard } from '../components/ActionCard';
import { StatusCard } from '../components/StatusCard';
import { FavoritesDialog } from '../components/FavoritesDialog';
import { MasteredDialog } from '../components/MasteredDialog';
import { Loader2, Zap, Hammer, Moon, Sun, Heart, AlertTriangle, Trophy, X, MoonStar } from 'lucide-react';
import { initDB, db, updateSettings } from '../lib/db';
import { preloadVoices } from '../lib/tts';
import { useLiveQuery } from 'dexie-react-hooks';
import { motion, AnimatePresence } from 'framer-motion';
import { WordStatus, Word } from '../types';

export const StudyPage: React.FC = () => {
  const {
    dueCount,
    reviewAheadCount,
    newLearnedToday,
    leechCount,
    masteredCount,
    sessionType,
    queue,
    currentIndex,
    showCompletionMessage,
    actions
  } = useStudyStore();

  const settings = useLiveQuery(() => db.settings.toCollection().first());
  const [isInitializing, setIsInitializing] = useState(true);
  const [showFavorites, setShowFavorites] = useState(false);
  const [showMastered, setShowMastered] = useState(false);

  // Get today's review count from dailyStats
  const reviewedToday = useLiveQuery(async () => {
    const today = new Date().toISOString().split('T')[0];
    const stats = await db.dailyStats.where('date').equals(today).first();
    return stats?.reviewCount || 0;
  }) || 0;

  // Get favorites count
  const favoritesCount = useLiveQuery(async () => {
    return db.favorites.count();
  }) || 0;

  // 晚间复习：今天学习过的单词（状态为 learning/review，今天有操作）
  const nightReviewCount = useLiveQuery(async () => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    // 获取今天到期且处于 learning 状态的词（需要闭环）
    const words = await db.words
      .where('status').equals(WordStatus.LEARNING)
      .filter(w => w.dueDate >= todayStart.getTime() && w.dueDate <= todayEnd.getTime())
      .count();

    return words;
  }) || 0;

  useEffect(() => {
    Promise.all([
      initDB(),
      preloadVoices()
    ]).then(() => {
      actions.refreshStats();
      setIsInitializing(false);
    });
  }, [actions]);

  // Apply dark mode class to document
  useEffect(() => {
    if (settings?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings?.theme]);

  const handleToggleTheme = () => {
    const newTheme = settings?.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
  };

  const handleStartFavoritesReview = () => {
    actions.startSession('favorites');
  };

  if (isInitializing) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-rose-500 bg-[#F7F6F2] dark:bg-[#1a1a1a]">
        <Loader2 className="animate-spin mb-3" size={32} />
        <p className="text-sm text-slate-500 dark:text-[#c5c5c0]">読み込み中...</p>
      </div>
    );
  }

  // Active Session View
  if (sessionType) {
    const currentWord = queue[currentIndex];

    if (!currentWord) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-fade-in bg-[#F7F6F2] dark:bg-[#1a1a1a]">
          <div className="w-24 h-24 bg-[#EDEBE5] dark:bg-[#2a2a2a] rounded-full flex items-center justify-center text-rose-500 mb-6">
            <Zap size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-[#f5f5f0] mb-2">学習完了！</h2>
          <p className="text-slate-500 dark:text-[#c5c5c0] mb-10 text-sm">少し休憩しましょう。</p>
          <button
            onClick={actions.endSession}
            className="w-full max-w-xs px-8 py-4 bg-slate-800 dark:bg-rose-600 rounded-2xl text-white font-bold hover:bg-slate-900 dark:hover:bg-rose-700 transition-colors"
          >
            ホームに戻る
          </button>
        </div>
      );
    }

    const getSessionLabel = () => {
      switch (sessionType) {
        case 'blitz': return '⚡ クイック復習';
        case 'forge': return '🔨 新規学習';
        case 'leech': return '🎯 苦手克服';
        case 'favorites': return '❤️ お気に入り';
        default: return '📚 学習';
      }
    };

    return (
      <div className="h-full flex flex-col relative px-4 bg-[#F7F6F2] dark:bg-[#1a1a1a]">
        {/* Session Header */}
        <div className="absolute top-6 left-0 right-0 flex justify-center items-center pointer-events-none z-10">
          <div className="bg-[#F7F6F2]/90 dark:bg-[#2a2a2a]/90 backdrop-blur-md border border-[#E8E6E0] dark:border-[#3a3a3a] rounded-full px-5 py-1.5 text-xs font-medium text-slate-600 dark:text-[#c5c5c0] shadow-sm">
            {getSessionLabel()} • {currentIndex + 1} / {queue.length}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={actions.endSession}
          className="absolute top-5 right-5 p-2 bg-[#EDEBE5]/80 dark:bg-[#2a2a2a]/80 rounded-full text-slate-500 hover:text-slate-800 dark:text-[#a5a5a0] dark:hover:text-[#f5f5f0] hover:bg-[#E8E6E0] dark:hover:bg-[#3a3a3a] transition-all z-20"
        >
          <span className="text-xl leading-none">×</span>
        </button>

        <div className="flex-1 flex items-center justify-center py-6 pb-safe">
          <UniversalCard
            word={currentWord}
            onEasy={actions.markEasy}
            onKeep={actions.markKeep}
            onLearned={actions.markLearned}
            progress={{ current: currentIndex + 1, total: queue.length }}
            mode={sessionType === 'leech' ? 'leech' : 'normal'}
          />
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto no-scrollbar max-w-2xl mx-auto bg-[#F7F6F2] dark:bg-[#1a1a1a]">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 mt-2">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-[#f5f5f0] tracking-tight mb-1">
            Flux日本語
          </h1>
          <p className="text-sm text-slate-500 dark:text-[#a5a5a0] font-medium">SRSで効率的に記憶</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Favorites Button */}
          <button
            onClick={() => setShowFavorites(true)}
            className="relative w-10 h-10 rounded-full bg-[#EDEBE5] dark:bg-[#2a2a2a] flex items-center justify-center text-slate-600 dark:text-[#c5c5c0] hover:bg-rose-100 dark:hover:bg-rose-900/30 hover:text-rose-500 transition-colors"
          >
            <Heart size={20} />
            {favoritesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {favoritesCount > 99 ? '99+' : favoritesCount}
              </span>
            )}
          </button>
          {/* Theme Toggle Button */}
          <button
            onClick={handleToggleTheme}
            className="w-10 h-10 rounded-full bg-[#EDEBE5] dark:bg-[#2a2a2a] flex items-center justify-center text-slate-600 dark:text-[#c5c5c0] hover:bg-[#E8E6E0] dark:hover:bg-[#3a3a3a] transition-colors"
          >
            {settings?.theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </header>

      {/* Stats Pill */}
      <StatsPill
        learnedToday={newLearnedToday}
        reviewedToday={reviewedToday}
        leechCount={leechCount}
      />

      {/* Main Actions */}
      <div className="flex gap-4 mb-6">
        <ActionCard
          title="新規学習"
          subtitle={`現在のレベルから20語`}
          icon={Hammer}
          onClick={() => actions.startSession('forge', 20)}
          variant="secondary"
        />
        <ActionCard
          title="クイック復習"
          subtitle={
            dueCount > 0
              ? `復習対象: ${dueCount}`
              : reviewAheadCount > 0
                ? `前倒し復習: ${reviewAheadCount}`
                : "復習完了"
          }
          icon={Zap}
          onClick={() => actions.startSession('blitz')}
          disabled={dueCount === 0 && reviewAheadCount === 0}
          variant={dueCount > 0 ? "primary" : "secondary"}
        />
      </div>

      {/* Night Review Banner */}
      {nightReviewCount > 0 && (
        <div
          onClick={() => actions.startSession('blitz', nightReviewCount)}
          className="mb-6 p-4 bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-900 dark:to-slate-800 rounded-2xl flex items-center gap-4 cursor-pointer hover:scale-[1.02] transition-transform shadow-lg"
        >
          <div className="w-12 h-12 bg-indigo-500/20 rounded-xl flex items-center justify-center">
            <MoonStar size={24} className="text-indigo-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold text-sm">🌙 夜間復習</h3>
            <p className="text-slate-300 text-xs">{nightReviewCount} 語の本日分を完了しましょう</p>
          </div>
          <div className="text-indigo-400 text-xl">→</div>
        </div>
      )}

      {/* Status Cards - Two Rows */}
      <div className="flex gap-4 mb-8">
        <StatusCard
          title="苦手な単語"
          count={leechCount}
          icon={AlertTriangle}
          iconColor="text-amber-500"
          bgColor="bg-amber-100 dark:bg-amber-900/30"
          onClick={() => actions.startSession('leech', 10)}
        />
        <StatusCard
          title="習得済み"
          count={masteredCount}
          icon={Trophy}
          iconColor="text-emerald-500"
          bgColor="bg-emerald-100 dark:bg-emerald-900/30"
          onClick={() => setShowMastered(true)}
        />
      </div>

      {/* Bottom padding for nav */}
      <div className="pb-20" />

      {/* Favorites Dialog */}
      <FavoritesDialog
        isOpen={showFavorites}
        onClose={() => setShowFavorites(false)}
        onStartReview={handleStartFavoritesReview}
      />

      {/* Mastered Dialog */}
      <MasteredDialog
        isOpen={showMastered}
        onClose={() => setShowMastered(false)}
        onStartReview={(words: Word[]) => {
          actions.startMasteredSession(words);
          setShowMastered(false);
        }}
      />

      {/* Completion Message Toast */}
      <AnimatePresence>
        {showCompletionMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 dark:bg-[#2a2a2a] text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 z-50 max-w-sm"
          >
            <span className="text-sm font-medium">{showCompletionMessage}</span>
            <button
              onClick={actions.clearCompletionMessage}
              className="p-1 hover:bg-white/10 rounded-lg transition-colors"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
