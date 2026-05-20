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

/** unidades por m² desde rendimiento (ej. "68 und/m²") */
function unitsPerSquareMeter(rendimiento?: string): number | null {
  if (!rendimiento) return null;
  const match = rendimiento.match(/(\d+(?:[.,]\d+)?)\s*und\s*\/\s*m²/i);
  if (!match) return null;
  return Number.parseFloat(match[1].replace(",", "."));
}

/** Etiqueta B2B para tarjetas del catálogo */
export function getReferencePriceLabel(product: Product): string | null {
  if (!product.pricePerUnit) return null;

  const price = product.pricePerUnit.trim();

  if (product.priceUnitLabel === "m²") {
    return `Desde ${price}/m² + IVA (precio referencia, sin envío)`;
  }

  const unitAmount = parseCopAmount(price);
  const units = unitsPerSquareMeter(product.dimensions?.rendimiento);

  if (unitAmount && units) {
    return `Desde ${formatCop(unitAmount * units)}/m² + IVA (precio referencia, sin envío)`;
  }

  const unit = product.priceUnitLabel ?? "unidad";
  return `Desde ${price}/${unit} + IVA (precio referencia, sin envío)`;
}
