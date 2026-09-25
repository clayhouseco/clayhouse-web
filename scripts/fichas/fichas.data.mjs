/**
 * LAS FICHAS TÉCNICAS: los datos del ERP, más lo que el ERP no puede saber.
 *
 * Este archivo eran 1.588 líneas escritas a mano donde estaban OTRA VEZ las medidas, el peso, el
 * rendimiento, la norma y los colores que el ERP ya tiene. Tres copias del mismo dato —el ERP,
 * `products.ts` y ésta— y ninguna forma de saber cuál estaba vieja.
 *
 * Y sí estaban distintas. La ficha del Cartagena publica 1,6 kg y el ERP dice 2,8. El Romano 2,9
 * contra 2,5, y mide 28,3 × 14,5 contra 30 × 15. El Toscano 76 und/m² contra 68. Son PDFs que el
 * cliente descarga y con los que calcula cuánto pesa un muro y cuántas piezas pedir.
 *
 * AHORA NO HAY DÓNDE QUEDARSE VIEJO: los datos salen de `erpFeed.json`, que baja del ERP antes
 * de cada build. Lo que no puede salir de allá —los textos de venta, la foto de marca, el orden
 * de la tabla— vive en `fichas.editorial.mjs`.
 *
 * Y LO QUE ESTÁ EN DISPUTA SE CONSERVA COMO ESTÁ. El ERP no siempre tiene la razón: la ficha de
 * la teja dice NTC 2086, que es la norma de tejas de arcilla, y el ERP dice NTC 4205, que es la
 * de mampostería. Ahí la ficha está bien y el ERP mal. Así que ningún dato se pisa a ciegas: los
 * que no coinciden están escritos en el editorial con el valor que hoy se publica y una nota de
 * qué dice el ERP. `npm run fichas:verificar` los lista.
 *
 * Tras cambiar algo:
 *   npm run sync:erp                               (bajar el catálogo del ERP)
 *   node scripts/fichas/generate.mjs --all         (todas)
 *   node scripts/fichas/generate.mjs --only romano (una)
 * Ver scripts/fichas/README.md
 */
import { editorial } from "./fichas.editorial.mjs";
import { catalogoDelErp, datosDelErp, fusionar } from "./desde-erp.mjs";

const { porPagina, actualizado } = catalogoDelErp();

const escritas = editorial.map((e) => {
  const ps = porPagina.get(e.slug);
  /* Sin producto en el ERP la ficha se sostiene sola desde el editorial: son productos que la
     web todavía muestra y el ERP dejó de publicar (napolitano, enchape rústico, gran formato). */
  if (!ps?.length) { const { orden, ...resto } = e; void orden; return resto; }
  return fusionar(datosDelErp(ps[0]), e);
});

/**
 * LAS FICHAS DE LOS PRODUCTOS QUE NADIE HA ESCRITO.
 *
 * Un producto creado en el ERP no tenía ficha hasta que alguien viniera a escribirle una entrada
 * acá. El Super Terras lleva desde septiembre en la web, con su foto, sus dos colores y sus
 * precios, y sin PDF que descargar.
 *
 * Ahora la tiene: con sus medidas, su peso, su rendimiento, su norma y sus colores, que es lo
 * que un cliente busca en una ficha. Lo que le falta son los tres argumentos de venta y la lista
 * de usos —«Fachadas modernas residenciales», «Excelente desempeño estructural»— que no salen de
 * ningún dato y los escribe una persona en `fichas.editorial.mjs` cuando pueda. Mientras tanto
 * esas secciones salen vacías, que es honesto: el PDF no dice nada que nadie haya afirmado.
 */
const NACIDAS_EN_EL_ERP = {
  subtitulo: "LADRILLO DE ARCILLA COCIDA",
  features: [],
  usos: [],
  foto: "",
};

const nuevas = [];
for (const [slug, ps] of porPagina) {
  if (editorial.some((e) => e.slug === slug)) continue;
  const p = ps[0];
  nuevas.push({
    slug,
    ...NACIDAS_EN_EL_ERP,
    ...datosDelErp(p),
    clasificacion: String(p.nombre ?? "").toUpperCase(),
    /* La foto de portada que tenga el ERP. Es una foto de producto, no la de marca, pero una
       ficha sin foto se ve rota y la del ERP es la que hay hasta que alguien la fotografíe. */
    foto: p.imagen ?? "",
  });
}

export const fichas = [...escritas, ...nuevas];

/** Las que todavía no tienen textos de venta escritos: el PDF sale con esas secciones vacías. */
export const sinTextosDeVenta = nuevas.map((f) => f.slug);

/** Para `verificar.mjs`, que compara las dos fuentes sin fusionarlas. */
export { editorial };
export const erpDeFicha = (slug) => porPagina.get(slug) ?? [];
export const catalogoActualizado = actualizado;
