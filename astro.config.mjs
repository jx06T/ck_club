// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import svgr from "vite-plugin-svgr"

import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';
import vercel from '@astrojs/vercel/serverless';

const isVercel = process.env.VERCEL === '1';
const isCloudflare = process.env.CF_PAGES === '1';

let adapter

if (isVercel) {
  adapter = vercel({
    webAnalytics: {
      enabled: true,
    },
    maxDuration: 8,
  });
} else if (isCloudflare) {
  adapter = cloudflare();
}

export default defineConfig({
  site: process.env.PUBLIC_SITE || 'http://localhost:4321',

  vite: {
    resolve: {
      alias: {
        "react-dom/server": "react-dom/server.edge",
      },
    },
    plugins: [
      tailwindcss(),
      svgr({
        include: "**/*.svg?react",
        svgrOptions: {
          plugins: ["@svgr/plugin-svgo", "@svgr/plugin-jsx"],
          svgoConfig: {
            plugins: [
              "removeTitle",
              "removeDesc",
              "removeDoctype",
            ],
          },
        },
      })],
  },

  integrations: [react(), sitemap()],

  build: {
    format: 'directory'
  },

  adapter: adapter,
});