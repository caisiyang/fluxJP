
import { Scenario } from '../types';

export const SCENARIOS: Scenario[] = [
    {
        id: 'konbini-basic',
        title: '便利店新手',
        description: '在便利店买东西的基本对话。',
        difficulty: 1,
        category: 'Daily Life',
        icon: 'Store',
        // Assuming IDs based on n5_vocabulary.ts (approximate, needs matching)
        // 100+ IDs are generated in n5_vocabulary.ts
        wordIds: [100, 101, 103, 104, 110, 111] // おはよう, こんにちは, ありがとう, すみません, 円, 店
    },
    {
        id: 'restaurant-order',
        title: '餐厅点餐',
        description: '如何点餐和结账。',
        difficulty: 2,
        category: 'Food',
        icon: 'Utensils',
        wordIds: [124, 135, 146, 155, 165, 186, 113, 110] // 吃, 喝, 水, 肉, 鱼, 好吃, 店, 円
    },
    {
        id: 'ask-directions',
        title: '问路指南',
        description: '迷路了怎么办？学会问路。',
        difficulty: 2,
        category: 'Travel',
        icon: 'MapPin',
        wordIds: [198, 208, 228, 237, 248, 258, 268] // 车站, 电车, 去, 来, 走路, 右, 左
    },
    {
        id: 'self-intro',
        title: '自我介绍',
        description: '向新朋友介绍自己。',
        difficulty: 1,
        category: 'Social',
        icon: 'User',
        wordIds: [394, 404, 414, 424, 434, 538] // 人, 朋友, 家人, 妈妈, 爸爸, 说
    }
];
