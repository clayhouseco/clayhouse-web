/** Categorías de navegación del catálogo Clay House */
export type ProductCategory = "Fachadas" | "Divisorios" | "Enchapes" | "Techos" | "Decorativos";

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
  /**
   * El titular de la página de categoría.
   *
   * Era la palabra de la pestaña —«fachadas», «techos»—, que no describe nada: el titular
   * de una página es lo que más pesa para quien busca «teja de arcilla» y para quien llega
   * sin saber qué vende la empresa. Se mantiene en minúscula, que es el tratamiento del
   * hero.
   */
  heroTitle: string;
}

export const catalogCategories: CatalogCategoryDef[] = [
  {
    id: "Fachadas",
    label: "Fachadas",
    title: "Fachadas",
    description:
      "Ladrillos para fachada y macizos a la vista: Romano, Toscano, Napolitano, Cartagena y línea Campesino / Brix, con despacho a Medellín y toda Colombia.",
    order: 1,
    seoTitle: "Ladrillo para fachada en Medellín | Clay House",
    seoDescription:
      "Ladrillo para fachada en Medellín: romano, toscano, cartagena y macizos de arcilla bajo norma NTC 4205. Compara medidas, acabados y precios.",
    heroTitle: "ladrillo para fachada y a la vista",
    coverProductSlug: "romano",
    coverFallback: "/images/products/romano/proyectos/casa-retiro/casa-EF-03.jpg",
  },
  {
    id: "Divisorios",
    label: "Divisorios",
    title: "Divisorios",
    description:
      "Ladrillos rayados horizontales y verticales para muros divisorios y cerramientos, con despacho a Medellín y Antioquia.",
    order: 2,
    seoTitle: "Ladrillo divisorio y rayado en Medellín | Clay House",
    seoDescription:
      "Ladrillo divisorio y rayado en Medellín: formatos horizontales y verticales para muros y cerramientos. Fabricación en Amagá y despacho en Antioquia.",
    heroTitle: "ladrillo divisorio y rayado",
    coverProductSlug: "rayados-verticales",
    coverFallback: "/images/Fotos Productos/Rayado Vertical.jpg",
  },
  {
    id: "Enchapes",
    label: "Enchapes",
    title: "Enchapes",
    description:
      "Enchapes delgados de ladrillo para muros interiores, fachadas y detalles de acento, con entrega en Medellín y Antioquia.",
    order: 4,
    seoTitle: "Enchape de ladrillo en Medellín | Clay House",
    seoDescription:
      "Enchape de ladrillo en Medellín para muros interiores y fachadas: romano, thin brick, rústico y bocadillo. Compara acabados y solicita cotización.",
    heroTitle: "enchape de ladrillo",
    coverProductSlug: "enchape-romano",
    coverFallback: "/images/Fotos Productos/Enchape Thin Brick.jpg",
  },
  {
    id: "Techos",
    label: "Techos",
    title: "Techos",
    description:
      "Teja plana y teja colonial de barro para cubiertas visibles, con despacho a Medellín, Antioquia y toda Colombia.",
    order: 5,
    seoTitle: "Teja de barro y arcilla en Medellín | Clay House",
    seoDescription:
      "Teja de barro y arcilla en Medellín para cubiertas visibles: perfiles plano y colonial, norma NTC 4205 y despacho desde Amagá a toda Colombia.",
    heroTitle: "teja de arcilla",
    coverProductSlug: "teja-plana",
    coverFallback: "/images/products/teja-plana/natural/Teja Plana Natural.webp",
  },
  {
    id: "Decorativos",
    label: "Decorativos",
    title: "Decorativos",
    description:
      "Calados y celosías de arcilla para muros que ventilan, tamizan la luz y decoran, con entrega en Medellín y Antioquia.",
    order: 6,
    seoTitle: "Calados y celosías de arcilla en Medellín | Clay House",
    seoDescription:
      "Calados y celosías de arcilla en Medellín para ventilar, filtrar la luz y decorar muros. Fabricación en Amagá y despacho en Antioquia.",
    heroTitle: "calados y celosías",
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

export function getCatalogCategoryHref(id: ProductCategory): string {
  return `/productos/categoria/${getCategorySlug(id)}`;
}
