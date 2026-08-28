/** Categorías de navegación del catálogo Clay House */
export type ProductCategory =
  | "Fachadas"
  | "Divisorios"
  | "Enchapes"
  | "Techos"
  | "Decorativos";

export interface CatalogCategoryDef {
  id: ProductCategory;
  label: string;
  title: string;
  description: string;
  order: number;
  coverProductSlug: string;
  coverFallback: string;
}

export const catalogCategories: CatalogCategoryDef[] = [
  {
    id: "Fachadas",
    label: "Fachadas",
    title: "Fachadas",
    description:
      "Ladrillos de fachada y macizos a la vista: Romano, Toscano, Napolitano, Cartagena y línea Campesino / Brix.",
    order: 1,
    coverProductSlug: "romano",
    coverFallback: "/images/products/romano/proyectos/casa-retiro/casa-EF-03.jpg",
  },
  {
    id: "Divisorios",
    label: "Divisorios",
    title: "Divisorios",
    description: "Rayados horizontales y verticales para muros divisorios y cerramientos con textura.",
    order: 2,
    coverProductSlug: "rayados-verticales",
    coverFallback: "/images/Fotos Productos/Rayado Vertical.jpg",
  },
  {
    id: "Enchapes",
    label: "Enchapes",
    title: "Enchapes",
    description: "Revestimientos delgados en ladrillo para muros interiores, exteriores y detalles de acento.",
    order: 4,
    coverProductSlug: "enchape-romano",
    coverFallback: "/images/Fotos Productos/Enchape Thin Brick.jpg",
  },
  {
    id: "Techos",
    label: "Techos",
    title: "Techos",
    description: "Teja Plana y Teja Colonial para cubiertas visibles en ladrillo.",
    order: 5,
    coverProductSlug: "teja-plana",
    coverFallback: "/images/products/teja-plana/natural/Teja Plana Natural.webp",
  },
  {
    id: "Decorativos",
    label: "Decorativos",
    title: "Decorativos",
    description: "Calados y celosías de arcilla para muros que ventilan, tamizan la luz y decoran.",
    order: 6,
    coverProductSlug: "calado",
    coverFallback: "/images/products/calado/calado-frente.webp",
  },
];

export const productCategories: ProductCategory[] = catalogCategories.map((c) => c.id);

/** Slug URL para rutas estáticas (/productos/categoria/fachadas/) */
export const categorySlugById: Record<ProductCategory, string> = {
  Fachadas: "fachadas",
  Divisorios: "divisorios",
  Enchapes: "enchapes",
  Techos: "techos",
  Decorativos: "decorativos",
};

export function getCategorySlug(id: ProductCategory): string {
  return categorySlugById[id];
}

export function parseCategorySlug(slug: string): ProductCategory | null {
  const entry = (
    Object.entries(categorySlugById) as [ProductCategory, string][]
  ).find(([, s]) => s === slug);
  return entry?.[0] ?? null;
}

export function getCatalogCategoryHref(id: ProductCategory): string {
  return `/productos/categoria/${getCategorySlug(id)}/`;
}

export function parseCategoryParam(value: string | null): ProductCategory | null {
  if (!value) return null;
  return catalogCategories.some((c) => c.id === value) ? (value as ProductCategory) : null;
}
