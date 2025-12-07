/**
 * TTS (Text-to-Speech) 模块
 * 使用免费的 Web Speech API 实现日语发音
 */

// 缓存日语语音
let cachedJapaneseVoice: SpeechSynthesisVoice | null = null;

/**
 * 获取日语语音
 */
const getJapaneseVoice = (): SpeechSynthesisVoice | null => {
    if (cachedJapaneseVoice) return cachedJapaneseVoice;

    const voices = speechSynthesis.getVoices();
    // 优先查找日语女声
    cachedJapaneseVoice = voices.find(v => v.lang === 'ja-JP' && v.name.includes('Female'))
        || voices.find(v => v.lang === 'ja-JP')
        || voices.find(v => v.lang.startsWith('ja'))
        || null;

    return cachedJapaneseVoice;
};

/**
 * 朗读日语文本
 * @param text - 要朗读的日语文本
 * @param rate - 语速 (0.5 - 2.0，默认 0.9)
 */
export const speak = (text: string, rate: number = 0.9): void => {
    // 如果正在朗读，先停止
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = Math.max(0.5, Math.min(2.0, rate));
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = getJapaneseVoice();
    if (voice) {
        utterance.voice = voice;
    }

    speechSynthesis.speak(utterance);
};

/**
 * 停止朗读
 */
export const stopSpeaking = (): void => {
    speechSynthesis.cancel();
};

/**
 * 检查 TTS 是否可用
 */
export const isTTSAvailable = (): boolean => {
    return 'speechSynthesis' in window;
};

/**
 * 预加载语音（在页面加载时调用）
 * 某些浏览器需要先调用 getVoices 才能使用
 */
export const preloadVoices = (): Promise<void> => {
    return new Promise((resolve) => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            getJapaneseVoice();
            resolve();
        } else {
            speechSynthesis.addEventListener('voiceschanged', () => {
                getJapaneseVoice();
                resolve();
            }, { once: true });
        }
    });
};
