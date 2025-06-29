// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.PUBLIC_SITE || 'http://localhost:4321',
});