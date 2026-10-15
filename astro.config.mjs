import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://clayhouse.com.co",
  compressHTML: true,
  build: {
    assets: "ch-assets",
  },
  vite: {
    build: {
      cssTarget: ["chrome111", "edge111", "firefox115", "safari16.4"],
    },
  },
  image: {
    service: { entrypoint: "astro/assets/services/sharp" },
  },
});
