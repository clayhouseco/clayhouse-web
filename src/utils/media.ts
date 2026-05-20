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

/** Logo horizontal Clay House */
export const logos = {
  header: assetUrl("/logo-clayhouse.png"),
  headerAlt: assetUrl("/logo-clayhouse.png"),
  /** Isotipo CH (crema) para pie de página */
  footerMark: assetUrl("/Logos/MASTERMesa de trabajo 11.png"),
} as const;
