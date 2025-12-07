/**
 * N5 核心词汇数据 - 日常生活场景
 * 约100个高频日常词汇 (完整版应有800+)
 */
import { Word, WordStatus } from '../types';

const N5_VOCABULARY_DATA: Omit<Word, 'id' | 'status' | 'interval' | 'easeFactor' | 'dueDate' | 'reviewCount' | 'leechCount'>[] = [
    // === 日常问候 ===
    {
        kanji: "おはよう",
        kana: "おはよう",
        meaning: "早上好",
        level: "N5",
        tags: ["greeting", "basic"],
        category: "日常问候",
        partOfSpeech: "感叹词",
        examples: [{ jp: "おはようございます。", en: "早上好（敬语）。" }]
    },
    {
        kanji: "こんにちは",
        kana: "こんにちは",
        meaning: "你好",
        level: "N5",
        tags: ["greeting", "basic"],
        category: "日常问候",
        partOfSpeech: "感叹词",
        examples: [{ jp: "こんにちは、元気ですか？", en: "你好，你好吗？" }]
    },
    {
        kanji: "こんばんは",
        kana: "こんばんは",
        meaning: "晚上好",
        level: "N5",
        tags: ["greeting", "basic"],
        category: "日常问候",
        partOfSpeech: "感叹词",
        examples: [{ jp: "こんばんは、今日はどうでしたか？", en: "晚上好，今天怎么样？" }]
    },
    {
        kanji: "ありがとう",
        kana: "ありがとう",
        meaning: "谢谢",
        level: "N5",
        tags: ["greeting", "basic"],
        category: "日常问候",
        partOfSpeech: "感叹词",
        mnemonic: "阿里嘎多(谐音)",
        examples: [{ jp: "ありがとうございます。", en: "非常感谢。" }]
    },
    {
        kanji: "すみません",
        kana: "すみません",
        meaning: "对不起/打扰一下",
        level: "N5",
        tags: ["greeting", "basic"],
        category: "日常问候",
        partOfSpeech: "感叹词",
        examples: [{ jp: "すみません、ちょっといいですか？", en: "打扰一下，可以吗？" }]
    },

    // === 购物 ===
    {
        kanji: "買う",
        kana: "かう",
        meaning: "买",
        level: "N5",
        tags: ["shopping", "verb"],
        category: "购物",
        partOfSpeech: "动词",
        examples: [{ jp: "りんごを買います。", en: "我买苹果。" }]
    },
    {
        kanji: "売る",
        kana: "うる",
        meaning: "卖",
        level: "N5",
        tags: ["shopping", "verb"],
        category: "购物",
        partOfSpeech: "动词",
        examples: [{ jp: "この店は野菜を売っています。", en: "这家店卖蔬菜。" }]
    },
    {
        kanji: "高い",
        kana: "たかい",
        meaning: "贵/高",
        level: "N5",
        tags: ["shopping", "adjective"],
        category: "购物",
        partOfSpeech: "形容词",
        examples: [{ jp: "このバッグは高いです。", en: "这个包很贵。" }]
    },
    {
        kanji: "安い",
        kana: "やすい",
        meaning: "便宜",
        level: "N5",
        tags: ["shopping", "adjective"],
        category: "购物",
        partOfSpeech: "形容词",
        examples: [{ jp: "この服は安いです。", en: "这件衣服很便宜。" }]
    },
    {
        kanji: "円",
        kana: "えん",
        meaning: "日元",
        level: "N5",
        tags: ["shopping", "noun"],
        category: "购物",
        partOfSpeech: "名词",
        examples: [{ jp: "これは500円です。", en: "这是500日元。" }]
    },
    {
        kanji: "店",
        kana: "みせ",
        meaning: "店",
        level: "N5",
        tags: ["shopping", "noun"],
        category: "购物",
        partOfSpeech: "名词",
        examples: [{ jp: "あの店は有名です。", en: "那家店很有名。" }]
    },

    // === 餐厅/饮食 ===
    {
        kanji: "食べる",
        kana: "たべる",
        meaning: "吃",
        level: "N5",
        tags: ["food", "verb"],
        category: "餐厅",
        partOfSpeech: "动词",
        mnemonic: "太补了(谐音)",
        examples: [{ jp: "寿司を食べます。", en: "我吃寿司。" }]
    },
    {
        kanji: "飲む",
        kana: "のむ",
        meaning: "喝",
        level: "N5",
        tags: ["food", "verb"],
        category: "餐厅",
        partOfSpeech: "动词",
        examples: [{ jp: "お茶を飲みます。", en: "我喝茶。" }]
    },
    {
        kanji: "水",
        kana: "みず",
        meaning: "水",
        level: "N5",
        tags: ["food", "noun"],
        category: "餐厅",
        partOfSpeech: "名词",
        examples: [{ jp: "水をください。", en: "请给我水。" }]
    },
    {
        kanji: "肉",
        kana: "にく",
        meaning: "肉",
        level: "N5",
        tags: ["food", "noun"],
        category: "餐厅",
        partOfSpeech: "名词",
        examples: [{ jp: "豚肉が好きです。", en: "我喜欢猪肉。" }]
    },
    {
        kanji: "魚",
        kana: "さかな",
        meaning: "鱼",
        level: "N5",
        tags: ["food", "noun"],
        category: "餐厅",
        partOfSpeech: "名词",
        examples: [{ jp: "魚を焼きます。", en: "我烤鱼。" }]
    },
    {
        kanji: "野菜",
        kana: "やさい",
        meaning: "蔬菜",
        level: "N5",
        tags: ["food", "noun"],
        category: "餐厅",
        partOfSpeech: "名词",
        examples: [{ jp: "野菜を食べましょう。", en: "吃蔬菜吧。" }]
    },
    {
        kanji: "おいしい",
        kana: "おいしい",
        meaning: "好吃",
        level: "N5",
        tags: ["food", "adjective"],
        category: "餐厅",
        partOfSpeech: "形容词",
        examples: [{ jp: "このラーメンはおいしいです。", en: "这拉面很好吃。" }]
    },

    // === 交通 ===
    {
        kanji: "駅",
        kana: "えき",
        meaning: "车站",
        level: "N5",
        tags: ["transport", "noun"],
        category: "交通",
        partOfSpeech: "名词",
        examples: [{ jp: "駅はどこですか？", en: "车站在哪里？" }]
    },
    {
        kanji: "電車",
        kana: "でんしゃ",
        meaning: "电车",
        level: "N5",
        tags: ["transport", "noun"],
        category: "交通",
        partOfSpeech: "名词",
        examples: [{ jp: "電車で行きます。", en: "坐电车去。" }]
    },
    {
        kanji: "バス",
        kana: "バス",
        meaning: "公交车",
        level: "N5",
        tags: ["transport", "noun"],
        category: "交通",
        partOfSpeech: "名词",
        examples: [{ jp: "バスに乗ります。", en: "乘坐公交车。" }]
    },
    {
        kanji: "行く",
        kana: "いく",
        meaning: "去",
        level: "N5",
        tags: ["transport", "verb"],
        category: "交通",
        partOfSpeech: "动词",
        examples: [{ jp: "学校に行きます。", en: "去学校。" }]
    },
    {
        kanji: "来る",
        kana: "くる",
        meaning: "来",
        level: "N5",
        tags: ["transport", "verb"],
        category: "交通",
        partOfSpeech: "动词",
        examples: [{ jp: "友達が来ます。", en: "朋友来了。" }]
    },
    {
        kanji: "歩く",
        kana: "あるく",
        meaning: "走路",
        level: "N5",
        tags: ["transport", "verb"],
        category: "交通",
        partOfSpeech: "动词",
        examples: [{ jp: "公園を歩きます。", en: "在公园散步。" }]
    },
    {
        kanji: "右",
        kana: "みぎ",
        meaning: "右",
        level: "N5",
        tags: ["direction", "noun"],
        category: "交通",
        partOfSpeech: "名词",
        examples: [{ jp: "右に曲がってください。", en: "请右转。" }]
    },
    {
        kanji: "左",
        kana: "ひだり",
        meaning: "左",
        level: "N5",
        tags: ["direction", "noun"],
        category: "交通",
        partOfSpeech: "名词",
        examples: [{ jp: "左にあります。", en: "在左边。" }]
    },

    // === 时间 ===
    {
        kanji: "今日",
        kana: "きょう",
        meaning: "今天",
        level: "N5",
        tags: ["time", "noun"],
        category: "时间",
        partOfSpeech: "名词",
        examples: [{ jp: "今日は何曜日ですか？", en: "今天星期几？" }]
    },
    {
        kanji: "明日",
        kana: "あした",
        meaning: "明天",
        level: "N5",
        tags: ["time", "noun"],
        category: "时间",
        partOfSpeech: "名词",
        examples: [{ jp: "明日会いましょう。", en: "明天见。" }]
    },
    {
        kanji: "昨日",
        kana: "きのう",
        meaning: "昨天",
        level: "N5",
        tags: ["time", "noun"],
        category: "时间",
        partOfSpeech: "名词",
        examples: [{ jp: "昨日は忙しかったです。", en: "昨天很忙。" }]
    },
    {
        kanji: "朝",
        kana: "あさ",
        meaning: "早上",
        level: "N5",
        tags: ["time", "noun"],
        category: "时间",
        partOfSpeech: "名词",
        examples: [{ jp: "朝ごはんを食べます。", en: "吃早饭。" }]
    },
    {
        kanji: "夜",
        kana: "よる",
        meaning: "晚上",
        level: "N5",
        tags: ["time", "noun"],
        category: "时间",
        partOfSpeech: "名词",
        examples: [{ jp: "夜に勉強します。", en: "晚上学习。" }]
    },
    {
        kanji: "今",
        kana: "いま",
        meaning: "现在",
        level: "N5",
        tags: ["time", "noun"],
        category: "时间",
        partOfSpeech: "名词",
        examples: [{ jp: "今、何時ですか？", en: "现在几点？" }]
    },

    // === 数字/量词 ===
    {
        kanji: "一",
        kana: "いち",
        meaning: "一",
        level: "N5",
        tags: ["number", "noun"],
        category: "数字",
        partOfSpeech: "数词",
        examples: [{ jp: "りんごを一つください。", en: "请给我一个苹果。" }]
    },
    {
        kanji: "二",
        kana: "に",
        meaning: "二",
        level: "N5",
        tags: ["number", "noun"],
        category: "数字",
        partOfSpeech: "数词",
        examples: [{ jp: "二人で行きます。", en: "两个人去。" }]
    },
    {
        kanji: "三",
        kana: "さん",
        meaning: "三",
        level: "N5",
        tags: ["number", "noun"],
        category: "数字",
        partOfSpeech: "数词",
        examples: [{ jp: "三時に会いましょう。", en: "三点见。" }]
    },
    {
        kanji: "百",
        kana: "ひゃく",
        meaning: "百",
        level: "N5",
        tags: ["number", "noun"],
        category: "数字",
        partOfSpeech: "数词",
        examples: [{ jp: "百円です。", en: "一百日元。" }]
    },
    {
        kanji: "千",
        kana: "せん",
        meaning: "千",
        level: "N5",
        tags: ["number", "noun"],
        category: "数字",
        partOfSpeech: "数词",
        examples: [{ jp: "千円札を持っています。", en: "我有一千日元纸币。" }]
    },

    // === 家庭/人物 ===
    {
        kanji: "人",
        kana: "ひと",
        meaning: "人",
        level: "N5",
        tags: ["people", "noun"],
        category: "人物",
        partOfSpeech: "名词",
        examples: [{ jp: "あの人は誰ですか？", en: "那个人是谁？" }]
    },
    {
        kanji: "友達",
        kana: "ともだち",
        meaning: "朋友",
        level: "N5",
        tags: ["people", "noun"],
        category: "人物",
        partOfSpeech: "名词",
        examples: [{ jp: "友達と遊びます。", en: "和朋友玩。" }]
    },
    {
        kanji: "家族",
        kana: "かぞく",
        meaning: "家人",
        level: "N5",
        tags: ["family", "noun"],
        category: "人物",
        partOfSpeech: "名词",
        examples: [{ jp: "家族は四人です。", en: "家人有四口人。" }]
    },
    {
        kanji: "母",
        kana: "はは",
        meaning: "妈妈",
        level: "N5",
        tags: ["family", "noun"],
        category: "人物",
        partOfSpeech: "名词",
        examples: [{ jp: "母は料理が上手です。", en: "妈妈做饭很厉害。" }]
    },
    {
        kanji: "父",
        kana: "ちち",
        meaning: "爸爸",
        level: "N5",
        tags: ["family", "noun"],
        category: "人物",
        partOfSpeech: "名词",
        examples: [{ jp: "父は会社員です。", en: "爸爸是公司职员。" }]
    },

    // === 场所 ===
    {
        kanji: "学校",
        kana: "がっこう",
        meaning: "学校",
        level: "N5",
        tags: ["place", "noun"],
        category: "场所",
        partOfSpeech: "名词",
        examples: [{ jp: "学校に行きます。", en: "去学校。" }]
    },
    {
        kanji: "病院",
        kana: "びょういん",
        meaning: "医院",
        level: "N5",
        tags: ["place", "noun"],
        category: "场所",
        partOfSpeech: "名词",
        examples: [{ jp: "病院に行かなければなりません。", en: "必须去医院。" }]
    },
    {
        kanji: "銀行",
        kana: "ぎんこう",
        meaning: "银行",
        level: "N5",
        tags: ["place", "noun"],
        category: "场所",
        partOfSpeech: "名词",
        examples: [{ jp: "銀行でお金をおろします。", en: "在银行取钱。" }]
    },
    {
        kanji: "郵便局",
        kana: "ゆうびんきょく",
        meaning: "邮局",
        level: "N5",
        tags: ["place", "noun"],
        category: "场所",
        partOfSpeech: "名词",
        examples: [{ jp: "郵便局で手紙を送ります。", en: "在邮局寄信。" }]
    },
    {
        kanji: "会社",
        kana: "かいしゃ",
        meaning: "公司",
        level: "N5",
        tags: ["place", "noun"],
        category: "场所",
        partOfSpeech: "名词",
        examples: [{ jp: "会社で働いています。", en: "在公司工作。" }]
    },

    // === 常用动词 ===
    {
        kanji: "見る",
        kana: "みる",
        meaning: "看",
        level: "N5",
        tags: ["verb", "basic"],
        category: "基础动词",
        partOfSpeech: "动词",
        examples: [{ jp: "テレビを見ます。", en: "看电视。" }]
    },
    {
        kanji: "聞く",
        kana: "きく",
        meaning: "听/问",
        level: "N5",
        tags: ["verb", "basic"],
        category: "基础动词",
        partOfSpeech: "动词",
        examples: [{ jp: "音楽を聞きます。", en: "听音乐。" }]
    },
    {
        kanji: "書く",
        kana: "かく",
        meaning: "写",
        level: "N5",
        tags: ["verb", "basic"],
        category: "基础动词",
        partOfSpeech: "动词",
        examples: [{ jp: "手紙を書きます。", en: "写信。" }]
    },
    {
        kanji: "読む",
        kana: "よむ",
        meaning: "读",
        level: "N5",
        tags: ["verb", "basic"],
        category: "基础动词",
        partOfSpeech: "动词",
        examples: [{ jp: "本を読みます。", en: "读书。" }]
    },
    {
        kanji: "話す",
        kana: "はなす",
        meaning: "说",
        level: "N5",
        tags: ["verb", "basic"],
        category: "基础动词",
        partOfSpeech: "动词",
        examples: [{ jp: "日本語を話します。", en: "说日语。" }]
    },
    {
        kanji: "する",
        kana: "する",
        meaning: "做",
        level: "N5",
        tags: ["verb", "basic"],
        category: "基础动词",
        partOfSpeech: "动词",
        examples: [{ jp: "宿題をします。", en: "做作业。" }]
    },
    {
        kanji: "ある",
        kana: "ある",
        meaning: "有(物)",
        level: "N5",
        tags: ["verb", "basic"],
        category: "基础动词",
        partOfSpeech: "动词",
        examples: [{ jp: "机の上に本があります。", en: "桌上有书。" }]
    },
    {
        kanji: "いる",
        kana: "いる",
        meaning: "有(人/动物)",
        level: "N5",
        tags: ["verb", "basic"],
        category: "基础动词",
        partOfSpeech: "动词",
        examples: [{ jp: "猫がいます。", en: "有猫。" }]
    },

    // === 常用形容词 ===
    {
        kanji: "大きい",
        kana: "おおきい",
        meaning: "大",
        level: "N5",
        tags: ["adjective", "basic"],
        category: "基础形容词",
        partOfSpeech: "形容词",
        examples: [{ jp: "大きい家です。", en: "大房子。" }]
    },
    {
        kanji: "小さい",
        kana: "ちいさい",
        meaning: "小",
        level: "N5",
        tags: ["adjective", "basic"],
        category: "基础形容词",
        partOfSpeech: "形容词",
        examples: [{ jp: "小さい犬がいます。", en: "有只小狗。" }]
    },
    {
        kanji: "新しい",
        kana: "あたらしい",
        meaning: "新",
        level: "N5",
        tags: ["adjective", "basic"],
        category: "基础形容词",
        partOfSpeech: "形容词",
        examples: [{ jp: "新しい車を買いました。", en: "买了新车。" }]
    },
    {
        kanji: "古い",
        kana: "ふるい",
        meaning: "旧",
        level: "N5",
        tags: ["adjective", "basic"],
        category: "基础形容词",
        partOfSpeech: "形容词",
        examples: [{ jp: "古い神社を見ました。", en: "看了古老的神社。" }]
    },
    {
        kanji: "いい",
        kana: "いい",
        meaning: "好",
        level: "N5",
        tags: ["adjective", "basic"],
        category: "基础形容词",
        partOfSpeech: "形容词",
        examples: [{ jp: "いい天気ですね。", en: "天气真好啊。" }]
    },
    {
        kanji: "悪い",
        kana: "わるい",
        meaning: "坏",
        level: "N5",
        tags: ["adjective", "basic"],
        category: "基础形容词",
        partOfSpeech: "形容词",
        examples: [{ jp: "気分が悪いです。", en: "感觉不舒服。" }]
    }
];

/**
 * 生成带有默认SRS字段的N5词汇
 */
export const generateN5Words = (): Word[] => {
    const now = Date.now();
    return N5_VOCABULARY_DATA.map((w, i) => ({
        ...w,
        id: 100 + i, // 从100开始避免与mock数据冲突
        status: WordStatus.NEW,
        interval: 0,
        easeFactor: 2.5,
        dueDate: now,
        reviewCount: 0,
        leechCount: 0,
    } as Word));
};

export const N5_VOCAB_PACK = {
    id: 'n5-daily',
    name: 'N5 日常词汇',
    description: '日本语能力测试N5级别日常生活高频词汇',
    level: 'N5',
    wordCount: N5_VOCABULARY_DATA.length,
    categories: [...new Set(N5_VOCABULARY_DATA.map(w => w.category).filter(Boolean))]
};
