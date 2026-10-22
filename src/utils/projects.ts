import { isVisible, products, type Product } from "@/data/products";
import { getProductAssets, getProductInspiration } from "@/data/productVariants";
import type { InspirationCard } from "@/utils/variantGallery";

interface IndexedProjectDefinition {
  slug: string;
  sourceTitle: string;
  title: string;
  productSlug: string;
  location?: string;
  seoTitle: string;
  description: string;
  intro: string;
}

export interface IndexedProject extends IndexedProjectDefinition {
  product: Product;
  gallery: InspirationCard;
}

/**
 * Casos que tienen nombre, producto y uso comprobables en el material publicado.
 * No se añaden arquitectos, fechas ni ubicaciones que no estén confirmadas.
 */
const definitions: IndexedProjectDefinition[] = [
  {
    slug: "plaza-mercado-envigado-ladrillo-romano",
    sourceTitle: "Plaza de Mercado Envigado",
    title: "Plaza de Mercado de Envigado",
    productSlug: "romano",
    location: "Envigado, Antioquia",
    seoTitle: "Plaza de Mercado de Envigado en ladrillo romano",
    description:
      "Galería de la Plaza de Mercado de Envigado: fachada de gran formato construida con Ladrillo Romano Clay House.",
    intro:
      "La fachada de la Plaza de Mercado de Envigado permite ver el Ladrillo Romano en una superficie extensa, donde el ritmo del aparejo y las variaciones naturales del material se leen a escala urbana.",
  },
  {
    slug: "edificio-el-solar-medellin",
    sourceTitle: "Edificio El Solar",
    title: "Edificio El Solar",
    productSlug: "romano",
    location: "Medellín, Antioquia",
    seoTitle: "Edificio El Solar: fachada en ladrillo romano",
    description:
      "Galería del Edificio El Solar en Medellín, con fachada construida en Ladrillo Romano Clay House.",
    intro:
      "En el Edificio El Solar, el Ladrillo Romano define una fachada continua y cálida. La galería muestra el material a distintas distancias, desde la lectura completa del edificio hasta el detalle del aparejo.",
  },
  {
    slug: "starbucks-enchape-romano",
    sourceTitle: "Starbucks",
    title: "Starbucks",
    productSlug: "enchape-romano",
    seoTitle: "Starbucks: fachada con enchape de ladrillo romano",
    description:
      "Galería de un proyecto comercial Starbucks con Enchape Romano Clay House aplicado en fachada.",
    intro:
      "Este proyecto comercial muestra cómo el Enchape Romano conserva la textura y el tono del ladrillo a la vista en una solución delgada para revestimiento de fachada.",
  },
  {
    slug: "dos-santos-enchape-romano",
    sourceTitle: "Dos Santos",
    title: "Dos Santos Cantina",
    productSlug: "enchape-romano",
    seoTitle: "Dos Santos Cantina con enchape de ladrillo romano",
    description:
      "Galería de Dos Santos Cantina con Enchape Romano Clay House en un espacio comercial.",
    intro:
      "En Dos Santos Cantina, el Enchape Romano aporta una superficie de arcilla con variación natural y carácter artesanal. Las fotografías permiten apreciar su uso dentro del lenguaje del espacio comercial.",
  },
];

export const indexedProjectPaths = definitions.map(({ slug }) => `/proyectos/${slug}`);

export function getIndexedProjects(): IndexedProject[] {
  return definitions.map((definition) => {
    const product = products.find(
      (candidate) => candidate.slug === definition.productSlug && isVisible(candidate)
    );
    const manifest = getProductAssets(definition.productSlug);
    const gallery = manifest
      ? getProductInspiration(manifest).find(
          (candidate) =>
            candidate.category === "Proyecto" && candidate.title === definition.sourceTitle
        )
      : undefined;

    if (!product || !gallery) {
      throw new Error(
        `No se pudo construir el proyecto indexable ${definition.slug}: falta el producto o la galería ${definition.sourceTitle}`
      );
    }

    return { ...definition, product, gallery };
  });
}

export function getIndexedProjectHref(
  productSlug: string,
  sourceTitle: string
): string | undefined {
  const project = definitions.find(
    (candidate) => candidate.productSlug === productSlug && candidate.sourceTitle === sourceTitle
  );
  return project ? `/proyectos/${project.slug}` : undefined;
}
