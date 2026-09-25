/**
 * LOS DATOS DE LA FICHA TÉCNICA SALEN DEL ERP.
 *
 * `fichas.data.mjs` eran 1.588 líneas escritas a mano donde estaban OTRA VEZ las medidas, el
 * peso, el rendimiento, la norma y los colores que el ERP ya tiene. Tres copias del mismo dato
 * —el ERP, `products.ts` y este archivo— y ninguna forma de saber cuál estaba vieja.
 *
 * Y sí estaban distintas. La primera comparación encontró que la ficha del Cartagena publica
 * 1,6 kg y el ERP dice 2,8; el Romano 2,9 contra 2,5; el Toscano 76 und/m² contra 68. Son PDFs
 * que el cliente descarga y con los que calcula cuánto pesa un muro y cuántas piezas pedir.
 *
 * PERO EL ERP NO SIEMPRE TIENE LA RAZÓN, y por eso esto no lo pisa todo sin preguntar. La ficha
 * de la teja dice NTC 2086, que es la norma de tejas de arcilla; el ERP dice NTC 4205, que es la
 * de unidades de mampostería. Ahí la ficha está bien y el ERP mal. Cambiar los dos sentidos a
 * ciegas publicaría fichas peores que las de hoy.
 *
 * CÓMO QUEDA. El ERP es la fuente por defecto. Lo que no puede salir de él —los textos de venta,
 * la foto de marca— vive en `fichas.editorial.mjs`. Y cada dato en disputa está ahí ESCRITO
 * APARTE, con el valor que hoy se publica y una nota de qué dice el ERP, para que nadie lo
 * cambie sin darse cuenta. `npm run fichas:verificar` los lista todos.
 *
 * Un producto NUEVO no necesita nada de eso: su ficha se arma sola con lo que tenga el ERP.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const AQUI = path.dirname(fileURLToPath(import.meta.url));
const FEED = path.resolve(AQUI, "../../src/data/erpFeed.json");

/** «2,5» → 2.5 · «14» → 14 · cualquier otra cosa → null */
const num = (s) => {
  const n = Number(String(s ?? "").trim().replace(",", "."));
  return Number.isFinite(n) ? n : null;
};
const fmt = (n) => String(n).replace(".", ",");
const norm = (s) => String(s ?? "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();

/**
 * La llave de una fila de la tabla técnica: su etiqueta sin tildes, sin mayúsculas y EN
 * SINGULAR. El ERP dice «Tolerancia dimensional» y la ficha «TOLERANCIAS DIMENSIONALES»: es la
 * misma fila, y sin esto salía dos veces en el PDF.
 */
export const claveFila = (etiqueta) =>
  norm(etiqueta).replace(/\.$/, "").split(/\s+/).map((w) => w.replace(/(?:es|s)$/, "")).join(" ");

/**
 * «6*15*30» → [30, 15, 6]: de mayor a menor.
 *
 * NO por posición. La planta anota en el orden que quiere —el Romano es «6*15*30» y el Toscano
 * «14*5,2*28,5»— y tomar el primero como largo daba «largo: 6 cm» para un ladrillo de 30. Que
 * el largo de una pieza es su medida mayor sí se cumple siempre.
 */
export function medidas(dimension) {
  const xs = String(dimension ?? "").split(/[*x×]/).map(num).filter((n) => n !== null);
  return xs.length === 3 ? xs.sort((a, b) => b - a) : [];
}

/** Busca una especificación por etiqueta, sin importar tildes ni mayúsculas. */
export function espec(p, ...etiquetas) {
  for (const e of p.especificaciones ?? []) {
    if (etiquetas.some((x) => norm(x) === norm(e.etiqueta))) return String(e.valor ?? "").trim();
  }
  return "";
}

/**
 * Qué dibujo le toca a cada fila de la tabla técnica.
 *
 * El generador solo conoce estos nombres; una etiqueta que no esté acá se dibuja con el cubo,
 * que es el neutro. Es mejor un icono genérico que ninguno: la fila sin icono descuadra la
 * cuadrícula del PDF.
 */
const ICONOS = [
  [/peso/, "weight"],
  [/textura|acabado/, "layers"],
  [/tipo de uso|aplicacion|uso/, "home"],
  [/dimension|medida|espesor/, "cube"],
  [/rendimiento|unidades/, "grid"],
  [/resistencia a la compresi|compresi/, "compress"],
  [/absorci/, "drop"],
  [/fuego|incendio/, "flame"],
  [/tolerancia/, "arrows"],
];
const iconoDe = (etiqueta) => ICONOS.find(([re]) => re.test(norm(etiqueta)))?.[1] ?? "cube";

/** El catálogo del ERP, por página de la web. Varias filas si la página tiene formatos. */
export function catalogoDelErp() {
  const feed = JSON.parse(fs.readFileSync(FEED, "utf8"));
  const porPagina = new Map();
  for (const p of feed.productos ?? []) {
    if (!p.pagina) continue;
    const ps = porPagina.get(p.pagina);
    if (ps) ps.push(p); else porPagina.set(p.pagina, ps ?? [p]);
  }
  return { porPagina, actualizado: feed.actualizado ?? "" };
}

/**
 * LOS DATOS DE UNA FICHA, SACADOS DEL ERP.
 *
 * Devuelve solo lo que el ERP sabe. Lo que no sabe se deja fuera —no vacío— para que el
 * editorial pueda ponerlo sin que esto lo borre.
 */
export function datosDelErp(p) {
  const m = medidas(p.dimension);
  const filas = [];

  if (p.pesoKg) filas.push(["weight", "PESO APROX.", `${fmt(p.pesoKg)} kg`, "(por unidad)"]);
  if (m.length === 3) filas.push(["cube", "DIMENSIONES", `${m.map(fmt).join(" × ")} cm`, ""]);
  if (p.rendimiento) {
    /* El ERP escribe «≈ 68 und/m²» y a veces solo «43». La ficha las muestra con su unidad. */
    const r = String(p.rendimiento).trim();
    filas.push(["grid", "RENDIMIENTO", /und/i.test(r) ? r : `${r} und/m²`, "(por metro cuadrado)"]);
  }
  /**
   * Las demás especificaciones, en el orden en que están en el ERP.
   *
   * La norma NO: tiene su propio renglón arriba en el PDF y saldría dos veces. La TEXTURA y el
   * TIPO DE USO sí van —las fichas publicadas las llevan, con su icono de capas y de casa— y
   * estaban fuera por un descuido mío al escribir esta lista.
   */
  for (const e of p.especificaciones ?? []) {
    const et = norm(e.etiqueta);
    if (et === "norma") continue;
    if (filas.some((f) => norm(f[1]) === et)) continue;
    filas.push([iconoDe(e.etiqueta), String(e.etiqueta).toUpperCase(), String(e.valor), ""]);
  }

  const datos = {
    titulo: String(p.nombre ?? "").toUpperCase(),
    specsRow: filas,
  };
  const norma = espec(p, "Norma");
  if (norma) datos.norma = norma;
  if (m.length === 3) datos.dims = { largo: `${fmt(m[0])} cm`, ancho: `${fmt(m[1])} cm`, alto: `${fmt(m[2])} cm` };
  const colores = (p.colores ?? []).filter((c) => c.hex).map((c) => [c.nombre, c.hex]);
  if (colores.length) datos.colores = colores;
  return datos;
}

/**
 * Junta lo del ERP con lo editorial. Lo editorial MANDA donde esté escrito: es o bien algo que
 * el ERP no puede saber, o bien un dato en disputa que alguien decidió dejar como está.
 */
export function fusionar(delErp, editorial) {
  const out = { ...delErp, ...editorial };
  delete out.enDisputa;
  /* Una fila de la tabla se pisa por ETIQUETA, no reemplazando la tabla entera: así un override
     de un solo dato no se lleva por delante las demás filas que sí vienen del ERP. */
  if (delErp?.specsRow) {
    const base = delErp.specsRow.map((f) => [...f]);
    for (const fila of editorial?.specsRow ?? []) {
      const i = base.findIndex((f) => claveFila(f[1]) === claveFila(fila[1]));
      if (i >= 0) base[i] = fila; else base.push(fila);
    }
    /**
     * EL ORDEN DE LAS FILAS LO DECIDE LA FICHA, NO EL ERP.
     *
     * En el PDF las filas se leen de arriba abajo y se agruparon con criterio —el peso y la
     * medida primero, los ensayos después—. El ERP las devuelve en el orden en que alguien las
     * escribió en el maestro, que no tiene por qué ser ése. Cuando la ficha declara un `orden`,
     * manda; lo que no esté nombrado va al final, para que un dato nuevo del ERP aparezca en
     * vez de perderse.
     */
    if (editorial?.orden?.length) {
      const pos = new Map(editorial.orden.map((e, i) => [claveFila(e), i]));
      base.sort((a, b) => (pos.get(claveFila(a[1])) ?? 999) - (pos.get(claveFila(b[1])) ?? 999));
    }
    out.specsRow = base;
  }
  delete out.orden;
  return out;
}
