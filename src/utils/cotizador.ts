/**
 * LA LÓGICA DE LA COTIZACIÓN, FUERA DEL NAVEGADOR.
 *
 * Todo esto vivía dentro del `<script>` de `/cotizacion`, mezclado con la lectura del
 * formulario: 440 líneas donde la validación, el texto que se manda por WhatsApp y la fila
 * que recibe el ERP no se podían probar sin abrir un navegador y llenar el formulario a
 * mano. Es la parte del sitio donde un error cuesta dinero —una fila mal armada es una
 * solicitud que el ERP no puede procesar— y era la única sin una sola prueba.
 *
 * Acá las funciones reciben datos y devuelven datos. Quien lee el formulario sigue siendo
 * la página; lo que decide qué es válido, cómo se escribe y qué se guarda, está acá.
 */

export type UnidadCotizacion = "unidad" | "m2" | "ml";

export interface LineaCotizacion {
  /** Código del ERP. `null` solo en datos viejos: el catálogo ya no ofrece líneas sin él. */
  codigo: string | null;
  producto: string;
  categoria?: string;
  colorCodigo?: string | null;
  colorNombre?: string;
  calidadCodigo?: string;
  calidadNombre?: string;
  cantidad: number;
  unidad: UnidadCotizacion;
  unidadLabel: string;
  /** Precio unitario en pesos, ya en la unidad de venta. */
  precioUnitario: number;
}

export interface ClienteCotizacion {
  nombre: string;
  telefono: string;
  email?: string;
  empresa?: string;
  proyecto?: string;
}

export interface UbicacionCotizacion {
  direccion?: string;
  municipio?: string;
  departamento?: string;
  lat?: string;
  lng?: string;
  maps?: string;
}

export interface Cotizacion {
  cliente: ClienteCotizacion;
  entrega: "planta" | "obra";
  ubicacion?: UbicacionCotizacion;
  lineas: LineaCotizacion[];
}

/** De dónde llegó la visita. Son datos de la campaña, no de la persona. */
export type OrigenVisita = Record<string, string>;

export interface ErrorCotizacion {
  campo: "nombre" | "telefono" | "lineas";
  mensaje: string;
}

/**
 * Lo mínimo para que alguien pueda atender la solicitud.
 *
 * Sin nombre y teléfono no hay a quién devolverle la llamada; sin líneas no hay qué
 * cotizar. El correo no es obligatorio a propósito: en obra se trabaja por WhatsApp.
 */
export function validarCotizacion(c: Cotizacion): ErrorCotizacion | null {
  if (!c.cliente.nombre?.trim()) {
    return { campo: "nombre", mensaje: "Escribe tu nombre de contacto." };
  }
  if (!c.cliente.telefono?.trim()) {
    return { campo: "telefono", mensaje: "Escribe tu teléfono / WhatsApp." };
  }
  if (!c.lineas.length) {
    return { campo: "lineas", mensaje: "Agrega al menos un producto a la cotización." };
  }
  return null;
}

const dos = (n: number) => String(n).padStart(2, "0");

/** `WEB-20261020-143512`. El prefijo distingue en el ERP lo que entra por la web. */
export function numeroDeSolicitud(fecha: Date = new Date()): string {
  return (
    `WEB-${fecha.getFullYear()}${dos(fecha.getMonth() + 1)}${dos(fecha.getDate())}` +
    `-${dos(fecha.getHours())}${dos(fecha.getMinutes())}${dos(fecha.getSeconds())}`
  );
}

/** El total de la cotización en pesos. */
export function valorCotizacion(c: Cotizacion): number {
  return c.lineas.reduce((t, l) => t + (l.precioUnitario || 0) * (l.cantidad || 0), 0);
}

/**
 * El texto que viaja por WhatsApp y por correo.
 *
 * Lo lee una persona en un teléfono, en obra: va en el orden en que preguntaría —quién,
 * dónde, qué— y sin una sola línea de relleno.
 */
export function textoCotizacion(c: Cotizacion): string {
  const L: string[] = [];
  L.push("*Solicitud de cotización — Clay House*");
  L.push(`Cliente: ${c.cliente.nombre}`);
  if (c.cliente.empresa) L.push(`Empresa: ${c.cliente.empresa}`);
  L.push(`Tel: ${c.cliente.telefono}${c.cliente.email ? " · " + c.cliente.email : ""}`);
  if (c.cliente.proyecto) L.push(`Proyecto: ${c.cliente.proyecto}`);
  L.push(`Entrega: ${c.entrega === "planta" ? "Recoge en planta (Amagá)" : "Despacho a obra"}`);
  if (c.entrega !== "planta" && c.ubicacion) {
    const ub = [c.ubicacion.direccion, c.ubicacion.municipio, c.ubicacion.departamento]
      .filter(Boolean)
      .join(", ");
    if (ub) L.push(`Ubicación: ${ub}`);
    if (c.ubicacion.maps) L.push(`Mapa: ${c.ubicacion.maps}`);
  }
  L.push("");
  L.push("Productos:");
  for (const l of c.lineas) {
    const detalle = [l.colorNombre, l.calidadNombre].filter(Boolean).join(" · ");
    L.push(`• ${l.producto}${detalle ? ` (${detalle})` : ""} — ${l.cantidad} ${l.unidadLabel}`);
  }
  L.push("");
  L.push("Nota: el flete NO está incluido (cotización preliminar).");
  return L.join("\n");
}

/**
 * Las notas que ve quien abre la solicitud en el ERP.
 *
 * Incluyen de dónde llegó la visita: «Origen: google / cpc / lanzamiento-romano» le ahorra
 * al asesor la primera pregunta. Son datos del anuncio, no del visitante.
 */
export function notasComerciales(c: Cotizacion, origen: OrigenVisita = {}): string[] {
  const notas = ["Solicitud desde la web (clayhouse.com.co)"];
  if (c.cliente.empresa) notas.push(`Empresa: ${c.cliente.empresa}`);

  const campana = [origen.utm_source, origen.utm_medium, origen.utm_campaign]
    .filter(Boolean)
    .join(" / ");
  if (campana) notas.push(`Origen: ${campana}`);
  if (origen.utm_content) notas.push(`Anuncio: ${origen.utm_content}`);
  if (origen.utm_term) notas.push(`Búsqueda: ${origen.utm_term}`);
  for (const k of ["gclid", "gbraid", "wbraid"]) {
    if (origen[k]) notas.push(`${k}: ${origen[k]}`);
  }
  if (origen.landing) notas.push(`Entró por: ${origen.landing}`);
  if (origen.referrer) notas.push(`Venía de: ${origen.referrer}`);

  notas.push("Flete NO incluido — cotización preliminar");
  return notas;
}

/**
 * La fila que se inserta en la tabla del ERP.
 *
 * Tiene la forma que el ERP ya usa para sus cotizaciones internas: las columnas sueltas
 * describen la PRIMERA línea —así se ve en su bandeja sin abrir nada— y `items` lleva la
 * solicitud completa. No se cambia sin mirar el ERP.
 */
export function construirFilaErp(
  c: Cotizacion,
  opciones: { numero?: string; origen?: OrigenVisita; fecha?: Date } = {}
): Record<string, unknown> {
  const u = c.entrega === "planta" ? {} : (c.ubicacion ?? {});
  const items = c.lineas.map((l) => ({
    productoCodigo: l.codigo || "",
    color: l.colorCodigo ?? null,
    calidad: l.calidadCodigo || "PRI",
    unidad: l.unidad,
    cantidad: l.cantidad,
    valorUnitario: l.precioUnitario,
    valorProducto: l.precioUnitario * l.cantidad,
    tiempoEntrega: "",
  }));
  const primera = c.lineas[0];

  return {
    numero: opciones.numero ?? numeroDeSolicitud(opciones.fecha),
    atencion: c.cliente.nombre || "",
    proyecto: c.cliente.proyecto || "",
    direccion: u.direccion || "",
    telefono: c.cliente.telefono || "",
    email: c.cliente.email || "",
    producto_codigo: primera?.codigo || "VARIOS",
    color: primera?.colorCodigo ?? null,
    calidad: primera?.calidadCodigo || "PRI",
    unidad: primera?.unidad || "unidad",
    cantidad: primera?.cantidad || 0,
    valor_unitario: primera?.precioUnitario || 0,
    valor_producto: (primera?.precioUnitario || 0) * (primera?.cantidad || 0),
    entrega: c.entrega,
    municipio: u.municipio || null,
    departamento: u.departamento || null,
    lat_entrega: u.lat ? Number(u.lat) : null,
    lng_entrega: u.lng ? Number(u.lng) : null,
    items,
    notas_comerciales: notasComerciales(c, opciones.origen),
  };
}

/**
 * Lo que se le manda al medidor: el pedido, nunca la persona.
 *
 * Código, categoría, cantidad, valor, moneda y canal. El nombre, el teléfono, el correo y
 * la dirección se quedan en la solicitud.
 */
export function resumenMedicion(c: Cotizacion, canal = ""): Record<string, unknown> {
  return {
    currency: "COP",
    value: Math.round(valorCotizacion(c)),
    lineas: c.lineas.length,
    canal,
    items: c.lineas.map((l) => ({
      item_id: l.codigo || "",
      item_category: l.categoria || "",
      quantity: l.cantidad || 0,
      price: l.precioUnitario || 0,
      unidad: l.unidad || "",
    })),
  };
}
