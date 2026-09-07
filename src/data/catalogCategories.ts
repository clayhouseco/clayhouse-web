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
  /** Título del resultado en Google. Debe abrir con el término que la gente
   *  escribe («enchapes de ladrillo»), no con la palabra «Productos». */
  seoTitle: string;
  /** Meta description: qué es + norma + dónde se fabrica + qué sigue. */
  seoDescription: string;
}

export const catalogCategories: CatalogCategoryDef[] = [
  {
    id: "Fachadas",
    label: "Fachadas",
    title: "Fachadas",
    description:
      "Ladrillos de fachada y macizos a la vista: Romano, Toscano, Napolitano, Cartagena y línea Campesino / Brix.",
    order: 1,
    seoTitle: "Ladrillo a la vista para fachada | Clay House Antioquia",
    seoDescription:
      "Ladrillo de fachada a la vista: Romano, Toscano, Cartagena y macizos campesinos. Arcilla cocida bajo norma NTC 4205, fabricada en Amagá, Antioquia. Cotiza en 24 horas.",
    coverProductSlug: "romano",
    coverFallback: "/images/products/romano/proyectos/casa-retiro/casa-EF-03.jpg",
  },
  {
    id: "Divisorios",
    label: "Divisorios",
    title: "Divisorios",
    description: "Rayados horizontales y verticales para muros divisorios y cerramientos con textura.",
    order: 2,
    seoTitle: "Ladrillo divisorio y rayado para muro | Clay House",
    seoDescription:
      "Ladrillo rayado horizontal y vertical para muros divisorios y cerramientos con textura. Norma NTC 4205, fabricación en Amagá, Antioquia. Cotiza en 24 horas.",
    coverProductSlug: "rayados-verticales",
    coverFallback: "/images/Fotos Productos/Rayado Vertical.jpg",
  },
  {
    id: "Enchapes",
    label: "Enchapes",
    title: "Enchapes",
    description: "Revestimientos delgados en ladrillo para muros interiores, exteriores y detalles de acento.",
    order: 4,
    seoTitle: "Enchapes de ladrillo para muro y fachada | Clay House",
    seoDescription:
      "Enchapes de arcilla para revestir muros interiores, exteriores y detalles de acento: rústico, romano, thin brick y bocadillo. Fabricación en Amagá, Antioquia.",
    coverProductSlug: "enchape-romano",
    coverFallback: "/images/Fotos Productos/Enchape Thin Brick.jpg",
  },
  {
    id: "Techos",
    label: "Techos",
    title: "Techos",
    description: "Teja Plana y Teja Colonial para cubiertas visibles en ladrillo.",
    order: 5,
    seoTitle: "Teja de barro para cubierta: plana y colonial | Clay House",
    seoDescription:
      "Teja de arcilla para cubiertas visibles en perfil plano y colonial, norma NTC 4205. Fabricación propia en Amagá, Antioquia, con despacho a toda Colombia.",
    coverProductSlug: "teja-plana",
    coverFallback: "/images/products/teja-plana/natural/Teja Plana Natural.webp",
  },
  {
    id: "Decorativos",
    label: "Decorativos",
    title: "Decorativos",
    description: "Calados y celosías de arcilla para muros que ventilan, tamizan la luz y decoran.",
    order: 6,
    seoTitle: "Calados y celosías de arcilla | Clay House",
    seoDescription:
      "Calados y celosías de arcilla para muros que ventilan, tamizan la luz y decoran. Fabricación neoartesanal en Amagá, Antioquia. Cotiza en 24 horas.",
    coverProductSlug: "calado",
    coverFallback: "/images/products/calado/calado-muro.webp",
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
