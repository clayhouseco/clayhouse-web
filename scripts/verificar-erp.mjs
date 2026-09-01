/**
 * Comprueba que el catálogo de la web NO se haya separado del ERP.
 *
 * El ERP es la fuente única: publica en /api/catalogo-web los productos con la casilla
 * "mostrar en web" marcada, solo calidad Primera. Este script compara los códigos que usa
 * src/data/erpCatalog.ts contra ese catálogo y falla si alguno no existe allá — que es
 * exactamente lo que pasaba antes: la web ofrecía productos que el ERP no podía cotizar,
 * y códigos inventados (BOC-PRE, BLQ, ENC-THB) que no correspondían a ninguno real.
 *
 *   npm run verificar:erp
 */
import { readFileSync } from "node:fs";

const URL_ERP = process.env.ERP_CATALOGO_URL || "https://erp.clayhouse.com.co/api/catalogo-web";

const txt = readFileSync(new URL("../src/data/erpCatalog.ts", import.meta.url), "utf8");
const ini = txt.indexOf("const ERP_MAP");
const cuerpo = txt.slice(ini, txt.indexOf("\n};", ini));

const web = [];
const re = /^\s{2}"?([a-z0-9-]+)"?:\s*\{/gm;
for (let m; (m = re.exec(cuerpo)); ) {
  let nivel = 0, i = m.index + m[0].length - 1, fin = i;
  for (; i < cuerpo.length; i++) {
    if (cuerpo[i] === "{") nivel++;
    else if (cuerpo[i] === "}") { nivel--; if (nivel === 0) { fin = i; break; } }
  }
  const b = cuerpo.slice(m.index, fin + 1);
  const uno = b.match(/codigo:\s*"([^"]+)"/);
  if (uno) web.push({ slug: m[1], codigo: uno[1] });
  const pv = b.match(/porVariante:\s*\{([^}]*)\}/);
  if (pv) for (const mm of pv[1].matchAll(/"?([\w.x]+)"?:\s*"([^"]+)"/g)) web.push({ slug: m[1], variante: mm[1], codigo: mm[2] });
}

const r = await fetch(URL_ERP);
if (!r.ok) { console.error(`No pude leer el catálogo del ERP (${URL_ERP}): HTTP ${r.status}`); process.exit(1); }
const { productos } = await r.json();
const enErp = new Map(productos.map((p) => [p.codigo, p]));

const rotos = web.filter((w) => !enErp.has(w.codigo));
const sinPublicar = productos.filter((p) => !web.some((w) => w.codigo === p.codigo));

console.log(`Catálogo del ERP: ${productos.length} productos publicados`);
console.log(`Catálogo de la web: ${web.length} códigos mapeados\n`);

if (rotos.length) {
  console.error("❌ Códigos de la web que NO existen en el catálogo publicado del ERP:");
  for (const w of rotos) console.error(`   ${w.codigo.padEnd(10)} ← ${w.slug}${w.variante ? ` (${w.variante})` : ""}`);
  console.error("\n   Una cotización con estos códigos no se puede cargar al ERP.");
}
if (sinPublicar.length) {
  console.log("\n⚠️  Publicados en el ERP y no mapeados en la web (no se ofrecen):");
  for (const p of sinPublicar) console.log(`   ${String(p.codigo).padEnd(10)} ${p.nombre} → /${p.pagina}`);
}
if (!rotos.length && !sinPublicar.length) console.log("✅ Los dos catálogos coinciden.");
process.exit(rotos.length ? 1 : 0);
