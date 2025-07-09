// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';
import svgr from "vite-plugin-svgr"

import vercel from '@astrojs/vercel/serverless';
import cloudflare from '@astrojs/cloudflare';

// 檢測部署環境
const isVercel = process.env.VERCEL === '1';
const isCloudflare = process.env.CF_PAGES === '1';

// 根據環境選擇適配器
let adapter;
let output = 'static';

if (isVercel) {
  adapter = vercel({
    webAnalytics: {
      enabled: true,
    },
    maxDuration: 8,
  });
  output = 'server';
} else if (isCloudflare) {
  adapter = cloudflare();
  output = 'server';
}

export default defineConfig({
  site: process.env.PUBLIC_SITE || 'http://localhost:4321',
  vite: {
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
  integrations: [react()],
  // @ts-ignore
  output: output,
  adapter: adapter,
  build: {
    format: 'directory'
  }
});