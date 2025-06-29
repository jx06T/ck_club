// @ts-check
import { defineConfig } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';

export default defineConfig({
  site: process.env.PUBLIC_SITE || 'http://localhost:4321',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [react()],
});