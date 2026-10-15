/**
 * ¿LA POLÍTICA DE SEGURIDAD DEJA PASAR LO QUE LA PÁGINA USA?
 *
 * Una CSP mal puesta no avisa: el navegador bloquea el recurso en silencio, la consola del
 * visitante dice algo que nadie lee y la página se queda sin el mapa, sin las reseñas o sin
 * medición. El error no aparece en el build ni en los registros del servidor.
 *
 * Esto compara las dos listas. De un lado, lo que `vercel.json` permite; del otro, todos los
 * dominios que el sitio ya construido nombra. Lo que esté en el sitio y no en la política es
 * un bloqueo esperando a que alguien lo descubra; lo que esté en la política y no en el sitio
 * es una puerta abierta que ya no hace falta —o un servicio que solo existe en producción,
 * como la medición de Google, que no se carga sin su variable de entorno—.
 *
 *   npm run verificar:csp        (necesita dist/: corre `npm run build` antes)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DIST = path.join(raiz, "dist");

if (!fs.existsSync(DIST)) {
  console.error("✗ No hay dist/. Corre `npm run build` antes de verificar la política.");
  process.exit(1);
}

/* ── La política, tal como la sirve Vercel ── */
const vercel = JSON.parse(fs.readFileSync(path.join(raiz, "vercel.json"), "utf8"));
const csp = (vercel.headers ?? [])
  .flatMap((h) => h.headers ?? [])
  .find((h) => h.key.toLowerCase() === "content-security-policy")?.value;

if (!csp) {
  console.error("✗ vercel.json no define Content-Security-Policy.");
  process.exit(1);
}

const directivas = new Map();
for (const trozo of csp.split(";")) {
  const [nombre, ...valores] = trozo.trim().split(/\s+/);
  if (nombre) directivas.set(nombre, valores);
}
const permitidos = new Set(
  [...directivas.values()].flat().filter((v) => v.startsWith("https://")).map((v) => v.slice(8))
);

/** ¿La política admite este dominio, en alguna directiva? Entiende `*.dominio`. */
const permitido = (host) =>
  [...permitidos].some((p) =>
    p.startsWith("*.") ? host === p.slice(2) || host.endsWith(p.slice(1)) : host === p
  );

/* ── Lo que el sitio nombra ──
   Se ignoran los dominios que solo aparecen como identificadores o como destino de un
   enlace: un `<a href>` lo abre el navegador como una navegación y la CSP no lo gobierna. */
const NO_SON_RECURSOS = new Set([
  "schema.org", "www.w3.org", "ogp.me", "purl.org", "gmpg.org", "www.sitemaps.org",
  "base.google.com",                       // espacio de nombres del feed de Merchant
  "wa.me", "api.whatsapp.com", "waze.com", // enlaces que abre el visitante
  "www.facebook.com", "www.instagram.com", "www.tiktok.com", "www.linkedin.com",
  "co.pinterest.com", "www.youtube.com", "www.openstreetmap.org", "www.google.com",
  "maps.app.goo.gl", "g.page", "search.google.com", "unpkg.com",
]);

const RECURSO = /(?:src|href)\s*=\s*["']https:\/\/([a-z0-9.-]+)/gi;
const URL_SUELTA = /https:\/\/([a-z0-9.-]+)/gi;
const enlaces = /<a\b[^>]*href\s*=\s*["']https:\/\/([a-z0-9.-]+)[^>]*>/gi;

const usados = new Map();   // host → ejemplos de dónde
function anotar(host, donde) {
  if (host.endsWith("clayhouse.com.co") || NO_SON_RECURSOS.has(host)) return;
  if (!usados.has(host)) usados.set(host, new Set());
  if (usados.get(host).size < 3) usados.get(host).add(donde);
}

function archivos(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...archivos(p));
    else if (/\.(html|js|css|xml)$/.test(e.name)) out.push(p);
  }
  return out;
}

for (const f of archivos(DIST)) {
  const texto = fs.readFileSync(f, "utf8");
  const rel = path.relative(DIST, f);
  /* Los href de <a> se descuentan: son navegaciones, no recursos cargados en la página. */
  const soloEnlaces = new Set([...texto.matchAll(enlaces)].map((m) => m[1]));
  const comoRecurso = new Set([...texto.matchAll(RECURSO)].map((m) => m[1]));
  for (const m of texto.matchAll(URL_SUELTA)) {
    const host = m[1].toLowerCase();
    if (soloEnlaces.has(host) && !comoRecurso.has(host)) continue;
    anotar(host, rel);
  }
}

/**
 * Servicios que el código sabe usar pero que hoy están apagados.
 *
 * El nombre del dominio viaja en el paquete aunque nadie lo pida: la analítica alternativa
 * solo se carga si se define su variable de entorno. No es un bloqueo real, pero sí una
 * trampa para quien la encienda mañana, así que se dice en voz alta en vez de callarlo.
 */
const APAGADOS = new Map([["plausible.io", "analítica alternativa (PUBLIC_PLAUSIBLE_DOMAIN)"]]);

/* ── El informe ── */
const bloqueados = [...usados.keys()].filter((h) => !permitido(h) && !APAGADOS.has(h)).sort();
const apagados = [...usados.keys()].filter((h) => !permitido(h) && APAGADOS.has(h)).sort();
const sinUsar = [...permitidos].filter((p) => {
  const sufijo = p.startsWith("*.") ? p.slice(1) : null;
  return ![...usados.keys()].some((h) => (sufijo ? h.endsWith(sufijo) : h === p));
}).sort();

console.log(`Política: ${directivas.size} directivas · ${permitidos.size} dominios permitidos`);
console.log(`Sitio construido: ${usados.size} dominios externos cargados como recurso\n`);

if (bloqueados.length) {
  console.error(`✗ ${bloqueados.length} dominio(s) que la página usa y la política NO permite:\n`);
  for (const h of bloqueados) {
    console.error(`  ${h}`);
    console.error(`     en: ${[...usados.get(h)].join(", ")}`);
  }
  console.error("\n  El navegador los bloquea sin decir nada a quien publica.");
} else {
  console.log("✓ Todo lo que la página carga está permitido por la política.");
}

if (apagados.length) {
  console.log(`\n· Nombrados en el código pero apagados y NO permitidos (${apagados.length}):`);
  for (const h of apagados) console.log(`  ${h} — ${APAGADOS.get(h)}`);
  console.log("  Encenderlos exige añadirlos antes a la política, o el navegador los bloquea.");
}

if (sinUsar.length) {
  console.log(`\n· Permitidos que este build no usa (${sinUsar.length}):`);
  console.log(`  ${sinUsar.join(", ")}`);
  console.log("  Normal para lo que solo existe en producción —la medición de Google no se");
  console.log("  carga sin PUBLIC_GA4_MEASUREMENT_ID—. Lo demás sobra y conviene quitarlo.");
}

process.exit(bloqueados.length ? 1 : 0);
