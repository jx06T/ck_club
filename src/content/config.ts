import { defineCollection, z } from 'astro:content';

const eventsCollection = defineCollection({
    type: 'content',
    schema: ({ image }) => z.object({
        title: z.string(),
        date: z.date(),
        image: image(),
        gradientStart: z.string(),
        gradientEnd: z.string(),
        link: z.string()
    }),
});

export const collections = {
    'events': eventsCollection,
};