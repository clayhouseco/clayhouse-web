#!/usr/bin/env node
/**
 * Optimiza imágenes en public/images/ in-place.
 *
 *  - Salta GIF, SVG, WebP, .HEIC (no se usan en web).
 *  - Salta archivos < MIN_KB (no compensa).
 *  - Resize a MAX_WIDTH si es más ancho.
 *  - JPG recomprimido a quality QUALITY (mozjpeg, progresivo).
 *  - PNG con paleta optimizada (sharp .png({ quality, compressionLevel })).
 *  - Usa --dry-run para ver el reporte sin escribir.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = path.resolve("public/images");
const MAX_WIDTH = 2000;
const QUALITY_JPG = 82;
const QUALITY_PNG = 82;
const MIN_KB = 200; // ignora archivos pequeños
const DRY_RUN = process.argv.includes("--dry-run");

const VALID_EXTS = new Set([".jpg", ".jpeg", ".png"]);

const totals = { count: 0, before: 0, after: 0, skipped: 0, errors: [] };
const samples = [];

async function* walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else yield full;
  }
}

function fmt(bytes) {
  if (bytes > 1048576) return `${(bytes / 1048576).toFixed(2)} MB`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

async function processFile(file) {
  const ext = path.extname(file).toLowerCase();
  if (!VALID_EXTS.has(ext)) {
    totals.skipped++;
    return;
  }
  const stat = await fs.stat(file);
  if (stat.size < MIN_KB * 1024) {
    totals.skipped++;
    return;
  }
  try {
    const img = sharp(file, { failOn: "none" });
    const meta = await img.metadata();
    const needsResize = (meta.width ?? 0) > MAX_WIDTH;

    let pipeline = img.rotate(); // respeta EXIF orientation
    if (needsResize) pipeline = pipeline.resize({ width: MAX_WIDTH, withoutEnlargement: true });
    if (ext === ".png") {
      pipeline = pipeline.png({ quality: QUALITY_PNG, compressionLevel: 9, palette: true });
    } else {
      pipeline = pipeline.jpeg({ quality: QUALITY_JPG, progressive: true, mozjpeg: true });
    }

    const out = await pipeline.toBuffer();
    const ratio = out.length / stat.size;

    // Si el reencode aumenta el peso (mancha), salta
    if (ratio >= 0.97) {
      totals.skipped++;
      return;
    }

    if (!DRY_RUN) await fs.writeFile(file, out);

    totals.count++;
    totals.before += stat.size;
    totals.after += out.length;
    if (samples.length < 5 && stat.size > 2_000_000) {
      samples.push({ file: path.relative(ROOT, file), before: stat.size, after: out.length });
    }
  } catch (err) {
    totals.errors.push({ file, msg: err.message });
  }
}

console.log(DRY_RUN ? "🔍 DRY RUN — sin escritura" : "✏️  Escribiendo cambios in-place");
console.log(`max-width=${MAX_WIDTH}px · quality JPG=${QUALITY_JPG} · quality PNG=${QUALITY_PNG}`);
console.log();

for await (const file of walk(ROOT)) await processFile(file);

console.log(`Procesadas: ${totals.count}`);
console.log(`Saltadas:   ${totals.skipped}`);
console.log(`Antes:      ${fmt(totals.before)}`);
console.log(`Después:    ${fmt(totals.after)}`);
console.log(`Ahorrado:   ${fmt(totals.before - totals.after)} (${(((totals.before - totals.after) / totals.before) * 100).toFixed(1)}%)`);
if (samples.length) {
  console.log("\nEjemplos de imágenes grandes:");
  for (const s of samples) console.log(`  ${fmt(s.before)} → ${fmt(s.after)}  ${s.file}`);
}
if (totals.errors.length) {
  console.log(`\n⚠️  ${totals.errors.length} errores:`);
  totals.errors.slice(0, 5).forEach((e) => console.log(`  ${e.file}: ${e.msg}`));
}
