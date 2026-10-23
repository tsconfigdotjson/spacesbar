import { defineConfig } from "vite";

// Served from https://<owner>.github.io/spacesbar/ on GitHub Pages.
export default defineConfig({
  base: process.env.BASE_PATH ?? "/spacesbar/",
});
