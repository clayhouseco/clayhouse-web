/**
 * Recomprime las fotos JPG de public/images conservando nombre y extensión
 * (cero cambios de código: las rutas siguen siendo las mismas).
 *
 * Detalles importantes:
 *  - .rotate() aplica la orientación EXIF antes de recomprimir. Sin esto, las
 *    fotos con orientation 6/8 quedarían de lado al perderse el EXIF.
 *  - Solo reescribe si el ahorro supera MIN_SAVING. Así no se degrada calidad
 *    en imágenes que ya estaban bien comprimidas.
 *
 * Uso:  node scripts/optimize-photos.mjs [--dry]
 */
import sharp from "sharp";
import fs from "node:fs";
import { execSync } from "node:child_process";

const QUALITY = 82;
const MIN_SAVING = 0.1; // 10%
const DRY = process.argv.includes("--dry");

const files = execSync(`find public/images -iname "*.jpg" -o -iname "*.jpeg"`)
  .toString().trim().split("\n").filter(Boolean);

let before = 0, after = 0, rewritten = 0, skipped = 0, failed = 0;

for (const f of files) {
  try {
    const orig = fs.statSync(f).size;
    const buf = await sharp(f).rotate().jpeg({ quality: QUALITY, mozjpeg: true }).toBuffer();
    before += orig;
    if (buf.length > orig * (1 - MIN_SAVING)) {
      after += orig;
      skipped++;
      continue;
    }
    if (!DRY) fs.writeFileSync(f, buf);
    after += buf.length;
    rewritten++;
  } catch (e) {
    failed++;
    console.warn(`  ⚠️  ${f}: ${e.message}`);
  }
}

const mb = (b) => (b / 1048576).toFixed(1);
console.log(
  `${DRY ? "[simulación] " : ""}${rewritten} recomprimidas · ${skipped} ya estaban bien · ${failed} fallos`
);
console.log(`Peso: ${mb(before)} MB → ${mb(after)} MB  (-${(100 - (after / before) * 100).toFixed(0)}%)`);
