// https://docs.astro.build/en/guides/integrations-guide/sitemap/#usage
import type { APIRoute } from 'astro';

const robotsTxt = `
User-agent: Googlebot
Allow: /
Crawl-delay: 5

User-agent: facebookexternalhit
Allow: /

User-agent: Facebot
Allow: /

User-agent: Yandex
Allow: /
Crawl-delay: 2

User-agent: archive.org_bot
Allow: /
Crawl-delay: 2

User-agent: *
Disallow: /

Sitemap: ${new URL('sitemap-index.xml', import.meta.env.SITE).href}
`.trim();

export const GET: APIRoute = () => {
  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};