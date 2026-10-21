/**
 * PESOS COLOMBIANOS, DE TEXTO A NÚMERO Y DE VUELTA.
 *
 * Vivían en `@/data/unidades`, que importa el feed completo del ERP. El cotizador corre en
 * el navegador y necesita exactamente estas dos funciones: traerlas desde allá significaba
 * confiar en que el empaquetador descartara un JSON de cientos de kilobytes. Acá no hay
 * nada que descartar.
 *
 * `unidades.ts` las re-exporta, así que quien ya las importaba de ahí sigue igual.
 */

/** "$ 1.600" → 1600. `null` si no hay cifra ("Consultar", vacío, undefined). */
export function copANumero(valor: string | null | undefined): number | null {
  const d = String(valor ?? "").replace(/[^\d]/g, "");
  if (!d) return null;
  const n = Number.parseInt(d, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function numeroACop(valor: number): string {
  return `$ ${Math.round(valor).toLocaleString("es-CO")}`;
}
