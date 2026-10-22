/**
 * ¿ALGUIEN ESTÁ ABUSANDO DEL COTIZADOR?
 *
 * La clave publicable viaja en el HTML —como corresponde a una clave publicable— y la
 * política de RLS acota QUÉ se puede escribir, pero no CUÁNTAS veces. Nada impide que
 * alguien escriba un script y meta miles de cotizaciones válidas.
 *
 * NO PUEDE TUMBAR LA PÁGINA: el sitio es estático y se sirve desde el CDN; el navegador
 * escribe directo en Supabase y Vercel ni participa. Lo que sí puede es llenar de basura la
 * bandeja del equipo comercial, que es el daño que de verdad cuesta: diez mil cotizaciones
 * falsas mezcladas con las verdaderas y nadie encuentra las que importan.
 *
 * POR QUÉ ESTO Y NO UNA EDGE FUNCTION. Lo normal sería poner una delante de la escritura.
 * Pero eso mete un componente nuevo en el único camino del sitio que genera dinero: si falla,
 * dejan de llegar cotizaciones. Es cambiar un riesgo de abuso poco probable por un riesgo de
 * disponibilidad en la ruta de ingresos. Mejor enterarse rápido y, si llega a pasar, diseñar
 * el freno sabiendo qué patrón hay que frenar.
 *
 * NO TOCA LA BASE DE DATOS. No crea funciones, ni vistas, ni disparadores: solo lee. Después
 * de aplicar restricciones a una tabla compartida con el ERP y tener que retirarlas, esa es
 * la regla.
 *
 *   SUPABASE_SERVICE_KEY=... node scripts/vigilar-cotizaciones.mjs
 *   SUPABASE_SERVICE_KEY=... node scripts/vigilar-cotizaciones.mjs --strict   # sale 1 si hay pico
 *
 * La clave de servicio se saca de Supabase → Project Settings → API → `service_role`. NUNCA
 * va al repositorio: se guarda como secreto del repositorio en GitHub. Es una clave que se
 * salta RLS, así que quien la tenga puede leerlo y cambiarlo todo.
 */
import { PREFIJO, filtroDelDia, filtroDesde } from "./lib/ventana.mjs";

const URL_BASE = process.env.PUBLIC_SUPABASE_URL ?? "https://xmgsljwxiyyporczsrum.supabase.co";
const CLAVE = process.env.SUPABASE_SERVICE_KEY;
const STRICT = process.argv.includes("--strict");

/**
 * Los topes, y de dónde salen.
 *
 * No son un cálculo: son el orden de magnitud de la operación real. En cuatro meses la web
 * había dejado seis cotizaciones. Veinte en una hora sería el mejor día de la historia; cien
 * en un día, otro tanto. Si el negocio crece hasta rozarlos, se suben — y que haya que
 * subirlos será una buena noticia.
 */
const TOPE_HORA = Number(process.env.COTZ_TOPE_HORA ?? 20);
const TOPE_DIA = Number(process.env.COTZ_TOPE_DIA ?? 100);

if (!CLAVE) {
  console.log(
    "\n  Sin SUPABASE_SERVICE_KEY no se puede mirar: la clave publicable no lee esta tabla"
  );
  console.log("  (es justo lo que cierra la política de RLS).\n");
  console.log("  Supabase → Project Settings → API → `service_role`, y guardarla como secreto");
  console.log("  del repositorio en GitHub con ese nombre. Nunca en un archivo del proyecto.\n");
  process.exit(0);
}

/** Cuenta filas sin traérselas: PostgREST devuelve el total en `content-range`. */
async function contar(filtro) {
  const res = await fetch(`${URL_BASE}/rest/v1/cotizaciones?select=numero&limit=0&${filtro}`, {
    headers: {
      apikey: CLAVE,
      Authorization: `Bearer ${CLAVE}`,
      Prefer: "count=exact",
      Range: "0-0",
    },
  });
  if (!res.ok) throw new Error(`Supabase respondió ${res.status}`);
  return Number((res.headers.get("content-range") ?? "*/0").split("/")[1]) || 0;
}

let ultimaHora, ultimoDia, totalWeb, total;
try {
  const ahora = new Date();
  total = await contar("");
  totalWeb = await contar(`numero=like.${PREFIJO}*`);
  ultimoDia = await contar(filtroDelDia(ahora));
  ultimaHora = await contar(filtroDesde(new Date(ahora.getTime() - 3600_000)));
} catch (e) {
  console.error(`\n✗ No se pudo consultar: ${e.message}\n`);
  process.exit(STRICT ? 1 : 0);
}

const pico = ultimaHora > TOPE_HORA || ultimoDia > TOPE_DIA;

console.log("\nCotizaciones en la tabla del ERP\n");
console.log(`  en total                 ${String(total).padStart(6)}`);
console.log(`  llegadas por la web      ${String(totalWeb).padStart(6)}`);
console.log(`  en la última hora        ${String(ultimaHora).padStart(6)}   (tope ${TOPE_HORA})`);
console.log(`  hoy                      ${String(ultimoDia).padStart(6)}   (tope ${TOPE_DIA})`);

if (!pico) {
  console.log("\n✓ Ritmo normal. Nada que hacer.\n");
  process.exit(0);
}

console.log("\n✗ RITMO ANORMAL — puede ser un buen día o puede ser un script.\n");
console.log("  Qué mirar, en este orden:");
console.log("    1. Abrir la tabla y ver si las filas parecen reales: nombres, teléfonos, obras.");
console.log("    2. Si son basura, cortar la escritura anónima mientras se decide:");
console.log('         alter policy "web inserta cotizaciones" on public.cotizaciones');
console.log("           with check (false);");
console.log("       Eso deja el cotizador sin registrar —el cliente verá el aviso de error y");
console.log("       los botones de WhatsApp y correo siguen funcionando—, así que no se pierde");
console.log("       el negocio mientras se limpia.");
console.log("    3. Borrar las filas falsas y recién entonces decidir el freno definitivo.\n");
process.exit(STRICT ? 1 : 0);
