/**
 * ¿SE PUEDE PUBLICAR ESTE CATÁLOGO?
 *
 * `npm run verificar:datos` imprime la tabla de conflictos entre el ERP y la web y la deja
 * escrita en `erp-divergencias.md` para repartirla. Ese archivo NO se versiona: es el retrato
 * de un momento, y el build tiene que poder correr sin tocar nada que esté en git.
 *
 * `npm run verificar:datos -- --strict` además FALLA, y es lo que corre antes de cada
 * despliegue (`npm run build:prod`). No falla por cualquier diferencia: la mayoría son
 * decisiones humanas pendientes —cuánto pesa el Cartagena, qué norma lleva la teja— y bloquear
 * el despliegue por ellas dejaría la página sin poder publicar un cambio de texto durante
 * semanas. Falla por lo que haría daño si sale:
 *
 *   · No hay catálogo, viene vacío, o el que hay es demasiado viejo.
 *   · Un producto publicado sin código: no se puede cotizar ni inventariar.
 *   · Una unidad de venta que la web no sabe interpretar.
 *   · Un precio que no se puede expresar en la unidad en que se vende —el caso de la teja
 *     colonial, que durante meses se cotizó 22 veces más barata—.
 *   · Un producto visible que ningún código del ERP respalda: se puede ver y no se puede
 *     cotizar, y el cliente lo descubre al final del formulario.
 *
 * Todo lo demás se informa y sigue.
 */
import fs from "node:fs";
import path from "node:path";
import {
  raiz,
  leerFeed,
  edadDelFeed,
  conflictos,
  bloqueos,
  reporteMarkdown,
  productosDeLaWeb,
  codigosDeLaWeb,
  inactivosDeInventario,
  normalizarUnidad,
} from "./lib/catalogo.mjs";

const STRICT = process.argv.includes("--strict");
/** Un catálogo de más de un mes no es un catálogo: es una foto. */
const DIAS_MAXIMOS = Number(process.env.ERP_FEED_DIAS_MAXIMOS ?? 30);
const DIAS_AVISO = 7;

const salida = [];
const fatales = [];
const avisos = [];

const feed = leerFeed();
if (!feed || !Array.isArray(feed.productos) || !feed.productos.length) {
  console.error("✗ No hay catálogo del ERP en src/data/erpFeed.json (o viene vacío). Corre `npm run sync`.");
  process.exit(1);
}

const edad = edadDelFeed(feed);
if (edad === null) fatales.push("el catálogo no dice cuándo se bajó (`actualizado` ausente o ilegible)");
else if (edad > DIAS_MAXIMOS)
  fatales.push(`el catálogo del ERP tiene ${edad.toFixed(0)} días (máximo ${DIAS_MAXIMOS}). Corre \`npm run sync\` y revisa el diff`);
else if (edad > DIAS_AVISO)
  avisos.push(`el catálogo del ERP tiene ${edad.toFixed(0)} días; conviene sincronizar antes de desplegar`);

/* ── Unidades que la web sabe interpretar ── */
const UNIDADES = new Set(["unidad", "m2", "ml"]);
for (const p of feed.productos) {
  const cruda = String(p.unidad ?? "").trim().toLowerCase();
  if (!UNIDADES.has(normalizarUnidad(cruda)) || (cruda && !["unidad", "m2", "m²", "mt2", "ml", "mt"].includes(cruda)))
    fatales.push(`${p.codigo ?? p.id}: unidad de venta "${p.unidad}", que la web no sabe interpretar`);
}

/* ── Todo producto visible tiene que ser cotizable ── */
const { slugs: inactivos, fecha: fechaInventario, fuente: fuenteInventario } = inactivosDeInventario();
const codigos = codigosDeLaWeb();
const codigosErp = new Set(feed.productos.map((p) => p.codigo).filter(Boolean));
const paginasErp = new Set(feed.productos.map((p) => p.pagina).filter(Boolean));
const porSlugWeb = new Map();
for (const [codigo, de] of codigos) {
  if (!porSlugWeb.has(de.slug)) porSlugWeb.set(de.slug, []);
  porSlugWeb.get(de.slug).push(codigo);
}

for (const p of productosDeLaWeb()) {
  // Visible es lo mismo que en `isVisible`: lo publica el ERP, el inventario no lo desactivó
  // y no está oculto a mano.
  if (!paginasErp.has(p.slug) || inactivos.has(p.slug) || p.oculto) continue;
  const suyos = porSlugWeb.get(p.slug);
  // Sin entrada en ERP_MAP la web usa el código que publique el ERP para esa página: existe
  // por definición. El riesgo está en las entradas escritas a mano que ya no corresponden.
  if (!suyos) continue;
  if (!suyos.some((c) => codigosErp.has(c)))
    fatales.push(
      `${p.slug}: es visible en la web y ninguno de sus códigos (${suyos.join(", ")}) lo publica el ERP; ` +
        `se puede ver y no se puede cotizar`
    );
}

if (fuenteInventario === "seed-inicial")
  avisos.push(
    `la disponibilidad sigue siendo la semilla inicial (${fechaInventario}): nadie ha publicado la hoja de inventario, ` +
      `así que el único filtro real es lo que el ERP marque para la web`
  );

/* ── La tabla ── */
const filas = conflictos(feed);
for (const f of bloqueos(filas)) fatales.push(`${f.slug} · ${f.campo}: ${f.accion}`);

fs.writeFileSync(path.join(raiz, "erp-divergencias.md"), reporteMarkdown(feed, filas));

/* ── Lo que se imprime ── */
const ancho = (s, n) => String(s ?? "").slice(0, n).padEnd(n);
salida.push(`Catálogo del ERP: ${feed.productos.length} productos · bajado el ${String(feed.actualizado).slice(0, 10)}` +
  (edad !== null ? ` (hace ${edad.toFixed(0)} día(s))` : ""));
salida.push("");
if (filas.length) {
  salida.push(`${ancho("PRODUCTO", 22)} ${ancho("CAMPO", 22)} ${ancho("WEB", 26)} ${ancho("ERP", 26)} MANDA`);
  for (const f of filas)
    salida.push(`${ancho(f.slug, 22)} ${ancho(f.campo, 22)} ${ancho(f.web, 26)} ${ancho(f.erp, 26)} ${f.manda}`);
  salida.push("");
  salida.push(`${filas.length} conflicto(s). La acción de cada uno, en erp-divergencias.md`);
} else {
  salida.push("Sin conflictos: el ERP y la web dicen lo mismo.");
}
console.log(salida.join("\n"));

if (avisos.length) {
  console.log("");
  for (const a of avisos) console.log(`⚠ ${a}`);
}

if (fatales.length) {
  console.log("");
  console.error(`✗ ${fatales.length} problema(s) que no deberían salir a producción:`);
  for (const f of fatales) console.error(`   · ${f}`);
  if (STRICT) process.exit(1);
  console.error("   (no se detuvo nada: corre con --strict para que falle el build)");
} else if (STRICT) {
  console.log("\n✓ Nada que impida publicar este catálogo.");
}
