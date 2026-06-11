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

/** Reseñas que mencionan explícitamente el producto (por nombre exacto).
 *  Usado para alimentar el Schema.org Product → AggregateRating + Review. */
export function getReviewsForProduct(productName: string): Review[] {
  return reviews.filter(
    (r) => r.product && r.product.toLowerCase() === productName.toLowerCase()
  );
}
