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
 * NO NECESITA NINGUNA CREDENCIAL PRIVILEGIADA, y esa es la mitad del diseño. La primera
 * versión pedía la `service_role` del ERP —la que se salta RLS y permite leer y modificar
 * todo: productos, precios, clientes— para contar filas, y guardarla en GitHub. Pedir la
 * llave maestra del negocio para contar es desproporcionado. En su lugar, la base expone una
 * función que devuelve TRES NÚMEROS y nada más (`supabase/ritmo-cotizaciones.sql`), y acá se
 * llama con la clave que ya es pública.
 *
 * La hora también la pone la base, no esta máquina: el número de solicitud lo estampa el
 * reloj del visitante en hora de Colombia, y un servidor de integración corre en UTC. La
 * primera versión contaba la ventana con cinco horas de desfase.
 *
 *   node scripts/vigilar-cotizaciones.mjs
 *   node scripts/vigilar-cotizaciones.mjs --strict   # sale 1 si el ritmo es anormal
 */
const URL_BASE = process.env.PUBLIC_SUPABASE_URL ?? "https://xmgsljwxiyyporczsrum.supabase.co";
const CLAVE = process.env.PUBLIC_SUPABASE_KEY ?? "sb_publishable_fyo-0iRd3xBmq9AjAgkwxw_xjIDKYeH";
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

const res = await fetch(`${URL_BASE}/rest/v1/rpc/ritmo_cotizaciones_web`, {
  method: "POST",
  headers: {
    apikey: CLAVE,
    Authorization: `Bearer ${CLAVE}`,
    "Content-Type": "application/json",
    Accept: "application/vnd.pgrst.object+json",
  },
  body: "{}",
}).catch((e) => ({ ok: false, status: 0, error: e.message }));

if (!res.ok) {
  const cuerpo = res.json ? await res.text().catch(() => "") : res.error;
  console.log(`\n  No se pudo consultar el ritmo (${res.status || "sin red"}).`);
  if (String(cuerpo).includes("ritmo_cotizaciones_web")) {
    console.log("\n  La función no existe todavía. Córrala una vez en Supabase:");
    console.log("    SQL Editor → New query → pegar `supabase/ritmo-cotizaciones.sql` → Run");
    console.log("\n  Devuelve solo tres números: no expone ninguna fila ni dato de cliente.\n");
  } else {
    console.log(`  ${String(cuerpo).slice(0, 180)}\n`);
  }
  process.exit(STRICT ? 1 : 0);
}

const { ultima_hora: ultimaHora, hoy, total_web: totalWeb } = await res.json();
const pico = ultimaHora > TOPE_HORA || hoy > TOPE_DIA;

console.log("\nCotizaciones llegadas por la web\n");
console.log(`  en la última hora   ${String(ultimaHora).padStart(6)}   (tope ${TOPE_HORA})`);
console.log(`  hoy                 ${String(hoy).padStart(6)}   (tope ${TOPE_DIA})`);
console.log(`  desde siempre       ${String(totalWeb).padStart(6)}`);

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
console.log("       Eso deja el cotizador sin registrar —el cliente ve el aviso de error y los");
console.log("       botones de WhatsApp y correo siguen funcionando—, así que no se pierde el");
console.log("       negocio mientras se limpia.");
console.log("    3. Borrar las filas falsas y recién entonces decidir el freno definitivo.\n");
process.exit(STRICT ? 1 : 0);
