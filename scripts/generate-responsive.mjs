/**
 * Versiones reducidas de cada foto, para que el navegador descargue la que necesita.
 *
 * El problema medido: la ficha del Romano abría con `Romano Natural.webp`, 247 KB, para
 * pintarla a 390 px en un teléfono; las tarjetas del catálogo traían archivos de 1.600 px
 * para huecos de 350 px; el cotizador pedía la foto completa del producto para una miniatura
 * de 72 px. En una obra, con datos móviles, eso se nota.
 *
 * ANTES SOLO MIRABA LOS JPG. Las fotos de producto —las que abren la ficha y llenan el
 * catálogo— son casi todas `.webp`, así que se quedaban sin reducir justo las que más
 * pesan en la primera pantalla. Ahora entran jpg, jpeg, png y webp.
 *
 * Cuatro anchos, uno por sitio donde aparece una foto:
 *   320  miniatura (el carrusel del cotizador, la tira del visor)
 *   480  tarjeta en teléfono
 *   800  tarjeta en escritorio y galería en teléfono
 *  1200  galería grande y visor a pantalla completa
 * El original queda como último candidato y como respaldo del `src`.
 *
 * Se exporta WebP: pesa ~15% menos que el JPEG equivalente y lo entiende el 97% de los
 * navegadores. El `src` sigue apuntando al archivo original, así que quien no lo soporte ve
 * la foto igual.
 *
 * Las variantes van a un árbol aparte, public/images/_responsive/, espejando la ruta
 * original. Es a propósito: variantGallery.ts escanea las carpetas de producto para armar
 * las galerías, y una subcarpeta dentro de ellas se interpretaría como un proyecto más.
 *
 * Son artefactos de build (están en .gitignore): se regeneran en cada despliegue y no
 * engordan el repositorio.
 *
 * Uso:  node scripts/generate-responsive.mjs [--force]
 */
import sharp from "sharp";
import fs from "node:fs";
import path from "node:path";

export const WIDTHS = [320, 480, 800, 1200];
const SRC_ROOT = "public/images";
const OUT_ROOT = "public/images/_responsive";
const EXT = /\.(jpe?g|png|webp)$/i;
const FORCE = process.argv.includes("--force");

/** Calidad por ancho: una miniatura admite más compresión que una foto a pantalla completa. */
const CALIDAD = (w) => (w <= 480 ? 70 : w <= 800 ? 76 : 80);

function recorrer(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (path.resolve(p) === path.resolve(OUT_ROOT)) continue;
      recorrer(p, out);
    } else if (EXT.test(e.name)) out.push(p);
  }
  return out;
}

/* Limpieza de lo que sobró de un esquema anterior: durante un tiempo las variantes fueron
   JPEG y solo de 800 y 1200. Si se quedan, se copian a dist en cada despliegue y nadie las
   pide: son megas de peso muerto en el sitio publicado. */
let borradas = 0;
const vigente = new RegExp(`-(${WIDTHS.join("|")})\\.webp$`);
function limpiar(dir) {
  if (!fs.existsSync(dir)) return;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) limpiar(p);
    else if (!vigente.test(e.name)) {
      fs.unlinkSync(p);
      borradas++;
    }
  }
}
limpiar(OUT_ROOT);

const files = fs.existsSync(SRC_ROOT) ? recorrer(SRC_ROOT) : [];

let creadas = 0, enCache = 0, innecesarias = 0, fallos = 0;

for (const src of files) {
  let meta;
  try {
    meta = await sharp(src).metadata();
  } catch (e) {
    fallos++;
    console.warn(`  ⚠️  ${src}: ${e.message}`);
    continue;
  }

  const rel = path.relative(SRC_ROOT, src);
  const dir = path.join(OUT_ROOT, path.dirname(rel));
  const base = path.basename(rel, path.extname(rel));

  for (const w of WIDTHS) {
    // Sin sentido agrandar: si el original ya es más chico, no hay variante.
    if (!meta.width || meta.width <= w) { innecesarias++; continue; }
    const out = path.join(dir, `${base}-${w}.webp`);
    if (!FORCE && fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) {
      enCache++;
      continue;
    }
    fs.mkdirSync(dir, { recursive: true });
    await sharp(src).rotate().resize({ width: w }).webp({ quality: CALIDAD(w) }).toFile(out);
    creadas++;
  }
}

const partes = [`${creadas} generadas`, `${enCache} en caché`, `${innecesarias} innecesarias (original más chico)`];
if (borradas) partes.push(`${borradas} obsoletas borradas`);
if (fallos) partes.push(`${fallos} fallos`);
console.log(`[responsive] ${partes.join(" · ")}`);
