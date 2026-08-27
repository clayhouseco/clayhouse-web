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
  return `${name} ${id}`;
}

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
      refPrice: p.pricePerUnit ?? "Consultar",
    };
  });
});
