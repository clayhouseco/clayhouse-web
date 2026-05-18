import { products } from "@/data/products";
import {
  catalogCategories,
  type ProductCategory,
} from "@/data/catalogCategories";

export interface Download {
  title: string;
  slug: string;
  type: string;
  description: string;
  order: number;
  file: string;
  category: ProductCategory;
  productSlug: string;
}

/** Fichas técnicas activas (una por producto del catálogo) */
export const downloads: Download[] = products.map((p, index) => ({
  title: p.name,
  slug: `ficha-${p.slug}`,
  type: "Ficha técnica",
  description: p.shortDescription,
  order: index + 1,
  file: p.technicalPdf,
  category: p.category,
  productSlug: p.slug,
}));

export interface DownloadGroup {
  category: ProductCategory;
  label: string;
  description: string;
  items: Download[];
}

export function getDownloadsByCategory(): DownloadGroup[] {
  return catalogCategories
    .map((def) => ({
      category: def.id,
      label: def.label,
      description: def.description,
      items: downloads.filter((d) => d.category === def.id),
    }))
    .filter((g) => g.items.length > 0);
}
