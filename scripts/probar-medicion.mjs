/**
 * ¿EL COTIZADOR MIDE LO QUE DICE MEDIR? — prueba en un navegador de verdad.
 *
 * La medición es el único código del sitio que, cuando se rompe, no se nota: la página
 * sigue funcionando, el cliente recibe su WhatsApp y los informes simplemente mienten. Un
 * `generate_lead` que se dispara al hacer clic —y no cuando el servidor confirma— infla
 * los leads de Google Ads, y Ads puja con eso.
 *
 * Esto lo comprueba de la única forma seria: abre el sitio construido en Chrome, hace el
 * recorrido y mira qué eventos salieron.
 *
 * NO ESCRIBE EN PRODUCCIÓN. Antes de pulsar nada se sustituye `fetch` por un doble que
 * responde lo que la prueba necesite sin salir de la máquina, así que la bandeja del ERP no
 * recibe cotizaciones de mentira. `window.open` y `window.print` también se neutralizan.
 *
 * Qué se comprueba:
 *   1. La secuencia completa: begin_quote → quote_product_selected → quote_submit_attempt
 *      → generate_lead → quote_whatsapp_open.
 *   2. `generate_lead` lleva código de producto, categoría, cantidad, valor y moneda.
 *   3. Con el servidor caído NO hay conversión, pero el canal sí se abre y el cliente ve
 *      el aviso.
 *   4. Un segundo canal no vuelve a contar la conversión.
 *   5. Nada personal —nombre, teléfono, correo— viaja al medidor.
 *   6. El origen de la campaña (utm, gclid) llega a las notas de la solicitud.
 *
 *   npm run probar:medicion
 */
import { CHROME } from "./lib/navegador.mjs";
import { spawn, execSync } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const PUERTO_WEB = 4399;
const PUERTO_CDP = 9335;

const esperar = (ms) => new Promise((r) => setTimeout(r, ms));
const fallos = [];
const ok = (cond, texto, detalle = "") => {
  console.log(`  ${cond ? "✓" : "✗"} ${texto}${detalle ? ` — ${detalle}` : ""}`);
  if (!cond) fallos.push(texto);
};

if (!fs.existsSync(CHROME)) {
  console.error(`✗ No encuentro Chrome en ${CHROME}. Defina CHROME_PATH.`);
  process.exit(1);
}

/* El módulo de medición solo se expone cuando hay una cuenta configurada, así que la
   prueba construye el sitio con una de mentira. El `dist/` resultante no se publica. */
console.log("Construyendo el sitio con una cuenta de medición de prueba…");
execSync("npx astro build", {
  stdio: "ignore",
  env: { ...process.env, PUBLIC_GA4_MEASUREMENT_ID: "G-PRUEBAMEDICION" },
});

/* Servidor estático mínimo: no hace falta nada más para abrir el sitio construido. */
const TIPOS = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".webp": "image/webp", ".jpg": "image/jpeg",
  ".png": "image/png", ".avif": "image/avif", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const servidor = http.createServer((req, res) => {
  let rel = decodeURIComponent(req.url.split("?")[0]);
  if (rel.endsWith("/")) rel += "index.html";
  const file = path.join(process.cwd(), "dist", rel);
  if (!file.startsWith(path.join(process.cwd(), "dist")) || !fs.existsSync(file)) {
    res.writeHead(404).end("no");
    return;
  }
  res.writeHead(200, { "content-type": TIPOS[path.extname(file)] || "application/octet-stream" });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => servidor.listen(PUERTO_WEB, r));

const perfil = fs.mkdtempSync("/tmp/clayhouse-medicion-");
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PUERTO_CDP}`, "--headless=new", "--no-first-run",
  `--user-data-dir=${perfil}`, "--disable-gpu", "about:blank",
], { stdio: "ignore" });

async function objetivo() {
  for (let i = 0; i < 40; i++) {
    try {
      const lista = await (await fetch(`http://127.0.0.1:${PUERTO_CDP}/json/list`)).json();
      const t = lista.find((x) => x.type === "page");
      if (t) return t;
    } catch { /* todavía no levanta */ }
    await esperar(250);
  }
  throw new Error("Chrome no respondió al protocolo de depuración");
}

const destino = await objetivo();
const ws = new WebSocket(destino.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pendientes = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pendientes.has(m.id)) { pendientes.get(m.id)(m); pendientes.delete(m.id); }
};
const enviar = (method, params = {}) =>
  new Promise((res) => { const i = ++id; pendientes.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evaluar = async (expression) =>
  (await enviar("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true }))
    .result?.result?.value;

await enviar("Page.enable");
await enviar("Runtime.enable");

/** Deja la página lista: recoge los eventos y neutraliza todo lo que saldría de ella. */
const preparar = (servidorResponde) => `(() => {
  window.__eventos = [];
  window.gtag = (tipo, nombre, props) => { if (tipo === "event") window.__eventos.push([nombre, props]); };
  window.fetch = async (url, opts) => {
    window.__peticion = { url: String(url), body: opts && opts.body };
    return { ok: ${servidorResponde}, status: ${servidorResponde ? 201 : 500} };
  };
  window.open = () => null;
  window.print = () => {};
  return typeof window.clayTrack;
})()`;

const llenar = `(() => {
  document.querySelector("[data-pick]").click();
  const f = document.getElementById("cotizacion-form");
  f.querySelector('[name="nombre"]').value = "PRUEBA MEDICION";
  f.querySelector('[name="telefono"]').value = "3000000000";
  const c = f.querySelector('[data-campo="cantidad"]');
  if (c) { c.value = "500"; c.dispatchEvent(new Event("input", { bubbles: true })); }
  return true;
})()`;

const nombres = async () => JSON.parse(await evaluar("JSON.stringify(window.__eventos.map(e => e[0]))"));

/* ── 1. Camino feliz ── */
console.log("\nCon el servidor respondiendo bien:");
await enviar("Page.navigate", { url: `http://localhost:${PUERTO_WEB}/cotizacion/` });
await esperar(3500);
const expuesto = await evaluar(preparar(true));
ok(expuesto === "function", "la medición está disponible en la página");
await evaluar(llenar);
await esperar(500);
await evaluar(`document.querySelector("[data-action-whatsapp]").click()`);
await esperar(1200);

const secuencia = await nombres();
const esperada = ["begin_quote", "quote_product_selected", "quote_submit_attempt", "generate_lead", "quote_whatsapp_open"];
ok(esperada.every((e) => secuencia.includes(e)), "se disparan los cinco eventos del recorrido", secuencia.join(" → "));
ok(secuencia.indexOf("generate_lead") > secuencia.indexOf("quote_submit_attempt"),
   "la conversión va después del intento, no antes");

const lead = JSON.parse(await evaluar(`JSON.stringify((window.__eventos.find(e => e[0] === "generate_lead") || [])[1] || null)`));
ok(!!lead && lead.currency === "COP" && lead.value > 0, "la conversión lleva valor y moneda",
   lead ? `${lead.value} ${lead.currency}` : "sin datos");
ok(!!lead && Array.isArray(lead.items) && lead.items[0] && lead.items[0].item_id && lead.items[0].quantity > 0,
   "la conversión lleva código, categoría y cantidad",
   lead && lead.items && lead.items[0] ? `${lead.items[0].item_id} · ${lead.items[0].item_category} · ${lead.items[0].quantity}` : "");

const personales = JSON.parse(await evaluar(
  `JSON.stringify(window.__eventos.filter(e => /PRUEBA MEDICION|3000000000|@/.test(JSON.stringify(e[1] || {}))))`
));
ok(personales.length === 0, "ningún evento lleva datos personales",
   personales.length ? JSON.stringify(personales).slice(0, 160) : "");

/* ── 2. Segundo canal ── */
await evaluar("window.__eventos = []");
await evaluar(`document.querySelector("[data-action-print]").click()`);
await esperar(900);
const segundo = await nombres();
ok(!segundo.includes("generate_lead"), "un segundo canal no vuelve a contar la conversión", segundo.join(" → "));
ok(segundo.includes("quote_print"), "pero sí registra el canal usado");

/* ── 3. Servidor caído, y origen de campaña ── */
console.log("\nCon el servidor caído, y llegando desde un anuncio:");
/* Se limpia el carrito: si queda la cotización del escenario anterior, la página la
   restaura al cargar y el formulario arranca con líneas que esta prueba no llenó. */
await evaluar(`try { localStorage.clear(); sessionStorage.clear(); } catch {}`);
await enviar("Page.navigate", {
  url: `http://localhost:${PUERTO_WEB}/cotizacion/?utm_source=google&utm_medium=cpc&utm_campaign=prueba&utm_content=anuncio-a&gclid=PRUEBA-GCLID`,
});
await esperar(3500);
await evaluar(preparar(false));
await evaluar(llenar);
await esperar(500);
await evaluar(`document.querySelector("[data-action-whatsapp]").click()`);
await esperar(1500);

const caido = await nombres();
ok(!caido.includes("generate_lead"), "sin confirmación del servidor NO hay conversión", caido.join(" → "));
ok(caido.includes("quote_whatsapp_open"), "pero el canal sí se abre: el cliente no se queda sin su WhatsApp");

const aviso = await evaluar(`(() => {
  const n = [...document.querySelectorAll("p,div,span")].filter(x => /No pudimos registrar/.test(x.textContent || ""));
  return n.length ? n[n.length - 1].textContent.trim() : "";
})()`);
ok(!!aviso, "el fallo se le dice al cliente", aviso.slice(0, 80));

const peticion = JSON.parse(await evaluar("JSON.stringify(window.__peticion || null)"));
const fila = peticion && peticion.body ? JSON.parse(peticion.body) : null;
const notas = (fila && fila.notas_comerciales) || [];
ok(notas.some((n) => n.includes("google / cpc / prueba")), "el origen de la campaña viaja con la solicitud",
   notas.find((n) => n.startsWith("Origen:")) || "");
ok(notas.some((n) => n.includes("PRUEBA-GCLID")), "el identificador de clic de Google también");

ws.close();
chrome.kill();
servidor.close();
try {
  fs.rmSync(perfil, { recursive: true, force: true });
} catch {
  /* Chrome todavía escribe en su perfil al cerrarse; es un temporal, se lo lleva el sistema. */
}

console.log(fallos.length ? `\n✗ ${fallos.length} comprobación(es) fallaron.` : "\n✓ La medición hace lo que dice hacer.");
console.log("  Nota: dist/ quedó construido con la cuenta de prueba. Corre `npm run build` antes de publicar.");
process.exit(fallos.length ? 1 : 0);
