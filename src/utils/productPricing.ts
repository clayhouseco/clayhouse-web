import type { Product } from "@/data/products";

function parseCopAmount(value: string): number | null {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number.parseInt(digits, 10) : null;
}

function formatCop(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Parsea dimensiones tipo "27,5 cm" → 27.5 (centímetros). Cuando el producto
 *  trae varios formatos en un solo string ("5 / 6 cm"), toma el primer valor —
 *  el resultado es una estimación conservadora (más piezas/m²) y el cliente
 *  confirma el formato exacto en cotización. */
function parseCm(value?: string): number | null {
  if (!value) return null;
  const match = value.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return null;
  return Number.parseFloat(match[1].replace(",", "."));
}

/** Etiqueta B2B para tarjetas del catálogo. Muestra el precio por unidad
 *  (o por m² si el producto se vende así), sin convertir entre los dos —
 *  la conversión a m² depende del rendimiento de pega elegido y se muestra
 *  por separado en la ficha del producto. */
export function getReferencePriceLabel(product: Product): string | null {
  if (!product.pricePerUnit) return null;
  const price = product.pricePerUnit.trim();
  const unit = product.priceUnitLabel ?? "unidad";
  return `Desde ${price}/${unit} + IVA (precio referencia, sin envío)`;
}

/** Igual que getReferencePriceLabel pero devuelve el monto principal y la
 *  nota (IVA + disclaimer) separados, para dar jerarquía visual al precio. */
export function getReferencePriceParts(
  product: Product
): { amount: string; note: string } | null {
  const label = getReferencePriceLabel(product);
  if (!label) return null;
  const idx = label.indexOf(" + IVA");
  if (idx === -1) return { amount: label, note: "" };
  return { amount: label.slice(0, idx).trim(), note: label.slice(idx + 1).trim() };
}

export interface RendimientoRow {
  /** Etiqueta humana del escenario (ej. "Junta perdida", "Pega 1 cm") */
  label: string;
  /** Espesor de la junta en cm (puede ser fraccional para escenarios en mm) */
  jointCm: number;
  /** Unidades por m² (redondeado al entero superior, para obra real) */
  unitsPerM2: number;
  /** Precio por m² ya formateado en COP, o null si no hay pricePerUnit o el
   *  producto se vende ya por m² (pisos, enchapes, tejas planas) */
  pricePerM2: string | null;
  /** Tamaño relativo del gap en el ícono SVG (unidades del viewBox 60×30).
   *  Permite que un mismo template renderice las cards de ladrillo
   *  (0, 1.5, 3) y de piso (0.7, 1.2, 1.8, 2.4) sin ramas extra. */
  iconGap: number;
}

/** Calcula cuántas piezas/m² requiere el producto según el espesor de junta.
 *  Junta perdida (0 cm) suele dar el mayor rendimiento; la competencia
 *  habitualmente cotiza con 1 cm de pega, lo que arroja menos unidades/m²
 *  y por ende un menor precio aparente. Mostrar los 3 escenarios deja al
 *  cliente comparar manzanas con manzanas. */
export function getRendimientoTable(product: Product): RendimientoRow[] | null {
  // Solo aplica a productos cotizados por unidad con largo y alto numéricos.
  if (product.priceUnitLabel && product.priceUnitLabel !== "unidad") return null;
  const largoCm = parseCm(product.dimensions?.largo);
  const altoCm = parseCm(product.dimensions?.alto);
  if (!largoCm || !altoCm) return null;

  const largoM = largoCm / 100;
  const altoM = altoCm / 100;
  const unitAmount = parseCopAmount(product.pricePerUnit ?? "");
  const fmtPrice = (units: number) =>
    unitAmount ? `${formatCop(units * unitAmount)}/m²` : null;

  const scenarios: { label: string; jointCm: number; iconGap: number }[] = [
    { label: "Junta perdida", jointCm: 0, iconGap: 0 },
    { label: "Pega 1 cm", jointCm: 1, iconGap: 1.5 },
    { label: "Pega 2 cm", jointCm: 2, iconGap: 3 },
  ];

  return scenarios.map(({ label, jointCm, iconGap }) => {
    const j = jointCm / 100;
    const units = Math.ceil(1 / ((largoM + j) * (altoM + j)));
    return {
      label,
      jointCm,
      unitsPerM2: units,
      pricePerM2: fmtPrice(units),
      iconGap,
    };
  });
}

export interface RendimientoVariantData {
  variantId: string;
  label: string;
  table: RendimientoRow[];
}

/** Cuando un producto tiene variantes con dimensiones/precio distintos
 *  (ej. Macizo en formato 5×10×20 y 6×12×24), devuelve una tabla de
 *  rendimiento por variante. Si ninguna variante sobrescribe las dims,
 *  devuelve null (se usa getRendimientoTable normal). */
export function getRendimientoTablesByVariant(
  product: Product,
  variants: ReadonlyArray<{
    id: string;
    label: string;
    pricePerUnit?: string;
    dimensions?: { largo: string; alto: string };
  }>
): RendimientoVariantData[] | null {
  const overriders = variants.filter((v) => v.dimensions);
  if (overriders.length < 2) return null;

  const result: RendimientoVariantData[] = [];
  for (const v of overriders) {
    const composite: Product = {
      ...product,
      pricePerUnit: v.pricePerUnit ?? product.pricePerUnit,
      dimensions: {
        ...(product.dimensions ?? {}),
        largo: v.dimensions!.largo,
        alto: v.dimensions!.alto,
      },
    };
    const table = getRendimientoTable(composite);
    if (table) result.push({ variantId: v.id, label: v.label, table });
  }
  return result.length >= 2 ? result : null;
}

/** Rendimiento para pisos. La pega del piso se mide en milímetros (3, 5, 8,
 *  10 mm) y la superficie de cálculo es la cara visible largo × ancho (no
 *  largo × alto, porque "alto" para un piso es el espesor de la pieza). El
 *  precio por m² no se muestra: los pisos ya se cotizan por m² y no varía
 *  con la pega. */
export function getFloorRendimientoTable(product: Product): RendimientoRow[] | null {
  if (product.category !== "Pisos") return null;
  const largoCm = parseCm(product.dimensions?.largo);
  const anchoCm = parseCm(product.dimensions?.ancho);
  if (!largoCm || !anchoCm) return null;

  const largoM = largoCm / 100;
  const anchoM = anchoCm / 100;

  const scenarios: { label: string; jointMm: number; iconGap: number }[] = [
    { label: "Pega 3 mm", jointMm: 3, iconGap: 0.7 },
    { label: "Pega 5 mm", jointMm: 5, iconGap: 1.2 },
    { label: "Pega 8 mm", jointMm: 8, iconGap: 1.8 },
    { label: "Pega 10 mm", jointMm: 10, iconGap: 2.4 },
  ];

  return scenarios.map(({ label, jointMm, iconGap }) => {
    const j = jointMm / 1000;
    const units = Math.ceil(1 / ((largoM + j) * (anchoM + j)));
    return {
      label,
      jointCm: jointMm / 10,
      unitsPerM2: units,
      pricePerM2: null,
      iconGap,
    };
  });
}
