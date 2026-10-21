/**
 * EL ENVÍO DE UNA RESEÑA, EN UN CHROME DE VERDAD.
 *
 * Durante meses este formulario mandaba la reseña con `mode: "no-cors"` —que le impide al
 * navegador leer la respuesta— y después llevaba a «gracias» pasara lo que pasara. Con la
 * hoja caída o el guion borrado, quien escribía veía la misma página de agradecimiento y su
 * texto se perdía sin que nadie se enterara. Esta prueba existe para que eso no vuelva.
 *
 * NO ESCRIBE EN LA HOJA. Antes de pulsar nada se sustituye `fetch` por un doble que
 * responde lo que la prueba decida, así que no se crea ninguna fila y no hay nada que
 * borrar después. Lo que se comprueba es la decisión del formulario, no Google.
 *
 * Requisitos: `npm run build` antes, y Chrome instalado.
 */
import { abrirChrome, esperar, servirDist } from "./lib/navegador.mjs";

const PUERTO = 4461;
const servidor = await servirDist(PUERTO);
const b = await abrirChrome(9315);
const base = `http://127.0.0.1:${PUERTO}`;

let fallos = 0;
const ok = (bien, texto, extra = "") => {
  console.log(`  ${bien ? "✓" : "✗"} ${texto}${extra ? " — " + extra : ""}`);
  if (!bien) fallos++;
};

/** Deja el formulario lleno y `fetch` sustituido por un doble con la respuesta pedida. */
async function preparar(respuesta) {
  await b.enviar("Page.navigate", { url: `${base}/resenas` });
  await esperar(1800);
  const estadoFormulario = await b.evaluar(`
    (() => {
      /* En sessionStorage y no en una variable de la página: el camino bueno navega a
         «gracias», y lo que viva en la página se pierde justo antes de poder mirarlo. */
      sessionStorage.removeItem("__enviado");
      window.fetch = (url, opciones) => {
        sessionStorage.setItem("__enviado", JSON.stringify({
          url: String(url),
          modo: String((opciones && opciones.mode) ?? "sin modo"),
          cuerpo: String((opciones && opciones.body) ?? ""),
        }));
        ${respuesta}
      };
      const f = document.querySelector("[data-reviews-form]");
      const poner = (sel, v) => { const el = f.querySelector(sel); if (el) { el.value = v; el.dispatchEvent(new Event("input", {bubbles:true})); } };
      poner('[name="nombre"]', "Prueba Automatizada");
      poner('[name="email"]', "prueba@example.com");
      poner('[name="resena"]', "Texto de prueba que no debe perderse.");
      /* Los tres obligatorios que no son de texto: calificación, autorización y
         —si existiera— cualquier otro marcable. Sin ellos el navegador ni dispara
         el envío, y la prueba mediría su propia omisión. */
      const radio = f.querySelector('input[name="calificacion"]'); if (radio) radio.checked = true;
      f.querySelectorAll('input[type="checkbox"][required]').forEach((c) => { c.checked = true; });
      const sel = f.querySelector('select[name="producto"]');
      if (sel && sel.options.length > 1) sel.selectedIndex = 1;
      /* Si algo quedara inválido, que la prueba lo diga en vez de fallar en silencio. */
      return f.checkValidity() ? "listo" : "INVÁLIDO: " + [...f.elements].filter((e) => !e.validity.valid).map((e) => e.name).join(", ");
    })()
  `);
  if (estadoFormulario !== "listo") {
    console.log(`  ✗ el formulario no quedó válido — ${estadoFormulario}`);
    fallos++;
  }
}

const enviar = async () => {
  await b.evaluar(`document.querySelector("[data-reviews-form]").requestSubmit()`);
  await esperar(900);
};

console.log("\nCuando la hoja responde bien:\n");
await preparar(`return Promise.resolve(new Response('{"ok":true}', { status: 200 }));`);
await enviar();
const tras = JSON.parse(
  await b.evaluar(`
  JSON.stringify({ url: location.pathname, enviado: sessionStorage.getItem("__enviado") })
`)
);
const enviado = tras.enviado ? JSON.parse(tras.enviado) : null;
ok(
  Boolean(enviado),
  "se manda la reseña al guion de la hoja",
  enviado ? enviado.url.slice(0, 48) : ""
);
ok(
  Boolean(enviado) && enviado.modo !== "no-cors",
  "y ya NO se manda a ciegas",
  enviado ? enviado.modo : ""
);
ok(Boolean(enviado) && /nombre=/.test(enviado.cuerpo), "con lo que la persona escribió");
ok(tras.url.startsWith("/resenas/gracias"), "y solo entonces se va a «gracias»", tras.url);

console.log("\nCuando la hoja responde con error:\n");
await preparar(`return Promise.resolve(new Response('{"ok":false}', { status: 500 }));`);
await enviar();
const malo = JSON.parse(
  await b.evaluar(`
  (() => {
    const e = document.querySelector("[data-reviews-estado]");
    const f = document.querySelector("[data-reviews-form]");
    return JSON.stringify({
      url: location.pathname,
      aviso: e && !e.hidden ? e.textContent.trim() : "",
      textoIntacto: f.querySelector('[name="resena"]').value,
      botonUsable: !f.querySelector('button[type="submit"]').disabled,
    });
  })()
`)
);
ok(!malo.url.startsWith("/resenas/gracias"), "NO se dice «gracias» si no se guardó", malo.url);
ok(Boolean(malo.aviso), "se le dice a la persona qué pasó", malo.aviso.slice(0, 70));
ok(malo.textoIntacto.includes("no debe perderse"), "y su texto sigue ahí, no hay que reescribirlo");
ok(malo.botonUsable, "el botón vuelve a quedar usable para reintentar");

console.log("\nCuando no hay red:\n");
await preparar(`return Promise.reject(new TypeError("Failed to fetch"));`);
await enviar();
const caido = JSON.parse(
  await b.evaluar(`
  (() => {
    const e = document.querySelector("[data-reviews-estado]");
    return JSON.stringify({
      url: location.pathname,
      aviso: e && !e.hidden ? e.textContent.trim() : "",
      textoIntacto: document.querySelector('[name="resena"]').value,
    });
  })()
`)
);
ok(!caido.url.startsWith("/resenas/gracias"), "tampoco se dice «gracias»");
ok(/conexión/i.test(caido.aviso), "se nombra la causa probable", caido.aviso.slice(0, 70));
ok(caido.textoIntacto.includes("no debe perderse"), "y el texto tampoco se pierde");

b.cerrar();
servidor.close();

if (fallos) {
  console.log(`\n✗ ${fallos} comprobación(es) fallaron.`);
  process.exit(1);
}
console.log(
  "\n✓ El formulario de reseñas sabe si se guardó, y lo dice. No se escribió en la hoja."
);
