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
      alias: isCloudflare ? {
        "react-dom/server": "react-dom/server.edge",
      } : {},
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
    optimizeDeps: {
      exclude: ['functions'],
    },
  },

  integrations: [react(), sitemap({
    // 添加這個 serialize 函數來自定義輸出
    serialize: (item) => {
      // item.url 是 sitemap 插件初步生成的 URL
      // 我們使用 decodeURI() 來確保路徑中的中文字符是未編碼的
      // 這會將 ".../%E7%A7%91..." 轉回 ".../科學研習社"
      item.url = decodeURI(item.url);
      return item;
    },
  }),],

  build: {
    format: 'directory'
  },

  adapter: adapter,
});