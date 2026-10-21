/**
 * LA UNIDAD DE VENTA, DEFINIDA UNA SOLA VEZ.
 *
 * Gerencia: «si un cliente va a cotizar m2 de teja, no funciona bien el cálculo: 60 m² son
 * 22 unidades por m² × 60, 1.320 tejas, que a $ 1.600 son $ 2.112.000». Salían $ 96.000.
 *
 * El error no estaba en una multiplicación: estaba en que cuatro lugares decidían por su
 * cuenta en qué unidad se vende cada producto. El ERP decía m² para la teja colonial, la
 * ficha decía «unidad», el cotizador leía la del ERP y el botón «agregar a cotización» de
 * la ficha mandaba la de la ficha. Cada uno tenía razón en su archivo y el resultado era
 * una cantidad de metros multiplicada por el precio de una pieza.
 *
 * Acá vive la única respuesta, y la da el ERP: es quien factura. Lo que la web puede hacer
 * es traducir su propio precio a esa unidad —con el rendimiento que publica el mismo ERP— o
 * callarse el precio si no hay con qué traducirlo. Lo que no puede es publicar una cifra en
 * una unidad y cobrarla en otra.
 */
import { erpDeSlug } from "@/data/erpFeed";
import { copANumero, numeroACop } from "@/utils/pesos";

export type UnidadVenta = "unidad" | "m2" | "ml";

/** Etiqueta para el cotizador (encabezado de columna, selector). */
export const UNIDAD_LABEL: Record<UnidadVenta, string> = {
  unidad: "Unidad",
  m2: "m²",
  ml: "ml",
};

/** Etiqueta para la ficha, que la escribe detrás del precio: «$ 2.450 / unidad». */
export const UNIDAD_PRECIO_LABEL: Record<UnidadVenta, string> = {
  unidad: "unidad",
  m2: "m²",
  ml: "ml",
};

/** Cualquier forma de escribir la unidad —la del ERP, la de la ficha— a una sola. */
export function normalizarUnidad(raw: string | null | undefined): UnidadVenta {
  const v = (raw ?? "").trim().toLowerCase();
  if (v === "m2" || v === "m²" || v === "mt2") return "m2";
  if (v === "ml" || v === "mt" || v === "metro lineal") return "ml";
  return "unidad";
}

/**
 * En qué unidad se vende este producto. MANDA EL ERP.
 *
 * Una página puede agrupar varios códigos (los rayados son tres formatos); todos se venden
 * en la misma unidad, así que basta el primero. Si el ERP no publica la página, la web se
 * queda con lo que tenga escrito: no hay con qué contradecirla.
 */
export function unidadDeVenta(slug: string, porDefecto?: string | null): UnidadVenta {
  const filas = erpDeSlug(slug);
  if (filas.length) return normalizarUnidad(filas[0].unidad);
  return normalizarUnidad(porDefecto);
}

/** "≈ 22 und/m²" → 22. Es el rendimiento que publica el ERP y en tejas es el único que
 *  existe: se traslapan, así que no se deduce de la geometría. */
export function unidadesPorM2(slug: string): number | null {
  for (const p of erpDeSlug(slug)) {
    const m = p.rendimiento?.match(/(\d+(?:[.,]\d+)?)\s*und/i);
    if (m) {
      const n = Number.parseFloat(m[1].replace(",", "."));
      if (Number.isFinite(n) && n > 0) return n;
    }
  }
  return null;
}

/* El manejo del dinero vive en `@/utils/pesos`, que no importa nada: así el cotizador lo usa
   en el navegador sin arrastrar el feed del ERP. Se re-exporta para no mover a quien ya lo
   importaba desde acá. */
export { copANumero, numeroACop } from "@/utils/pesos";

export interface PrecioEnUnidad {
  /** El precio ya expresado en la unidad de venta. */
  texto: string;
  /** El precio original, cuando hubo que convertirlo. La ficha lo muestra como referencia:
   *  quien compra por m² sigue queriendo saber cuánto vale la pieza. */
  equivale?: string;
}

/**
 * El precio expresado en la unidad en que se vende, o `null` si no hay forma de expresarlo.
 *
 * `null` NO significa que el producto no tenga precio: significa que el que hay está en otra
 * unidad y no existe el dato para convertirlo. Publicarlo así sería publicar una cifra que
 * la cotización va a contradecir, y por eso quien llama debe mostrar «Consultar» en su lugar.
 */
export function precioEnUnidadDeVenta(
  slug: string,
  precio: string | null | undefined,
  unidadDelPrecio: UnidadVenta,
  unidadDestino?: UnidadVenta
): PrecioEnUnidad | null {
  if (!precio) return null;
  const destino = unidadDestino ?? unidadDeVenta(slug, UNIDAD_PRECIO_LABEL[unidadDelPrecio]);
  if (destino === unidadDelPrecio) return { texto: precio };

  // Pieza → m²: el rendimiento del ERP dice cuántas piezas lleva un metro.
  if (destino === "m2" && unidadDelPrecio === "unidad") {
    const und = unidadesPorM2(slug);
    const base = copANumero(precio);
    if (!und || !base) return null;
    return { texto: numeroACop(base * und), equivale: precio };
  }

  /* El resto no se intenta. Dividir un precio por m² entre las piezas que caben daría una
     cifra plausible y falsa: nadie vende la pieza suelta de un producto que se despacha por
     metro, y el metro lineal no tiene equivalencia con ninguno de los dos. */
  return null;
}
