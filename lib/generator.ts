
import { Word, GrammarPattern, Sentence } from '../types';

export const GRAMMAR_PATTERNS: GrammarPattern[] = [
    {
        id: 'desu-basic',
        structure: '{Noun} は {Adjective} です。',
        level: 'N5',
        requiredParts: ['名词', '形容词'],
        description: 'Basic Description (A is B)'
    },
    {
        id: 'masu-verb',
        structure: '{Noun} を {Verb-masu}。',
        level: 'N5',
        requiredParts: ['名词|food', '动词|eat_drink'],
        // Note: Simple tagging for now. 
        // Ideally we need sub-categories like 'transitive verb' etc.
        // For this prototype, we'll try to match broad categories.
        description: 'Action (Do X)'
    },
    {
        id: 'movement',
        structure: '{Place} に {Verb-move}。',
        level: 'N5',
        requiredParts: ['场所', '动词|move'],
        description: 'Movement (Go to X)'
    }
];

// Helper to conjugate verbs to Masu form (Simplified)
// This is a very basic rule-based conjugator. 
// Real Japanese conjugation is complex, this is a placeholder.
const toMasuForm = (verb: string): string => {
    if (verb.endsWith('る')) return verb.slice(0, -1) + 'ます';
    if (verb.endsWith('く')) return verb.slice(0, -1) + 'きます';
    if (verb.endsWith('す')) return verb.slice(0, -1) + 'します';
    if (verb.endsWith('む')) return verb.slice(0, -1) + 'みます';
    if (verb.endsWith('ぬ')) return verb.slice(0, -1) + 'にます';
    if (verb.endsWith('ぶ')) return verb.slice(0, -1) + 'びます';
    if (verb.endsWith('う')) return verb.slice(0, -1) + 'います';
    if (verb.endsWith('つ')) return verb.slice(0, -1) + 'ちます';
    return verb; // Fallback
};

export const generateSentences = (
    availableWords: Word[],
    count: number = 5
): Sentence[] => {
    const sentences: Sentence[] = [];

    // Filter useful words
    const nouns = availableWords.filter(w => w.partOfSpeech === '名词');
    const adjs = availableWords.filter(w => w.partOfSpeech === '形容词');
    const verbs = availableWords.filter(w => w.partOfSpeech === '动词');

    // Specific subsets for better logical matches (very basic semantic matching)
    const places = nouns.filter(w => w.tags.includes('place'));
    const foods = nouns.filter(w => w.tags.includes('food'));
    const moveVerbs = verbs.filter(w => w.kanji === '行く' || w.kanji === '来る' || w.kanji === '帰る');
    const eatVerbs = verbs.filter(w => w.kanji === '食べる' || w.kanji === '飲む');

    for (let i = 0; i < count; i++) {
        const pattern = GRAMMAR_PATTERNS[Math.floor(Math.random() * GRAMMAR_PATTERNS.length)];
        let sent: Sentence | null = null;

        if (pattern.id === 'desu-basic' && nouns.length > 0 && adjs.length > 0) {
            const n = nouns[Math.floor(Math.random() * nouns.length)];
            const a = adjs[Math.floor(Math.random() * adjs.length)];
            sent = {
                id: Date.now() + i,
                japanese: `${n.kanji}は${a.kanji}です。`, // Ideally handle kana reading vs kanji display
                english: `${n.meaning} is ${a.meaning}.`,
                wordIds: [n.id!, a.id!], // Ensure IDs exist
                grammar: 'N5-Desu',
                source: 'Gen-AI-Template'
            };
        } else if (pattern.id === 'movement' && places.length > 0 && moveVerbs.length > 0) {
            const p = places[Math.floor(Math.random() * places.length)];
            const v = moveVerbs[Math.floor(Math.random() * moveVerbs.length)];
            const vMasu = toMasuForm(v.kanji);
            sent = {
                id: Date.now() + i,
                japanese: `${p.kanji}に${vMasu}。`,
                english: `(I) go/come to ${p.meaning}.`,
                wordIds: [p.id!, v.id!],
                grammar: 'N5-Movement',
                source: 'Gen-AI-Template'
            };
        } else if (pattern.id === 'masu-verb' && foods.length > 0 && eatVerbs.length > 0) {
            const f = foods[Math.floor(Math.random() * foods.length)];
            const v = eatVerbs[Math.floor(Math.random() * eatVerbs.length)];
            const vMasu = toMasuForm(v.kanji);
            sent = {
                id: Date.now() + i,
                japanese: `${f.kanji}を${vMasu}。`,
                english: `(I) consume ${f.meaning}.`,
                wordIds: [f.id!, v.id!],
                grammar: 'N5-Verbs',
                source: 'Gen-AI-Template'
            };
        }

        if (sent) {
            sentences.push(sent);
        }
    }

    return sentences;
};
