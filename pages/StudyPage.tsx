import React, { useEffect, useState } from 'react';
import { useStudyStore } from '../store/useStudyStore';
import { UniversalCard } from '../components/UniversalCard';
import { StatsPill } from '../components/StatsPill';
import { ActionCard } from '../components/ActionCard';
import { WarningCard } from '../components/WarningCard';
import { SceneExplorer } from '../components/SceneExplorer';
import { Loader2, Zap, Hammer, Moon, Search } from 'lucide-react';
import { initDB } from '../lib/db';
import { preloadVoices } from '../lib/tts';
import { SCENARIOS } from '../data/scenarios';

export const StudyPage: React.FC = () => {
  const {
    dueCount,
    newLearnedToday,
    leechCount,
    retentionRate,
    sessionType,
    queue,
    currentIndex,
    actions
  } = useStudyStore();

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    Promise.all([
      initDB(),
      preloadVoices()
    ]).then(() => {
      actions.refreshStats();
      setIsInitializing(false);
    });
  }, [actions]);

  if (isInitializing) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-[#D45D5D] bg-[#F7F6F2]">
        <Loader2 className="animate-spin mb-3" size={32} />
        <p className="text-sm text-slate-400">正在加载...</p>
      </div>
    );
  }

  // Active Session View
  if (sessionType) {
    const currentWord = queue[currentIndex];

    if (!currentWord) {
      return (
        <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-fade-in bg-[#F7F6F2]">
          <div className="w-24 h-24 bg-[#D45D5D]/10 rounded-full flex items-center justify-center text-[#D45D5D] mb-6 shadow-soft">
            <Zap size={48} />
          </div>
          <h2 className="text-2xl font-black text-slate-800 mb-2">学习完成！</h2>
          <p className="text-slate-400 mb-10 text-sm">心流状态已达成，休息一下吧。</p>
          <button
            onClick={actions.endSession}
            className="w-full max-w-xs px-8 py-4 bg-slate-800 rounded-2xl text-white font-bold hover:bg-slate-900 transition-colors shadow-soft"
          >
            返回首页
          </button>
        </div>
      );
    }

    return (
      <div className="h-full flex flex-col relative px-4 bg-[#F7F6F2]">
        {/* Session Header */}
        <div className="absolute top-6 left-0 right-0 flex justify-center items-center pointer-events-none z-10">
          <div className="bg-white/80 backdrop-blur-md border border-slate-200/50 rounded-full px-5 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
            {sessionType === 'blitz' ? '⚡ 闪击复习' : sessionType === 'forge' ? '🔨 新词铸造' : '🎯 顽固克星'} • {currentIndex + 1} / {queue.length}
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={actions.endSession}
          className="absolute top-5 right-5 p-2 bg-white/50 rounded-full text-slate-400 hover:text-slate-800 hover:bg-white transition-all z-20"
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
          />
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto no-scrollbar max-w-2xl mx-auto">
      {/* Header */}
      <header className="flex items-center justify-between mb-8 mt-2">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight mb-1">
            FluxJP
          </h1>
          <p className="text-sm text-slate-400 font-medium">Ready for flow state.</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme Toggle Button (Visual only for now) */}
          <button className="w-10 h-10 rounded-full bg-[#E5E5E0] flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
            <Moon size={20} />
          </button>
          {/* Search Button */}
          <button
            onClick={() => window.location.hash = '#/search'}
            className="w-10 h-10 rounded-full bg-[#E5E5E0] flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
          >
            <Search size={20} />
          </button>
        </div>
      </header>

      {/* Stats Pill */}
      <StatsPill
        dueCount={dueCount}
        newCount={newLearnedToday}
        retentionRate={retentionRate}
      />

      {/* Main Actions */}
      <div className="flex gap-4 mb-6">
        <ActionCard
          title="新词铸造"
          subtitle={`学习 20 个新词`}
          icon={Hammer}
          onClick={() => actions.startSession('forge', 20)}
          variant="secondary"
        />
        <ActionCard
          title="闪击复习"
          subtitle={dueCount > 0 ? "目前有待复习单词" : "目前没有待复习单词"}
          icon={Zap}
          onClick={() => actions.startSession('blitz')}
          disabled={dueCount === 0}
          variant="primary"
        />
      </div>

      {/* Stubborn Obstacle */}
      <div className="mb-8">
        <WarningCard
          count={leechCount}
          onClick={() => actions.startSession('leech', 10)}
        />
      </div>

      {/* Scenarios Section */}
      <div className="pb-24">
        <SceneExplorer
          scenarios={SCENARIOS}
          onSelect={(scenario) => actions.startSession('scenario', 0, scenario)}
        />
      </div>
    </div>
  );
};
