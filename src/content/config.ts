import { defineCollection, z } from 'astro:content';

const eventsCollection = defineCollection({
    type: 'content',
    schema: ({ image }) => z.object({
        title: z.string(),
        date: z.date(),
        image: image(),
        gradientStart: z.string(),
        gradientEnd: z.string(),
        link: z.string(),
        ctaTitle: z.string(),
        organizer: z.string()
    }),
});

const clubsCollection = defineCollection({
    type: 'content',
    schema: ({ image }) => z.object({
        // --- 基本資訊 ---
        timestamp: z.date(),
        clubCode: z.string(),
        name: z.string(),
        summary: z.string(),

        profileImage: image(),
        coverImage: image(),

        // --- 詳細資料 ---
        members: z.object({
            current: z.string(),
            previousYear: z.string(),
        }),

        // 可能是空字串
        membershipFee: z.string().optional(),

        activities: z.array(z.string()),
        workshops: z.object({
            has: z.boolean(),
            description: z.string(),
        }),

        // --- 標籤與分類 ---
        tags: z.array(z.string()),

        // --- 布林值旗標 ---
        attendsExpo: z.boolean(),
        hasClubStamp: z.boolean(),
        acceptsUnofficial: z.boolean(),

        // --- 幹部 ---
        officers: z.array(
            z.object({
                title: z.string(),
                name: z.string(),
                contact: z.string().optional(),
            })
        ),
        links: z.array(
            z.object({
                platform: z.string(),
                handle: z.string(),
                url: z.string().url(),
            })
        ),

        mapId: z.string().optional(),
    }),
});


export const collections = {
    'events': eventsCollection,
    'clubs': clubsCollection,
};