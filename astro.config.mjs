// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import svgr from "vite-plugin-svgr"

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
});