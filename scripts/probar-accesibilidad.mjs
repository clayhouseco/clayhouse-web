/**
 * ¿PUEDE USAR ESTA PÁGINA ALGUIEN QUE NO VE LA PANTALLA, O QUE NO USA RATÓN?
 *
 * Dos comprobaciones sobre el sitio ya construido, en un Chrome de verdad:
 *
 *   1. axe-core, el mismo motor que usan Lighthouse y las herramientas de Deque, sobre
 *      nueve páginas. Detecta contraste insuficiente, nombres accesibles que no coinciden
 *      con el texto visible, encabezados que saltan niveles y contenido fuera de todo
 *      punto de referencia.
 *   2. El teclado: que el primer tabulador llegue al enlace de saltar al contenido, que el
 *      foco no se escape de un diálogo abierto, que Escape cierre y devuelva el foco a
 *      donde estaba, y que se vea dónde está el foco.
 *
 * Lo segundo no lo mide ninguna herramienta automática: hay que pulsar las teclas. Acá se
 * pulsan de verdad, por el protocolo de depuración.
 *
 *   npm run build && npm run probar:accesibilidad
 *
 * axe-core se baja de su CDN la primera vez y queda en node_modules/.cache.
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { abrirChrome, esperar, servirDist } from "./lib/navegador.mjs";

const PUERTO = 4402;
const CDP = 9338;
const PAGINAS = ["/", "/productos", "/productos/romano", "/cotizacion", "/resenas",
  "/contacto", "/blog", "/proyectos", "/descargas"];
const AXE_URL = "https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js";
const CACHE = "node_modules/.cache/axe-core.js";

/* Se construye con una cuenta de medición de prueba para que exista el banner de cookies:
   sin ella no se emite, y su botón «Rechazar» llevaba meses con texto crema sobre el gris
   por defecto del navegador —1,11:1— sin que ninguna revisión local lo viera. */
console.log("Construyendo el sitio para la revisión…\n");
execSync("npx astro build", { stdio: "ignore", env: { ...process.env, PUBLIC_GA4_MEASUREMENT_ID: "G-PRUEBAA11Y" } });

async function axe() {
  if (fs.existsSync(CACHE)) return fs.readFileSync(CACHE, "utf8");
  const r = await fetch(AXE_URL, { signal: AbortSignal.timeout(30_000) });
  if (!r.ok) throw new Error(`no se pudo bajar axe-core (${r.status})`);
  const js = await r.text();
  fs.mkdirSync(path.dirname(CACHE), { recursive: true });
  fs.writeFileSync(CACHE, js);
  return js;
}

const AXE = await axe();
const servidor = await servirDist(PUERTO);
const { enviar, evaluar, tecla, cerrar } = await abrirChrome(CDP);

const fallos = [];
const ok = (cond, texto, detalle = "") => {
  console.log(`  ${cond ? "✓" : "✗"} ${texto}${detalle ? ` — ${detalle}` : ""}`);
  if (!cond) fallos.push(texto);
};
const ir = async (ruta, ms = 2500) => {
  await enviar("Page.navigate", { url: `http://localhost:${PUERTO}${ruta}` });
  await esperar(ms);
};

/* ─────────────────────────── 1. axe-core ─────────────────────────── */
console.log("Revisión automática (axe-core):\n");
let total = 0;
for (const ruta of PAGINAS) {
  await ir(ruta);
  await evaluar(AXE);
  const crudo = await evaluar(`axe.run(document, { resultTypes: ["violations"] }).then(r => JSON.stringify(
    r.violations.map(v => ({ id: v.id, impact: v.impact, n: v.nodes.length,
      ejemplo: String((v.nodes[0] || {}).target || ""), msg: ((v.nodes[0]||{}).any||[{}])[0]?.message || "" }))
  ))`);
  const v = JSON.parse(crudo || "[]");
  total += v.reduce((t, x) => t + x.n, 0);
  if (!v.length) {
    console.log(`  ✓ ${ruta}`);
  } else {
    for (const x of v) {
      console.log(`  ✗ ${ruta} · ${x.id} (${x.impact}) ×${x.n}`);
      console.log(`      ${x.ejemplo.slice(0, 70)}  ${x.msg.slice(0, 80)}`);
      fallos.push(`${ruta}: ${x.id}`);
    }
  }
}
console.log(`\n  ${total} elemento(s) con problemas en ${PAGINAS.length} páginas.`);

/* Los estados que solo existen tras una interacción: el banner de cookies y el carrito.
   Una revisión que solo mira la página en reposo no los ve nunca. */
await ir("/");
await evaluar(AXE);
const estados = await evaluar(`(async () => {
  const salida = [];
  const banner = document.getElementById("cookie-consent");
  if (banner) {
    banner.hidden = false;
    const r = await axe.run(banner, { resultTypes: ["violations"] });
    salida.push(["banner de cookies", r.violations.map(v => v.id + " ×" + v.nodes.length)]);
  }
  const abrir = document.querySelector("[data-quote-cart-open]");
  if (abrir) {
    abrir.click();
    await new Promise(r => setTimeout(r, 400));
    const cart = document.querySelector(".quote-cart");
    if (cart && !cart.hidden) {
      const r = await axe.run(cart, { resultTypes: ["violations"] });
      salida.push(["carrito de cotización", r.violations.map(v => v.id + " ×" + v.nodes.length)]);
    }
  }
  return JSON.stringify(salida);
})()`);
for (const [nombre, violaciones] of JSON.parse(estados || "[]")) {
  if (violaciones.length) {
    console.log(`  ✗ ${nombre}: ${violaciones.join(", ")}`);
    fallos.push(nombre);
  } else {
    console.log(`  ✓ ${nombre} (abierto)`);
  }
}

/* ─────────────────────────── 2. el teclado ─────────────────────────── */
console.log("\nNavegación con teclado:\n");

await ir("/");
await evaluar("document.body.focus()");
await tecla("Tab", 9);
const primero = await evaluar(`document.activeElement.className + "|" + (document.activeElement.textContent||"").trim().slice(0,30)`);
ok(/skip|saltar/i.test(primero || ""), "el primer tabulador llega al enlace de saltar al contenido", primero);

await ir("/proyectos", 2800);
await evaluar(`(() => { const b = document.querySelector("[data-project-id]"); b.focus(); b.click(); })()`);
await esperar(700);
ok((await evaluar(`!document.querySelector("[data-viewer]").hidden`)) === true, "el visor de proyectos se abre con el teclado");

let fuera = 0;
for (let i = 0; i < 14; i++) {
  await tecla("Tab", 9);
  const dentro = await evaluar(`document.querySelector("[data-viewer]").contains(document.activeElement)`);
  if (!dentro) fuera++;
}
ok(fuera === 0, "el tabulador no se escapa del visor", fuera ? `se salió ${fuera} vez/veces` : "14 pulsaciones adentro");

await tecla("Escape", 27);
await esperar(500);
ok((await evaluar(`document.querySelector("[data-viewer]").hidden`)) === true, "Escape cierra el visor");
ok((await evaluar(`document.activeElement.hasAttribute("data-project-id")`)) === true,
   "y el foco vuelve a la tarjeta desde la que se abrió");

await enviar("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
await ir("/");
ok((await evaluar(`document.querySelector(".header__toggle").getAttribute("aria-controls")`)) === "header-nav",
   "el botón del menú declara qué controla");
await evaluar(`(() => { const b = document.querySelector(".header__toggle"); b.focus(); b.click(); })()`);
await esperar(400);
ok((await evaluar(`document.querySelector(".header__toggle").getAttribute("aria-expanded")`)) === "true",
   "el menú se anuncia abierto");
await tecla("Escape", 27);
await esperar(400);
ok((await evaluar(`document.querySelector(".header__toggle").getAttribute("aria-expanded")`)) === "false",
   "Escape cierra el menú");
ok(/header__toggle/.test((await evaluar(`document.activeElement.className`)) || ""),
   "y el foco vuelve al botón del menú");

const contorno = await evaluar(`(() => {
  const a = document.querySelector("a[href='/productos']");
  a.focus();
  const s = getComputedStyle(document.activeElement);
  return s.outlineStyle + "|" + s.outlineWidth;
})()`);
ok(!/^none/.test(contorno || "none"), "se ve dónde está el foco", contorno);

cerrar();
servidor.close();
console.log(fallos.length ? `\n✗ ${fallos.length} comprobación(es) fallaron.` : "\n✓ Sin violaciones y el teclado llega a todo.");
process.exit(fallos.length ? 1 : 0);
