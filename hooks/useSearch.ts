import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../lib/db';
import { Word } from '../types';

/**
 * 搜索词汇 Hook
 * 支持汉字、假名、中文释义多维度搜索
 */
export const useSearch = (query: string): Word[] | undefined => {
    return useLiveQuery(async () => {
        const q = query.trim().toLowerCase();
        if (!q) return [];

        // 搜索匹配
        const results = await db.words
            .filter(w =>
                w.kanji.toLowerCase().includes(q) ||
                w.kana.toLowerCase().includes(q) ||
                w.meaning.toLowerCase().includes(q) ||
                (w.category?.toLowerCase().includes(q) ?? false) ||
                w.tags.some(t => t.toLowerCase().includes(q))
            )
            .limit(50)
            .toArray();

        return results;
    }, [query]);
};

/**
 * 获取搜索建议 (前缀匹配)
 */
export const useSearchSuggestions = (query: string, limit: number = 5): string[] | undefined => {
    return useLiveQuery(async () => {
        const q = query.trim().toLowerCase();
        if (!q || q.length < 1) return [];

        const words = await db.words
            .filter(w =>
                w.kanji.toLowerCase().startsWith(q) ||
                w.kana.toLowerCase().startsWith(q)
            )
            .limit(limit)
            .toArray();

        return [...new Set(words.map(w => w.kanji))];
    }, [query, limit]);
};
