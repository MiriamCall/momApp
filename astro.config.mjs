// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  site: "https://mommytime.netlify.app/",
  integrations: [mdx(), sitemap()],

  output: "server", // This enables Server-Side Rendering for API routes and dynamic pages

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: netlify(),
});
