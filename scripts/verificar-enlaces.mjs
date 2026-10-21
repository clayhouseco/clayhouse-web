/**
 * ENLACES ROTOS, ANTES DE PUBLICAR.
 *
 * Un enlace interno roto en un sitio estático no avisa: la página se construye igual, el
 * build pasa, y el 404 solo lo descubre quien hizo clic. En este sitio pasa seguido porque
 * las rutas se escriben a mano en veinte plantillas y los slugs cambian cuando el ERP
 * renombra un producto.
 *
 * Lee el `dist/` ya construido —no el código— así que comprueba lo que de verdad se sube:
 *   · cada href/src interno apunta a un archivo o a una página que existe;
 *   · cada ancla `#algo` existe en la página destino;
 *   · el sitemap y lo construido coinciden en ambas direcciones.
 *
 * No toca la red: los enlaces externos se cuentan y se listan, no se visitan. Con `--strict`
 * devuelve código 1 y corta el despliegue.
 */
import fs from "node:fs";
import path from "node:path";

const DIST = path.resolve("dist");
const ESTRICTO = process.argv.includes("--strict");

if (!fs.existsSync(DIST)) {
  console.error("No hay dist/. Corre `npm run build` primero.");
  process.exit(1);
}

/** Todos los .html construidos, con su ruta pública. */
function paginas(dir = DIST) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const abs = path.join(dir, e.name);
    if (e.isDirectory()) return paginas(abs);
    if (!e.name.endsWith(".html")) return [];
    const rel = path.relative(DIST, abs).split(path.sep).join("/");
    const url = "/" + rel.replace(/index\.html$/, "").replace(/\.html$/, "");
    return [{ archivo: abs, rel, url: url === "/" ? "/" : url.replace(/\/$/, "") || "/" }];
  });
}

const HTML = paginas();
const porUrl = new Map(HTML.map((p) => [p.url, p]));

/** Los ids y names a los que se puede apuntar dentro de una página. */
const anclasDe = new Map();
function anclas(pagina) {
  if (anclasDe.has(pagina.url)) return anclasDe.get(pagina.url);
  const html = fs.readFileSync(pagina.archivo, "utf8");
  const set = new Set();
  for (const m of html.matchAll(/\s(?:id|name)=["']([^"']+)["']/g)) set.add(m[1]);
  anclasDe.set(pagina.url, set);
  return set;
}

/**
 * Un destino interno existe si hay un archivo o una página con esa ruta.
 *
 * Astro publica `/productos/romano` como `productos/romano/index.html`; un `.pdf` o un
 * `.webp` es un archivo tal cual. Se prueban las dos formas.
 */
function existe(ruta) {
  const limpia = decodeURIComponent(ruta.replace(/[?#].*$/, ""));
  const sinBarra = limpia.replace(/\/$/, "") || "/";
  if (porUrl.has(sinBarra)) return true;
  const abs = path.join(DIST, limpia);
  if (fs.existsSync(abs) && fs.statSync(abs).isFile()) return true;
  return fs.existsSync(path.join(DIST, sinBarra, "index.html"));
}

const EXTERNO = /^(https?:|mailto:|tel:|sms:|data:|blob:|javascript:|#)/i;
const rotos = [];
const anclasRotas = [];
const externos = new Map();

for (const pagina of HTML) {
  const html = fs.readFileSync(pagina.archivo, "utf8");
  const destinos = new Set();

  for (const m of html.matchAll(/\s(?:href|src|action|poster)=["']([^"']+)["']/g)) destinos.add(m[1]);
  /* El srcset lleva varias URLs separadas por coma, cada una con su ancho. */
  for (const m of html.matchAll(/\ssrcset=["']([^"']+)["']/g)) {
    for (const parte of m[1].split(",")) {
      const url = parte.trim().split(/\s+/)[0];
      if (url) destinos.add(url);
    }
  }

  for (const destino of destinos) {
    const d = destino.trim();
    if (!d) continue;

    if (d.startsWith("#")) {
      /* Un ancla a la misma página: el id tiene que existir acá. */
      const id = decodeURIComponent(d.slice(1));
      if (id && !anclas(pagina).has(id)) anclasRotas.push({ en: pagina.url, destino: d });
      continue;
    }
    if (EXTERNO.test(d)) {
      try {
        const host = new URL(d).host || d.split(":")[0];
        externos.set(host, (externos.get(host) ?? 0) + 1);
      } catch {
        externos.set(d.split(":")[0], (externos.get(d.split(":")[0]) ?? 0) + 1);
      }
      continue;
    }
    /* Relativo: se resuelve contra la carpeta de la página. */
    const absoluto = d.startsWith("/")
      ? d
      : "/" + path.posix.join(path.posix.dirname("/" + pagina.rel).slice(1), d);

    if (!existe(absoluto)) {
      rotos.push({ en: pagina.url, destino: d });
      continue;
    }
    const hash = d.includes("#") ? d.split("#")[1] : "";
    if (hash) {
      const ruta = absoluto.replace(/[?#].*$/, "").replace(/\/$/, "") || "/";
      const objetivo = porUrl.get(ruta);
      if (objetivo && !anclas(objetivo).has(decodeURIComponent(hash))) {
        anclasRotas.push({ en: pagina.url, destino: d });
      }
    }
  }
}

// ---- Sitemap: que lo publicado y lo listado sean lo mismo ----
const faltanEnSitemap = [];
const sobranEnSitemap = [];
const sitemapArchivos = fs
  .readdirSync(DIST)
  .filter((f) => /^sitemap.*\.xml$/.test(f))
  .map((f) => path.join(DIST, f));

if (sitemapArchivos.length) {
  const urls = new Set();
  for (const archivo of sitemapArchivos) {
    const xml = fs.readFileSync(archivo, "utf8");
    for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) {
      if (/sitemap.*\.xml$/.test(m[1])) continue; // el índice apunta a los otros sitemaps
      urls.add(new URL(m[1]).pathname.replace(/\/$/, "") || "/");
    }
  }
  for (const u of urls) if (!porUrl.has(u)) sobranEnSitemap.push(u);
  /* Las páginas de «gracias» y el 404 no se indexan a propósito: no se exigen. */
  const noIndexables = /\/404$|\/gracias$/;
  for (const p of HTML) {
    if (noIndexables.test(p.url)) continue;
    if (!urls.has(p.url)) faltanEnSitemap.push(p.url);
  }
}

// ---- Informe ----
const total = HTML.length;
console.log(`\n${total} páginas construidas.\n`);

if (rotos.length) {
  console.log(`✗ ${rotos.length} enlace(s) interno(s) roto(s):`);
  for (const r of rotos) console.log(`    ${r.en}  →  ${r.destino}`);
} else {
  console.log("✓ todos los enlaces internos apuntan a algo que existe");
}

if (anclasRotas.length) {
  console.log(`\n✗ ${anclasRotas.length} ancla(s) que no existe(n):`);
  for (const a of anclasRotas) console.log(`    ${a.en}  →  ${a.destino}`);
} else {
  console.log("✓ todas las anclas existen en su página destino");
}

if (sitemapArchivos.length) {
  if (sobranEnSitemap.length) {
    console.log(`\n✗ ${sobranEnSitemap.length} URL(s) en el sitemap que no se construyeron:`);
    for (const u of sobranEnSitemap) console.log(`    ${u}`);
  }
  if (faltanEnSitemap.length) {
    console.log(`\n⚠ ${faltanEnSitemap.length} página(s) construida(s) que el sitemap no lista:`);
    for (const u of faltanEnSitemap) console.log(`    ${u}`);
  }
  if (!sobranEnSitemap.length && !faltanEnSitemap.length) {
    console.log("✓ el sitemap y lo construido coinciden");
  }
} else {
  console.log("\n⚠ no hay sitemap en dist/");
}

const listaExternos = [...externos.entries()].sort((a, b) => b[1] - a[1]);
console.log(`\nEnlaces externos (no se visitan): ${listaExternos.length} destino(s)`);
for (const [host, n] of listaExternos) console.log(`    ${n.toString().padStart(4)}  ${host}`);

const falla = rotos.length || anclasRotas.length || sobranEnSitemap.length;
if (falla && ESTRICTO) {
  console.log("\nCon --strict esto corta el despliegue.");
  process.exit(1);
}
console.log("");
