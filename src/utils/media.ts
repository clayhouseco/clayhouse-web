import { assetUrl } from "./paths";

/** Rutas locales en /public — al subir archivos con estos nombres, el sitio los usa automáticamente */

export function productImage(slug: string): string {
  return `/images/products/${slug}.jpg`;
}

export function downloadFile(slug: string): string {
  return `/downloads/${slug}.pdf`;
}

export const heroImages = {
  main: "/images/hero/hero.jpg",
  redescubre: "/images/hero/redescubre.jpg",
  horno: "/images/hero/horno.jpg",
} as const;

/** Logo horizontal Clay House (1080×237) */
export const logos = {
  header: assetUrl("/Logos/MASTERMesa de trabajo 3.png"),
  headerAlt: assetUrl("/Logos/MASTERMesa de trabajo 1.png"),
} as const;
