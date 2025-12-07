import React, { useState } from 'react';
import { db } from '../lib/db';
import { Word, WordStatus } from '../types';
import { Cloud, Download, Check, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

// --- Real Configuration ---
const OFFICIAL_BOOKS = [
    {
        id: 'n4_official',
        title: 'N4 进阶词汇',
        desc: '日常会话基础，涵盖大部分生活场景。',
        count: 1568,
        level: 'N4',
        color: 'bg-emerald-100 text-emerald-600',
        url: 'https://raw.githubusercontent.com/caisiyang/fluxJP/main/public/N4_Clean.json'
    },
    {
        id: 'n3_official',
        title: 'N3 中级词汇',
        desc: '能够理解日常话题，衔接高级日语的桥梁。',
        count: 1579,
        level: 'N3',
        color: 'bg-cyan-100 text-cyan-600',
        url: 'https://raw.githubusercontent.com/caisiyang/fluxJP/main/public/N3_Clean.json'
    },
    {
        id: 'n2_official',
        title: 'N2 高级词汇',
        desc: '商务日语与学术日语的门槛，深度交流必备。',
        count: 2916,
        level: 'N2',
        color: 'bg-indigo-100 text-indigo-600',
        url: 'https://raw.githubusercontent.com/caisiyang/fluxJP/main/public/N2_Clean.json'
    },
    {
        id: 'n1_official',
        title: 'N1 巅峰词汇',
        desc: '日语母语者水平，涵盖抽象概念与生僻词。',
        count: 4084,
        level: 'N1',
        color: 'bg-rose-100 text-rose-600',
        url: 'https://raw.githubusercontent.com/caisiyang/fluxJP/main/public/N1_Clean.json'
    }
];

export const LibraryStore: React.FC = () => {
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // --- Logic: Check Installed Status ---
    // Criteria: Database has any word with BOTH tags: [Level] AND 'Official'
    const installedLevels = useLiveQuery(async () => {
        const installed: Record<string, boolean> = {};

        for (const book of OFFICIAL_BOOKS) {
            // We need to check if ANY word has both tags.
            // Dexie `tags` is a multi-entry index.
            // We can find all words with 'Official' tag, and limit 1.
            // Then check if that word also has the level tag.
            // WAIT. 'Official' tag might be on N5 words, but we want to check N4.
            // So we should query for book.level, then filter for 'Official'.

            // Count words that have tag=Level AND tag=Official
            // Note: Dexie `where('tags').equals(val)` returns words having that tag.
            // We can use a filter on the collection.

            const count = await db.words
                .where('tags').equals(book.level)
                .filter(w => w.tags.includes('Official'))
                .count();

            if (count > 0) {
                installed[book.level] = true;
            }
        }
        return installed;
    }, []) || {};

    const handleDownload = async (book: typeof OFFICIAL_BOOKS[0]) => {
        setDownloadingId(book.id);
        setError(null);
        setSuccessMsg(null);

        try {
            // 1. Fetch
            const response = await fetch(book.url);
            if (!response.ok) {
                throw new Error(`下载失败 (HTTP ${response.status})`);
            }

            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("无效的词库格式 (Not Array)");

            // 2. Transform & Tag
            const wordsToInsert: Word[] = data.map((item: any) => ({
                kanji: item.kanji || item.term,
                kana: item.kana || item.reading,
                meaning: item.meaning || item.gloss,
                level: book.level,
                status: WordStatus.NEW,
                interval: 0,
                easeFactor: 2.5,
                dueDate: Date.now(),
                reviewCount: 0,
                leechCount: 0,
                // FORCE TAGS: Level + Official
                tags: [book.level, 'Official'],
                examples: []
            }));

            // 3. Bulk Insert
            if (wordsToInsert.length === 0) throw new Error("词库文件为空");

            await db.words.bulkPut(wordsToInsert); // upsert
            setSuccessMsg(`已成功安装 ${book.title}`);

            // Clear success msg after 3s
            setTimeout(() => setSuccessMsg(null), 3000);

        } catch (err: any) {
            console.error(err);
            setError(err.message || "未知错误");
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-500 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}
            {successMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-600 text-xs rounded-xl flex items-center gap-2 animate-in fade-in">
                    <Check size={14} />
                    {successMsg}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OFFICIAL_BOOKS.map(book => {
                    const isInstalled = installedLevels[book.level];
                    const isDownloading = downloadingId === book.id;

                    return (
                        <div
                            key={book.id}
                            className={`
                                relative overflow-hidden rounded-2xl border p-5 transition-all
                                ${isInstalled
                                    ? 'bg-emerald-50/30 border-emerald-100'
                                    : 'bg-white border-slate-100 hover:shadow-md'
                                }
                            `}
                        >
                            {/* Background Decor */}
                            <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-20 pointer-events-none ${book.color.split(' ')[0]}`} />

                            <div className="relative z-10 flex flex-col justify-between h-full gap-4">
                                <div className="flex gap-4 items-start">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${book.color}`}>
                                        <span className="text-sm font-black">{book.level}</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-bold text-slate-800 text-base">{book.title}</h3>
                                            {isInstalled && <Check size={14} className="text-emerald-500" strokeWidth={3} />}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                                            {book.desc}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                                    <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                                        <BookOpen size={12} />
                                        <span>{book.count} 词</span>
                                        <span>•</span>
                                        <span>Official</span>
                                    </div>

                                    <div>
                                        {isInstalled ? (
                                            <button disabled className="px-3 py-1.5 bg-emerald-100 text-emerald-600 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-default opacity-80">
                                                <Check size={12} strokeWidth={3} />
                                                已安装
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleDownload(book)}
                                                disabled={isDownloading}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm
                                                    ${isDownloading
                                                        ? 'bg-indigo-50 text-indigo-400 cursor-wait'
                                                        : 'bg-slate-800 text-white hover:bg-slate-700 active:scale-95'
                                                    }`}
                                            >
                                                {isDownloading ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
                                                下载
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
