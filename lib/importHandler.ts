import { db } from './db';
import { Word, WordStatus } from '../types';

/**
 * Expected schema for Simple Import
 */
interface SimpleWord {
    // Matches our DB schema loosely
    kanji: string;
    kana: string;
    meaning: string;
    level?: string;
    tags?: string[];
}

/**
 * Parses and imports a JSON file into the database.
 * Uses Response.json() for efficient off-main-thread parsing of large files if supported by browser (or just native opt).
 * Batches DB writes to avoid UI freezing.
 */
export async function parseAndImportJson(
    file: File,
    onProgress: (count: number, total: number) => void
): Promise<{ added: number; skipped: number }> {

    try {
        // 1. Parse JSON
        // standard Text-based parse. For 50MB, text() then parse() is roughly same as Response.json() in RAM but Response is cleaner.
        const content = await new Response(file).json();

        if (!Array.isArray(content)) {
            throw new Error("JSON must be an array of words.");
        }

        const total = content.length;
        let processed = 0;

        // 2. Map items to Word objects
        const words: Word[] = content.map((item: any) => {
            // Auto-detect format
            let word: Partial<Word> = {
                status: WordStatus.NEW,
                interval: 0,
                easeFactor: 2.5,
                dueDate: Date.now(),
                reviewCount: 0,
                leechCount: 0,
                tags: [],
                examples: []
            };

            // Case A: Simple format (keys match DB)
            if (typeof item.kanji === 'string') {
                word.kanji = item.kanji;
                word.kana = item.kana || item.reading || ""; // Fallback
                word.meaning = item.meaning || item.gloss || "";
                word.level = (item.level as any) || 'N5';
            }
            // Case B: JMdict Simplified (Rough approximation)
            // { kanji: [{text: "..."}], kana: [{text: "..."}], sense: [{gloss: [{text: "..."}]}] }
            else if (Array.isArray(item.kanji) || Array.isArray(item.kana)) {
                word.kanji = item.kanji?.[0]?.text || item.kana?.[0]?.text || "?";
                word.kana = item.kana?.[0]?.text || "";
                // Gloss is often array of objects or strings in different versions of JMdict
                const firstSense = item.sense?.[0];
                if (firstSense && Array.isArray(firstSense.gloss)) {
                    word.meaning = firstSense.gloss.map((g: any) => g.text || g).join("; ");
                } else {
                    word.meaning = "No meaning found";
                }
                word.level = 'N5'; // Unknown from raw JMdict usually
            }
            // Case C: The template prompt user asked for: { "term": "...", "reading": "..." }
            else if (item.term) {
                word.kanji = item.term;
                word.kana = item.reading || "";
                word.meaning = item.meaning || "";
                word.level = 'N5';
            }

            // Validation
            if (!word.kanji || !word.meaning) return null; // Skip invalid
            return word as Word;
        }).filter((w): w is Word => w !== null);

        // 3. Batch insert
        const BATCH_SIZE = 2000;
        const chunks = [];
        for (let i = 0; i < words.length; i += BATCH_SIZE) {
            chunks.push(words.slice(i, i + BATCH_SIZE));
        }

        for (const chunk of chunks) {
            await db.words.bulkAdd(chunk);
            processed += chunk.length;
            onProgress(processed, total);
            // Small delay to allow UI update
            await new Promise(r => setTimeout(r, 10));
        }

        return { added: processed, skipped: total - processed };

    } catch (error) {
        console.error("Import failed:", error);
        throw error;
    }
}
