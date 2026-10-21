import fs from "node:fs";
import path from "node:path";
import { assetUrl } from "@/utils/paths";

/** Anchos generados por scripts/generate-responsive.mjs */
const WIDTHS = [320, 480, 800, 1200];
const SRC_ROOT = "public/images";
const OUT_ROOT = "public/images/_responsive";

/**
 * Qué tan grande se ve la imagen en cada sitio.
 *
 * Sin esto el navegador supone que ocupa el ancho de la pantalla y se trae la variante más
 * grande «por si acaso». Cada entrada describe el hueco real donde se pinta la foto, que es
 * lo único que le permite elegir bien.
 */
export const SIZES = {
  /** Grilla de tarjetas: 1 col en móvil, 2 en tablet, 3 en escritorio */
  card: "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  /** Galería principal de la ficha: ocupa media pantalla en escritorio */
  gallery: "(max-width: 900px) 100vw, 45vw",
  /** Tira de miniaturas y carrusel del cotizador: cuadros de 72-96 px. */
  thumb: "96px",
} as const;

/** Ruta en disco de una variante, a partir de la URL pública del original. */
function variantPath(src: string, width: number): { file: string; url: string } | null {
  const clean = decodeURIComponent(src.split("?")[0]);
  if (!clean.startsWith("/images/")) return null;
  const rel = clean.slice("/images/".length);
  const dir = path.dirname(rel);
  const base = path.basename(rel, path.extname(rel));
  const relOut = path.join(dir, `${base}-${width}.webp`);
  return {
    file: path.join(process.cwd(), OUT_ROOT, relOut),
    url: `/images/_responsive/${relOut.split(path.sep).join("/")}`,
  };
}

/**
 * srcset con las variantes que existan, más el original como candidato mayor.
 *
 * Devuelve undefined si no hay ninguna variante: así el `<img>` queda con su
 * `src` de siempre y la imagen nunca se rompe, aunque el script de generación
 * no haya corrido.
 */
export function srcSetFor(src: string): string | undefined {
  if (!src || src.startsWith("http")) return undefined;

  const entries: string[] = [];
  for (const w of WIDTHS) {
    const v = variantPath(src, w);
    if (v && fs.existsSync(v.file)) entries.push(`${assetUrl(v.url)} ${w}w`);
  }
  if (entries.length === 0) return undefined;

  // El original cierra la lista con su ancho real.
  const originalFile = path.join(
    process.cwd(),
    SRC_ROOT,
    decodeURIComponent(src.split("?")[0]).slice("/images/".length)
  );
  const width = originalWidth(originalFile);
  if (width) entries.push(`${assetUrl(src)} ${width}w`);

  return entries.join(", ");
}

/** Ancho real leído de la cabecera del JPEG (sin dependencias ni async). */
function originalWidth(file: string): number | null {
  try {
    const buf = fs.readFileSync(file);
    if (buf[0] !== 0xff || buf[1] !== 0xd8) return null; // no es JPEG
    let i = 2;
    while (i < buf.length) {
      if (buf[i] !== 0xff) {
        i++;
        continue;
      }
      const marker = buf[i + 1];
      // SOF0..SOF15 (excepto DHT/JPG/DAC) llevan las dimensiones
      if (
        marker >= 0xc0 &&
        marker <= 0xcf &&
        marker !== 0xc4 &&
        marker !== 0xc8 &&
        marker !== 0xcc
      ) {
        return buf.readUInt16BE(i + 7);
      }
      i += 2 + buf.readUInt16BE(i + 2);
    }
  } catch {
    /* archivo ausente o ilegible: se omite el candidato original */
  }
  return null;
}

/**
 * URL de la variante más adecuada para mostrar una foto a pantalla completa
 * (lightbox). Devuelve la de 1200 px si existe; si no, el original.
 *
 * Existe porque el visor cargaba el archivo de cámara sin reducir: fotos de
 * proyecto de hasta 6,5 MB que el navegador ya tenía resueltas en 113 KB para
 * la miniatura. No afecta al ranking —se descargan al hacer clic, no al cargar
 * la página— pero en móvil con datos el costo es real.
 */
export function displaySrcFor(src: string): string {
  const v = variantPath(src, 1200);
  return v && fs.existsSync(v.file) ? assetUrl(v.url) : assetUrl(src);
}

/**
 * La miniatura: la tira del visor y las tarjetas del cotizador se pintan a 72-96 px.
 *
 * Pedía la variante de 800 px —y antes de eso, el archivo original—: entre 200 y 350 KB por
 * cada cuadro de 72 px, veintidós de ellos en el carrusel del cotizador. Ahora pide la de
 * 320, que cubre hasta pantallas de triple densidad.
 */
export function thumbSrcFor(src: string): string {
  for (const w of [320, 480]) {
    const v = variantPath(src, w);
    if (v && fs.existsSync(v.file)) return assetUrl(v.url);
  }
  return assetUrl(src);
}

/** La variante más chica que sirve para un hueco de `ancho` px, o el original si no hay. */
export function srcPara(src: string, ancho: number): string {
  for (const w of WIDTHS) {
    if (w < ancho) continue;
    const v = variantPath(src, w);
    if (v && fs.existsSync(v.file)) return assetUrl(v.url);
  }
  return assetUrl(src);
}
