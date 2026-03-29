// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from "@tailwindcss/vite";

import node from "@astrojs/node";

import react from "@astrojs/react";

// https://astro.build/config
export default defineConfig({
  output: "server",

  vite: {
    plugins: [tailwindcss()],
    build: {
      chunkSizeWarningLimit: 8000,
    },
    optimizeDeps: {
      exclude: ["@huggingface/transformers"],
    },
  },

  adapter: node({
    mode: "standalone"
  }),

  i18n: {
    defaultLocale: "en",
    locales: ["en", "ar"],
    routing: "manual",
  },

  integrations: [react()],
});