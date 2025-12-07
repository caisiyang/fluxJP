import React, { useEffect, useState } from 'react';
import { useStudyStore } from '../store/useStudyStore';
import { UniversalCard } from '../components/UniversalCard';
import { Zap, Hammer, Moon, Loader2 } from 'lucide-react';
import { initDB } from '../lib/db';

export const StudyPage: React.FC = () => {
  const { 
    dueCount, 
    newLearnedToday, 
    retentionRate, 
    sessionType,
    queue,
    currentIndex,
    actions 
  } = useStudyStore();

  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initDB().then(() => {
        actions.refreshStats();
        setIsInitializing(false);
    });
  }, [actions]);

  if (isInitializing) {
      return <div className="h-full flex items-center justify-center text-indigo-500"><Loader2 className="animate-spin" size={32} /></div>;
  }

  // Active Session View
  if (sessionType) {
    const currentWord = queue[currentIndex];
    
    if (!currentWord) {
        return (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center animate-fade-in bg-white">
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 mb-6 shadow-sm">
                    <Zap size={48} />
                </div>
                <h2 className="text-2xl font-black text-slate-800 mb-2">学习完成</h2>
                <p className="text-slate-400 mb-10 text-sm">心流状态已达成，休息一下吧。</p>
                <button 
                    onClick={actions.endSession}
                    className="w-full max-w-xs px-8 py-4 bg-slate-900 rounded-2xl text-white font-bold hover:bg-slate-800 transition-colors shadow-xl shadow-slate-200"
                >
                    返回首页
                </button>
            </div>
        )
    }

    return (
      <div className="h-full flex flex-col relative px-4 bg-white">
        {/* Session Header */}
        <div className="absolute top-6 left-0 right-0 flex justify-center items-center pointer-events-none z-10">
           <div className="bg-white/90 backdrop-blur-md border border-slate-100 rounded-full px-5 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
              {sessionType === 'blitz' ? '⚡ 闪击复习' : '🔨 新词铸造'} • {currentIndex + 1} / {queue.length}
           </div>
        </div>
        
        {/* Close Button */}
        <button 
            onClick={actions.endSession}
            className="absolute top-5 right-5 p-2 bg-slate-50 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all z-20"
        >
            <span className="text-xl leading-none">×</span>
        </button>

        <div className="flex-1 flex items-center justify-center py-6">
            <UniversalCard 
                word={currentWord} 
                onReview={actions.submitGrade} 
            />
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className="h-full flex flex-col p-6 overflow-y-auto no-scrollbar bg-white">
      <header className="mb-8 mt-4">
        <h1 className="text-3xl font-black text-slate-800 mb-1 tracking-tight">学习中心</h1>
        <p className="text-slate-400 text-sm tracking-wide">保持专注，进入心流。</p>
      </header>

      {/* Stats Row - Flattened and Minimal */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-white px-3 py-4 rounded-xl border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] text-center">
            <span className="block text-xl font-black text-rose-500">{dueCount}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">待复习</span>
        </div>
        <div className="bg-white px-3 py-4 rounded-xl border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] text-center">
            <span className="block text-xl font-black text-indigo-500">{newLearnedToday}</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">今日新词</span>
        </div>
        <div className="bg-white px-3 py-4 rounded-xl border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.03)] text-center">
            <span className="block text-xl font-black text-emerald-500">{retentionRate}%</span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">记忆率</span>
        </div>
      </div>

      {/* Action Cards */}
      <div className="space-y-5 w-full pb-24">
        
        {/* Blitz Card */}
        <button 
          onClick={() => actions.startSession('blitz')}
          disabled={dueCount === 0}
          className="w-full group relative overflow-hidden bg-white border border-slate-100 rounded-[2rem] p-6 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] active:scale-[0.98]"
        >
           {/* Background Decor */}
           <div className="absolute right-0 bottom-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
             <Zap size={150} />
           </div>
           
           <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 shadow-inner">
                 <Zap size={32} fill="currentColor" className="drop-shadow-sm" />
              </div>
              <div>
                 <h3 className="text-xl font-bold text-slate-800 group-hover:text-rose-500 transition-colors">闪击复习</h3>
                 <p className="text-slate-400 text-sm mt-1 font-medium">清理积压的 {dueCount} 个单词</p>
              </div>
           </div>
        </button>

        {/* Forge Card */}
        <button 
          onClick={() => actions.startSession('forge', 20)}
          className="w-full group relative overflow-hidden bg-white border border-slate-100 rounded-[2rem] p-6 text-left transition-all shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-10px_rgba(0,0,0,0.08)] active:scale-[0.98]"
        >
            <div className="absolute right-0 bottom-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
             <Hammer size={150} />
           </div>

           <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center shrink-0 shadow-inner">
                 <Hammer size={32} />
              </div>
              <div>
                 <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-500 transition-colors">新词铸造</h3>
                 <p className="text-slate-400 text-sm mt-1 font-medium">学习 20 个新单词</p>
              </div>
           </div>
        </button>

        {/* Fix Leech Card */}
        <button 
          disabled
          className="w-full group relative overflow-hidden bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-left opacity-60 cursor-not-allowed"
        >
           <div className="relative z-10 flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-200 text-slate-400 flex items-center justify-center shrink-0">
                 <Moon size={32} />
              </div>
              <div>
                 <h3 className="text-xl font-bold text-slate-400">顽固克星</h3>
                 <p className="text-slate-400 text-sm mt-1 font-medium">暂无需要特别关注的单词</p>
              </div>
           </div>
        </button>

      </div>
    </div>
  );
};