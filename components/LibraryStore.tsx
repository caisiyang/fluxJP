import React, { useState } from 'react';
import { db, updateSettings } from '../lib/db';
import { Word, WordStatus } from '../types';
import { Download, Check, Loader2, BookOpen, Trash2, ArrowRightLeft } from 'lucide-react';
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
        title: 'N4+N5 基礎単語',
        desc: '日本語学習の第一歩。最も基本的で重要な初級単語を網羅。',
        count: 2500,
        level: 'N4',
        color: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
        url: 'N4_N5_Clean.json'
    },
    {
        id: 'n3_official',
        title: 'N3 中級単語',
        desc: '日常会話をスムーズに。中級から上級への架け橋となる重要単語。',
        count: 1579,
        level: 'N3',
        color: 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-600 dark:text-cyan-400',
        url: 'N3_Clean.json'
    },
    {
        id: 'n2_official',
        title: 'N2 上級単語',
        desc: 'ビジネスや学術的な場面で必須。深いコミュニケーションのための語彙。',
        count: 2916,
        level: 'N2',
        color: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
        url: 'N2_Clean.json'
    },
    {
        id: 'n1_official',
        title: 'N1 超上級単語',
        desc: 'ネイティブレベルの表現力。抽象的な概念や洗練された語彙を習得。',
        count: 4084,
        level: 'N1',
        color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
        url: 'N1_Clean.json'
    }
];

export const LibraryStore: React.FC = () => {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    // Get currently selected book from settings
    const settings = useLiveQuery(() => db.settings.toCollection().first());
    const selectedLevel = settings?.selectedBook;

    // Check installed levels
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

    const handleSelectBook = async (book: typeof OFFICIAL_BOOKS[0]) => {
        setLoadingId(book.id);
        setSuccessMsg(null);

        try {
            // Check if already installed
            const count = await db.words
                .where('level').equals(book.level)
                .count();

            // If not installed, or if data appears corrupted, import it
            let needsImport = count === 0;

            if (count > 0) {
                // Check a sample for corruption (empty word/kanji)
                const sample = await db.words.where('level').equals(book.level).first();
                // If sample exists but has no valid word field, consider it corrupted
                if (sample && !sample.word && !sample.kanji) {
                    console.warn(`[LibraryStore] Corrupted data detected for ${book.level}. Forcing re-import.`);
                    needsImport = true;
                    // Delete old corrupted data
                    await db.words.where('level').equals(book.level).delete();
                }
            }

            if (needsImport) {
                const baseUrl = import.meta.env.BASE_URL;
                const fullUrl = `${baseUrl}${book.url}`.replace('//', '/'); // Encode base url logic
                console.log(`[LibraryStore] Fetching from: ${fullUrl}`);

                const response = await fetch(fullUrl);
                if (!response.ok) {
                    throw new Error(`ダウンロードに失敗しました (HTTP ${response.status})`);
                }

                const data = await response.json();
                if (!Array.isArray(data)) throw new Error("無効なフォーマットです");

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

                if (wordsToInsert.length === 0) throw new Error("単語データが空です");

                await db.words.bulkPut(wordsToInsert);
                setSuccessMsg(`「${book.title}」を準備しました`);
            }

            // Set as selected book
            await updateSettings({ selectedBook: book.level });

            if (count > 0) {
                setSuccessMsg(`学習対象を「${book.title}」に切り替えました`);
            }

            setTimeout(() => setSuccessMsg(null), 3000);

        } catch (err: any) {
            console.error(err);
            setSuccessMsg(`エラーが発生しました: ${err.message}`);
        } finally {
            setLoadingId(null);
        }
    };

    const handleForceReset = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm('本当にすべてのデータを削除しますか？学習履歴も完全に消去されます。')) {
            return;
        }

        console.log('[LibraryStore] Force reset starting...');
        setSuccessMsg('データを削除中...');

        try {
            await db.words.clear();
            await db.dailyStats.clear();
            await updateSettings({ selectedBook: undefined });

            setSuccessMsg('すべてのデータを削除しました。ページを更新します...');

            setTimeout(() => {
                window.location.reload();
            }, 1000);

        } catch (err: any) {
            console.error('[LibraryStore] Force reset error:', err);
            setSuccessMsg(`削除失敗: ${err.message}`);
        }
    };

    return (
        <div className="space-y-3">
            {successMsg && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-xs rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                    <Check size={14} />
                    <span>{successMsg}</span>
                </div>
            )}

            <div className="grid grid-cols-1 gap-3">
                {OFFICIAL_BOOKS.map(book => {
                    const isSelected = selectedLevel === book.level;
                    const isLoading = loadingId === book.id;
                    const isInstalled = installedLevels[book.level];

                    return (
                        <div
                            key={book.id}
                            className={`relative p-4 rounded-2xl border transition-all duration-300 ${isSelected
                                ? 'border-rose-400 bg-rose-50/50 dark:bg-rose-900/20 shadow-sm'
                                : 'border-[#E8E6E0] dark:border-[#3a3a3a] bg-[#F7F6F2] dark:bg-[#2a2a2a] hover:border-slate-300 dark:hover:border-slate-600'
                                }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 text-sm font-black shadow-sm ${book.color}`}>
                                        {book.level}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 dark:text-[#f5f5f0] text-sm">
                                            {book.title}
                                        </h3>
                                        <p className="text-[11px] text-slate-500 dark:text-[#a5a5a0] flex items-center gap-1.5 mt-0.5">
                                            <BookOpen size={10} />
                                            {book.count} 単語
                                            {!isInstalled && <span className="text-slate-400 dark:text-slate-600"> (未ダウンロード)</span>}
                                        </p>
                                        <p className="text-[10px] text-slate-400 dark:text-[#888] mt-1 line-clamp-1">
                                            {book.desc}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleSelectBook(book)}
                                    disabled={isLoading || isSelected}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer min-w-[80px] justify-center ${isSelected
                                        ? 'bg-rose-100 dark:bg-rose-900/40 text-rose-500 cursor-default'
                                        : isLoading
                                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-wait'
                                            : 'bg-slate-800 dark:bg-rose-600 text-white hover:bg-rose-600 dark:hover:bg-rose-500 shadow-sm hover:shadow active:scale-95'
                                        }`}
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 size={12} className="animate-spin" />
                                            <span>準備中</span>
                                        </>
                                    ) : isSelected ? (
                                        <>
                                            <Check size={12} strokeWidth={3} />
                                            <span>選択中</span>
                                        </>
                                    ) : (
                                        <>
                                            {isInstalled ? <ArrowRightLeft size={12} /> : <Download size={12} />}
                                            <span>{isInstalled ? '切り替え' : '選択'}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="pt-4 border-t border-[#E8E6E0] dark:border-[#3a3a3a] mt-4">
                <button
                    type="button"
                    onClick={handleForceReset}
                    className="w-full p-3 text-xs text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl cursor-pointer flex items-center justify-center gap-2 transition-colors"
                >
                    <Trash2 size={14} />
                    データリセット（初期化）
                </button>
            </div>
        </div>
    );
};
