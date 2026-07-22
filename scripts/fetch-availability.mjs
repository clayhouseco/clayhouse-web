/**
 * Trae el inventario desde la hoja de Google (publicada como CSV) y regenera
 * src/data/availability.json antes del build.
 *
 * Configuración: variable de entorno PRODUCTS_SHEET_CSV_URL con la URL del CSV
 * publicado (Archivo → Compartir → Publicar en la web → CSV).
 *
 * Formato esperado de la hoja (la primera fila son encabezados):
 *   slug | producto | activo | motivo
 * "activo" acepta: casilla de verificación (TRUE/FALSE), SÍ/NO, 1/0, X.
 *
 * Reglas importantes:
 *  - Un slug que NO aparezca en la hoja se considera ACTIVO (una referencia
 *    nueva nunca queda oculta por accidente).
 *  - Si la hoja no responde o viene vacía, se conserva el availability.json
 *    actual y el build continúa. Nunca rompe el despliegue.
 */
import fs from "node:fs";
import path from "node:path";

const OUT = path.join(process.cwd(), "src/data/availability.json");
const PRODUCTS = path.join(process.cwd(), "src/data/products.ts");
const URL_CSV = process.env.PRODUCTS_SHEET_CSV_URL;

const log = (msg) => console.log(`[inventario] ${msg}`);

/** Parser CSV mínimo con soporte de comillas y comas dentro de campos. */
function parseCsv(text) {
  const rows = [];
  let row = [], field = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += c;
    } else if (c === '"') inQuotes = true;
    else if (c === ",") { row.push(field); field = ""; }
    else if (c === "\n") { row.push(field); rows.push(row); row = []; field = ""; }
    else if (c !== "\r") field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const TRUTHY = new Set(["true", "sí", "si", "s", "yes", "y", "1", "x", "activo"]);

function keep(reason) {
  log(`${reason} → se conserva el availability.json actual (el build continúa).`);
  process.exit(0);
}

if (!URL_CSV) keep("PRODUCTS_SHEET_CSV_URL no está definida");

let csv;
try {
  const res = await fetch(URL_CSV, { redirect: "follow" });
  if (!res.ok) keep(`la hoja respondió HTTP ${res.status}`);
  csv = await res.text();
} catch (e) {
  keep(`no se pudo leer la hoja (${e.message})`);
}

const rows = parseCsv(csv);
if (rows.length < 2) keep("la hoja vino vacía o sin filas de datos");

const header = rows[0].map((h) => h.trim().toLowerCase());
const iSlug = header.indexOf("slug");
const iActivo = header.indexOf("activo");
if (iSlug === -1 || iActivo === -1) {
  keep('faltan las columnas "slug" y/o "activo" en la hoja');
}

// Slugs reales del catálogo, para avisar de errores de digitación en la hoja.
const known = new Set(
  [...fs.readFileSync(PRODUCTS, "utf8").matchAll(/^\s*slug:\s*"([^"]+)"/gm)].map((m) => m[1])
);

const inactive = [];
const unknown = [];
for (const row of rows.slice(1)) {
  const slug = (row[iSlug] ?? "").trim();
  if (!slug) continue;
  if (!known.has(slug)) { unknown.push(slug); continue; }
  const activo = (row[iActivo] ?? "").trim().toLowerCase();
  if (!TRUTHY.has(activo)) inactive.push(slug);
}

if (unknown.length) {
  log(`⚠️  slugs en la hoja que no existen en el catálogo (se ignoran): ${unknown.join(", ")}`);
}

const payload = {
  _comment:
    "Generado por scripts/fetch-availability.mjs desde la hoja de inventario. No editar a mano: los cambios se hacen en el Google Sheet y se publican con el botón. Este archivo se versiona para que el build funcione aunque la hoja no responda.",
  updatedAt: new Date().toISOString().slice(0, 10),
  source: "google-sheet",
  inactive: inactive.sort(),
};

fs.writeFileSync(OUT, JSON.stringify(payload, null, 2) + "\n");
log(
  `ok · ${known.size} productos en catálogo · ${inactive.length} desactivados` +
    (inactive.length ? `: ${inactive.join(", ")}` : "")
);
