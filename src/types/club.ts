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

    profileImage: ImageMetadata;
    coverImage: ImageMetadata;

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

    mapId?: string;

    // 👇 加上 slug
    slug: string;
};
