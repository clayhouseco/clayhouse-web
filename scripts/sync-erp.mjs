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

/* Unidad de venta desalineada. Es la divergencia más cara de todas: la unidad la
   manda el ERP y el precio lo tiene la web, así que si no coinciden el cotizador
   multiplica metros cuadrados por el precio de una pieza. Pasó con la teja
   colonial —60 m² salían en $ 96.000 en vez de $ 2.112.000— y nadie lo vio
   durante meses porque ninguna comprobación miraba las dos cosas juntas. */
const bloqueDe = (slug) => {
  const i = productosTs.indexOf(`slug: "${slug}"`);
  if (i < 0) return "";
  const j = productosTs.indexOf('    slug: "', i + 10);
  return productosTs.slice(i, j > 0 ? j : i + 3000);
};
const unidadWeb = (slug) => (bloqueDe(slug).match(/priceUnitLabel: "([^"]+)"/) || [, "unidad"])[1];
const precioWeb = (slug) => (bloqueDe(slug).match(/pricePerUnit: "([^"]+)"/) || [, null])[1];

/* ─── Comparación campo a campo contra el ERP ───────────────────────────────
   El feed publica dimensión, peso, precio (dentro de `colores`) y fotos. La web
   tiene su propia copia de todo eso, escrita a mano, y hasta ahora nadie las
   comparaba: así vivieron meses el rendimiento inventado del Thin Brick, el
   precio de la teja colonial que multiplicaba mal, y un macizo con el precio y
   las medidas del 5x10x20 que se dejó de fabricar.

   No se pisa nada. El campo `dimension` del ERP es texto libre y cada producto
   usa un orden distinto (Toscano ancho·alto·largo, Cartagena largo·ancho·alto),
   así que importarlo a ciegas rompería fichas técnicas publicadas. Se reporta,
   y la decisión sigue siendo de quien conoce el producto. */
const num = (v) => { const d = String(v ?? "").replace(/[^\d]/g, ""); return d ? parseInt(d, 10) : null; };
const cm = (v) => { const m = String(v ?? "").match(/(\d+(?:[.,]\d+)?)/); return m ? parseFloat(m[1].replace(",", ".")) : null; };
/** Las tres medidas del ERP, en el orden en que las escribió: "6*13*25" o "40 x 25 x 1.5 cm". */
const medidasErp = (d) => (String(d ?? "").match(/\d+(?:[.,]\d+)?/g) || []).map((x) => parseFloat(x.replace(",", ".")));
/** Precio del ERP: vive dentro de `colores`, así que una variante sin color lo pierde. */
const precioErp = (ps) => {
  const v = ps.flatMap((p) => (p.colores || []).map((c) => c.precio)).filter((x) => typeof x === "number");
  return v.length ? Math.min(...v) : null;
};

const difPrecio = [], difMedida = [], difPeso = [], fotoNueva = [], sinPrecioErp = [];
for (const [slug, ps] of porSlug) {
  if (!slugsWeb.includes(slug)) continue;
  const b = bloqueDe(slug);

  const pe = precioErp(ps), pw = num((b.match(/pricePerUnit: "([^"]+)"/) || [])[1]);
  if (pe === null) sinPrecioErp.push(slug);
  else if (pw !== null && pe !== pw) difPrecio.push({ slug, web: pw, erp: pe });

  const me = medidasErp(ps[0].dimension);
  const mw = ["alto", "ancho", "largo"].map((k) => cm((b.match(new RegExp(`${k}: "([^"]+)"`)) || [])[1]));
  if (me.length === 3 && mw.every((x) => x !== null)) {
    // Se comparan como conjuntos: el ERP no respeta un orden fijo, así que lo
    // que importa es si son las mismas tres medidas, no en qué orden están.
    const a1 = [...me].sort((x, y) => x - y).join("·"), b1 = [...mw].sort((x, y) => x - y).join("·");
    if (a1 !== b1) difMedida.push({ slug, web: mw.join(" × "), erp: ps[0].dimension });
  }

  const ke = ps[0].pesoKg, kw = cm((b.match(/pesoAprox: "([^"]+)"/) || [])[1]);
  if (ke && kw && Math.abs(ke - kw) > 0.05) difPeso.push({ slug, web: kw, erp: ke });

  const externas = ps.flatMap((p) => [p.imagen, ...(p.fotos || [])]).filter((u) => u && /^https?:/.test(u));
  if (externas.length) fotoNueva.push({ slug, n: externas.length });
}

const unidadDistinta = [];
for (const [slug, ps] of porSlug) {
  if (!slugsWeb.includes(slug)) continue;
  const erpM2 = ps.some((p) => String(p.unidad).toLowerCase() === "m2");
  const webM2 = unidadWeb(slug) === "m²";
  if (erpM2 !== webM2)
    unidadDistinta.push({ slug, web: unidadWeb(slug), erp: ps[0].unidad, precio: precioWeb(slug), rend: ps[0].rendimiento });
}

if (soloWeb.length) lineas.push(`## La web los ofrece y el ERP no los publica (${soloWeb.length})\n\n` +
  soloWeb.map((s) => `- \`${s}\` — o se marca \`mostrar_web\` en el ERP, o se baja de la página.`).join("\n"));
if (soloErp.length) lineas.push(`## El ERP los publica y la web no tiene página (${soloErp.length})\n\n` +
  soloErp.map((s) => `- \`${s}\` — falta crearle la ficha en la web.`).join("\n"));
if (sinCodigo.length) lineas.push(`## Publicados sin código ERP (${sinCodigo.length})\n\n` +
  sinCodigo.map((s) => `- \`${s}\` — sin código no se puede cotizar ni inventariar.`).join("\n"));
if (sinColor.length) lineas.push(`## Publicados sin colores en el ERP (${sinColor.length})\n\n` +
  `Sus variantes en el ERP tienen el color vacío, así que el ERP no puede decir qué colores se ofrecen y la web sigue usando su propia lista.\n\n` +
  sinColor.map((s) => `- \`${s}\``).join("\n"));
if (unidadDistinta.length) lineas.push(`## Unidad de venta desalineada (${unidadDistinta.length})\n\n` +
  `El ERP manda la unidad y la web tiene el precio. Si no coinciden, el cotizador multiplica cantidades de una unidad por el precio de otra.\n\n` +
  unidadDistinta.map((d) =>
    `- \`${d.slug}\` — web: ${d.precio ?? "sin precio"} / ${d.web} · ERP: ${d.erp}${d.rend ? ` (${d.rend})` : ""}`
  ).join("\n"));
if (difPrecio.length) lineas.push(`## Precio distinto al del ERP (${difPrecio.length})\n\n` +
  `El ERP publica el precio dentro de cada color. Donde no coincide, la web está cotizando otra cifra.\n\n` +
  difPrecio.map((d) => `- \`${d.slug}\` — web: $ ${d.web.toLocaleString("es-CO")} · ERP: $ ${d.erp.toLocaleString("es-CO")}`).join("\n"));
if (difMedida.length) lineas.push(`## Dimensiones distintas a las del ERP (${difMedida.length})\n\n` +
  `Se comparan como conjunto: el campo del ERP es texto libre y cada producto usa un orden distinto.\n\n` +
  difMedida.map((d) => `- \`${d.slug}\` — web: ${d.web} · ERP: ${d.erp}`).join("\n"));
if (difPeso.length) lineas.push(`## Peso distinto al del ERP (${difPeso.length})\n\n` +
  difPeso.map((d) => `- \`${d.slug}\` — web: ${d.web} kg · ERP: ${d.erp} kg`).join("\n"));
if (fotoNueva.length) lineas.push(`## Fotos subidas al ERP que la web no tiene (${fotoNueva.length})\n\n` +
  `Están en el almacenamiento del ERP. La web sirve las suyas desde public/images/products/, así que hay que incorporarlas.\n\n` +
  fotoNueva.map((d) => `- \`${d.slug}\` — ${d.n} foto(s)`).join("\n"));
if (sinPrecioErp.length) lineas.push(`## Sin precio en el feed del ERP (${sinPrecioErp.length})\n\n` +
  `El precio viaja dentro de \`colores\`, así que una variante sin color asignado lo pierde. Asignar el color en el ERP lo haría publicable.\n\n` +
  sinPrecioErp.map((s) => `- \`${s}\``).join("\n"));
if (codigosHuerfanos.length) lineas.push(`## Códigos que la web usa y el ERP no publica (${codigosHuerfanos.length})\n\n` +
  codigosHuerfanos.map((c) => `- \`${c}\` (${codigosWeb.get(c)}) — una cotización con este código no se puede cargar al ERP.`).join("\n"));

const reporte = `# Divergencias entre el ERP y la página web\n\n` +
  `_Generado por \`npm run sync:erp\` · catálogo del ERP al ${feed.actualizado}._\n\n` +
  (lineas.length ? lineas.join("\n\n") : "Sin divergencias: los dos lados dicen lo mismo.\n");
fs.writeFileSync(REPORTE, reporte);

const total = soloWeb.length + soloErp.length + sinCodigo.length + sinColor.length + codigosHuerfanos.length +
  unidadDistinta.length + difPrecio.length + difMedida.length + difPeso.length + fotoNueva.length + sinPrecioErp.length;
console.log(total ? `⚠ ${total} divergencias con el ERP — detalle en erp-divergencias.md` : "✓ web y ERP dicen lo mismo");
