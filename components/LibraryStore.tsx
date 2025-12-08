import React, { useState } from 'react';
import { db, updateSettings } from '../lib/db';
import { Word, WordStatus } from '../types';
import { Download, Check, Loader2, BookOpen, Trash2 } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';

export type OfficialBook = {
    id: string;
    title: string;
    desc: string;
    count: number;
    level: Word['level'];
    color: string;
    url: string;
};

export const OFFICIAL_BOOKS: OfficialBook[] = [
    {
        id: 'n4_n5_official',
        title: 'N4+N5 基础词汇',
        desc: '日语入门基础，涵盖最常用的初级词汇。',
        count: 2500,
        level: 'N4',
        color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
        url: 'https://raw.githubusercontent.com/caisiyang/fluxJP/refs/heads/main/public/N4_N5_Clean.json'
    },
    {
        id: 'n3_official',
        title: 'N3 中级词汇',
        desc: '能够理解日常话题，衔接高级日语的桥梁。',
        count: 1579,
        level: 'N3',
        color: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400',
        url: 'https://raw.githubusercontent.com/caisiyang/fluxJP/refs/heads/main/public/N3_Clean.json'
    },
    {
        id: 'n2_official',
        title: 'N2 高级词汇',
        desc: '商务日语与学术日语的门槛，深度交流必备。',
        count: 2916,
        level: 'N2',
        color: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
        url: 'https://raw.githubusercontent.com/caisiyang/fluxJP/refs/heads/main/public/N2_Clean.json'
    },
    {
        id: 'n1_official',
        title: 'N1 巅峰词汇',
        desc: '日语母语者水平，涵盖抽象概念与生僻词。',
        count: 4084,
        level: 'N1',
        color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
        url: 'https://raw.githubusercontent.com/caisiyang/fluxJP/refs/heads/main/public/N1_Clean.json'
    }
];

export const LibraryStore: React.FC = () => {
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [uninstallingId, setUninstallingId] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    const installedLevels = useLiveQuery(async () => {
        const installed: Record<string, boolean> = {};
        for (const book of OFFICIAL_BOOKS) {
            const count = await db.words
                .where('level').equals(book.level)
                .limit(1)
                .count();
            if (count > 0) {
                installed[book.level] = true;
            }
        }
        return installed;
    }, []) || {};

    const handleDownload = async (book: typeof OFFICIAL_BOOKS[0]) => {
        setDownloadingId(book.id);
        setSuccessMsg(null);

        try {
            const response = await fetch(book.url);
            if (!response.ok) {
                throw new Error(`下载失败 (HTTP ${response.status})`);
            }

            const data = await response.json();
            if (!Array.isArray(data)) throw new Error("无效的词库格式");

            const wordsToInsert: Word[] = data.map((item: any) => ({
                word: item.word || item.kanji || item.term || '',
                reading: item.reading || item.kana || '',
                pos: item.pos || item.partOfSpeech || '',
                meaning: item.meaning || item.gloss || '',
                sentence: item.sentence || '',
                sentence_meaning: item.sentence_meaning || '',
                kanji: item.word || item.kanji || item.term || '',
                kana: item.reading || item.kana || '',
                level: book.level,
                status: WordStatus.NEW,
                interval: 0,
                easeFactor: 2.5,
                dueDate: Date.now(),
                reviewCount: 0,
                leechCount: 0,
                tags: [book.level, 'Official'],
                examples: []
            }));

            if (wordsToInsert.length === 0) throw new Error("词库文件为空");

            await db.words.bulkPut(wordsToInsert);
            await updateSettings({ selectedBook: book.level });

            setSuccessMsg(`已安装 ${book.title} (${wordsToInsert.length} 词)`);
            setTimeout(() => setSuccessMsg(null), 3000);

        } catch (err: any) {
            console.error(err);
            setSuccessMsg(`下载失败: ${err.message}`);
        } finally {
            setDownloadingId(null);
        }
    };

    const handleUninstall = async (e: React.MouseEvent, book: typeof OFFICIAL_BOOKS[0]) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('[LibraryStore] handleUninstall starting for:', book.level);
        setUninstallingId(book.id);

        try {
            const wordsToDelete = await db.words
                .where('level').equals(book.level)
                .primaryKeys();

            console.log('[LibraryStore] Found words to delete:', wordsToDelete.length);

            if (wordsToDelete.length > 0) {
                await db.words.bulkDelete(wordsToDelete);
                console.log('[LibraryStore] Deleted successfully');
            }

            const settings = await db.settings.toCollection().first();
            if (settings?.selectedBook === book.level) {
                await updateSettings({ selectedBook: undefined });
            }

            setSuccessMsg(`已卸载 ${book.title}，刷新中...`);

            setTimeout(() => {
                window.location.reload();
            }, 500);

        } catch (err: any) {
            console.error('[LibraryStore] Uninstall error:', err);
            setSuccessMsg(`卸载失败: ${err.message}`);
            setUninstallingId(null);
        }
    };

    const handleForceReset = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        console.log('[LibraryStore] Force reset starting...');
        setSuccessMsg('正在清空数据...');

        try {
            console.log('[LibraryStore] Clearing words table...');
            await db.words.clear();

            console.log('[LibraryStore] Clearing dailyStats table...');
            await db.dailyStats.clear();

            console.log('[LibraryStore] Updating settings...');
            await updateSettings({ selectedBook: undefined });

            setSuccessMsg('已清空所有数据，刷新中...');

            setTimeout(() => {
                window.location.reload();
            }, 500);

        } catch (err: any) {
            console.error('[LibraryStore] Force reset error:', err);
            setSuccessMsg(`清空失败: ${err.message}`);
        }
    };

    return (
        <div className="space-y-3">
            {successMsg && (
                <div className="p-2.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs rounded-xl flex items-center gap-2">
                    <span>{successMsg}</span>
                </div>
            )}

            <div className="grid grid-cols-1 gap-3">
                {OFFICIAL_BOOKS.map(book => {
                    const isInstalled = installedLevels[book.level];
                    const isDownloading = downloadingId === book.id;
                    const isUninstalling = uninstallingId === book.id;

                    return (
                        <div
                            key={book.id}
                            className="relative p-4 rounded-2xl border border-[#E8E6E0] dark:border-[#3a3a3a] bg-[#F7F6F2] dark:bg-[#2a2a2a]"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black ${book.color}`}>
                                        {book.level}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-[#f5f5f0] text-sm">
                                            {book.title}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-[#a5a5a0] flex items-center gap-1.5">
                                            <BookOpen size={10} />
                                            {book.count} 词
                                        </p>
                                    </div>
                                </div>

                                {isInstalled ? (
                                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold">
                                        <Check size={12} strokeWidth={3} />
                                        已安装
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => handleDownload(book)}
                                        disabled={isDownloading}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${isDownloading
                                                ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-400 cursor-wait'
                                                : 'bg-slate-800 dark:bg-rose-600 text-white hover:bg-rose-600 dark:hover:bg-rose-500'
                                            }`}
                                    >
                                        {isDownloading ? (
                                            <>
                                                <Loader2 size={12} className="animate-spin" />
                                                <span>下载中</span>
                                            </>
                                        ) : (
                                            <>
                                                <Download size={12} strokeWidth={2.5} />
                                                <span>获取</span>
                                            </>
                                        )}
                                    </button>
                                )}
                            </div>

                            {isInstalled && (
                                <div className="mt-3 pt-3 border-t border-[#E8E6E0] dark:border-[#3a3a3a] flex justify-end">
                                    <button
                                        type="button"
                                        onClick={(e) => handleUninstall(e, book)}
                                        disabled={isUninstalling}
                                        className="px-3 py-1.5 text-xs text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer flex items-center gap-1"
                                    >
                                        <Trash2 size={12} />
                                        {isUninstalling ? '卸载中...' : '卸载'}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="pt-4 border-t border-[#E8E6E0] dark:border-[#3a3a3a]">
                <button
                    type="button"
                    onClick={handleForceReset}
                    className="w-full p-3 text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl cursor-pointer flex items-center justify-center gap-2"
                >
                    <Trash2 size={14} />
                    强制清空所有词库
                </button>
            </div>
        </div>
    );
};
