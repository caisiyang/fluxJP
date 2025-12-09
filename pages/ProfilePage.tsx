import React, { useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateSettings } from '../lib/db';
import { Trash2, Book, Volume2, Moon, Sun, Download, Upload } from 'lucide-react';
import { LibraryStore, OFFICIAL_BOOKS } from '../components/LibraryStore';

export const ProfilePage: React.FC = () => {
  const settings = useLiveQuery(() => db.settings.toCollection().first());

  // Check which books are installed
  const installedBooks = useLiveQuery(async () => {
    const installed = [];
    for (const book of OFFICIAL_BOOKS) {
      const count = await db.words
        .where('level').equals(book.level)
        .limit(1)
        .count();
      if (count > 0) installed.push(book);
    }
    return installed;
  }, []) || [];

  // AUTO-SELECT: If only one book is installed and no book is selected, auto-select it
  useEffect(() => {
    if (settings && installedBooks.length > 0 && !settings.selectedBook) {
      const firstBook = installedBooks[0];
      updateSettings({ selectedBook: firstBook.level });
    }
  }, [settings, installedBooks]);

  // Apply dark mode class to document
  useEffect(() => {
    if (settings?.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings?.theme]);

  const currentBook = installedBooks.find(b => b.level === settings?.selectedBook);
  const displayTitle = currentBook?.title || (installedBooks.length > 0 ? (settings?.selectedBook || '単語帳を選択') : '単語帳未選択');
  const displayDesc = currentBook?.desc || (installedBooks.length > 0 ? 'タップして切り替え' : 'リストから選択してください');

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

  // --- Data Backup & Restore ---

  const handleExportData = async () => {
    try {
      const words = await db.words.toArray();
      const dailyStats = await db.dailyStats.toArray();
      const settingsData = await db.settings.toArray();
      const favorites = await db.favorites.toArray();

      const backupData = {
        version: 1,
        date: new Date().toISOString(),
        words,
        dailyStats,
        settings: settingsData,
        favorites
      };

      const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().split('T')[0];

      a.href = url;
      a.download = `fluxjp_backup_${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('学習データをエクスポートしました');
    } catch (error: any) {
      console.error('Export failed:', error);
      alert(`エクスポートに失敗しました: ${error.message}`);
    }
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = e.target?.result as string;
        const data = JSON.parse(json);

        if (!data.words || !Array.isArray(data.words)) {
          throw new Error('無効なバックアップファイルです (words data missing)');
        }

        if (!confirm(`バックアップファイルを読み込みますか？\n既存のデータと統合（マージ）します。\n学習進度が高い方を優先して保存します。`)) {
          // Clear input so same file can be selected again if needed
          event.target.value = '';
          return;
        }

        // Dynamically import merge function to avoid circular deps if any, or just use it
        const { mergeDatabase } = await import('../lib/db');
        await mergeDatabase(data);

        alert('データを復元しました。ページを再読み込みします。');
        window.location.reload();

      } catch (error: any) {
        console.error('Import failed:', error);
        alert(`インポートに失敗しました: ${error.message}`);
        event.target.value = ''; // Reset input
      }
    };
    reader.readAsText(file);
  };

  const handleClearAllData = async () => {
    console.log('[ProfilePage] handleClearAllData called');

    const confirmed = window.confirm('本当にすべてのデータを削除しますか？学習履歴も完全に消去されます。此の操作は取り消せません。');
    console.log('[ProfilePage] User confirmed:', confirmed);

    if (confirmed) {
      await db.words.clear();
      await db.dailyStats.clear();
      await updateSettings({ selectedBook: undefined });
      window.alert('すべてのデータを削除しました');
      window.location.reload();
    }
  };

  return (
    <div className="h-full p-6 overflow-y-auto no-scrollbar bg-[#F7F6F2] dark:bg-[#1a1a1a]">
      <h1 className="text-3xl font-black text-slate-800 dark:text-[#f5f5f0] mb-8 mt-4">設定</h1>

      <div className="space-y-8 max-w-2xl">

        {/* Active Book Section */}
        <section id="book-section">
          <h2 className="text-xs font-bold text-slate-500 dark:text-[#a5a5a0] uppercase tracking-widest mb-4 pl-1">学習中の単語帳</h2>
          <div className="bg-[#F7F6F2] dark:bg-[#2a2a2a] border border-[#E8E6E0] dark:border-[#3a3a3a] rounded-[1.5rem] p-5 flex items-center justify-between shadow-sm relative overflow-hidden">

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
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${installedBooks.length > 0 ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-500' : 'bg-[#EDEBE5] dark:bg-[#3a3a3a] text-slate-400 dark:text-[#888]'}`}>
                <Book size={24} />
              </div>
              <div>
                <h3 className="text-slate-800 dark:text-[#f5f5f0] font-bold text-lg">{displayTitle}</h3>
                <p className="text-slate-500 dark:text-[#a5a5a0] text-xs font-medium">{displayDesc}</p>
              </div>
            </div>

            {installedBooks.length > 1 ? (
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 text-xs font-bold px-3 py-1.5 bg-rose-50 dark:bg-rose-900/30 rounded-lg pointer-events-none">
                <span>切替</span>
                <span className="text-lg leading-none">▾</span>
              </div>
            ) : installedBooks.length === 1 ? (
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg pointer-events-none">
                <span>選択中</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-slate-400 dark:text-[#888] text-xs font-bold px-3 py-1.5 bg-[#EDEBE5] dark:bg-[#3a3a3a] rounded-lg pointer-events-none">
                <span>未選択</span>
              </div>
            )}
          </div>
        </section>

        {/* Official Library */}
        <section id="library-section">
          <h2 className="text-xs font-bold text-slate-500 dark:text-[#a5a5a0] uppercase tracking-widest mb-4 pl-1">公式単語帳</h2>
          <LibraryStore />
        </section>

        {/* Audio Settings */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 dark:text-[#a5a5a0] uppercase tracking-widest mb-4 pl-1">音声設定</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-5 bg-[#F7F6F2] dark:bg-[#2a2a2a] rounded-[1.5rem] border border-[#E8E6E0] dark:border-[#3a3a3a] shadow-sm">
              <div className="flex items-center gap-3">
                <Volume2 size={18} className="text-slate-400 dark:text-[#888]" />
                <span className="text-slate-700 dark:text-[#e5e5e0] text-sm font-medium">音声自動再生</span>
              </div>
              <button
                onClick={handleAudioToggle}
                className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${settings?.autoAudio ? 'bg-rose-500' : 'bg-[#D5D3CD] dark:bg-[#4a4a4a]'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white dark:bg-[#f5f5f0] rounded-full shadow-sm transition-transform ${settings?.autoAudio ? 'left-6' : 'left-1'}`} />
              </button>
            </div>

            <div className="p-5 bg-[#F7F6F2] dark:bg-[#2a2a2a] rounded-[1.5rem] border border-[#E8E6E0] dark:border-[#3a3a3a] shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-700 dark:text-[#e5e5e0] text-sm font-medium">再生速度</span>
                <span className="text-rose-500 font-bold text-sm">{settings?.audioSpeed?.toFixed(1) || '0.9'}x</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.5"
                step="0.1"
                value={settings?.audioSpeed || 0.9}
                onChange={(e) => handleSpeedChange(parseFloat(e.target.value))}
                className="w-full h-2 bg-[#D5D3CD] dark:bg-[#4a4a4a] rounded-lg appearance-none cursor-pointer accent-rose-500"
              />
              <div className="flex justify-between text-[10px] text-slate-400 dark:text-[#888] mt-1">
                <span>遅い</span>
                <span>普通</span>
                <span>速い</span>
              </div>
            </div>
          </div>
        </section>

        {/* Theme Toggle */}
        <section>
          <h2 className="text-xs font-bold text-slate-500 dark:text-[#a5a5a0] uppercase tracking-widest mb-4 pl-1">表示設定</h2>
          <div className="flex items-center justify-between p-5 bg-[#F7F6F2] dark:bg-[#2a2a2a] rounded-[1.5rem] border border-[#E8E6E0] dark:border-[#3a3a3a] shadow-sm">
            <div className="flex items-center gap-3">
              {settings?.theme === 'dark' ? <Moon size={18} className="text-rose-400" /> : <Sun size={18} className="text-orange-400" />}
              <span className="text-slate-700 dark:text-[#e5e5e0] text-sm font-medium">テーマ設定</span>
            </div>
            <button
              onClick={() => updateSettings({ theme: settings?.theme === 'dark' ? 'light' : 'dark' })}
              className={`flex items-center px-1 w-14 h-7 rounded-full cursor-pointer transition-colors ${settings?.theme === 'dark' ? 'bg-rose-500' : 'bg-[#D5D3CD]'}`}
            >
              <div className={`w-5 h-5 bg-white dark:bg-[#f5f5f0] rounded-full shadow-sm transition-transform ${settings?.theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`} />
            </button>
          </div>
        </section>

        {/* Data Management */}
        <section className="pt-4">
          <h2 className="text-xs font-bold text-slate-500 dark:text-[#a5a5a0] uppercase tracking-widest mb-4 pl-1">データ管理</h2>

          <div className="space-y-3">
            {/* Export */}
            <button
              onClick={handleExportData}
              className="w-full p-4 bg-[#F7F6F2] dark:bg-[#2a2a2a] border border-[#E8E6E0] dark:border-[#3a3a3a] rounded-[1.5rem] flex items-center justify-between hover:bg-white dark:hover:bg-[#333] transition-colors shadow-sm"
            >
              <span className="text-slate-700 dark:text-[#e5e5e0] font-bold text-sm">学習データをバックアップ (保存)</span>
              <Download size={18} className="text-slate-400" />
            </button>

            {/* Import - Hidden Input + Label */}
            <label className="w-full p-4 bg-[#F7F6F2] dark:bg-[#2a2a2a] border border-[#E8E6E0] dark:border-[#3a3a3a] rounded-[1.5rem] flex items-center justify-between hover:bg-white dark:hover:bg-[#333] transition-colors shadow-sm cursor-pointer">
              <span className="text-slate-700 dark:text-[#e5e5e0] font-bold text-sm">学習データを復元 (読み込み)</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
              <Upload size={18} className="text-slate-400" />
            </label>

            {/* Clear Data */}
            <button
              onClick={handleClearAllData}
              className="w-full p-4 border border-red-200 dark:border-red-900/50 text-red-500 dark:text-red-400 rounded-2xl flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors font-medium mt-6"
            >
              <Trash2 size={18} />
              <span className="text-sm">全データを削除（リセット）</span>
            </button>
          </div>
        </section>

        <div className="text-center pt-8 pb-20">
          <p className="text-[10px] text-slate-400 dark:text-[#666] font-medium tracking-wide">FluxJP v0.3.0</p>
        </div>
      </div>
    </div>
  );
};