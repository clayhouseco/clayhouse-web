/**
 * TRAE LAS RESEÑAS APROBADAS A LA WEB — un paso deliberado, como el catálogo del ERP.
 *
 * Hasta hoy las reseñas de la hoja llegaban por un `fetch` desde el navegador, después de
 * cargar la página. Eso tenía tres consecuencias que no se veían:
 *
 *   · Ningún buscador las leía. El HTML publicado de /resenas y de la portada contenía una
 *     sola reseña —la escrita a mano en el repositorio— y las de los clientes aparecían
 *     solo para quien tuviera JavaScript. Google indexaba lo primero.
 *   · No podían entrar a los datos estructurados, que se arman en el servidor.
 *   · Cada visita dependía de que `script.google.com` respondiera.
 *
 * Ahora se bajan acá, quedan versionadas en `src/data/resenasFeed.json` y se renderizan en
 * el servidor. La moderación no cambia: sigue siendo marcar la casilla «Aprobada» en la
 * hoja, y el guion solo sirve las aprobadas. Lo que cambia es que publicar una reseña nueva
 * pide un `npm run sync` y un despliegue — el mismo trato que el catálogo, y por la misma
 * razón: lo que se publica se revisa antes en un diff.
 *
 * Si la hoja no responde, el build NO se cae: se sigue con el último feed bajado.
 *
 *   node scripts/sync-resenas.mjs            # baja las aprobadas
 *   node scripts/sync-resenas.mjs --strict   # además falla si la hoja no responde
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DESTINO = path.join(raiz, "src/data/resenasFeed.json");
const STRICT = process.argv.includes("--strict");

/** El mismo endpoint del formulario: en GET devuelve solo las aprobadas. */
const ENDPOINT =
  process.env.RESENAS_ENDPOINT ||
  "https://script.google.com/macros/s/AKfycbzpaa2dsvGIvPP-sFStBRwmen3JoOv26N8LpOGmhG5WRWztxEG_wz6c59NDcdb28ox9Cw/exec";

const slug = (s) =>
  String(s ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** La fecha de la hoja llega en ISO; se guarda como YYYY-MM-DD, que es lo que usa la web. */
function soloFecha(valor) {
  const d = new Date(valor);
  return Number.isNaN(d.getTime()) ? "" : d.toISOString().slice(0, 10);
}

/**
 * Un identificador estable, porque la hoja no tiene columna de id.
 *
 * Se arma con la fecha y el nombre: mientras la fila no cambie, el id no cambia. Hace falta
 * para que las decisiones que viven en el código —si una reseña es apta para Schema.org, si
 * va destacada— sigan apuntando a la misma reseña después de cada sincronización.
 */
const idDe = (r, i) => `${soloFecha(r.fecha) || "sin-fecha"}-${slug(r.nombre) || i}`;

async function bajar() {
  const res = await fetch(ENDPOINT, {
    cache: "no-store",
    headers: { accept: "application/json", "cache-control": "no-cache" },
  });
  if (!res.ok) throw new Error(`la hoja respondió ${res.status}`);
  const datos = await res.json();
  if (!Array.isArray(datos)) throw new Error("la respuesta no es una lista de reseñas");
  return datos;
}

let crudas;
try {
  crudas = await bajar();
} catch (e) {
  const hayFeed = fs.existsSync(DESTINO);
  console.error(`✗ No se pudieron bajar las reseñas: ${e.message}`);
  if (STRICT) process.exit(1);
  console.error(hayFeed ? "  Se sigue con el último feed bajado." : "  No hay feed previo.");
  process.exit(0);
}

/* Solo lo que la web publica. El correo del cliente se queda en la hoja: no hace falta
   para mostrar una reseña y no tiene por qué viajar al repositorio ni al navegador. */
const resenas = crudas
  .filter((r) => r && r.resena && r.nombre)
  .map((r, i) => ({
    id: idDe(r, i),
    author: String(r.nombre).trim(),
    role: r.rol ? String(r.rol).trim() : undefined,
    rating: Number(r.calificacion) || 0,
    text: String(r.resena).trim(),
    date: soloFecha(r.fecha),
    product: r.producto ? String(r.producto).trim() : undefined,
    /* La hoja todavía no tiene columna `empresa`; cuando la tenga, llega sola. */
    company: r.empresa ? String(r.empresa).trim() : undefined,
  }))
  .sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

const anterior = fs.existsSync(DESTINO)
  ? (JSON.parse(fs.readFileSync(DESTINO, "utf8")).resenas ?? [])
  : [];

fs.writeFileSync(
  DESTINO,
  JSON.stringify({ actualizado: new Date().toISOString(), resenas }, null, 2) + "\n"
);

const nuevas = resenas.filter((r) => !anterior.some((a) => a.id === r.id));
console.log(`\n${resenas.length} reseña(s) aprobada(s) en la hoja.`);
if (nuevas.length) {
  console.log(`\n${nuevas.length} nueva(s) desde la última sincronización:\n`);
  for (const r of nuevas) {
    console.log(`  · ${r.author}${r.product ? ` — ${r.product}` : ""} (${r.rating}★, ${r.date})`);
  }
  console.log(
    "\n  Para que salgan en los datos estructurados de Google hay que marcarlas una a una\n" +
      "  en `src/data/reviews.ts` (`APTAS_PARA_GOOGLE`). Solo reseñas de clientes reales e\n" +
      "  independientes: marcar una propia expone el dominio entero a una acción manual."
  );
}
const idas = anterior.filter((a) => !resenas.some((r) => r.id === a.id));
if (idas.length) {
  console.log(
    `\n${idas.length} ya no está(n) aprobada(s): ${idas.map((r) => r.author).join(", ")}`
  );
}
console.log("");
