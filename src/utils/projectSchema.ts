import { site } from "@/data/site";
import type { IndexedProject } from "@/utils/projects";

/**
 * Describe una obra como página editorial y el material utilizado como tema.
 *
 * El material no debe marcarse aquí como Product: la oferta comercial completa
 * vive en su ficha de producto. Marcarlo como Thing evita que Google intente
 * validar la página del proyecto como un resultado enriquecido de producto.
 */
export function buildProjectJsonLd(project: IndexedProject) {
  const cover = project.gallery.images[0];

  if (!cover) {
    throw new Error(`El proyecto ${project.slug} no tiene una imagen de portada`);
  }

  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: project.title,
    description: project.description,
    url: new URL(`/proyectos/${project.slug}`, site.url).href,
    image: project.gallery.images.map((image) => new URL(image.src, site.url).href),
    about: {
      "@type": "Thing",
      name: project.product.name,
      url: new URL(`/productos/${project.product.slug}`, site.url).href,
      image: new URL(cover.src, site.url).href,
    },
    isPartOf: {
      "@type": "CollectionPage",
      name: "Proyectos Clay House",
      url: new URL("/proyectos", site.url).href,
    },
  };
}
