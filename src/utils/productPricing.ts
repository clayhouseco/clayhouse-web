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

/** Parsea dimensiones tipo "27,5 cm" → 27.5 (centímetros). Rechaza valores
 *  con "/" (ej. "5 / 6 cm") porque no son medidas únicas calculables. */
function parseCm(value?: string): number | null {
  if (!value) return null;
  if (value.includes("/")) return null;
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
