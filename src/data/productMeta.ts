import type { Product } from "@/data/products";
import { isVisible, products, sortProductsByPriority } from "@/data/products";
import type { ProductCategory } from "@/data/catalogCategories";
import { getCatalogCategoryHref } from "@/data/catalogCategories";

export interface UseChip {
  id: string;
  label: string;
  icon: "exterior" | "interior" | "fachada" | "muro" | "suelo" | "techo" | "estructural" | "bano";
}

const USE_CHIPS: Record<string, UseChip> = {
  exterior: { id: "exterior", label: "Uso exterior", icon: "exterior" },
  interior: { id: "interior", label: "Uso interior", icon: "interior" },
  fachada: { id: "fachada", label: "Fachada", icon: "fachada" },
  muro: { id: "muro", label: "Muro", icon: "muro" },
  suelo: { id: "suelo", label: "Suelo", icon: "suelo" },
  techo: { id: "techo", label: "Techo / cubierta", icon: "techo" },
  estructural: { id: "estructural", label: "Estructural", icon: "estructural" },
  bano: { id: "bano", label: "Baños", icon: "bano" },
};

const USES_BY_CATEGORY: Record<ProductCategory, string[]> = {
  Fachadas: ["exterior", "interior", "fachada", "muro"],
  Divisorios: ["exterior", "interior", "estructural", "muro"],
  Enchapes: ["interior", "exterior", "muro", "bano"],
  Techos: ["exterior", "techo"],
};

const NOT_APT_BY_CATEGORY: Record<ProductCategory, string[]> = {
  Fachadas: ["Piscinas", "Tráfico vehicular directo"],
  Divisorios: ["Piscinas", "Acabados de alto brillo sin tratamiento"],
  Enchapes: ["Piscinas", "Zonas heladas sin especificación"],
  Techos: ["Muros estructurales verticales", "Piscinas"],
};

export function getRecommendedUses(product: Product): UseChip[] {
  const ids = USES_BY_CATEGORY[product.category] ?? ["exterior", "muro"];
  return ids.map((id) => USE_CHIPS[id]).filter(Boolean);
}

export function getNotRecommended(product: Product): string[] {
  return NOT_APT_BY_CATEGORY[product.category] ?? [];
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  const sameCategory = products.filter(
    (p) => p.slug !== product.slug && p.category === product.category && isVisible(p)
  );
  return sortProductsByPriority(sameCategory).slice(0, limit);
}

export function getCategoryHref(category: ProductCategory): string {
  return getCatalogCategoryHref(category);
}
