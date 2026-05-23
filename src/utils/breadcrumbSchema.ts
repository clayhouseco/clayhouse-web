import { site } from "@/data/site";

export interface BreadcrumbStep {
  name: string;
  /** Ruta relativa o URL absoluta. La última se omite en algunos casos (página actual). */
  href?: string;
}

/** Construye un JSON-LD de BreadcrumbList listo para imprimir.
 *  Recibe la lista en orden lógico (de raíz a hoja).
 *  Si un step no trae href, no se publica el campo `item` (Google permite omitirlo en la hoja). */
export function buildBreadcrumbJsonLd(steps: BreadcrumbStep[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: steps.map((step, i) => {
      const node: Record<string, unknown> = {
        "@type": "ListItem",
        position: i + 1,
        name: step.name,
      };
      if (step.href) {
        const url = step.href.startsWith("http")
          ? step.href
          : new URL(step.href, site.url).href;
        node.item = url;
      }
      return node;
    }),
  };
}
