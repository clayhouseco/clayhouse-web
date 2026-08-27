/**
 * Mapeo del catálogo de la web al catálogo maestro del ERP (clayhouse_erp).
 *
 * Objetivo: que la cotización que sale de la web use la MISMA estructura de
 * datos del ERP (códigos de producto, color, calidad y unidad), para que el
 * equipo pueda pasarla al ERP sin volver a digitar.
 *
 * Fuente: ERP ClayHouse (repo clayhouse_erp) — src/lib/catalog.ts.
 * Si el ERP cambia códigos/colores/calidades, actualizar este archivo.
 */

export type ColorCodigo = "NAT" | "MC" | "MO" | "CHO";
export type CalidadCodigo = "PRI" | "SEG" | "MED";
export type UnidadVenta = "unidad" | "m2" | "ml";

export const ERP_COLORES: Record<ColorCodigo, { nombre: string; hex: string }> = {
  NAT: { nombre: "Natural", hex: "#c8835f" },
  MC: { nombre: "Matizado Claro", hex: "#b06a45" },
  MO: { nombre: "Matizado Oscuro", hex: "#6f3a2c" },
  CHO: { nombre: "Chocolate", hex: "#4a2c20" },
};

export const ERP_CALIDADES: Record<CalidadCodigo, string> = {
  PRI: "Primera",
  SEG: "Segunda",
  MED: "Medio",
};

export const ERP_UNIDAD_LABEL: Record<UnidadVenta, string> = {
  unidad: "Unidad",
  m2: "m²",
  ml: "ml",
};

/** Nombres de color de la web → código ERP. `null` si no tiene equivalente. */
const COLOR_NOMBRE_A_CODIGO: Record<string, ColorCodigo | null> = {
  natural: "NAT",
  "matizado claro": "MC",
  "matizado oscuro": "MO",
  matizado: "MC", // "Matizado" a secas (napolitano/enchape) — aprox. Matizado Claro
  chocolate: "CHO",
  roja: "NAT", // Teja Colonial en la web ("Roja") = Natural en el ERP
  rojo: null,
  rojizo: null,
  arena: null,
  tabaco: null,
};

export function colorCodigo(nombre: string | undefined | null): ColorCodigo | null {
  if (!nombre) return null;
  return COLOR_NOMBRE_A_CODIGO[nombre.trim().toLowerCase()] ?? null;
}

interface ErpMapEntry {
  /** Código ERP directo (productos sin variantes de dimensión). */
  codigo?: string;
  /** Código ERP por id de variante (rayados, macizo-brix). */
  porVariante?: Record<string, string>;
  coloresPermitidos: ColorCodigo[];
  calidadesPermitidas: CalidadCodigo[];
  unidad: UnidadVenta;
}

/**
 * slug de la web → equivalencia en el ERP.
 * Los productos que aún no existen en el ERP no están aquí (se marcan "sin
 * código" en la cotización): napolitano, macizo-campesino, bocadillo-prensado,
 * enchape-rustico.
 */
const ERP_MAP: Record<string, ErpMapEntry> = {
  romano: { codigo: "ROM", coloresPermitidos: ["NAT", "MC", "MO"], calidadesPermitidas: ["PRI", "MED"], unidad: "unidad" },
  toscano: { codigo: "TOS", coloresPermitidos: ["NAT", "MC", "MO"], calidadesPermitidas: ["PRI", "MED"], unidad: "unidad" },
  cartagena: { codigo: "CAR", coloresPermitidos: ["NAT", "MC", "MO"], calidadesPermitidas: ["PRI"], unidad: "unidad" },
  "enchape-romano": { codigo: "ENC-ROM", coloresPermitidos: ["NAT", "MC", "MO"], calidadesPermitidas: ["PRI"], unidad: "unidad" },
  // Código temporal — reemplazar cuando exista el definitivo en el ERP.
  "gran-formato-prensado": { codigo: "GFP", coloresPermitidos: [], calidadesPermitidas: ["PRI"], unidad: "unidad" },
  "macizo-brix": {
    porVariante: { "5x10x20": "MAC-520", "6x12x24": "MAC-624" },
    coloresPermitidos: ["NAT", "MC", "MO"],
    calidadesPermitidas: ["PRI"],
    unidad: "unidad",
  },
  "rayados-verticales": {
    porVariante: { "10": "R10V", "12": "R12V", "15": "R15V" },
    coloresPermitidos: [],
    calidadesPermitidas: ["PRI", "SEG"],
    unidad: "unidad",
  },
  "rayados-horizontales": {
    porVariante: { "10": "R10H", "12": "R12H", "15": "R15H" },
    coloresPermitidos: [],
    calidadesPermitidas: ["PRI", "SEG"],
    unidad: "unidad",
  },
  "piso-10x30": { codigo: "PIS-1030", coloresPermitidos: ["NAT", "MC", "MO"], calidadesPermitidas: ["PRI"], unidad: "m2" },
  "piso-30x30": { codigo: "PIS-3030", coloresPermitidos: ["NAT", "MC", "MO"], calidadesPermitidas: ["PRI"], unidad: "m2" },
  "teja-colonial": { codigo: "TEJ-COL", coloresPermitidos: ["NAT"], calidadesPermitidas: ["PRI"], unidad: "m2" },
  "teja-plana": { codigo: "TEJ-PLA", coloresPermitidos: ["NAT", "CHO"], calidadesPermitidas: ["PRI"], unidad: "m2" },
};

export interface ErpEquivalencia {
  /** Código ERP del producto, o null si aún no existe en el ERP. */
  codigo: string | null;
  coloresPermitidos: ColorCodigo[];
  calidadesPermitidas: CalidadCodigo[];
  unidad: UnidadVenta;
}

/** Equivalencia ERP de un producto de la web (con id de variante si aplica). */
export function erpEquivalencia(slug: string, variantId?: string | null): ErpEquivalencia {
  const entry = ERP_MAP[slug];
  if (!entry) {
    // Producto aún no catalogado en el ERP → sin código, se digita a mano.
    return { codigo: null, coloresPermitidos: [], calidadesPermitidas: ["PRI", "SEG", "MED"], unidad: "unidad" };
  }
  const codigo = entry.porVariante
    ? (variantId ? entry.porVariante[variantId] ?? null : null)
    : entry.codigo ?? null;
  return {
    codigo,
    coloresPermitidos: entry.coloresPermitidos,
    calidadesPermitidas: entry.calidadesPermitidas,
    unidad: entry.unidad,
  };
}

/** Calidad por defecto de un producto (la primera permitida; casi siempre PRI). */
export function calidadPorDefecto(slug: string, variantId?: string | null): CalidadCodigo {
  return erpEquivalencia(slug, variantId).calidadesPermitidas[0] ?? "PRI";
}

/** Ids de dimensión de un producto con variantes ERP (rayados, macizo-brix); [] si no. */
export function erpVariantIds(slug: string): string[] {
  const e = ERP_MAP[slug];
  return e?.porVariante ? Object.keys(e.porVariante) : [];
}
