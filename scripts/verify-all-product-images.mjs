#!/usr/bin/env node
/**
 * ¿QUEDÓ ALGUNA IMAGEN ROTA EN LO QUE SE VA A PUBLICAR?
 *
 * Antes esto comparaba contra una lista de 18 rutas escritas a mano. Las carpetas se
 * reorganizaron —`toscano/arena/` pasó a ser `toscano/natural/`— y la lista no: el comando
 * llevaba meses diciendo que faltaban 17 imágenes que no faltan, mientras las que sí podrían
 * faltar no las miraba nadie. Un verificador que siempre falla es un verificador apagado.
 *
 * Ahora no hay lista. Se mira el sitio ya construido, se recogen todas las rutas de imagen
 * que aparecen —en `src`, en `srcset`, en los atributos `data-` y dentro de los JSON que la
 * galería embebe— y se comprueba que cada archivo exista. Lo que se verifica es exactamente
 * lo que el visitante va a pedir.
 *
 *   npm run build && npm run verify:images
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(raiz, "dist");

if (!fs.existsSync(DIST)) {
  console.error("✗ No hay dist/. Corre `npm run build` antes de verificar las imágenes.");
  process.exit(1);
}

/** Todos los .html de dist, recursivamente. */
function paginas(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...paginas(p));
    else if (e.name.endsWith(".html")) out.push(p);
  }
  return out;
}

/* Las rutas absolutas a archivos servidos. Se barre el HTML entero y no atributo por
   atributo: la galería de variantes viaja como JSON dentro de un `data-galleries`, y ahí
   es donde están las fotos de los colores que no se ven hasta que alguien pulsa el botón.

   La ruta tiene que EMPEZAR después de una comilla, un espacio o un paréntesis. Sin eso, el
   final de una URL ajena —`https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png`—
   pasa por una ruta local y el comando denuncia tres archivos que nadie sirve desde acá. */
const RUTA = /(?<=^|["'\s,(=[])\/(?:images|ch-assets|downloads|fonts)\/[^"'\s\\)<>]+?\.(?:webp|jpg|jpeg|png|avif|svg|gif|ico|pdf|woff2?)/gi;

const faltantes = new Map();   // ruta → páginas que la piden
let miradas = 0;

for (const pagina of paginas(DIST)) {
  const html = fs.readFileSync(pagina, "utf8");
  const vistas = new Set();
  for (const m of html.matchAll(RUTA)) {
    const cruda = m[0].replace(/&amp;/g, "&").replace(/&#x2F;/gi, "/");
    if (vistas.has(cruda)) continue;
    vistas.add(cruda);
    miradas++;
    let rel;
    try {
      rel = decodeURIComponent(cruda);
    } catch {
      rel = cruda;   // ruta con un % suelto: se prueba tal cual
    }
    if (fs.existsSync(path.join(DIST, rel)) || fs.existsSync(path.join(DIST, cruda))) continue;
    const quien = path.relative(DIST, pagina);
    if (!faltantes.has(rel)) faltantes.set(rel, []);
    faltantes.get(rel).push(quien);
  }
}

if (faltantes.size) {
  console.error(`\n✗ ${faltantes.size} imagen(es) que la página pide y no están en dist/:\n`);
  for (const [ruta, paginas_] of faltantes) {
    console.error(`  ${ruta}`);
    console.error(`     la piden: ${paginas_.slice(0, 3).join(", ")}${paginas_.length > 3 ? ` y ${paginas_.length - 3} más` : ""}`);
  }
  process.exit(1);
}

console.log(`✓ ${miradas} referencia(s) de imagen verificadas en ${paginas(DIST).length} página(s). Ninguna rota.`);
