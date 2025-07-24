import type { GetImageResult } from 'astro';
export interface ClubInfo {
    mapId: string;
    clubCode: string;
    name: string;
    summary: string;
    slug: string;
    tags?: string[];
}

export type Club = {
    timestamp: Date;
    clubCode: string;
    name: string;
    summary: string;

    profileImage: ImageMetadata | GetImageResult;
    bgImage: ImageMetadata | GetImageResult;
    cardImage: ImageMetadata | GetImageResult;

    members: {
        current: string;
        previousYear: string;
    };

    membershipFee?: string;

    activities: string[];
    workshops: {
        has: boolean;
        description: string;
    };

    tags: string[];

    attendsExpo: boolean;
    hasClubStamp: boolean;
    acceptsUnofficial: boolean;

    officers: {
        title: string;
        name: string;
        contact?: string;
    }[];

    links: {
        platform: string;
        handle: string;
        url: string;
    }[];

    slug: string;
};
