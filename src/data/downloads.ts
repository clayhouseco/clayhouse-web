import { products } from "@/data/products";

export interface Download {
  title: string;
  slug: string;
  type: string;
  description: string;
  order: number;
  file: string;
}

/** Fichas técnicas activas (una por producto del catálogo) */
export const downloads: Download[] = products.map((p, index) => ({
  title: `Ficha técnica — ${p.name}`,
  slug: `ficha-${p.slug}`,
  type: "Ficha técnica",
  description: p.shortDescription,
  order: index + 1,
  file: p.technicalPdf,
}));
