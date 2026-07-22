import availability from "./availability.json";

/** Slugs desactivados desde la hoja de inventario (Google Sheet).
 *
 *  El equipo marca/desmarca productos en la hoja y publica; el build regenera
 *  availability.json con scripts/fetch-availability.mjs. Un producto que no
 *  aparezca en la lista se considera ACTIVO (así una referencia nueva nunca
 *  queda oculta por accidente). */
export const inactiveSlugs: ReadonlySet<string> = new Set(availability.inactive);

/** Un producto está disponible si el inventario no lo desactivó. */
export function isAvailable(slug: string): boolean {
  return !inactiveSlugs.has(slug);
}

/** Fecha del último cambio traído de la hoja (para diagnóstico). */
export const availabilityUpdatedAt: string = availability.updatedAt;
