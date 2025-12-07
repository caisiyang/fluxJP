import React, { useState, useEffect } from 'react';
import { db } from '../lib/db';
import { Word, WordStatus } from '../types';
import { Cloud, Download, Check, Loader2, BookOpen, AlertCircle } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

// --- Configuration ---
const OFFICIAL_BOOKS = [
    {
        id: 'n5_core',
        title: 'N5 核心词汇',
        count: 680,
        level: 'N5',
        description: 'JLPT N5 必备基础词汇，适合初学者。',
        url: 'https://raw.githubusercontent.com/caisiyang/FluxJP-Data/main/N5_Clean.json' // Real URL or Placeholder
    },
    {
        id: 'n4_core',
        title: 'N4 进阶词汇',
        count: 800,
        level: 'N4',
        description: 'JLPT N4 进阶词汇，提升阅读能力。',
        url: 'https://raw.githubusercontent.com/caisiyang/FluxJP-Data/main/N4_Clean.json'
    }
];

export const LibraryStore: React.FC = () => {
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Check installed books by checking for the specific tag in DB
    // We count check existence of ANY word with tag = book.id
    // This is a bit expensive if we had millions of rows, but for tags it's okay-ish with Dexie?
    // Optimization: We could maintain a 'Library' table, but for now let's just check metadata or count.

    // Better Strategy: Just use useLiveQuery to Check existence of 1 item with that tag.
    const installedBooks = useLiveQuery(async () => {
        const installed: Record<string, boolean> = {};
        for (const book of OFFICIAL_BOOKS) {
            const count = await db.words.where('tags').equals(book.id).count();
            if (count > 0) installed[book.id] = true;
        }
        return installed;
    }, []) || {};

    const handleDownload = async (book: typeof OFFICIAL_BOOKS[0]) => {
        setDownloadingId(book.id);
        setError(null);

        try {
            // 1. Fetch Data
            // Note: For now this might fail if the URL doesn't exist. 
            // We'll wrap in try/catch.
            const response = await fetch(book.url);
            if (!response.ok) {
                // Determine if it looks like a 404
                throw new Error(`Failed to fetch: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("Invalid data format");

            // 2. Map & Prepare
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
                // Critical: Add book.id to tags for "Installed" check
                tags: [book.level, 'Official', book.id]
            }));

            // 3. Bulk Insert
            await db.words.bulkPut(wordsToInsert);

            // Success feedback handled by UI (installedBooks will update)

        } catch (err: any) {
            console.error(err);
            setError(`下载失败: ${err.message}. (可能是还没有正式发布该词库)`);
        } finally {
            setDownloadingId(null);
        }
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="p-3 bg-red-50 text-red-500 text-xs rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <AlertCircle size={14} />
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 gap-4">
                {OFFICIAL_BOOKS.map(book => {
                    const isInstalled = installedBooks[book.id];
                    const isDownloading = downloadingId === book.id;

                    return (
                        <div key={book.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                            {/* Background Decor */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 group-hover:bg-indigo-100 transition-colors" />

                            <div className="relative z-10 flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 ${book.level === 'N5' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'
                                        }`}>
                                        <BookOpen size={24} strokeWidth={2.5} />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-slate-800 text-lg">{book.title}</h3>
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold">
                                                {book.level}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-2">{book.description}</p>
                                        <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400">
                                            <span className="flex items-center gap-1">
                                                <Cloud size={12} /> 官方源
                                            </span>
                                            <span>•</span>
                                            <span>{book.count} 词</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end">
                                    {isInstalled ? (
                                        <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-default">
                                            <Check size={14} />
                                            已安装
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => handleDownload(book)}
                                            disabled={isDownloading}
                                            className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 active:scale-95 transition-all disabled:opacity-70 disabled:active:scale-100 shadow-indigo-200 shadow-lg"
                                        >
                                            {isDownloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
                                            下载
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
