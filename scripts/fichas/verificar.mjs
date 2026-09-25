/**
 * QUÉ DICE DISTINTO LA FICHA TÉCNICA DE LO QUE DICE EL ERP.
 *
 * Los datos de la ficha salen del ERP, salvo los que alguien dejó escritos a mano en
 * `fichas.editorial.mjs` porque las dos fuentes no coinciden. Esos «datos en disputa» son
 * necesarios —el ERP no siempre tiene la razón: la norma de la teja es NTC 2086 y el ERP dice
 * NTC 4205— pero si nadie los mira se vuelven justo lo que se quería evitar: un dato viejo
 * escrito en dos sitios.
 *
 * Esto los lista. Cada línea es una decisión pendiente: o se corrige el ERP, o se corrige la
 * ficha, o se deja como está porque la ficha tiene razón. Lo que no se puede es no saberlo.
 *
 *   npm run fichas:verificar
 */
import { editorial, erpDeFicha, catalogoActualizado } from "./fichas.data.mjs";
import { datosDelErp, claveFila } from "./desde-erp.mjs";

const igual = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const corto = (v) => (typeof v === "string" ? v : JSON.stringify(v)).slice(0, 46);

const fisicos = [], textuales = [], huerfanas = [];

for (const e of editorial) {
  const ps = erpDeFicha(e.slug);
  if (!ps.length) { huerfanas.push(e.slug); continue; }
  const erp = datosDelErp(ps[0]);

  for (const campo of ["titulo", "norma", "dims", "colores"]) {
    if (e[campo] === undefined || erp[campo] === undefined || igual(e[campo], erp[campo])) continue;
    (campo === "dims" ? fisicos : textuales).push([e.slug, campo, corto(e[campo]), corto(erp[campo])]);
  }
  for (const fila of e.specsRow ?? []) {
    const x = (erp.specsRow ?? []).find((y) => claveFila(y[1]) === claveFila(fila[1]));
    if (!x || igual(x, fila)) continue;
    if (x[2] === fila[2]) continue;                       // solo cambia el icono: no es un dato
    const n = (s) => Number(String(s).match(/[\d,.]+/)?.[0]?.replace(",", ".") ?? NaN);
    const [a, b] = [n(fila[2]), n(x[2])];
    const lejos = Number.isFinite(a) && Number.isFinite(b) && Math.abs(a - b) / Math.max(a, b) > 0.03;
    (lejos ? fisicos : textuales).push([e.slug, fila[1], corto(fila[2]), corto(x[2])]);
  }
}

const tabla = (t) => t.map(([s, c, a, b]) => `  ${s.padEnd(22)} ${String(c).padEnd(28)} ficha: ${a.padEnd(48)} ERP: ${b}`).join("\n");

console.log(`Fichas técnicas contra el ERP — catálogo del ${String(catalogoActualizado).slice(0, 10)}\n`);
console.log(`═══ DATOS FÍSICOS QUE NO COINCIDEN (${fisicos.length}) ═══`);
console.log("El cliente calcula con estos números: cuánto pesa un muro, cuántas piezas caben en");
console.log("un metro, cuántas van en una mula. Uno de los dos está mal.\n");
console.log(fisicos.length ? tabla(fisicos) : "  (ninguno)");
console.log(`\n═══ NORMAS, NOMBRES Y TONOS (${textuales.length}) ═══`);
console.log("Diferencias de texto. Varias son del ERP: NTC 2086 es la norma de tejas de arcilla y");
console.log("NTC 4205 la de mampostería, así que ahí la ficha tiene razón.\n");
console.log(textuales.length ? tabla(textuales) : "  (ninguna)");
if (huerfanas.length) {
  console.log(`\n═══ FICHAS SIN PRODUCTO EN EL ERP (${huerfanas.length}) ═══`);
  console.log("Se publica su PDF pero el ERP no las ofrece: o se marcan allá, o se bajan de la web.\n");
  for (const s of huerfanas) console.log(`  ${s}`);
}
console.log(`\nTotal: ${fisicos.length + textuales.length} dato(s) en disputa.`);
