import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://clayhouse.com.co",
  compressHTML: true,
  build: {
    assets: "ch-assets",
  },
  image: {
    service: { entrypoint: "astro/assets/services/sharp" },
  },
});
