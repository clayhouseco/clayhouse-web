import { defineConfig } from "astro/config";

export default defineConfig({
  site: "https://clayhouse.com.co",
  compressHTML: true,
  build: {
    // Sin guion bajo: cPanel/FTP a veces no suben la carpeta "_astro"
    assets: "ch-assets",
  },
});
