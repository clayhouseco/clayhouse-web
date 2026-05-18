import type { Product, ProductCategory } from "@/data/products";
import { products } from "@/data/products";

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
  Fachada: ["exterior", "interior", "fachada", "muro"],
  Macizo: ["exterior", "interior", "estructural", "muro"],
  Rayado: ["exterior", "fachada", "muro"],
  Enchape: ["interior", "exterior", "muro", "bano"],
  Piso: ["interior", "exterior", "suelo"],
  Techo: ["exterior", "techo"],
};

const NOT_APT_BY_CATEGORY: Record<ProductCategory, string[]> = {
  Fachada: ["Piscinas", "Tráfico vehicular directo"],
  Macizo: ["Piscinas", "Acabados de alto brillo sin tratamiento"],
  Rayado: ["Piscinas", "Suelos"],
  Enchape: ["Piscinas", "Zonas heladas sin especificación"],
  Piso: ["Piscinas", "Zonas heladas sin tratamiento"],
  Techo: ["Muros estructurales verticales", "Piscinas"],
};

export function getRecommendedUses(product: Product): UseChip[] {
  const ids = USES_BY_CATEGORY[product.category] ?? ["exterior", "muro"];
  return ids.map((id) => USE_CHIPS[id]).filter(Boolean);
}

export function getNotRecommended(product: Product): string[] {
  return NOT_APT_BY_CATEGORY[product.category] ?? [];
}

export function getRelatedProducts(product: Product, limit = 3): Product[] {
  return products
    .filter((p) => p.slug !== product.slug && p.category === product.category)
    .slice(0, limit);
}

export function getCategoryHref(category: ProductCategory): string {
  return `/productos?categoria=${encodeURIComponent(category)}`;
}
