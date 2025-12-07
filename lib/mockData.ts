import { Word, Sentence, WordStatus } from '../types';

const MOCK_WORDS: Partial<Word>[] = [
  {
    kanji: "猫",
    kana: "ねこ",
    meaning: "猫",
    level: "N5",
    mnemonic: "发音像 'Ne-ko' (睡着的猫)。",
    etymology: "部首 犭(兽) + 苗 (声旁/幼苗)。",
    examples: [
      { jp: "猫はこたつで丸くなる。", en: "猫在暖炉桌下缩成一团。" },
      { jp: "黒い猫を見ました。", en: "我看见了一只黑猫。" }
    ]
  },
  {
    kanji: "学生",
    kana: "がくせい",
    meaning: "学生",
    level: "N5",
    mnemonic: "Gaku (学) + Sei (生)。",
    etymology: "学 (学习) + 生 (生命/人)。",
    examples: [
      { jp: "私は日本語の学生です。", en: "我是日语专业的学生。" }
    ]
  },
  {
    kanji: "心流",
    kana: "しんりゅう",
    meaning: "心流 (心理状态)",
    level: "N1",
    mnemonic: "Shin (心) + Ryuu (流)。心中的流动。",
    etymology: "会意词。",
    examples: [
      { jp: "心流状態に入る。", en: "进入心流状态。" }
    ]
  },
  {
    kanji: "冒険",
    kana: "ぼうけん",
    meaning: "冒险",
    level: "N3",
    mnemonic: "Bou (冒) + Ken (险)。冒着危险。",
    etymology: "冒 (覆盖/冒犯) + 険 (险峻)。",
    examples: [
      { jp: "冒険に出かけよう。", en: "让我们去冒险吧。" }
    ]
  },
  {
    kanji: "図書館",
    kana: "としょかん",
    meaning: "图书馆",
    level: "N5",
    mnemonic: "To (图) + Sho (书) + Kan (馆)。",
    etymology: "标准合成词。",
    examples: [
      { jp: "図書館で勉強します。", en: "在图书馆学习。" }
    ]
  },
  {
    kanji: "食べる",
    kana: "たべる",
    meaning: "吃",
    level: "N5",
    mnemonic: "Ta-be-ru (太补了 -> 吃)。",
    etymology: "基础动词。",
    examples: [
      { jp: "寿司を食べる。", en: "吃寿司。" }
    ]
  },
  {
    kanji: "世界",
    kana: "せかい",
    meaning: "世界",
    level: "N4",
    mnemonic: "Se (世) + Kai (界)。",
    etymology: "源自佛教用语。",
    examples: [
      { jp: "世界中を旅する。", en: "环游世界。" }
    ]
  }
];

// Helper to fill basic SRS fields
export const generateMockWords = (): Word[] => {
  const now = Date.now();
  return MOCK_WORDS.map((w, i) => ({
    ...w,
    id: i + 1,
    tags: ['basic'],
    status: WordStatus.NEW,
    interval: 0,
    easeFactor: 2.5,
    dueDate: now, // Ready immediately
    reviewCount: 0,
    leechCount: 0,
  } as Word));
};

export const MOCK_SENTENCES: Sentence[] = [
  {
    id: 1,
    japanese: "猫はベッドで寝ています。",
    english: "猫正在床上睡觉。",
    grammar: "【は】主题标记；【で】表示动作发生的地点；【寝ています】正在进行时，原型为寝る(睡觉)。",
    wordIds: [1]
  },
  {
    id: 2,
    japanese: "図書館で静かにしてください。",
    english: "请在图书馆保持安静。",
    grammar: "【で】动作场所；【静かに】形容动词词干+に修饰动词；【してください】请做...（请求）。",
    wordIds: [5]
  },
  {
    id: 3,
    japanese: "新しい世界を発見する。",
    english: "发现新的世界。",
    grammar: "【新しい】一类形容词作定语；【を】宾语标记；【発見する】三类动词。",
    wordIds: [7]
  },
  {
    id: 4,
    japanese: "学生たちは冒険を求めている。",
    english: "学生们正在寻求冒险。",
    grammar: "【たち】复数后缀；【を】宾语标记；【求めている】正在寻求 (求める + ている)。",
    wordIds: [2, 4]
  }
];