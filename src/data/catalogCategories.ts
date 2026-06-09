/** Categorías de navegación del catálogo Clay House */
export type ProductCategory =
  | "Fachadas"
  | "Divisorios"
  | "Pisos"
  | "Enchapes"
  | "Techos";

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
    coverFallback: "/images/products/romano/proyectos/casa-retiro/Casa_ladrilloromano_Clayhouse (22).jpg",
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
    id: "Pisos",
    label: "Pisos",
    title: "Pisos",
    description: "Pisos de ladrillo en formato 30×30 y 10×30 para interiores y espacios cubiertos.",
    order: 3,
    coverProductSlug: "piso-30x30",
    coverFallback: "/images/products/piso-30x30/DSC_9524.jpg",
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
];

export const productCategories: ProductCategory[] = catalogCategories.map((c) => c.id);

/** Slug URL para rutas estáticas (/productos/categoria/fachadas/) */
export const categorySlugById: Record<ProductCategory, string> = {
  Fachadas: "fachadas",
  Divisorios: "divisorios",
  Pisos: "pisos",
  Enchapes: "enchapes",
  Techos: "techos",
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
