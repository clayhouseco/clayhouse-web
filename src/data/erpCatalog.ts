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

export type ColorCodigo = "NAT" | "MC" | "MO" | "CHO" | "ADO" | "ARE" | "COC" | "BIA" | "CAP";
export type CalidadCodigo = "PRI" | "SEG" | "MED";
export type UnidadVenta = "unidad" | "m2" | "ml";

export const ERP_COLORES: Record<ColorCodigo, { nombre: string; hex: string }> = {
  NAT: { nombre: "Natural", hex: "#c8835f" },
  MC: { nombre: "Matizado Claro", hex: "#b06a45" },
  MO: { nombre: "Matizado Oscuro", hex: "#6f3a2c" },
  CHO: { nombre: "Chocolate", hex: "#4a2c20" },
  // Colores de los prensados y thin brick.
  ADO: { nombre: "Adobe", hex: "#a15c41" },
  ARE: { nombre: "Arena", hex: "#c9ad83" },
  COC: { nombre: "Cocoa", hex: "#4b3225" },
  BIA: { nombre: "Bianco", hex: "#d9ccb6" },
  CAP: { nombre: "Capuccino", hex: "#b48f6a" },
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
  adobe: "ADO",
  arena: "ARE",
  cocoa: "COC",
  bianco: "BIA",
  capuccino: "CAP",
  rojo: null,
  rojizo: null,
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
 * Todos los productos tienen código. Algunos códigos son provisionales de la web
 * (se asignaron para que ninguna cotización quede "sin código") y deben
 * confirmarse contra el ERP: MAC-CAM, BOC-PRE, BLQ, ENC-RUS, ENC-THB, ENC-BOC, NAP.
 */
const ERP_MAP: Record<string, ErpMapEntry> = {
  romano: { codigo: "ROM", coloresPermitidos: ["NAT", "MC", "MO"], calidadesPermitidas: ["PRI", "MED"], unidad: "unidad" },
  toscano: { codigo: "TOS", coloresPermitidos: ["NAT", "MC", "MO"], calidadesPermitidas: ["PRI", "MED"], unidad: "unidad" },
  cartagena: { codigo: "CAR", coloresPermitidos: ["NAT", "MC", "MO"], calidadesPermitidas: ["PRI"], unidad: "unidad" },
  napolitano: { codigo: "NAP", coloresPermitidos: ["NAT", "MC"], calidadesPermitidas: ["PRI"], unidad: "unidad" },
  "enchape-romano": { codigo: "ENC-ROM", coloresPermitidos: ["NAT", "MC", "MO"], calidadesPermitidas: ["PRI"], unidad: "unidad" },
  "enchape-rustico": { codigo: "ENC-RUS", coloresPermitidos: [], calidadesPermitidas: ["PRI"], unidad: "m2" },
  "macizo-campesino": { codigo: "MAC-CAM", coloresPermitidos: ["MC", "MO"], calidadesPermitidas: ["PRI"], unidad: "unidad" },
  "enchape-thinbrick": { codigo: "ENC-THB", coloresPermitidos: ["NAT", "BIA", "CAP", "COC"], calidadesPermitidas: ["PRI"], unidad: "m2" },
  "enchape-bocadillo": { codigo: "ENC-BOC", coloresPermitidos: ["NAT"], calidadesPermitidas: ["PRI"], unidad: "m2" },
  "gran-formato-prensado": { codigo: "GFP", coloresPermitidos: ["ADO", "ARE", "NAT", "COC"], calidadesPermitidas: ["PRI"], unidad: "unidad" },
  "bocadillo-prensado": { codigo: "BOC-PRE", coloresPermitidos: ["ADO", "ARE", "NAT", "COC"], calidadesPermitidas: ["PRI"], unidad: "unidad" },
  "bloquelon": { codigo: "BLQ", coloresPermitidos: [], calidadesPermitidas: ["PRI"], unidad: "unidad" },
  "calado": {
    porVariante: { "10": "CAL-10", "15": "CAL-15" },
    coloresPermitidos: [],
    calidadesPermitidas: ["PRI"],
    unidad: "unidad",
  },
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
