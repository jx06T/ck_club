// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import svgr from "vite-plugin-svgr"

import sitemap from '@astrojs/sitemap';

import cloudflare from '@astrojs/cloudflare';
import vercel from '@astrojs/vercel/serverless';
import node from '@astrojs/node';

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
} else {
  adapter = node({
    mode: 'standalone'
  });
}

const clubRedirects = {
  '/clubs/a01': '/clubs/a01-科學研習社/',
  '/clubs/A01-科學研習社': '/clubs/a01-科學研習社/',
  '/clubs/a02': '/clubs/a02-生物研究社/',
  '/clubs/A02-生物研究社': '/clubs/a02-生物研究社/',
  '/clubs/a03': '/clubs/a03-物理研究社/',
  '/clubs/A03-物理研究社': '/clubs/a03-物理研究社/',
  '/clubs/a05': '/clubs/a05-天文社/',
  '/clubs/A05-天文社': '/clubs/a05-天文社/',
  '/clubs/a06': '/clubs/a06-航空社/',
  '/clubs/A06-航空社': '/clubs/a06-航空社/',
  '/clubs/a07': '/clubs/a07-電子計算機研習社/',
  '/clubs/A07-電子計算機研習社': '/clubs/a07-電子計算機研習社/',
  '/clubs/a08': '/clubs/a08-資訊社/',
  '/clubs/A08-資訊社': '/clubs/a08-資訊社/',
  '/clubs/a09': '/clubs/a09-國學暨人文社會學術研究社/',
  '/clubs/A09-國學暨人文社會學術研究社': '/clubs/a09-國學暨人文社會學術研究社/',
  '/clubs/a10': '/clubs/a10-紅樓詩社/',
  '/clubs/A10-紅樓詩社': '/clubs/a10-紅樓詩社/',
  '/clubs/a13': '/clubs/a13-日本文化研究社/',
  '/clubs/A13-日本文化研究社': '/clubs/a13-日本文化研究社/',
  '/clubs/a14': '/clubs/a14-講演社/',
  '/clubs/A14-講演社': '/clubs/a14-講演社/',
  '/clubs/a17': '/clubs/a17-電影研習社/',
  '/clubs/A17-電影研習社': '/clubs/a17-電影研習社/',
  '/clubs/a20': '/clubs/a20-卡牌研究社/',
  '/clubs/A20-卡牌研究社': '/clubs/a20-卡牌研究社/',
  '/clubs/a21': '/clubs/a21-軍武社/',
  '/clubs/A21-軍武社': '/clubs/a21-軍武社/',
  '/clubs/a22': '/clubs/a22-小說創作研究社/',
  '/clubs/A22-小說創作研究社': '/clubs/a22-小說創作研究社/',
  '/clubs/a25': '/clubs/a25-英語辯論社/',
  '/clubs/A25-英語辯論社': '/clubs/a25-英語辯論社/',
  '/clubs/a28': '/clubs/a28-物理辯論社/',
  '/clubs/A28-物理辯論社': '/clubs/a28-物理辯論社/',
  '/clubs/a32': '/clubs/a32-建中機研/',
  '/clubs/A32-建中機研': '/clubs/a32-建中機研/',
  '/clubs/a33': '/clubs/a33-minecraft 邏輯研究社/',
  '/clubs/A33-Minecraft 邏輯研究社': '/clubs/a33-minecraft 邏輯研究社/',
  '/clubs/a34': '/clubs/a34-建中模擬聯合國/',
  '/clubs/A34-建中模擬聯合國': '/clubs/a34-建中模擬聯合國/',
  '/clubs/a35': '/clubs/a35-世界地理探索社/',
  '/clubs/A35-世界地理探索社': '/clubs/a35-世界地理探索社/',
  '/clubs/a36': '/clubs/a36-韓國文化研究社/',
  '/clubs/A36-韓國文化研究社': '/clubs/a36-韓國文化研究社/',
  '/clubs/a37': '/clubs/a37-人工智慧研究社/',
  '/clubs/A37-人工智慧研究社': '/clubs/a37-人工智慧研究社/',
  '/clubs/b01': '/clubs/b01-熱舞社/',
  '/clubs/B01-熱舞社': '/clubs/b01-熱舞社/',
  '/clubs/b05': '/clubs/b05-橋藝社/',
  '/clubs/B05-橋藝社': '/clubs/b05-橋藝社/',
  '/clubs/b06': '/clubs/b06-象棋社/',
  '/clubs/B06-象棋社': '/clubs/b06-象棋社/',
  '/clubs/b07': '/clubs/b07-圍棋社/',
  '/clubs/B07-圍棋社': '/clubs/b07-圍棋社/',
  '/clubs/b08': '/clubs/b08-魔術社/',
  '/clubs/B08-魔術社': '/clubs/b08-魔術社/',
  '/clubs/b09': '/clubs/b09-美術社/',
  '/clubs/B09-美術社': '/clubs/b09-美術社/',
  '/clubs/b10': '/clubs/b10-攝影社/',
  '/clubs/B10-攝影社': '/clubs/b10-攝影社/',
  '/clubs/b11': '/clubs/b11-大眾傳播社/',
  '/clubs/B11-大眾傳播社': '/clubs/b11-大眾傳播社/',
  '/clubs/b12': '/clubs/b12-建中口技/',
  '/clubs/B12-建中口技': '/clubs/b12-建中口技/',
  '/clubs/b13': '/clubs/b13-美食社/',
  '/clubs/B13-美食社': '/clubs/b13-美食社/',
  '/clubs/b14': '/clubs/b14-魔術方塊社/',
  '/clubs/B14-魔術方塊社': '/clubs/b14-魔術方塊社/',
  '/clubs/b20': '/clubs/b20-漫畫插畫研究社/',
  '/clubs/B20-漫畫插畫研究社': '/clubs/b20-漫畫插畫研究社/',
  '/clubs/b22': '/clubs/b22-西洋棋社/',
  '/clubs/B22-西洋棋社': '/clubs/b22-西洋棋社/',
  '/clubs/c06': '/clubs/c06-戶外探索社/',
  '/clubs/C06-戶外探索社': '/clubs/c06-戶外探索社/',
  '/clubs/c07': '/clubs/c07-駝鈴康輔社/',
  '/clubs/C07-駝鈴康輔社': '/clubs/c07-駝鈴康輔社/',
  '/clubs/ck2': '/clubs/ck2-建中青年刊物社/',
  '/clubs/CK2-建中青年刊物社': '/clubs/ck2-建中青年刊物社/',
  '/clubs/ck3': '/clubs/ck3-樂旗隊/',
  '/clubs/CK3-樂旗隊': '/clubs/ck3-樂旗隊/',
  '/clubs/d01': '/clubs/d01-爵士音樂社/',
  '/clubs/D01-爵士音樂社': '/clubs/d01-爵士音樂社/',
  '/clubs/d02': '/clubs/d02-熱音社/',
  '/clubs/D02-熱音社': '/clubs/d02-熱音社/',
  '/clubs/d03': '/clubs/d03-流行音樂社/',
  '/clubs/D03-流行音樂社': '/clubs/d03-流行音樂社/',
  '/clubs/d04': '/clubs/d04-另類音樂創作社/',
  '/clubs/D04-另類音樂創作社': '/clubs/d04-另類音樂創作社/',
  '/clubs/d05': '/clubs/d05-民謠吉他/',
  '/clubs/D05-民謠吉他': '/clubs/d05-民謠吉他/',
  '/clubs/d07': '/clubs/d07-管弦樂社/',
  '/clubs/D07-管弦樂社': '/clubs/d07-管弦樂社/',
  '/clubs/d08': '/clubs/d08-口琴社/',
  '/clubs/D08-口琴社': '/clubs/d08-口琴社/',
  '/clubs/d10': '/clubs/d10-合唱團/',
  '/clubs/D10-合唱團': '/clubs/d10-合唱團/',
  '/clubs/d11': '/clubs/d11-嘻哈音樂研究社/',
  '/clubs/D11-嘻哈音樂研究社': '/clubs/d11-嘻哈音樂研究社/',
  '/clubs/e03': '/clubs/e03-劍道社/',
  '/clubs/E03-劍道社': '/clubs/e03-劍道社/',
  '/clubs/e04': '/clubs/e04-棒球社/',
  '/clubs/E04-棒球社': '/clubs/e04-棒球社/',
  '/clubs/e05': '/clubs/e05-游泳健身社/',
  '/clubs/E05-游泳健身社': '/clubs/e05-游泳健身社/',
  '/clubs/e10': '/clubs/e10-足球社/',
  '/clubs/E10-足球社': '/clubs/e10-足球社/',
};

export default defineConfig({
  site: process.env.PUBLIC_SITE || 'http://localhost:4321',
  redirects: {
    ...clubRedirects,
  },
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
  markdown: {
    remarkPlugins: ['remark-breaks'],
  },
  integrations: [react(), sitemap(),],

  build: {
    format: 'directory'
  },

  adapter: adapter,
});