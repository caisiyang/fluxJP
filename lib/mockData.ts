import { Word, Sentence, WordStatus } from '../types';

/**
 * Mock 数据 - 用于初始化和演示
 */
const MOCK_WORDS: Partial<Word>[] = [
  {
    kanji: "猫",
    kana: "ねこ",
    meaning: "猫",
    level: "N5",
    tags: ['basic', 'animal'],
    category: "动物",
    partOfSpeech: "名词",
    mnemonic: "发音像 'Ne-ko' (睡着的猫)。",
    etymology: "部首 犭(兽) + 苗 (声旁/幼苗)。",
    examples: [
      { jp: "猫はこたつで丸くなる。", en: "猫在暖炉桌下缩成一团。" },
      { jp: "黒い猫を見ました。", en: "我看见了一只黑猫。" }
    ]
  },
  {
    kanji: "犬",
    kana: "いぬ",
    meaning: "狗",
    level: "N5",
    tags: ['basic', 'animal'],
    category: "动物",
    partOfSpeech: "名词",
    examples: [
      { jp: "犬が走っています。", en: "狗在跑。" }
    ]
  },
  {
    kanji: "学生",
    kana: "がくせい",
    meaning: "学生",
    level: "N5",
    tags: ['basic', 'people'],
    category: "人物",
    partOfSpeech: "名词",
    mnemonic: "Gaku (学) + Sei (生)。",
    etymology: "学 (学习) + 生 (生命/人)。",
    examples: [
      { jp: "私は日本語の学生です。", en: "我是日语专业的学生。" }
    ]
  },
  {
    kanji: "先生",
    kana: "せんせい",
    meaning: "老师",
    level: "N5",
    tags: ['basic', 'people'],
    category: "人物",
    partOfSpeech: "名词",
    examples: [
      { jp: "先生、質問があります。", en: "老师，我有问题。" }
    ]
  },
  {
    kanji: "図書館",
    kana: "としょかん",
    meaning: "图书馆",
    level: "N5",
    tags: ['basic', 'place'],
    category: "场所",
    partOfSpeech: "名词",
    mnemonic: "To (图) + Sho (书) + Kan (馆)。",
    etymology: "标准合成词。",
    examples: [
      { jp: "図書館で勉強します。", en: "在图书馆学习。" }
    ]
  },
  {
    kanji: "世界",
    kana: "せかい",
    meaning: "世界",
    level: "N4",
    tags: ['basic'],
    category: "基础名词",
    partOfSpeech: "名词",
    mnemonic: "Se (世) + Kai (界)。",
    etymology: "源自佛教用语。",
    examples: [
      { jp: "世界中を旅する。", en: "环游世界。" }
    ]
  },
  {
    kanji: "天気",
    kana: "てんき",
    meaning: "天气",
    level: "N5",
    tags: ['basic', 'weather'],
    category: "天气",
    partOfSpeech: "名词",
    examples: [
      { jp: "今日はいい天気ですね。", en: "今天天气真好啊。" }
    ]
  },
  // --- Japanese Elementary School Textbook Words ---
  {
    kanji: "学校",
    kana: "がっこう",
    meaning: "学校",
    level: "Elementary",
    tags: ['basic', 'place', 'school'],
    category: "学校生活",
    partOfSpeech: "名词",
    mnemonic: "像 'Gecko' (壁虎) 去学校。",
    etymology: "学 (学习) + 校 (场所)。",
    examples: [
      { jp: "毎日、学校へ行きます。", en: "每天去学校。" }
    ]
  },
  {
    kanji: "友達",
    kana: "ともだち",
    meaning: "朋友",
    level: "Elementary",
    tags: ['basic', 'people'],
    category: "人物",
    partOfSpeech: "名词",
    mnemonic: "Ko 'domo' (小孩) 和 'tachi' (复数) -> Tomo-dachi。",
    etymology: "友 (友人) + 達 (复数后缀)。",
    examples: [
      { jp: "友達と遊びます。", en: "和朋友玩。" }
    ]
  },
  {
    kanji: "鉛筆",
    kana: "えんぴつ",
    meaning: "铅笔",
    level: "Elementary",
    tags: ['basic', 'tool'],
    category: "文具",
    partOfSpeech: "名词",
    examples: [
      { jp: "鉛筆で字を書きます。", en: "用铅笔写字。" }
    ]
  },
  {
    kanji: "給食",
    kana: "きゅうしょく",
    meaning: "学校供餐",
    level: "Elementary",
    tags: ['school', 'food'],
    category: "学校生活",
    partOfSpeech: "名词",
    etymology: "給 (供给) + 食 (食物)。",
    examples: [
      { jp: "今日の給食はカレーです。", en: "今天的供餐是咖喱。" }
    ]
  },
  {
    kanji: "日直",
    kana: "にっちょく",
    meaning: "值日生",
    level: "Elementary",
    tags: ['school', 'role'],
    category: "学校生活",
    partOfSpeech: "名词",
    mnemonic: "Ni (日) + Choku (直班)。",
    examples: [
      { jp: "明日は日直です。", en: "明天我是值日生。" }
    ]
  },
  {
    kanji: "ランドセル",
    kana: "らんどせる",
    meaning: "双肩书包 (小学生用)",
    level: "Elementary",
    tags: ['school', 'tool'],
    category: "文具",
    partOfSpeech: "名词",
    etymology: "源自荷兰语 'ransel' (背包)。",
    examples: [
      { jp: "赤いランドセルを買いました。", en: "买了红色的书包。" }
    ]
  },
  {
    kanji: "掃除",
    kana: "そうじ",
    meaning: "打扫",
    level: "Elementary",
    tags: ['activity', 'school'],
    category: "生活",
    partOfSpeech: "名词/动词",
    examples: [
      { jp: "教室の掃除をします。", en: "打扫教室。" }
    ]
  }
];

/**
 * 生成带有默认SRS字段的词汇数据
 */
export const generateMockWords = (): Word[] => {
  const now = Date.now();
  return MOCK_WORDS.map((w, i) => ({
    ...w,
    id: i + 1,
    status: WordStatus.NEW,
    interval: 0,
    easeFactor: 2.5,
    dueDate: now,
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
    wordIds: [6]
  },
  {
    id: 4,
    japanese: "今日は天気がいいですね。",
    english: "今天天气真好啊。",
    grammar: "【は】主题标记；【が】主语标记（小主语）；【ね】表示确认或感叹的语气助词。",
    wordIds: [7]
  },
  {
    id: 5,
    japanese: "先生は学生に日本語を教えます。",
    english: "老师教学生日语。",
    grammar: "【に】间接宾语标记（对象）；【を】直接宾语标记；【教えます】授受动词。",
    wordIds: [3, 4]
  }
];