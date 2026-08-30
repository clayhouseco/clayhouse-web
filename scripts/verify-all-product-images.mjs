#!/usr/bin/env node
/**
 * Verifica rutas de imagen en products.ts y carpetas de variantes.
 * Uso: node scripts/verify-all-product-images.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const productsRoot = path.join(root, "public/images/products");

/** Rutas críticas (slug, archivo relativo) — mantener al reorganizar carpetas */
const CRITICAL = [
  ["toscano", "arena/Toscano Arena.png"],
  ["toscano", "oscuro/Toscano Oscuro.png"],
  ["napolitano", "rojo/Napolitano Roj.jpg"],
  ["napolitano", "matizado/Napolitano.jpg"],
  ["romano", "matizado/Romano Matizado Claro.jpg"],
  ["romano", "matizado-oscuro/Romano Oscuro (tono 1).jpg"],
  ["romano", "natural/Romano Natural.jpg"],
  ["cartagena", "claro/Cartagena Claro.png"],
  ["macizo-campesino", "claro/Campesino Claro.png"],
  ["macizo-brix", "pieza/DSC_9310.jpg"],
  ["enchape-romano", "natural/Chapa Natural.jpg"],
  ["enchape-romano", "matizado/Enchapematizado_Clayhouse.jpg"],
  ["enchape-romano", "matizado oscuro/Chapa Matizada Oscura (Tono 1).jpg"],
  ["enchape-rustico", "producto/enchape-rustico-producto.jpg"],
  ["teja-plana", "teja plana ppal.png"],
  ["teja-colonial", "roja/DSC_9435.jpg"],
  ["rayados-verticales", "rayado 12-vertical/rayado 12 vertical apilado.png"],
  ["rayados-horizontales", "rayado 12-horizontal/rayado 12 horizontal apilados.png"],
];

const missing = [];
for (const [slug, file] of CRITICAL) {
  const p = path.join(productsRoot, slug, file);
  if (!fs.existsSync(p)) missing.push(`${slug}/${file}`);
}

if (missing.length) {
  console.error(`\n✗ Faltan ${missing.length} imagen(es):\n`);
  missing.forEach((m) => console.error(`  ${m}`));
  process.exit(1);
}

console.log(`✓ ${CRITICAL.length} rutas de producto verificadas.`);
