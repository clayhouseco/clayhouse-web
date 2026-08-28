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
  return `${price}/${unit} + IVA (precio referencia, sin envío)`;
}

/** Precio por m² de referencia (una sola cifra), para mostrarlo junto al precio
 *  por unidad. Usa el rendimiento publicado del producto (× precio/unidad); si
 *  no hay, estima con 1 cm de pega. Devuelve null si el producto ya se vende
 *  por m² (el precio principal ya es /m²) o si no tiene precio por unidad. */
export function getReferencePriceM2(product: Product): string | null {
  if (!product.pricePerUnit) return null;
  if (product.priceUnitLabel && product.priceUnitLabel !== "unidad") return null;
  const unitAmount = parseCopAmount(product.pricePerUnit);
  if (!unitAmount) return null;
  // 1) escenario realista de pega 1 cm (coincide con la tabla de rendimiento
  //    de la ficha, para que el titular no contradiga lo que ve el cliente).
  const pega1 = getRendimientoTable(product)?.find((r) => r.jointCm === 1);
  // 2) respaldo: rendimiento publicado, si el producto no tiene dims calculables.
  const units = pega1?.unitsPerM2 ?? parseCm(product.dimensions?.rendimiento);
  if (!units) return null;
  return `${formatCop(Math.round(units * unitAmount))}/m²`;
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
  /** Espesor de la junta en cm (0, 1, 2) — útil como dato data-* */
  jointCm: number;
  /** Unidades por m² (redondeado al entero superior, para obra real) */
  unitsPerM2: number;
  /** Precio por m² ya formateado en COP, o null si no hay pricePerUnit */
  pricePerM2: string | null;
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

  const scenarios: { label: string; jointCm: number }[] = [
    { label: "Junta perdida", jointCm: 0 },
    { label: "Pega 1 cm", jointCm: 1 },
    { label: "Pega 2 cm", jointCm: 2 },
  ];

  return scenarios.map(({ label, jointCm }) => {
    const j = jointCm / 100;
    const units = Math.ceil(1 / ((largoM + j) * (altoM + j)));
    return { label, jointCm, unitsPerM2: units, pricePerM2: fmtPrice(units) };
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

export interface FloorRendimientoRow {
  /** Etiqueta humana (ej. "Pega 5 mm") */
  label: string;
  /** Espesor en mm (3, 5, 8, 10) — usado como discriminante del ícono */
  jointMm: number;
  /** Piezas por m² con 1 decimal. Para pisos grandes (30×30) las diferencias
   *  entre escenarios de mm son fraccionales y Math.ceil las aplanaba todas
   *  al mismo entero; mostrar un decimal preserva la información. */
  unitsPerM2: number;
}

/** Rendimiento para pisos. La categoría "Pisos" se retiró del catálogo, por lo
 *  que esta tabla ya no aplica a ningún producto y siempre devuelve null. Se
 *  conserva la firma por si se reintroduce una línea de pisos en el futuro. */
export function getFloorRendimientoTable(
  _product: Product
): FloorRendimientoRow[] | null {
  return null;
}
