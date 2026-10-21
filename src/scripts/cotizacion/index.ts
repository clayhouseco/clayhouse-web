/**
 * EL COTIZADOR, ARMADO.
 *
 * Esto era un `<script define:vars>` de 440 líneas dentro de `cotizacion.astro`: el
 * selector de productos, el documento en vivo, el mapa de la obra, la validación, el texto
 * de WhatsApp y la fila del ERP, todo en el mismo archivo y sin una sola prueba, porque
 * `define:vars` no admite `import`.
 *
 * Ahora cada parte vive en su archivo y acá solo queda el cableado: leer la configuración
 * que la página dejó en un bloque JSON, montar las cuatro piezas y, en cada cambio, armar
 * UN objeto `Cotizacion` del que todo lo demás se deriva —el documento que se imprime, el
 * texto que se manda, la fila que recibe el ERP y lo que se le reporta al medidor—. Si el
 * documento muestra una cifra, es la misma cifra que se guarda.
 */
import type { Cotizacion } from "@/utils/cotizador";
import { QUOTE_CART_KEY, type QuoteCartItem } from "@/utils/quoteCart";
import { leerConfig, medir, pedir, type ConfigCotizacion } from "./config";
import { montarDocumento } from "./documento";
import { montarEnvio } from "./envio";
import { montarLineas, type GestorLineas, type LineaElegida } from "./lineas";
import { montarUbicacion } from "./ubicacion";

function arrancar(config: ConfigCotizacion, form: HTMLFormElement): void {
  const pintar = montarDocumento(form);
  const campo = (nombre: string) =>
    (
      form.querySelector<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(
        `[data-c="${nombre}"]`
      )?.value ?? ""
    ).trim();

  let gestor: GestorLineas | null = null;

  /** Lo que el cliente tiene escrito ahora mismo, como datos. */
  function cotizacionActual(): Cotizacion {
    return {
      cliente: {
        nombre: campo("nombre"),
        telefono: campo("telefono"),
        email: campo("email"),
        empresa: campo("empresa"),
        proyecto: campo("proyecto"),
      },
      entrega: ubicacion.entrega(),
      ubicacion: ubicacion.leer(),
      lineas: gestor?.elegidas().map((e) => e.linea) ?? [],
    };
  }

  /**
   * El carrito (localStorage) sigue a las líneas, no al revés.
   *
   * Sin esto, borrar un producto acá no lo borraba del carrito: volvía a aparecer al
   * recargar la página o al agregar otro desde una ficha.
   */
  function guardarCarrito(elegidas: LineaElegida[]): void {
    const items: QuoteCartItem[] = elegidas.map(({ item, linea }) => ({
      slug: item.slug,
      name: item.label,
      category: item.categoria,
      color: linea.colorNombre || undefined,
      quantity: linea.cantidad || 1,
      unitLabel: item.unidadLabel,
      image: item.image,
      pricePerUnit:
        (linea.colorCodigo ? item.preciosPorColor?.[linea.colorCodigo] : undefined) ??
        item.refPrice,
      productUrl: `/productos/${item.slug}`,
      variantId: item.variantId ?? undefined,
      calidad: linea.calidadCodigo,
    }));
    try {
      localStorage.setItem(QUOTE_CART_KEY, JSON.stringify(items));
    } catch {
      /* en modo privado no hay dónde guardar; la cotización en pantalla no cambia */
    }
  }

  function refrescar(): void {
    const elegidas = gestor?.elegidas() ?? [];
    pintar(cotizacionActual());
    guardarCarrito(elegidas);
  }

  let empezada = false;
  function empezar(): void {
    if (empezada) return;
    empezada = true;
    medir("begin_quote", { currency: "COP" });
  }

  const ubicacion = montarUbicacion({ form, alCambiar: refrescar });
  gestor = montarLineas({
    form,
    catalogo: config.catalogo,
    alCambiar: refrescar,
    alEmpezar: empezar,
  });

  form.addEventListener("focusin", empezar, { once: true });
  form.querySelectorAll("[data-c]").forEach((el) => el.addEventListener("input", refrescar));

  montarEnvio({
    form,
    config,
    cotizacion: cotizacionActual,
    alDespedir: () => {
      try {
        localStorage.removeItem(QUOTE_CART_KEY);
      } catch {
        /* nada que limpiar */
      }
    },
  });

  precargarDesdeCarrito(config, gestor);
  refrescar();
}

/**
 * LO QUE VENÍA DE UNA FICHA DE PRODUCTO.
 *
 * El carrito guarda el color por su nombre («Arena») y la variante como la usa la galería
 * («arena»), mientras el catálogo cotizable usa códigos del ERP («ARE») y variantes de
 * dimensión («10»). Traducir eso acá es lo que hace que «Agregar a cotización» llegue con
 * el producto correcto ya elegido en vez de con el formulario en blanco.
 */
function precargarDesdeCarrito(config: ConfigCotizacion, gestor: GestorLineas): void {
  let carrito: QuoteCartItem[] = [];
  try {
    carrito = JSON.parse(localStorage.getItem(QUOTE_CART_KEY) ?? "[]") as QuoteCartItem[];
  } catch {
    /* un carrito ilegible se ignora: el formulario arranca en blanco */
  }

  const codigoDeColor = new Map<string, string>();
  for (const c of config.catalogo) {
    for (const col of c.coloresPermitidos) codigoDeColor.set(col.nombre.toLowerCase(), col.codigo);
  }
  const ids = new Set(config.catalogo.map((c) => c.id));

  const idCotizable = (it: QuoteCartItem): string | null => {
    const exacto = it.variantId ? `${it.slug}::${it.variantId}` : it.slug;
    if (ids.has(exacto)) return exacto; // la dimensión del ERP coincide
    if (ids.has(it.slug)) return it.slug; // producto sin variantes en el ERP
    return config.catalogo.find((c) => c.slug === it.slug)?.id ?? null; // 1ª variante del producto
  };

  let agregadas = 0;
  for (const it of Array.isArray(carrito) ? carrito : []) {
    const id = idCotizable(it);
    if (!id) continue;
    gestor.agregar({
      id,
      color: it.color ? codigoDeColor.get(String(it.color).toLowerCase()) : undefined,
      cantidad: it.quantity,
    });
    agregadas++;
  }
  /* Si vino con productos, la línea en blanco que pintó el servidor estorba. Si no vino con
     nada, esa línea ES el formulario y se deja tal cual: no hay que crear ninguna. */
  if (agregadas) gestor.quitarVacias();
}

const config = leerConfig();
if (config) {
  const form = pedir<HTMLFormElement>(document, "#cotizacion-form");
  arrancar(config, form);
}
