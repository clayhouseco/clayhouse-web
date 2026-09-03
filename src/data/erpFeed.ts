/**
 * EL CATÁLOGO DEL ERP, TAL COMO LO PUBLICA.
 *
 * `erpFeed.json` lo baja `scripts/sync-erp.mjs` antes de cada build desde
 * https://erp.clayhouse.com.co/api/catalogo-web. Este módulo solo lo lee y lo deja
 * consultable por slug de la web (`pagina` en el ERP) y por código.
 *
 * Está versionado en git a propósito: el build no depende de que el ERP conteste, y cuando
 * el catálogo cambia el diff muestra exactamente qué cambió.
 */
import feed from "./erpFeed.json";

export interface ErpColor {
  codigo: string;
  nombre: string;
  imagen: string | null;
  fotos: string[];
}

export interface ErpProducto {
  codigo: string | null;
  id: string;
  nombre: string;
  categoria: string | null;
  /** Slug de la web: clayhouse.com.co/productos/<pagina> */
  pagina: string | null;
  dimension: string | null;
  rendimiento: string | null;
  pesoKg: number | null;
  unidad: string;
  descripcion: string | null;
  imagen: string | null;
  fotos: string[];
  orden: number;
  colores: ErpColor[];
}

const productos = (feed.productos ?? []) as ErpProducto[];

/** Cuándo se bajó el catálogo del ERP que está usando este build. */
export const erpActualizado: string = feed.actualizado ?? "";

const porPagina = new Map<string, ErpProducto[]>();
const porCodigo = new Map<string, ErpProducto>();
for (const p of productos) {
  if (p.pagina) {
    const ps = porPagina.get(p.pagina);
    if (ps) ps.push(p); else porPagina.set(p.pagina, [p]);
  }
  if (p.codigo) porCodigo.set(p.codigo, p);
}

/** Todo lo que el ERP publica bajo esa página. Varias filas si el producto tiene medidas
 *  (los rayados son tres códigos —R10H, R12H, R15H— en una sola página). */
export function erpDeSlug(slug: string): ErpProducto[] {
  return porPagina.get(slug) ?? [];
}

export function erpDeCodigo(codigo: string | null | undefined): ErpProducto | null {
  return codigo ? porCodigo.get(codigo) ?? null : null;
}

/** ¿El ERP ofrece este producto? Lo que no publica, no está a la venta. */
export function erpPublica(slug: string): boolean {
  return porPagina.has(slug);
}

export const erpProductos = productos;
