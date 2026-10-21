/**
 * EL RECORRIDO COMERCIAL COMPLETO, EN UN CHROME DE VERDAD.
 *
 * Empieza donde empieza el cliente —una ficha de producto— y termina donde el equipo recibe
 * la solicitud. Es el único camino del sitio por el que entra dinero, y hasta ahora solo se
 * comprobaba a mano: alguien abría la página, pulsaba, miraba y decidía que estaba bien.
 *
 * NO ESCRIBE EN PRODUCCIÓN. No se pulsa ningún botón de envío: ni WhatsApp, ni correo, ni
 * imprimir. Lo que se comprueba es lo que pasa ANTES de enviar —qué llegó al cotizador, con
 * qué cantidad, en qué unidad, a qué precio, y qué dice la validación cuando faltan datos—
 * y eso no toca el ERP ni la base. Para el envío, la medición y el registro está
 * `npm run probar:medicion`, que sustituye `fetch` por un doble.
 *
 * Requisitos: `npm run build` antes, y Chrome instalado.
 */
import { abrirChrome, esperar, servirDist } from "./lib/navegador.mjs";

const PUERTO = 4456;
const servidor = await servirDist(PUERTO);
const b = await abrirChrome(9312);
const base = `http://127.0.0.1:${PUERTO}`;

let fallos = 0;
const ok = (bien, texto, extra = "") => {
  console.log(`  ${bien ? "✓" : "✗"} ${texto}${extra ? " — " + extra : ""}`);
  if (!bien) fallos++;
};

console.log("\nDe la ficha de producto al cotizador:\n");

// ── 1. La ficha ──
await b.enviar("Page.navigate", { url: `${base}/productos/romano` });
await esperar(1800);
await b.evaluar(`localStorage.removeItem("clayhouse-quote-cart")`);

const boton = await b.evaluar(`
  (() => {
    const btn = document.querySelector("[data-add-to-quote]");
    if (!btn) return null;
    return JSON.stringify({ slug: btn.dataset.slug, unidad: btn.dataset.unit, precio: btn.dataset.price });
  })()
`);
ok(Boolean(boton), "la ficha trae el botón de agregar", boton ?? "");

await b.evaluar(`
  (() => {
    const q = document.querySelector("[data-qty-input]");
    if (q) { q.value = "750"; q.dispatchEvent(new Event("input", { bubbles: true })); }
    document.querySelector("[data-add-to-quote]").click();
  })()
`);
await esperar(2500);

ok((await b.evaluar(`location.pathname`)) === "/cotizacion", "el botón lleva al cotizador");

// ── 2. Lo que llegó ──
const estado = JSON.parse(
  await b.evaluar(`
  (() => {
    const lineas = [...document.querySelectorAll("[data-linea]")];
    const conProducto = lineas.filter((l) => l.querySelector('[data-campo="item"]').value);
    const primera = conProducto[0];
    return JSON.stringify({
      conProducto: conProducto.length,
      vacias: lineas.length - conProducto.length,
      producto: primera?.querySelector("[data-sel-name]")?.textContent?.trim(),
      sku: primera?.querySelector("[data-sel-code]")?.textContent?.trim(),
      cantidad: primera?.querySelector('[data-campo="cantidad"]')?.value,
      unidad: primera?.querySelector("[data-unidad]")?.textContent?.trim(),
      color: primera?.querySelector('[data-campo="color"]')?.value,
      total: document.querySelector("[data-doc-material]")?.textContent?.trim(),
    });
  })()
`)
);
ok(estado.conProducto === 1, "llegó exactamente un producto", `${estado.producto} · ${estado.sku}`);
ok(estado.vacias === 0, "y no quedó una línea en blanco de sobra");
ok(estado.cantidad === "750", "con la cantidad que se escribió en la ficha", estado.cantidad);
ok(Boolean(estado.unidad), "y su unidad de venta", estado.unidad);
ok(Boolean(estado.color), "con el color preseleccionado", estado.color);
ok(/\$/.test(estado.total ?? ""), "el documento ya muestra el estimado", estado.total);

// ── 3. El precio del documento es cantidad × precio de la ficha ──
const cuenta = JSON.parse(
  await b.evaluar(`
  (() => {
    const fila = document.querySelector("[data-doc-lineas] tr");
    const celdas = [...fila.querySelectorAll("td")].map((c) => c.textContent.trim());
    const num = (t) => Number((t.match(/[\\d.]+/)?.[0] ?? "0").replace(/\\./g, ""));
    return JSON.stringify({ unitario: num(celdas[2]), total: num(celdas[3]), cantidad: num(celdas[1]) });
  })()
`)
);
ok(
  cuenta.total === cuenta.unitario * cuenta.cantidad,
  "y el valor de la línea es cantidad × precio unitario",
  `${cuenta.cantidad} × ${cuenta.unitario} = ${cuenta.total}`
);

console.log("\nLo que pasa cuando faltan datos:\n");

// ── 4. Validación ──
await b.evaluar(`document.querySelector("[data-action-whatsapp]").click()`);
await esperar(600);
const aviso = JSON.parse(
  await b.evaluar(`
  (() => {
    const err = document.querySelector(".cotz-error");
    const campo = document.querySelector('[aria-invalid="true"]');
    return JSON.stringify({
      mensaje: err?.textContent,
      describe: campo?.getAttribute("aria-describedby") === err?.id,
      campo: campo?.getAttribute("name"),
      foco: document.activeElement?.getAttribute("name"),
    });
  })()
`)
);
ok(Boolean(aviso.mensaje), "sin nombre no se envía: el error sale junto al campo", aviso.mensaje);
ok(aviso.campo === "nombre" && aviso.foco === "nombre", "y el foco va a ese campo");
ok(aviso.describe, "el campo apunta a su mensaje para quien use lector de pantalla");

console.log("\nVarias líneas, y el carrito:\n");

// ── 5. Segunda línea ──
await b.evaluar(`
  (() => {
    document.querySelector("[data-add-linea]").click();
    const nueva = [...document.querySelectorAll("[data-linea]")].pop();
    nueva.querySelector("[data-pick]").click();
  })()
`);
await esperar(900);
const dos = JSON.parse(
  await b.evaluar(`
  (() => {
    const guardado = JSON.parse(localStorage.getItem("clayhouse-quote-cart") || "[]");
    const lineas = [...document.querySelectorAll("[data-linea]")].filter((l) => l.querySelector('[data-campo="item"]').value);
    return JSON.stringify({ enPantalla: lineas.length, enCarrito: guardado.length });
  })()
`)
);
ok(dos.enPantalla === 2, "se puede agregar un segundo producto");
ok(
  dos.enCarrito === dos.enPantalla,
  "el carrito guardado coincide con lo que se ve",
  `${dos.enCarrito} = ${dos.enPantalla}`
);

// ── 6. Borrar ──
await b.evaluar(`[...document.querySelectorAll("[data-del-linea]")].pop().click()`);
await esperar(600);
const quedan = await b.evaluar(
  `String(JSON.parse(localStorage.getItem("clayhouse-quote-cart") || "[]").length)`
);
ok(quedan === "1", "al borrar una línea desaparece del carrito: no reaparece al recargar");

// ── 7. Recoger en planta no exige la dirección de obra ──
await b.evaluar(`document.querySelector('[data-entrega="planta"]').click()`);
await esperar(400);
const planta = JSON.parse(
  await b.evaluar(`
  (() => {
    const caja = document.querySelector("[data-obra-fields]");
    const dir = document.querySelector("[data-direccion]");
    return JSON.stringify({
      oculto: caja.hidden,
      deshabilitado: dir.disabled,
      exigido: dir.required,
      enDocumento: document.querySelector("[data-doc-entrega]").textContent.trim(),
    });
  })()
`)
);
ok(
  planta.oculto && planta.deshabilitado && !planta.exigido,
  "recoger en planta no exige la dirección de obra"
);
ok(planta.enDocumento === "Recoge en planta", "y el documento lo dice", planta.enDocumento);

b.cerrar();
servidor.close();

if (fallos) {
  console.log(`\n✗ ${fallos} comprobación(es) fallaron.`);
  process.exit(1);
}
console.log("\n✓ El camino de la ficha al cotizador funciona, y nada se escribió en producción.");
