/**
 * LAS LÍNEAS DE LA COTIZACIÓN: ELEGIR PRODUCTO, COLOR Y CANTIDAD.
 *
 * Una línea es un producto del catálogo del ERP con su color y su cantidad. Esta parte solo
 * se encarga del formulario: pinta el selector, clona la plantilla y, cuando se le pregunta,
 * lee lo que el cliente dejó escrito y lo devuelve como datos. Quién calcula el total, qué
 * texto se manda y qué fila recibe el ERP no es asunto de acá: eso vive en
 * `@/utils/cotizador`, que no toca el DOM y por eso se puede probar.
 */
import type { LineaCotizacion } from "@/utils/cotizador";
import { copANumero } from "@/utils/pesos";
import { medir, pedir, type CotizableItem } from "./config";

/** Una línea leída del formulario, con el item del catálogo que la originó. */
export interface LineaElegida {
  item: CotizableItem;
  linea: LineaCotizacion;
}

export interface PresetLinea {
  id?: string;
  /** Código ERP del color (NAT, ARE, TOP…). */
  color?: string;
  cantidad?: number;
}

export interface GestorLineas {
  agregar(preset?: PresetLinea): void;
  elegidas(): LineaElegida[];
  /** Quita las líneas sin producto elegido: la que pinta el servidor sobra si el cliente
   *  llega con el carrito lleno desde una ficha. */
  quitarVacias(): void;
}

/**
 * El precio de referencia de esa línea, ya en la unidad en que se cotiza.
 *
 * Los prensados valen distinto según el color —Super Terras cuesta $ 2.500 en Arena y
 * $ 2.950 en Topo—, así que el color manda sobre el precio del producto. `0` significa
 * «sin cifra»: la línea sale como «A confirmar» y nadie inventa un número.
 */
export function precioDeLinea(item: CotizableItem, colorCodigo: string | null): number {
  const porColor = colorCodigo ? item.preciosPorColor?.[colorCodigo] : undefined;
  return copANumero(porColor ?? item.refPrice) ?? 0;
}

export function montarLineas(opciones: {
  form: HTMLFormElement;
  catalogo: CotizableItem[];
  /** Algo cambió: hay que repintar el documento. */
  alCambiar: () => void;
  /** El cliente empezó a armar la cotización (se mide una sola vez). */
  alEmpezar: () => void;
}): GestorLineas {
  const { form, catalogo, alCambiar, alEmpezar } = opciones;
  const caja = pedir<HTMLElement>(form, "[data-lineas]");
  const plantilla = pedir<HTMLTemplateElement>(document, "[data-linea-template]");
  const porId = new Map(catalogo.map((c) => [c.id, c]));

  function colorVisible(linea: Element): HTMLSelectElement | null {
    const sel = linea.querySelector<HTMLSelectElement>('[data-campo="color"]');
    return sel && !sel.closest("[hidden]") ? sel : null;
  }

  /** Colores disponibles para ese item, con el preseleccionado que corresponda. */
  function pintarColores(linea: Element, item: CotizableItem, preset: PresetLinea): void {
    const envoltura = pedir<HTMLElement>(linea, '[data-campo-wrap="color"]');
    const sel = pedir<HTMLSelectElement>(linea, '[data-campo="color"]');
    const unidad = pedir<HTMLElement>(linea, "[data-unidad]");

    if (item.coloresPermitidos.length) {
      envoltura.hidden = false;
      /* Con la API del DOM y no interpolando: el dato viene del catálogo propio, pero dejar
         una interpolación cruda acá invita a copiar el patrón donde sí haya datos ajenos. */
      sel.replaceChildren(
        ...item.coloresPermitidos.map((c) => {
          const o = document.createElement("option");
          o.value = c.codigo;
          o.textContent = c.nombre;
          return o;
        })
      );
      const valido = preset.color && item.coloresPermitidos.some((c) => c.codigo === preset.color);
      sel.value = valido
        ? String(preset.color)
        : (item.coloresPermitidos.find((c) => c.codigo === "NAT")?.codigo ??
          item.coloresPermitidos[0]!.codigo);
    } else {
      envoltura.hidden = true;
      sel.replaceChildren();
    }
    unidad.textContent = item.unidadLabel;
  }

  function elegirProducto(linea: Element, id: string, preset: PresetLinea = {}): void {
    const item = porId.get(id);
    if (!item) return;
    pedir<HTMLInputElement>(linea, '[data-campo="item"]').value = id;
    pedir<HTMLImageElement>(linea, "[data-sel-img]").src = item.thumb;
    pedir<HTMLElement>(linea, "[data-sel-name]").textContent = item.label;
    pedir<HTMLElement>(linea, "[data-sel-code]").textContent = item.erpCodigo
      ? `SKU ${item.erpCodigo}`
      : "Código por confirmar";

    alEmpezar();
    medir("quote_product_selected", {
      currency: "COP",
      items: [
        {
          item_id: item.erpCodigo ?? "",
          item_category: item.categoria,
          price: copANumero(item.refPrice) ?? 0,
        },
      ],
    });

    pintarColores(linea, item, preset);
    if (preset.cantidad) {
      pedir<HTMLInputElement>(linea, '[data-campo="cantidad"]').value = String(preset.cantidad);
    }
    pedir<HTMLElement>(linea, "[data-picker]").hidden = true;
    pedir<HTMLElement>(linea, "[data-selected]").hidden = false;
    alCambiar();
  }

  /** Los oyentes de una línea, ya esté en el HTML o recién clonada. */
  function preparar(linea: HTMLElement): void {
    linea.querySelectorAll<HTMLElement>("[data-pick]").forEach((btn) => {
      btn.addEventListener("click", () => elegirProducto(linea, btn.dataset.pick ?? ""));
    });
    pedir<HTMLElement>(linea, "[data-cambiar]").addEventListener("click", () => {
      pedir<HTMLElement>(linea, "[data-picker]").hidden = false;
      pedir<HTMLElement>(linea, "[data-selected]").hidden = true;
    });
    pedir<HTMLElement>(linea, "[data-del-linea]").addEventListener("click", () => {
      linea.remove();
      alCambiar();
    });
  }

  function agregar(preset: PresetLinea = {}): void {
    const nueva = plantilla.content.firstElementChild?.cloneNode(true);
    if (!(nueva instanceof HTMLElement)) return;
    preparar(nueva);
    caja.appendChild(nueva);
    if (preset.id && porId.has(preset.id)) elegirProducto(nueva, preset.id, preset);
    alCambiar();
  }

  /** Las líneas que el servidor dejó pintadas y nadie ha usado todavía. */
  function vacias(): HTMLElement[] {
    return [...caja.querySelectorAll<HTMLElement>("[data-linea]")].filter(
      (l) => !l.querySelector<HTMLInputElement>('[data-campo="item"]')?.value
    );
  }

  function quitarVacias(): void {
    for (const l of vacias()) l.remove();
  }

  function elegidas(): LineaElegida[] {
    return [...caja.querySelectorAll<HTMLElement>("[data-linea]")].flatMap((l) => {
      const item = porId.get(l.querySelector<HTMLInputElement>('[data-campo="item"]')?.value ?? "");
      if (!item) return [];
      const cantidad =
        Number.parseInt(
          l.querySelector<HTMLInputElement>('[data-campo="cantidad"]')?.value ?? "",
          10
        ) || 0;
      const sel = colorVisible(l);
      const colorCodigo = sel ? sel.value : null;
      return [
        {
          item,
          linea: {
            codigo: item.erpCodigo,
            producto: item.label,
            categoria: item.categoria,
            colorCodigo,
            colorNombre: sel?.selectedOptions[0]?.text ?? "",
            /* La web solo cotiza Primera; el código se conserva porque el ERP lo exige. */
            calidadCodigo: item.calidadesPermitidas[0]?.codigo ?? "PRI",
            cantidad,
            unidad: item.unidad,
            unidadLabel: item.unidadLabel,
            precioUnitario: precioDeLinea(item, colorCodigo),
          },
        },
      ];
    });
  }

  pedir<HTMLElement>(form, "[data-add-linea]").addEventListener("click", () => agregar());
  caja.addEventListener("input", alCambiar);
  caja.addEventListener("change", alCambiar);

  /* La línea que ya está en el HTML: se adopta, no se vuelve a crear. */
  caja.querySelectorAll<HTMLElement>("[data-linea]").forEach(preparar);

  return { agregar, elegidas, quitarVacias };
}
