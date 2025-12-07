import React from 'react';
import { Settings, RefreshCw, Trash2, Book } from 'lucide-react';

export const ProfilePage: React.FC = () => {
  return (
    <div className="h-full p-6 overflow-y-auto no-scrollbar bg-white">
      <h1 className="text-3xl font-black text-slate-800 mb-8 mt-4">我的档案</h1>

      <div className="space-y-8 max-w-2xl">
        
        {/* Active Book Section */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">当前词书</h2>
          <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 flex items-center justify-between shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)]">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                    <Book size={24} />
                </div>
                <div>
                    <h3 className="text-slate-800 font-bold">JLPT N5 核心词汇</h3>
                    <p className="text-slate-400 text-xs mt-1 font-medium">进行中 • 7/650 词</p>
                </div>
             </div>
             <button className="text-indigo-600 text-xs font-bold px-3 py-1.5 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">切换</button>
          </div>
        </section>

        {/* Preferences */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">设置</h2>
          <div className="space-y-4">
             <div className="flex items-center justify-between p-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                <span className="text-slate-700 text-sm font-medium">每日新词上限</span>
                <span className="text-indigo-500 font-bold">20</span>
             </div>
             
             <div className="flex items-center justify-between p-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
                <span className="text-slate-700 text-sm font-medium">自动播放发音</span>
                <div className="w-11 h-6 bg-slate-200 rounded-full relative cursor-pointer">
                    <div className="absolute left-1 top-1 bottom-1 w-4 bg-white rounded-full shadow-sm"></div>
                </div>
             </div>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-6">
          <button className="w-full p-4 border border-red-100 text-red-500 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors font-medium">
             <Trash2 size={18} />
             <span className="text-sm">重置所有进度</span>
          </button>
        </section>
        
        <div className="text-center pt-8 pb-20">
            <p className="text-[10px] text-slate-300 font-medium tracking-wide">FluxJP v0.1.0 • Designed for Flow</p>
        </div>
      </div>
    </div>
  );
};