/**
 * LAS VENTANAS DE TIEMPO DE LA VIGILANCIA, SIN RED.
 *
 * `vigilar-cotizaciones.mjs` necesita una clave de servicio para consultar, así que
 * no se puede ejecutar entero sin credenciales —ni en una prueba, ni acá—. Lo que sí se
 * puede comprobar es lo único que tiene lógica: cómo se arman los filtros de «la última
 * hora» y «hoy». Vive acá, fuera del script, para poder probarlo.
 *
 * La ventana se calcula sobre el NÚMERO de solicitud y no sobre una fecha: `created_at`
 * puede no existir en esa tabla, que es del ERP y no nuestra. La web arma el número como
 * `WEB-AAAAMMDD-HHMMSS`, un formato que además ordena bien como texto —el año primero, con
 * ceros a la izquierda—, así que un `>=` lexicográfico es una comparación de fechas
 * correcta, incluso cruzando la medianoche.
 */
export const PREFIJO = "WEB-";

const dos = (n) => String(n).padStart(2, "0");

/** `WEB-20261022` — el día, para contar lo de hoy. */
export function selloDelDia(d) {
  return `${PREFIJO}${d.getFullYear()}${dos(d.getMonth() + 1)}${dos(d.getDate())}`;
}

/** `WEB-20261022-103045` — el instante, para contar desde un momento exacto. */
export function selloDelInstante(d) {
  return `${selloDelDia(d)}-${dos(d.getHours())}${dos(d.getMinutes())}${dos(d.getSeconds())}`;
}

/** Filtro de PostgREST para todo lo que entró desde ese instante. */
export function filtroDesde(d) {
  return `numero=gte.${selloDelInstante(d)}`;
}

/** Filtro de PostgREST para lo que entró hoy. */
export function filtroDelDia(d) {
  return `numero=like.${selloDelDia(d)}*`;
}
