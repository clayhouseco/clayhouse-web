export interface Review {
  id: string;
  author: string;
  role?: string;
  rating: number;
  text: string;
  /** ISO date YYYY-MM-DD */
  date: string;
  product?: string;
  featured?: boolean;
  /** Apta para Schema.org. Google prohíbe el marcado de reseñas escritas por el
   *  propio negocio ("reseñas de la empresa sobre sí misma"): publicarlas como
   *  aggregateRating expone el sitio a una acción manual por marcado engañoso,
   *  que retira los fragmentos enriquecidos de TODO el dominio. La reseña se
   *  sigue mostrando en la página; lo que se omite es solo el JSON-LD.
   *  Marcar en true únicamente reseñas de clientes reales e independientes. */
  schemaOk?: boolean;
}

/** Reseñas publicadas y aprobadas. */
export const reviews: Review[] = [
  {
    id: "r1",
    author: "David Medina",
    role: "Cliente final",
    rating: 5,
    text: "Muy bien todo, excelente.",
    date: "2026-06-11",
    product: "Ladrillo Romano",
    featured: true,
  },
];

export function getFeaturedReviews(limit = 3): Review[] {
  return reviews.filter((r) => r.featured).slice(0, limit);
}

export function getAverageRating(list: Review[] = reviews): number {
  if (!list.length) return 0;
  const sum = list.reduce((acc, r) => acc + r.rating, 0);
  return Math.round((sum / list.length) * 10) / 10;
}

/** Reseñas de un producto (por nombre exacto), para mostrar en la página. */
export function getReviewsForProduct(productName: string): Review[] {
  return reviews.filter(
    (r) => r.product && r.product.toLowerCase() === productName.toLowerCase()
  );
}

/** Subconjunto que sí puede ir al Schema.org Product → AggregateRating + Review.
 *  Ver `schemaOk`: solo reseñas de clientes reales e independientes. */
export function getSchemaReviewsForProduct(productName: string): Review[] {
  return getReviewsForProduct(productName).filter((r) => r.schemaOk === true);
}
