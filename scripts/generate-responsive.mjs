/**
 * Genera versiones reducidas de las fotos para servirlas con srcset.
 *
 * Las galerías muestran las fotos a ~300-550 px, pero los archivos son de
 * ~1600 px: se descarga hasta 4x más de lo necesario. Aquí se generan copias de
 * 800w y 1200w (cubren pantallas retina) y los componentes las ofrecen vía
 * srcset; el navegador elige la más pequeña que le sirva.
 *
 * Las variantes van a un árbol aparte, public/images/_responsive/, espejando la
 * ruta original. Es a propósito: variantGallery.ts escanea las carpetas de
 * producto para armar las galerías, y una subcarpeta dentro de ellas se
 * interpretaría como un proyecto más.
 *
 * Son artefactos de build (están en .gitignore): se regeneran en cada despliegue
 * y no engordan el repositorio.
 *
 * Uso:  node scripts/generate-responsive.mjs [--force]
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

export const WIDTHS = [800, 1200];
const SRC_ROOT = "public/images";
const OUT_ROOT = "public/images/_responsive";
const FORCE = process.argv.includes("--force");

const files = execSync(
  `find ${SRC_ROOT} -not -path "*/_responsive/*" \\( -iname "*.jpg" -o -iname "*.jpeg" \\)`
)
  .toString().trim().split("\n").filter(Boolean);

let created = 0, reused = 0, skipped = 0, failed = 0;

for (const src of files) {
  let meta;
  try {
    meta = await sharp(src).metadata();
  } catch (e) {
    failed++;
    console.warn(`  ⚠️  ${src}: ${e.message}`);
    continue;
  }

  const rel = path.relative(SRC_ROOT, src);
  const dir = path.join(OUT_ROOT, path.dirname(rel));
  const base = path.basename(rel, path.extname(rel));

  for (const w of WIDTHS) {
    // Sin sentido agrandar: si el original ya es más chico, no hay variante.
    if (meta.width <= w) { skipped++; continue; }
    const out = path.join(dir, `${base}-${w}.jpg`);
    if (!FORCE && fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) {
      reused++;
      continue;
    }
    fs.mkdirSync(dir, { recursive: true });
    await sharp(src).rotate().resize({ width: w }).jpeg({ quality: 80, mozjpeg: true }).toFile(out);
    created++;
  }
}

console.log(
  `[responsive] ${created} generadas · ${reused} en caché · ${skipped} innecesarias (original más chico) · ${failed} fallos`
);
