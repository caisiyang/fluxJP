/**
 * TTS (Text-to-Speech) 模块
 * 优先级: StreamElements (Mizuki) -> Google Translate -> Native Web Speech API
 */

let currentAudio: HTMLAudioElement | null = null;

// 缓存日语语音 (Native)
let cachedJapaneseVoice: SpeechSynthesisVoice | null = null;

/**
 * 获取 Native 日语语音
 */
const getNativeVoice = (): SpeechSynthesisVoice | null => {
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
 * 停止当前朗读
 */
export const stopSpeaking = (): void => {
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
    if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
    }
};

/**
 * 播放网络音频 (通过 Fetch Blob 方式，避免部分 CORS/Hotlink 问题)
 */
const playOnlineAudio = async (url: string, rate: number): Promise<void> => {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);

        return new Promise((resolve, reject) => {
            const audio = new Audio(blobUrl);
            audio.playbackRate = rate;

            audio.onended = () => {
                currentAudio = null;
                URL.revokeObjectURL(blobUrl); // 清理内存
                resolve();
            };

            audio.onerror = (e) => {
                currentAudio = null;
                URL.revokeObjectURL(blobUrl);
                // 尝试获取更多错误信息
                const errorMsg = (audio.error) ? `Code: ${audio.error.code}, Message: ${audio.error.message}` : 'Unknown Audio Error';
                reject(new Error(errorMsg));
            };

            currentAudio = audio;
            audio.play().catch(err => {
                URL.revokeObjectURL(blobUrl);
                reject(err);
            });
        });
    } catch (err) {
        throw err;
    }
};

/**
 * Native TTS Fallback
 */
const speakNative = (text: string, rate: number) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'ja-JP';
    utterance.rate = Math.max(0.5, Math.min(2.0, rate));
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    const voice = getNativeVoice();
    if (voice) {
        utterance.voice = voice;
    }

    speechSynthesis.speak(utterance);
};

/**
 * 朗读日语文本
 * @param text - 要朗读的日语文本
 * @param rate - 语速 (0.5 - 2.0，默认 0.9)
 */
export const speak = async (text: string, rate: number = 0.9): Promise<void> => {
    stopSpeaking();

    if (!text) return;

    // 1. Try StreamElements (Mizuki - High Quality Neural)
    try {
        const url = `https://api.streamelements.com/kappa/v2/speech?voice=Mizuki&text=${encodeURIComponent(text)}`;
        await playOnlineAudio(url, rate);
        return;
    } catch (e) {
        console.warn('StreamElements TTS failed, trying Google...', e);
    }

    // 2. Try Google Translate TTS (Unofficial)
    try {
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=ja&client=tw-ob`;
        await playOnlineAudio(url, rate);
        return;
    } catch (e) {
        console.warn('Google TTS failed, falling back to Native...', e);
    }

    // 3. Fallback to Native
    speakNative(text, rate);
};

/**
 * 检查 TTS 是否可用
 */
export const isTTSAvailable = (): boolean => {
    return 'speechSynthesis' in window || 'Audio' in window;
};

/**
 * 预加载 Native 语音
 */
export const preloadVoices = (): Promise<void> => {
    return new Promise((resolve) => {
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
            getNativeVoice();
            resolve();
        } else {
            speechSynthesis.addEventListener('voiceschanged', () => {
                getNativeVoice();
                resolve();
            }, { once: true });
        }
    });
};
