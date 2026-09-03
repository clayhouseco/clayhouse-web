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

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FEED = process.env.ERP_CATALOGO_URL || "https://erp.clayhouse.com.co/api/catalogo-web";
const DESTINO = path.join(raiz, "src/data/erpFeed.json");
const REPORTE = path.join(raiz, "erp-divergencias.md");
const STRICT = process.argv.includes("--strict");

function leerSnapshot() {
  try { return JSON.parse(fs.readFileSync(DESTINO, "utf8")); } catch { return null; }
}

async function bajar() {
  const ctrl = AbortSignal.timeout(20_000);
  const r = await fetch(FEED, { signal: ctrl, headers: { accept: "application/json" } });
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
  console.log(`ERP → web: ${feed.productos.length} productos publicados${cambio ? "  (el catálogo CAMBIÓ)" : "  (sin cambios)"}`);
} catch (e) {
  feed = leerSnapshot();
  const msg = `No se pudo leer el catálogo del ERP (${e.message}).`;
  if (!feed) {
    console.error(`✗ ${msg} Y no hay copia local para seguir.`);
    process.exit(1);
  }
  if (STRICT) { console.error(`✗ ${msg}`); process.exit(1); }
  console.warn(`⚠ ${msg} Se sigue con la última copia bajada (${feed.actualizado}).`);
}

/* ───────────────── divergencias entre las dos listas ───────────────── */

const ts = (f) => fs.readFileSync(path.join(raiz, "src/data", f), "utf8");
const productosTs = ts("products.ts");
const slugsWeb = [...productosTs.matchAll(/slug: "([^"]+)"/g)].map((m) => m[1]);
// Solo los códigos de ERP_MAP. Barrer todo el archivo también recogería los códigos de
// color y de calidad (NAT, PRI…), que no son productos y darían falsos huérfanos.
const erpCatalogTs = ts("erpCatalog.ts");
const ini = erpCatalogTs.indexOf("const ERP_MAP");
const mapaTs = erpCatalogTs.slice(ini, erpCatalogTs.indexOf("\n};", ini));
const codigosWeb = new Map();
// Se recorren llaves balanceadas y no por líneas: en ERP_MAP hay entradas de una sola
// línea y entradas de varias, y un regex por línea se salta justamente las cortas.
const re = /^\s{2}"?([a-z0-9-]+)"?:\s*\{/gm;
for (let m; (m = re.exec(mapaTs)); ) {
  let nivel = 0, i = m.index + m[0].length - 1, fin = i;
  for (; i < mapaTs.length; i++) {
    if (mapaTs[i] === "{") nivel++;
    else if (mapaTs[i] === "}" && --nivel === 0) { fin = i; break; }
  }
  const cuerpo = mapaTs.slice(m.index, fin + 1);
  const uno = cuerpo.match(/codigo:\s*"([^"]+)"/);
  if (uno) codigosWeb.set(uno[1], m[1]);
  const pv = cuerpo.match(/porVariante:\s*\{([^}]*)\}/);
  if (pv) for (const mm of pv[1].matchAll(/"?([\w.x]+)"?:\s*"([^"]+)"/g)) codigosWeb.set(mm[2], `${m[1]} ${mm[1]}`);
}

const porSlug = new Map();
for (const p of feed.productos) {
  if (!p.pagina) continue;
  (porSlug.get(p.pagina) ?? porSlug.set(p.pagina, []).get(p.pagina)).push(p);
}

const lineas = [];
const soloWeb = slugsWeb.filter((s) => !porSlug.has(s));
const soloErp = [...porSlug.keys()].filter((s) => !slugsWeb.includes(s));
const sinCodigo = feed.productos.filter((p) => !p.codigo).map((p) => p.pagina ?? p.id);
const sinColor = [...porSlug.entries()].filter(([, ps]) => ps.every((p) => !p.colores?.length)).map(([s]) => s);
const codigosHuerfanos = [...codigosWeb.keys()].filter((c) => !feed.productos.some((p) => p.codigo === c));

if (soloWeb.length) lineas.push(`## La web los ofrece y el ERP no los publica (${soloWeb.length})\n\n` +
  soloWeb.map((s) => `- \`${s}\` — o se marca \`mostrar_web\` en el ERP, o se baja de la página.`).join("\n"));
if (soloErp.length) lineas.push(`## El ERP los publica y la web no tiene página (${soloErp.length})\n\n` +
  soloErp.map((s) => `- \`${s}\` — falta crearle la ficha en la web.`).join("\n"));
if (sinCodigo.length) lineas.push(`## Publicados sin código ERP (${sinCodigo.length})\n\n` +
  sinCodigo.map((s) => `- \`${s}\` — sin código no se puede cotizar ni inventariar.`).join("\n"));
if (sinColor.length) lineas.push(`## Publicados sin colores en el ERP (${sinColor.length})\n\n` +
  `Sus variantes en el ERP tienen el color vacío, así que el ERP no puede decir qué colores se ofrecen y la web sigue usando su propia lista.\n\n` +
  sinColor.map((s) => `- \`${s}\``).join("\n"));
if (codigosHuerfanos.length) lineas.push(`## Códigos que la web usa y el ERP no publica (${codigosHuerfanos.length})\n\n` +
  codigosHuerfanos.map((c) => `- \`${c}\` (${codigosWeb.get(c)}) — una cotización con este código no se puede cargar al ERP.`).join("\n"));

const reporte = `# Divergencias entre el ERP y la página web\n\n` +
  `_Generado por \`npm run sync:erp\` · catálogo del ERP al ${feed.actualizado}._\n\n` +
  (lineas.length ? lineas.join("\n\n") : "Sin divergencias: los dos lados dicen lo mismo.\n");
fs.writeFileSync(REPORTE, reporte);

const total = soloWeb.length + soloErp.length + sinCodigo.length + sinColor.length + codigosHuerfanos.length;
console.log(total ? `⚠ ${total} divergencias con el ERP — detalle en erp-divergencias.md` : "✓ web y ERP dicen lo mismo");
