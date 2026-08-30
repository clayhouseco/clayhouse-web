import { getVisibleProducts } from "@/data/products";
import { assetUrl } from "@/utils/paths";
import {
  erpEquivalencia,
  erpVariantIds,
  ERP_COLORES,
  ERP_CALIDADES,
  ERP_UNIDAD_LABEL,
  type ColorCodigo,
  type CalidadCodigo,
  type UnidadVenta,
} from "@/data/erpCatalog";

/** Una opción cotizable, a la granularidad del ERP (cada dimensión de
 *  rayado/macizo es una opción distinta). Es lo que se elige por línea en
 *  /cotizacion. */
export interface CotizableItem {
  /** id único de la opción (slug o slug::variantId). */
  id: string;
  label: string;
  slug: string;
  variantId: string | null;
  /** Código ERP (null si el producto aún no existe en el ERP). */
  erpCodigo: string | null;
  coloresPermitidos: { codigo: ColorCodigo; nombre: string; hex: string }[];
  calidadesPermitidas: { codigo: CalidadCodigo; nombre: string }[];
  unidad: UnidadVenta;
  unidadLabel: string;
  image: string;
  /** Precio de referencia de la web (no es el precio final de la cotización). */
  refPrice: string;
}

function variantLabel(name: string, slug: string, id: string): string {
  if (slug.startsWith("rayados")) {
    const orient = slug.includes("vertical") ? "Vertical" : "Horizontal";
    return `Rayado ${orient} ${id} cm`;
  }
  if (slug === "macizo-brix") return `Macizo ${id}`;
  if (slug === "calado") return `Calado ${id} cm`;
  return `${name} ${id}`;
}

/** Precio de referencia por dimensión, cuando difiere del precio base del
 *  producto (el precio del producto es solo el punto de partida). */
const PRECIO_POR_VARIANTE: Record<string, Record<string, string>> = {
  "rayados-verticales": { "10": "$ 2.360", "12": "$ 2.690", "15": "$ 3.190" },
  "rayados-horizontales": { "10": "$ 1.790", "12": "$ 2.190", "15": "$ 2.390" },
  "macizo-brix": { "5x10x20": "$ 1.500", "6x12x24": "$ 1.850" },
  calado: { "10": "$ 3.500", "15": "$ 4.000" },
};

/** Catálogo cotizable completo (todas las opciones a nivel ERP). */
export const cotizableCatalog: CotizableItem[] = getVisibleProducts().flatMap((p) => {
  const variantes = erpVariantIds(p.slug);
  const ids: (string | null)[] = variantes.length ? variantes : [null];
  return ids.map((variantId) => {
    const eq = erpEquivalencia(p.slug, variantId);
    return {
      id: variantId ? `${p.slug}::${variantId}` : p.slug,
      label: variantId ? variantLabel(p.name, p.slug, variantId) : p.name,
      slug: p.slug,
      variantId,
      erpCodigo: eq.codigo,
      coloresPermitidos: eq.coloresPermitidos.map((c) => ({ codigo: c, ...ERP_COLORES[c] })),
      calidadesPermitidas: eq.calidadesPermitidas.map((c) => ({ codigo: c, nombre: ERP_CALIDADES[c] })),
      unidad: eq.unidad,
      unidadLabel: ERP_UNIDAD_LABEL[eq.unidad],
      image: assetUrl(p.image),
      refPrice:
        (variantId && PRECIO_POR_VARIANTE[p.slug]?.[variantId]) ??
        p.pricePerUnit ??
        "Consultar",
    };
  });
});
