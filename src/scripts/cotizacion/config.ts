/**
 * LO QUE LA PÁGINA LE ENTREGA AL NAVEGADOR.
 *
 * El cotizador necesita cuatro cosas del servidor: el catálogo cotizable, el número de
 * WhatsApp de ventas, el correo comercial y las credenciales públicas con las que se
 * escribe en el ERP. Antes viajaban por `define:vars`, que obliga a escribir TODO el
 * cotizador dentro del `<script>` de la página: sin `import`, sin tipos y sin una sola
 * prueba posible. Ahora viajan en un bloque `application/json` y el cotizador es un módulo
 * como cualquier otro.
 *
 * La clave de Supabase es la publicable y ya estaba en el HTML; esto no cambia qué se
 * expone, solo deja de obligar a que el código viva en línea.
 */
import type { CotizableItem } from "@/data/cotizacionCatalog";

export type { CotizableItem };

export interface ConfigCotizacion {
  catalogo: CotizableItem[];
  waNumber: string;
  ventasEmail: string;
  supabaseUrl: string;
  supabaseKey: string;
}

export function leerConfig(): ConfigCotizacion | null {
  const bloque = document.querySelector("[data-cotz-config]");
  if (!bloque?.textContent) return null;
  try {
    return JSON.parse(bloque.textContent) as ConfigCotizacion;
  } catch {
    return null;
  }
}

/**
 * El elemento que la página promete tener.
 *
 * Si falta, no hay cotizador: vale más un error claro en la consola que un formulario
 * mudo donde el botón de enviar no hace nada.
 */
export function pedir<T extends Element>(raiz: ParentNode, selector: string): T {
  const el = raiz.querySelector<T>(selector);
  if (!el) throw new Error(`/cotizacion: falta ${selector} en el HTML`);
  return el;
}

/** Texto que entra en HTML armado a mano. */
export function esc(valor: unknown): string {
  return String(valor ?? "").replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] ?? c
  );
}

export const pesosLargos = (n: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);

/** La medición nunca debe tumbar el formulario. */
export function medir(nombre: string, props?: Record<string, unknown>): void {
  try {
    window.clayTrack?.(nombre, props);
  } catch {
    /* sin medición se sigue cotizando */
  }
}

/** De dónde llegó la visita. Datos de la campaña, no de la persona. */
export function origenVisita(): Record<string, string> {
  try {
    return window.clayOrigen?.() ?? {};
  } catch {
    return {};
  }
}
