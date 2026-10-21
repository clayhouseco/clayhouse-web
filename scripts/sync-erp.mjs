/**
 * TRAE EL CATÁLOGO DEL ERP A LA WEB — se corre solo antes de cada build.
 *
 * Hasta ahora los dos lados eran listas separadas escritas a mano: se cambiaba un producto
 * en el ERP y la página seguía igual, porque nadie estaba leyendo al otro. Esto lo conecta:
 * el ERP publica su catálogo en /api/catalogo-web y acá se baja a `src/data/erpFeed.json`,
 * que queda versionado en git (así el build es reproducible y el cambio se ve en el diff).
 *
 * QUÉ MANDA CADA LADO. No es todo del ERP, y es a propósito:
 *   · ERP  → qué productos se ofrecen, sus colores, los códigos con los que se cotiza.
 *   · Web  → los textos, las fotos, el SEO, los precios y la ficha técnica publicada.
 * Donde los dos tienen dato y NO coinciden, no se pisa nada: se reporta. Cambiarle en
 * silencio las medidas a una ficha técnica publicada sería peor que tenerlas desalineadas.
 *
 * Si el ERP no responde, el build NO se cae: se sigue con el último feed bajado. Una caída
 * del ERP no puede tumbar la página pública.
 *
 *   node scripts/sync-erp.mjs            # baja el feed y reporta divergencias
 *   node scripts/sync-erp.mjs --strict   # además falla si el ERP no responde
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { conflictos, reporteMarkdown, bloqueos } from "./lib/catalogo.mjs";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FEED = process.env.ERP_CATALOGO_URL || "https://erp.clayhouse.com.co/api/catalogo-web";
const DESTINO = path.join(raiz, "src/data/erpFeed.json");
const REPORTE = path.join(raiz, "erp-divergencias.md");
const STRICT = process.argv.includes("--strict");

function leerSnapshot() {
  try {
    return JSON.parse(fs.readFileSync(DESTINO, "utf8"));
  } catch {
    return null;
  }
}

/**
 * EL CATÁLOGO, RECIÉN HECHO — NO EL QUE HAYA EN LA CACHÉ.
 *
 * Gerencia: «ya organicé ambos», y la sincronización seguía trayendo los datos viejos. El
 * API del ERP se sirve detrás de una caché (`x-vercel-cache: HIT`): respondía con la copia
 * guardada minutos antes, con el mismo `actualizado` y todo, así que un cambio hecho en el
 * ERP podía tardar en aparecer sin que nada lo delatara. Es, con toda probabilidad, parte
 * de las veces que «el ERP ya lo tiene y la página no lo muestra».
 *
 * Se pide sin caché por los dos caminos que existen: la cabecera y un parámetro distinto en
 * cada llamada, que es lo único que una caché intermedia no puede ignorar.
 */
async function bajar() {
  const ctrl = AbortSignal.timeout(20_000);
  const url = new URL(FEED);
  url.searchParams.set("_", String(Date.now()));
  const r = await fetch(url, {
    signal: ctrl,
    cache: "no-store",
    headers: { accept: "application/json", "cache-control": "no-cache", pragma: "no-cache" },
  });
  if (!r.ok) throw new Error(`el ERP respondió ${r.status}`);
  const j = await r.json();
  if (!j?.ok || !Array.isArray(j.productos)) throw new Error(j?.error || "respuesta sin productos");
  if (!j.productos.length) throw new Error("el ERP devolvió un catálogo vacío");
  return j;
}

let feed;
try {
  feed = await bajar();
  const antes = leerSnapshot();
  fs.writeFileSync(DESTINO, JSON.stringify(feed, null, 2) + "\n");
  const cambio = JSON.stringify(antes?.productos) !== JSON.stringify(feed.productos);
  console.log(
    `ERP → web: ${feed.productos.length} productos publicados${cambio ? "  (el catálogo CAMBIÓ)" : "  (sin cambios)"}`
  );
} catch (e) {
  feed = leerSnapshot();
  const msg = `No se pudo leer el catálogo del ERP (${e.message}).`;
  if (!feed) {
    console.error(`✗ ${msg} Y no hay copia local para seguir.`);
    process.exit(1);
  }
  if (STRICT) {
    console.error(`✗ ${msg}`);
    process.exit(1);
  }
  console.warn(`⚠ ${msg} Se sigue con la última copia bajada (${feed.actualizado}).`);
}

/* ───────────────── divergencias entre las dos listas ─────────────────
   El cálculo vive en scripts/lib/catalogo.mjs y lo comparten este comando y
   `npm run verificar:datos`. Tenerlo dos veces ya salió caro: la versión de acá leía el
   precio solo dentro de `colores` y declaraba «sin precio en el ERP» a los rayados, que
   tienen tres —uno por formato— en el campo `precio`. La página sí los leía, así que el
   informe contradecía a lo publicado y pedía asignar colores que nadie necesita. */

const filas = conflictos(feed);
fs.writeFileSync(REPORTE, reporteMarkdown(feed, filas));

const duros = bloqueos(filas).length;
console.log(
  filas.length
    ? `⚠ ${filas.length} conflicto(s) con el ERP — detalle en erp-divergencias.md` +
        (duros ? `, de los cuales ${duros} impiden publicar` : "")
    : "✓ web y ERP dicen lo mismo"
);
