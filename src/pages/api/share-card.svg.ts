import type { APIRoute } from 'astro';
import { toString as qrCodeToString } from 'qrcode';

import { satori } from "@cf-wasm/satori";
// import { satori } from "@cf-wasm/satori/node";

import { clubMappings } from '@data/clubFair';
import { getCollection } from 'astro:content';
import { SITE } from '@data/constants';

import backgroundSvg from '@/assets/card-background.svg?raw';
import s1 from '@/assets/stamps/s1.svg?raw';
import s2 from '@/assets/stamps/s2.svg?raw';
import s3 from '@/assets/stamps/s3.svg?raw';
import s4 from '@/assets/stamps/s4.svg?raw';
import s5 from '@/assets/stamps/s5.svg?raw';

import fontBoldUrl from '@/assets/NotoSansTC-Bold.ttf?url';
import fontRegularUrl from '@/assets/NotoSansTC-Regular.ttf?url';

export const prerender = false;

const mmToPx = (mm: number) => mm * 3.78;
const toBase64Uri = (svgString: string) => {
    const base64 = btoa(unescape(encodeURIComponent(svgString)));
    return `data:image/svg+xml;base64,${base64}`;
}
const backgroundDataUri = toBase64Uri(backgroundSvg);
const stamps = [null, s1, s2, s3, s4, s5].map(svg => svg ? toBase64Uri(svg) : null);

// let cachedFontData: ArrayBuffer | null = null;
// let cachedBackground: string | null = null;
// const cachedStamps: (string | null)[] = [null, null, null, null, null];
let fontBoldData: ArrayBuffer | null = null;
let fontRegularData: ArrayBuffer | null = null;

export const GET: APIRoute = async ({ request, locals }) => {
    try {
        const requestUrl = new URL(request.url);
        const clubCode = requestUrl.searchParams.get('clubCode');

        const outputWidth = parseInt(requestUrl.searchParams.get('width') || '768', 10);

        if (!clubCode) {
            return new Response('Missing clubCode parameter', { status: 400 });
        }

        const allClubs = await getCollection('clubs');
        const clubContent = allClubs.find(club => club.slug.startsWith(clubCode.toLowerCase()));
        const clubMapInfo = clubMappings[clubCode.toUpperCase()];

        if (!clubContent || !clubMapInfo) {
            return new Response(`Club data not found for ${clubCode}`, { status: 404 });
        }

        const { name: clubName, summary } = clubContent.data;
        const { mapId, stampId } = clubMapInfo;
        const shareUrl = `${SITE.url}/clubs/${clubContent.slug}`;

        if (!fontBoldData) {
            const fullFontUrl = new URL(fontBoldUrl, requestUrl.origin);
            fontBoldData = await fetch(fullFontUrl).then(res => res.arrayBuffer());
        }
        if (!fontRegularData) {
            const fullFontUrl = new URL(fontRegularUrl, requestUrl.origin);
            fontRegularData = await fetch(fullFontUrl).then(res => res.arrayBuffer());
        }


        const qrCodeSvgString = await qrCodeToString(shareUrl, {
            type: 'svg',
            width: 768,
            margin: 0,
            color: {
                dark: "#171e2a",
                light: "#fcfcfc"
            }
        });
        const qrCodeDataURL = toBase64Uri(qrCodeSvgString);

        const html = {
            type: 'div',
            props: {
                style: {
                    display: 'flex',
                    position: 'relative',
                    width: `${mmToPx(210)}px`,
                    height: `${mmToPx(297)}px`,
                    backgroundImage: `url("${backgroundDataUri}")`,
                    backgroundSize: '100% 100%',
                },
                children: [
                    {
                        type: 'img',
                        props: {
                            src: qrCodeDataURL,
                            style: {
                                position: 'absolute',
                                top: `${mmToPx(58.5)}px`,
                                left: `${mmToPx(42.8)}px`,
                                width: `${mmToPx(124.4)}px`,
                                height: `${mmToPx(124.4)}px`,
                            },
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            style: {
                                position: 'absolute',
                                top: `${mmToPx(54)}px`,
                                left: `${mmToPx(38)}px`,
                                width: `${mmToPx(134)}px`,
                                height: `${mmToPx(134)}px`,
                                border: '19px solid #fcfcfc',
                                borderRadius: '24px'
                            }
                        }
                    },
                    {
                        type: 'div',
                        props: {
                            children: clubName,
                            style: {
                                position: 'absolute',
                                top: `${mmToPx(9)}px`,
                                left: `${mmToPx(70)}px`,
                                width: `${mmToPx(136)}px`,
                                fontSize: '68px',
                                fontWeight: '700',
                                lineHeight: '1.1',
                                color: '#171e2a',
                                letterSpacing: `${mmToPx(1)}px`,
                            },
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            children: clubCode,
                            style: {
                                position: 'absolute',
                                top: `${mmToPx(4)}px`,
                                left: `${mmToPx(10)}px`,
                                fontSize: '5rem',
                                fontWeight: '700',
                                color: '#ec9f65',
                                letterSpacing: `${mmToPx(1)}px`,
                            },
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            children: ["無", "Ⅰ", "Ⅱ", "Ⅲ", "Ⅳ", "Ⅴ"][stampId] || '',
                            style: {
                                position: 'absolute',
                                top: `${mmToPx(190)}px`,
                                left: `${mmToPx(189)}px`,
                                fontSize: '2.6rem',
                                fontWeight: '700',
                                color: 'white',
                                letterSpacing: `${mmToPx(1)}px`,
                            },
                        },
                    },

                    {
                        type: 'div',
                        props: {
                            children: [stamps[stampId] && {
                                type: 'img',
                                props: {
                                    src: stamps[stampId],
                                    style: {
                                        width: "100%",
                                    },
                                },
                            }],
                            src: stamps[stampId],
                            style: {
                                display: 'flex',
                                position: 'absolute',
                                top: `${mmToPx(210)}px`,
                                left: `${mmToPx(156)}px`,
                                width: `${mmToPx(42)}px`,
                                height: `${mmToPx(42)}px`,
                            },
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            children: mapId.slice(5, mapId.length),
                            style: {
                                position: 'absolute',
                                top: `${mmToPx(213.5)}px`,
                                left: `${mmToPx(117)}px`,
                                fontSize: '38px',
                                fontWeight: '700',
                                color: 'white',
                                letterSpacing: '1.3px',
                            },
                        },
                    },
                    {
                        type: 'div',
                        props: {
                            children: summary.slice(0, 42),
                            style: {
                                position: 'absolute',
                                top: `${mmToPx(247.5)}px`,
                                left: `${mmToPx(9.5)}px`,
                                width: `${mmToPx(134)}px`,
                                fontSize: '20px',
                                fontWeight: '300',
                                color: 'white',
                                letterSpacing: `${mmToPx(0.9)}px`,
                                lineHeight: 1.5
                            }
                        }
                    },
                    {
                        type: 'div',
                        props: {
                            children: summary.slice(42, 130) + (summary.length > 130 ? '...' : ''),
                            style: {
                                position: 'absolute',
                                top: `${mmToPx(263.8)}px`,
                                left: `${mmToPx(9.5)}px`,
                                width: `${mmToPx(195)}px`,
                                fontSize: '20px',
                                fontWeight: '300',
                                color: 'white',
                                letterSpacing: `${mmToPx(0.9)}px`,
                                lineHeight: 1.5
                            }
                        }
                    },
                    {
                        type: 'div',
                        props: {
                            children: shareUrl,
                            style: {
                                position: 'absolute',
                                top: `${mmToPx(44)}px`,
                                left: `${mmToPx(4)}px`,
                                fontSize: '17.5px',
                                fontWeight: '300',
                                color: '#4e5580',
                                letterSpacing: `${mmToPx(0.9)}px`,
                                transform: 'rotate(90deg)',
                                transformOrigin: "left"
                            }
                        }
                    },
                ],
            },
        };

        const a4_width_px = mmToPx(210);
        const a4_height_px = mmToPx(297);
        // @ts-ignore
        const svg = await satori(html, {
            width: a4_width_px,
            height: a4_height_px,
            fonts: [
                {
                    name: 'Noto Sans TC',
                    data: fontBoldData,
                    style: 'normal',
                    weight: 700,
                },
                {
                    name: 'Noto Sans TC',
                    data: fontRegularData,
                    style: 'normal',
                    weight: 300,
                },
            ]
        });

        const scale = outputWidth / a4_width_px;
        const outputHeight = a4_height_px * scale;

        return new Response(svg, {
            headers: {
                'Content-Type': 'image/svg+xml',
                'Cache-Control': 'public, max-age=31536000, immutable',
            },
        });

    } catch (e: any) {
        console.error("Error generating share card:", e);
        return new Response(e.message || 'An internal server error occurred', { status: 500 });
    }
};