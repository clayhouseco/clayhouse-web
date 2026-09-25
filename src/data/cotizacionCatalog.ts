import { getVisibleProducts, getProduct } from "@/data/products";
import { erpDeCodigo, erpDeSlug } from "@/data/erpFeed";
import { getProductAssets } from "@/data/productVariants";
import { assetUrl } from "@/utils/paths";
import {
  erpEquivalencia,
  erpVariantIds,
  colorCodigo,
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
  /** Precio de referencia por color (código ERP → precio), cuando el producto
   *  tiene precio distinto según el color (prensados). Sobrescribe a refPrice. */
  preciosPorColor?: Record<string, string>;
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

/** "≈ 22 und/m²" → 22. Es el rendimiento que publica el ERP, y en tejas es el
 *  único dato válido: se traslapan, así que no se puede deducir de la geometría. */
function unidadesPorM2(codigo: string | null, slug: string): number | null {
  const p = erpDeCodigo(codigo) ?? erpDeSlug(slug)[0] ?? null;
  const m = p?.rendimiento?.match(/(\d+(?:[.,]\d+)?)\s*und/i);
  return m ? Number.parseFloat(m[1].replace(",", ".")) : null;
}

/** "$ 1.600" → 1600 */
function copANumero(v: string): number | null {
  const d = v.replace(/[^\d]/g, "");
  return d ? Number.parseInt(d, 10) : null;
}

/** Precio de referencia expresado SIEMPRE en la unidad en que se cotiza.
 *
 *  Sin esto el cotizador multiplicaba metros cuadrados por el precio de una
 *  pieza: la teja colonial se vende por m² según el ERP, pero la web tiene su
 *  precio por unidad ($ 1.600), y 60 m² salían en $ 96.000 cuando son 1.320
 *  tejas — $ 2.112.000. Un error de 22 veces en un documento con precios.
 *
 *  La conversión usa el rendimiento del ERP. Si no lo publica, no se inventa un
 *  número: se devuelve null y la línea queda "Consultar". */
function precioEnUnidadDeVenta(
  slug: string,
  codigo: string | null,
  precioWeb: string | undefined,
  unidadVenta: string
): string | null {
  if (!precioWeb) return null;
  const producto = getProduct(slug);
  const precioEsPorM2 = producto?.priceUnitLabel === "m²";
  if (unidadVenta !== "m2" || precioEsPorM2) return precioWeb;

  const und = unidadesPorM2(codigo, slug);
  const base = copANumero(precioWeb);
  if (!und || !base) return null;
  return `$ ${Math.round(base * und).toLocaleString("es-CO")}`;
}

/** Precio de referencia por dimensión, cuando difiere del precio base del
 *  producto (el precio del producto es solo el punto de partida). */
const PRECIO_POR_VARIANTE: Record<string, Record<string, string>> = {
  "rayados-verticales": { "10": "$ 2.360", "12": "$ 2.690", "15": "$ 3.190" },
  "rayados-horizontales": { "10": "$ 1.790", "12": "$ 2.190", "15": "$ 2.390" },
  "macizo-brix": { "6x12x24": "$ 2.290" },
  calado: { "10": "$ 3.500", "15": "$ 4.000" },
};

/** Precio por color (código ERP → precio) derivado de las variantes del
 *  producto, cuando el color determina el precio (prensados). Devuelve undefined
 *  si el color no afecta el precio (todas las variantes valen igual o las
 *  variantes son de dimensión, no de color). Así el precio vive en un solo
 *  lugar: las variantes en productVariants.ts. */
function preciosPorColorDe(slug: string): Record<string, string> | undefined {
  const assets = getProductAssets(slug);
  if (!assets) return undefined;
  const out: Record<string, string> = {};
  for (const v of assets.variants) {
    const codigo = colorCodigo(v.colorLabel);
    if (codigo && v.pricePerUnit) out[codigo] = v.pricePerUnit;
  }
  // Solo tiene sentido si el precio realmente varía según el color (≥2 precios
  // distintos); si todos valen igual, el precio base (refPrice) ya lo cubre.
  const distintos = new Set(Object.values(out));
  return distintos.size >= 2 ? out : undefined;
}

/** Catálogo cotizable completo (todas las opciones a nivel ERP). */
export const cotizableCatalog: CotizableItem[] = getVisibleProducts().flatMap((p) => {
  const variantes = erpVariantIds(p.slug);
  const ids: (string | null)[] = variantes.length ? variantes : [null];
  // El precio por color solo aplica a productos sin variantes de dimensión.
  const preciosPorColor = variantes.length ? undefined : preciosPorColorDe(p.slug);
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
        precioEnUnidadDeVenta(
          p.slug,
          eq.codigo,
          (variantId && PRECIO_POR_VARIANTE[p.slug]?.[variantId]) ?? p.pricePerUnit,
          eq.unidad
        ) ?? "Consultar",
      preciosPorColor,
    };
  });
});
