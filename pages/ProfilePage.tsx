import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateSettings } from '../lib/db';
import { WordStatus } from '../types';
import { Trash2, Book, Volume2, Moon, Sun } from 'lucide-react';
import { DataImporter } from '../components/DataImporter';
import { LibraryStore, OFFICIAL_BOOKS } from '../components/LibraryStore';

export const ProfilePage: React.FC = () => {
  const settings = useLiveQuery(() => db.settings.toCollection().first());

  // Check which books are installed
  const installedBooks = useLiveQuery(async () => {
    const installed = [];
    for (const book of OFFICIAL_BOOKS) {
      const count = await db.words
        .where('level').equals(book.level)
        .filter(w => w.tags.includes('Official'))
        .limit(1)
        .count();
      if (count > 0) installed.push(book);
    }
    return installed;
  }, []) || [];

  // Find current book title for display
  const currentBook = installedBooks.find(b => b.level === settings?.selectedBook);
  const displayTitle = currentBook?.title || (installedBooks.length > 0 ? (settings?.selectedBook || '选择词书') : '暂无词书');
  const displayDesc = currentBook?.desc || (installedBooks.length > 0 ? '点击切换' : '请到下方下载你需要的词书');

  const handleAudioToggle = async () => {
    if (settings) {
      await updateSettings({ autoAudio: !settings.autoAudio });
    }
  };

  const handleSpeedChange = async (speed: number) => {
    if (settings) {
      await updateSettings({ audioSpeed: speed });
    }
  };

  const handleResetProgress = async () => {
    if (confirm('确定要重置所有学习进度吗？此操作不可撤销！')) {
      await db.words.toCollection().modify({
        status: WordStatus.NEW,
        interval: 0,
        easeFactor: 2.5,
        dueDate: Date.now(),
        reviewCount: 0,
        leechCount: 0
      });
      await db.dailyStats.clear();
      alert('学习进度已重置');
    }
  };

  return (
    <div className="h-full p-6 overflow-y-auto no-scrollbar bg-white">
      <h1 className="text-3xl font-black text-slate-800 mb-8 mt-4">我的档案</h1>

      <div className="space-y-8 max-w-2xl">

        {/* Active Book Section */}
        <section id="book-section">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">当前词书</h2>
          <div className="bg-white border border-slate-100 rounded-[1.5rem] p-5 flex items-center justify-between shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] relative overflow-hidden">

            {/* Select Overlay */}
            {installedBooks.length > 0 ? (
              <select
                value={settings?.selectedBook || ''}
                onChange={(e) => updateSettings({ selectedBook: e.target.value })}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              >
                {installedBooks.map(book => (
                  <option key={book.id} value={book.level}>
                    {book.title} ({book.level})
                  </option>
                ))}
              </select>
            ) : (
              <div className="absolute inset-0 z-10" onClick={() => document.getElementById('library-section')?.scrollIntoView({ behavior: 'smooth' })} />
            )}

            <div className="flex items-center gap-4 pointer-events-none">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${installedBooks.length > 0 ? 'bg-indigo-50 text-indigo-500' : 'bg-slate-100 text-slate-400'}`}>
                <Book size={24} />
              </div>
              <div>
                <h3 className="text-slate-800 font-bold text-lg">{displayTitle}</h3>
                <p className="text-slate-400 text-xs font-medium">{displayDesc}</p>
              </div>
            </div>

            {installedBooks.length > 0 ? (
              <div className="flex items-center gap-2 text-indigo-600 text-xs font-bold px-3 py-1.5 bg-indigo-50 rounded-lg pointer-events-none">
                <span>切换</span>
                <span className="text-lg leading-none">▾</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 text-xs font-bold px-3 py-1.5 bg-slate-50 rounded-lg pointer-events-none">
                <span>未安装</span>
              </div>
            )}
          </div>
        </section>

        {/* Audio Settings */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">发音设置</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3">
                <Volume2 size={18} className="text-slate-400" />
                <span className="text-slate-700 text-sm font-medium">自动播放发音</span>
              </div>
              <button
                onClick={handleAudioToggle}
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${settings?.autoAudio ? 'bg-indigo-500' : 'bg-slate-200'
                  }`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${settings?.autoAudio ? 'left-6' : 'left-1'
                  }`} />
              </button>
            </div>

            <div className="p-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-700 text-sm font-medium">语速</span>
                <span className="text-indigo-500 font-bold text-sm">{settings?.audioSpeed?.toFixed(1) || '0.9'}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={settings?.audioSpeed || 0.9}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>慢速</span>
                <span>正常</span>
                <span>快速</span>
              </div>
            </div>
          </div>
        </section>

        {/* Preferences */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">学习设置</h2>

          <div className="space-y-4">
            {/* Daily Limit Slider */}
            <div className="p-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-700 text-sm font-medium">每日新词上限</span>
                <span className="text-indigo-500 font-bold text-sm">{settings?.dailyNewLimit || 20}</span>
              </div>
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={settings?.dailyNewLimit || 20}
                onChange={(e) => updateSettings({ dailyNewLimit: parseInt(e.target.value) })}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between p-5 bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-3">
                {settings?.theme === 'dark' ? <Moon size={18} className="text-indigo-400" /> : <Sun size={18} className="text-orange-400" />}
                <span className="text-slate-700 text-sm font-medium">界面主题</span>
              </div>
              <button
                onClick={() => updateSettings({ theme: settings?.theme === 'dark' ? 'light' : 'dark' })}
                className={`flex items-center px-1 w-14 h-7 rounded-full cursor-pointer transition-colors ${settings?.theme === 'dark' ? 'bg-slate-800' : 'bg-slate-200'
                  }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${settings?.theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
                  }`} />
              </button>
            </div>
          </div>
        </section>

        {/* Data Management - Official Library */}
        <section>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1">官方词库</h2>
          <LibraryStore />
        </section>

        {/* Manual Import (Advanced) */}
        <section>
          <details className="group">
            <summary className="list-none cursor-pointer flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 pl-1 hover:text-indigo-500 transition-colors">
              <span className="flex items-center gap-2">
                <span>手动导入 (高级)</span>
                <span className="group-open:rotate-180 transition-transform">▼</span>
              </span>
            </summary>
            <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)] overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="p-5">
                <DataImporter />
              </div>
            </div>
          </details>
        </section>

        {/* Danger Zone */}
        <section className="pt-4">
          <button
            onClick={handleResetProgress}
            className="w-full p-4 border border-red-100 text-red-500 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 transition-colors font-medium"
          >
            <Trash2 size={18} />
            <span className="text-sm">重置所有进度</span>
          </button>
        </section>

        <div className="text-center pt-8 pb-20">
          <p className="text-[10px] text-slate-300 font-medium tracking-wide">FluxJP v0.2.0 • Designed for Flow</p>
        </div>
      </div>
    </div>
  );
};