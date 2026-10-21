/**
 * LAS RESEÑAS QUE SE PUBLICAN.
 *
 * El contenido viene de la hoja, bajado por `npm run sync:resenas` a `resenasFeed.json`.
 * Antes llegaban por un `fetch` desde el navegador, después de cargar: el HTML publicado
 * —lo que lee un buscador— contenía una sola reseña escrita a mano acá, y las de los
 * clientes existían solo para quien tuviera JavaScript. Ahora se renderizan en el servidor.
 *
 * LO QUE SIGUE DECIDIÉNDOSE ACÁ son los dos juicios que una hoja de cálculo no puede
 * tomar: si una reseña es apta para los datos estructurados de Google, y cuál va destacada.
 * Es el mismo reparto que con el ERP: la fuente manda en los datos, el repositorio manda en
 * el criterio.
 */
import feed from "@/data/resenasFeed.json";

export interface Review {
  id: string;
  author: string;
  role?: string;
  rating: number;
  text: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  product?: string;
  /** Empresa, obra o proyecto. Es lo que hace comprobable una reseña: un nombre y un rol
   *  no se pueden verificar, una obra sí. Opcional: nadie tiene que decirlo. */
  company?: string;
  /** Apta para Schema.org. Ver `APTAS_PARA_GOOGLE`. */
  schemaOk?: boolean;
}

/**
 * LAS QUE PUEDEN IR A LOS DATOS ESTRUCTURADOS, UNA POR UNA.
 *
 * Google prohíbe el marcado de reseñas escritas por el propio negocio. Publicarlas como
 * `aggregateRating` expone el sitio a una acción manual por marcado engañoso, que retira
 * los fragmentos enriquecidos de TODO el dominio —no solo de esa página—. La reseña se
 * sigue mostrando a los visitantes; lo que se omite es el JSON-LD.
 *
 * Por eso esta lista se escribe a mano y está vacía por defecto: una reseña nueva no entra
 * sola. Añadir acá el `id` del feed solo cuando conste que es de un cliente real e
 * independiente — ni del equipo, ni de un familiar, ni solicitada a cambio de algo.
 */
const APTAS_PARA_GOOGLE = new Set<string>([]);

/** Reseñas publicadas y aprobadas, de la más reciente a la más antigua. */
export const reviews: Review[] = (feed.resenas as Review[]).map((r) => ({
  ...r,
  schemaOk: APTAS_PARA_GOOGLE.has(r.id),
}));

/** Cuándo se bajaron, para saber si el feed está viejo. */
export const resenasActualizadas: string = feed.actualizado;

/**
 * Las que se muestran en la portada.
 *
 * Antes dependía de una marca `featured` escrita a mano, que había que acordarse de mover
 * al llegar una reseña nueva. Ahora se eligen solas: las más recientes con buena
 * calificación, que es lo que alguien pondría a mano de todos modos.
 */
export function getFeaturedReviews(limit = 3): Review[] {
  return reviews.filter((r) => r.rating >= 4).slice(0, limit);
}

export function getAverageRating(list: Review[] = reviews): number {
  if (!list.length) return 0;
  const sum = list.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / list.length) * 10) / 10;
}

/** Reseñas de un producto (por nombre exacto), para mostrar en la página. */
export function getReviewsForProduct(productName: string): Review[] {
  return reviews.filter((r) => r.product && r.product.toLowerCase() === productName.toLowerCase());
}

/** Subconjunto que sí puede ir al Schema.org Product → AggregateRating + Review.
 *  Ver `APTAS_PARA_GOOGLE`: solo reseñas de clientes reales e independientes. */
export function getSchemaReviewsForProduct(productName: string): Review[] {
  return getReviewsForProduct(productName).filter((r) => r.schemaOk === true);
}
