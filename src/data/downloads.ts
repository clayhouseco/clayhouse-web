import fs from "node:fs";
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

/**
 * ¿Existe de verdad el PDF de este producto?
 *
 * Un producto creado en el ERP tiene página el mismo día, pero su ficha técnica no se
 * genera sola: la Teja S apareció en /descargas con un enlace a un archivo que no existía.
 * Un botón de descarga que lleva a un 404 es peor que no ofrecerlo.
 */
function tieneFicha(ruta: string): boolean {
  const limpia = decodeURIComponent(ruta.split("?")[0]).replace(/^\//, "");
  return fs.existsSync(`public/${limpia}`);
}

/** Fichas técnicas activas (una por producto del catálogo que tenga el PDF hecho) */
export const downloads: Download[] = products
  .filter((p) => p.technicalPdf && tieneFicha(p.technicalPdf))
  .map((p, index) => ({
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
