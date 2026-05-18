#!/usr/bin/env node
/**
 * Verifica que las rutas de imágenes del build existan en public/.
 * Uso: node scripts/verify-product-assets.mjs romano
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const slug = process.argv[2] ?? "romano";
const htmlPath = path.join(root, "dist/productos", slug, "index.html");

if (!fs.existsSync(htmlPath)) {
  console.error(`No existe ${htmlPath}. Ejecuta: npm run build`);
  process.exit(1);
}

const html = fs.readFileSync(htmlPath, "utf8");
const srcs = [
  ...html.matchAll(/(?:src|href)="(\/images\/[^"?#]+)"/g),
].map((m) => m[1]);

const unique = [...new Set(srcs)];
const missing = [];
const ok = [];

for (const src of unique) {
  const decoded = src
    .split("/")
    .map((seg, i) => (i === 0 || !seg ? seg : decodeURIComponent(seg)))
    .join("/");
  const file = path.join(root, "public", decoded);
  if (fs.existsSync(file)) ok.push(src);
  else missing.push(src);
}

console.log(`\n${slug} — ${ok.length} OK, ${missing.length} faltantes\n`);

if (missing.length) {
  console.log("Faltan en public/:");
  missing.forEach((s) => console.log("  ✗", s));
  process.exit(1);
}

console.log("Todas las imágenes referenciadas existen en public/.");
