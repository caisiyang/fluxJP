import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { ContextCard } from '../components/ContextCard';
import { Loader2 } from 'lucide-react';

export const ContextPage: React.FC = () => {
  const sentences = useLiveQuery(() => db.sentences.toArray());

  if (!sentences) {
      return (
        <div className="h-full flex flex-col items-center justify-center text-indigo-400">
             <Loader2 className="animate-spin mb-2" />
             <p className="text-xs text-slate-400">正在加载语境库...</p>
        </div>
      );
  }

  return (
    <div className="h-full w-full flex flex-col bg-white">
       <header className="px-6 py-8 pb-6">
          <h1 className="text-2xl font-black text-slate-800">语境画廊</h1>
          <p className="text-slate-400 text-sm mt-1">在句子中理解单词。</p>
       </header>

       <div className="flex-1 overflow-y-auto px-4 pb-24 no-scrollbar">
          {sentences.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">
                  暂无例句数据。
              </div>
          ) : (
              sentences.map((sentence) => (
                <ContextCard key={sentence.id} sentence={sentence} />
              ))
          )}
       </div>
    </div>
  );
};