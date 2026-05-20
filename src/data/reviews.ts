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

/** Reseñas publicadas (añada aquí las aprobadas tras recibirlas por Formspree) */
export const reviews: Review[] = [
  {
    id: "r1",
    author: "María Fernanda López",
    role: "Arquitecta · Medellín",
    rating: 5,
    text: "La cotización fue clara desde el primer contacto, las muestras llegaron a tiempo y el ladrillo Romano en obra superó lo que esperábamos en textura y tono.",
    date: "2025-11-12",
    product: "Ladrillo Romano",
    featured: true,
  },
  {
    id: "r2",
    author: "Constructora Altiplano",
    role: "Obra comercial · Envigado",
    rating: 5,
    text: "Buen acompañamiento en especificación y entregas. El enchape para fachada de retail se instaló sin sorpresas y el cliente quedó muy satisfecho con el acabado.",
    date: "2025-10-03",
    product: "Enchape Romano",
    featured: true,
  },
  {
    id: "r3",
    author: "Andrés Giraldo",
    role: "Desarrollador inmobiliario",
    rating: 4,
    text: "Proceso de compra ordenado: respuesta rápida por WhatsApp, ficha técnica útil para licencias y lotes consistentes en color entre entregas.",
    date: "2025-08-20",
    featured: true,
  },
  {
    id: "r4",
    author: "Estudio Materia",
    role: "Interiorismo · Cali",
    rating: 5,
    text: "Pedimos muestras de varias tonalidades y el equipo ayudó a definir la paleta. La comunicación durante la obra fue excelente.",
    date: "2025-06-15",
    product: "Ladrillo Toscano",
    featured: false,
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
