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
        organizer: z.string()
    }),
});

const clubsCollection = defineCollection({
    type: 'content',
    schema: ({ image }) => z.object({
        id: z.string(),
        name: z.string(),
        summary: z.string(),
        mapId: z.string()
    }),
});

export const collections = {
    'events': eventsCollection,
    'clubs': clubsCollection,
};