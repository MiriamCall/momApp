// @ts-check
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";

import db from "@astrojs/db";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
  site: "https://mommytime.netlify.app/",
  integrations: [mdx(), sitemap(), db()],

  output: "server", // This enables Server-Side Rendering for API routes and dynamic pages

  vite: {
    plugins: [tailwindcss()],
  },

  adapter: netlify(),
});
