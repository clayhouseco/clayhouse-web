import type { Product } from "@/data/products";
import { erpDeSlug } from "@/data/erpFeed";
import {
  normalizarUnidad,
  precioEnUnidadDeVenta,
  unidadesPorM2 as erpUnidadesPorM2,
} from "@/data/unidades";

function parseCopAmount(value: string): number | null {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number.parseInt(digits, 10) : null;
}

function formatCop(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(amount);
}

/** Parsea dimensiones tipo "27,5 cm" → 27.5 (centímetros). Cuando el producto
 *  trae varios formatos en un solo string ("5 / 6 cm"), toma el primer valor —
 *  el resultado es una estimación conservadora (más piezas/m²) y el cliente
 *  confirma el formato exacto en cotización. */
function parseCm(value?: string): number | null {
  if (!value) return null;
  const match = value.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return null;
  return Number.parseFloat(match[1].replace(",", "."));
}

/** Etiqueta B2B para tarjetas del catálogo. Muestra el precio por unidad
 *  (o por m² si el producto se vende así), sin convertir entre los dos —
 *  la conversión a m² depende del rendimiento de pega elegido y se muestra
 *  por separado en la ficha del producto. */
export function getReferencePriceLabel(product: Product): string | null {
  // Productos con varios precios (color/dimensión) muestran "Desde <mínimo>".
  const base = product.priceFrom ?? product.pricePerUnit;
  if (!base) return null;
  const prefix = product.priceFrom ? "Desde " : "";
  const unit = product.priceUnitLabel ?? "unidad";
  /* Cuando el precio se convirtió a la unidad de venta, el de la pieza sigue siendo el que el
     cliente reconoce: se dice al lado en vez de reemplazar al que se cobra. */
  const base2 =
    product.priceBasis && product.priceLiteralUnit
      ? `precio referencia, sin envío · ${product.priceBasis} por ${product.priceLiteralUnit}`
      : "precio referencia, sin envío";
  return `${prefix}${base.trim()}/${unit} + IVA (${base2})`;
}

/** Precio por m² de referencia (una sola cifra), para mostrarlo junto al precio
 *  por unidad. Usa el rendimiento publicado del producto (× precio/unidad); si
 *  no hay, estima con 1 cm de pega. Devuelve null si el producto ya se vende
 *  por m² (el precio principal ya es /m²) o si no tiene precio por unidad. */
/** Rendimiento publicado por el ERP, tal cual ("≈ 22 und/m²"). Es el único dato
 *  de rendimiento que existe para tejas: se traslapan, así que no se calcula. */
export function getErpRendimiento(slug: string): string | null {
  return erpDeSlug(slug)[0]?.rendimiento ?? null;
}

/**
 * EL PRECIO DE LA VARIANTE ACTIVA, EN LA UNIDAD EN QUE SE VENDE.
 *
 * Los botones de color traen su propio precio. Cuando lo puso el ERP ya viene en su unidad;
 * cuando está escrito a mano viene en la de la ficha, que puede ser otra —la teja colonial
 * tiene «$ 1.600» por pieza y el ERP la vende por m²—, y ese era el precio que el botón
 * «agregar a cotización» mandaba al carrito con la unidad del ERP pegada al lado.
 *
 * Devuelve `null` cuando el precio existe pero no hay forma de expresarlo en la unidad de
 * venta: la ficha no muestra cifra y el cliente la pide en la cotización. Es preferible a
 * publicar una que no se va a poder cobrar.
 */
export function precioDeVariante(
  product: Product,
  variant?: { pricePerUnit?: string; precioDelErp?: boolean } | null
): string | null {
  const literal = variant?.pricePerUnit;
  if (!literal) return product.pricePerUnit ?? null;
  if (variant?.precioDelErp || !product.priceLiteralUnit) return literal;
  return (
    precioEnUnidadDeVenta(product.slug, literal, normalizarUnidad(product.priceLiteralUnit))
      ?.texto ?? null
  );
}

/**
 * El precio por m² de cada variante.
 *
 * Gerencia: «el valor de 91.000 por m² no cambia cuando paso de muro 10 a muro 15».
 *
 * La cifra se calculaba una sola vez con el precio base del producto y se quedaba fija al
 * cambiar de botón, aunque el precio por unidad sí cambiara justo encima. En el calado el
 * de 15 cm cuesta $ 4.000 y no $ 3.500, y en los rayados cada formato tiene además otras
 * medidas, así que cambian las dos mitades del cálculo: las piezas por m² y lo que vale
 * cada una.
 *
 * Devuelve `{}` cuando el producto no tiene variantes con precio o medida propios: ahí la
 * cifra del producto ya es correcta para todos los botones.
 */
export function getReferencePriceM2PorVariante(
  product: Product,
  variants: ReadonlyArray<{
    id: string;
    pricePerUnit?: string;
    dimensions?: { largo: string; alto: string };
  }>
): Record<string, string> {
  const out: Record<string, string> = {};
  if (!variants.some((v) => v.pricePerUnit || v.dimensions)) return out;
  for (const v of variants) {
    const composite: Product = {
      ...product,
      pricePerUnit: v.pricePerUnit ?? product.pricePerUnit,
      dimensions: v.dimensions
        ? { ...(product.dimensions ?? {}), largo: v.dimensions.largo, alto: v.dimensions.alto }
        : product.dimensions,
    };
    const precio = getReferencePriceM2(composite);
    if (precio) out[v.id] = precio;
  }
  return out;
}

/**
 * CUÁNTAS PIEZAS LLEVA UN METRO CUADRADO.
 *
 * Una sola respuesta para las dos direcciones de la conversión: si las dos la calcularan
 * por su cuenta podrían contestar distinto, y entonces la página diría que la pieza vale X
 * y el metro vale algo que no es X por las piezas que caben.
 *
 *  1. El escenario de pega 1 cm, que es el que la ficha muestra en su tabla: así el titular
 *     no contradice lo que el cliente está viendo más abajo.
 *  2. El rendimiento publicado del producto, cuando no hay medidas con que calcular.
 *  3. El del ERP. Es lo único que hay en cubiertas, que se traslapan y no se calculan.
 */
function unidadesPorMetro(product: Product): number | null {
  const pega1 = getRendimientoTable(product)?.find((r) => r.jointCm === 1);
  return (
    pega1?.unitsPerM2 ?? parseCm(product.dimensions?.rendimiento) ?? erpUnidadesPorM2(product.slug)
  );
}

export function getReferencePriceM2(product: Product): string | null {
  if (!product.pricePerUnit) return null;
  if (product.priceUnitLabel && product.priceUnitLabel !== "unidad") return null;
  const unitAmount = parseCopAmount(product.pricePerUnit);
  if (!unitAmount) return null;
  const units = unidadesPorMetro(product);
  if (!units) return null;
  return `${formatCop(Math.round(units * unitAmount))}/m²`;
}

/**
 * CON QUÉ JUNTA SE CALCULÓ ESE METRO. SIN ESO, EL NÚMERO NO SIGNIFICA NADA.
 *
 * Gerencia: «el metro cuadrado es relativo a la cantidad de pega». Exacto, y la cifra se
 * mueve mucho: el Romano son 49 piezas/m² con pega de 1 cm y 60 a junta perdida —un 18% de
 * diferencia en lo que cuesta cubrir un metro—. Publicar «≈ $ 120.050/m²» a secas deja al
 * cliente sin saber cuál de las dos obras está presupuestando, y hace que la cifra parezca
 * peleada con el rendimiento que publica el ERP, que es el de junta perdida.
 *
 * El escenario no cambia —sigue siendo pega de 1 cm, el realista y el que la ficha muestra
 * en su tabla— pero ahora se nombra.
 *
 * Va aparte del precio y no dentro de la cadena: metido ahí, cualquiera que lea esa cifra
 * como número se llevaría el «1 cm» pegado al final («$ 120.050/m² con pega 1 cm» → 1200501).
 * Devuelve null donde no aplica: en cubiertas el rendimiento lo mide el ERP, no sale de una
 * junta.
 */
export function getJuntaLabel(product: Product): string | null {
  const units = unidadesPorMetro(product);
  if (!units) return null;
  const pega = getRendimientoTable(product)?.find((r) => r.unitsPerM2 === units);
  return pega ? `con ${pega.label.toLowerCase()}` : null;
}

/**
 * CUÁNTAS PIEZAS LLEVA UN METRO — PARA LO QUE SE FACTURA POR METRO.
 *
 * Durante unas horas acá hubo un «precio por pieza» para los enchapes, y estaba mal.
 * Gerencia lo detectó: el metro cuadrado depende del espesor de la junta, así que dividir el
 * precio del metro entre las piezas que caben da una cifra que se mueve un 43% según un
 * supuesto que el cliente no eligió —$ 1.492 con junta perdida, $ 2.131 con pega de 2 cm— y
 * encima al revés de la intuición: con MÁS pega la «pieza» sale más CARA.
 *
 * La asimetría que me faltaba ver:
 *
 *  · Un ladrillo se vende por pieza. «¿Cuánto me cuesta cubrir un metro?» es una pregunta
 *    real de presupuesto, y que su respuesta dependa de la junta es correcto: el cliente
 *    elige la junta y la ficha le muestra los tres escenarios.
 *  · Un enchape se factura por metro. «¿Cuánto cuesta la pieza?» no tiene respuesta
 *    comercial: no se puede comprar una. La pieza física cuesta lo que cuesta; lo que cambia
 *    es cuántas caben.
 *
 * Homecenter publica las dos cifras en una teja porque las dos son precios a los que de
 * verdad se puede comprar. Un «$ 1.790/pieza» de enchape no lo es: es un cociente disfrazado
 * de precio.
 *
 * Lo que sí se puede decir, y es cierto, es cuántas piezas lleva el metro. Eso ayuda a
 * comparar sin fingir un precio que no existe.
 */
export function getPiezasPorM2Label(product: Product): string | null {
  if (product.priceUnitLabel !== "m²") return null;
  const units = unidadesPorMetro(product);
  /* Sin «≈»: la plantilla ya lo antepone, igual que al precio por m². */
  return units ? `${units} piezas/m²` : null;
}

/** Igual que getReferencePriceLabel pero devuelve el monto principal y la
 *  nota (IVA + disclaimer) separados, para dar jerarquía visual al precio. */
export function getReferencePriceParts(product: Product): { amount: string; note: string } | null {
  const label = getReferencePriceLabel(product);
  if (!label) return null;
  const idx = label.indexOf(" + IVA");
  if (idx === -1) return { amount: label, note: "" };
  return { amount: label.slice(0, idx).trim(), note: label.slice(idx + 1).trim() };
}

export interface RendimientoRow {
  /** Etiqueta humana del escenario (ej. "Junta perdida", "Pega 1 cm") */
  label: string;
  /** Espesor de la junta en cm (0, 1, 2) — útil como dato data-* */
  jointCm: number;
  /** Unidades por m² (redondeado al entero superior, para obra real) */
  unitsPerM2: number;
  /** Precio por m² ya formateado en COP, o null si no hay pricePerUnit */
  pricePerM2: string | null;
}

/** Calcula cuántas piezas/m² requiere el producto según el espesor de junta.
 *  Junta perdida (0 cm) suele dar el mayor rendimiento; la competencia
 *  habitualmente cotiza con 1 cm de pega, lo que arroja menos unidades/m²
 *  y por ende un menor precio aparente. Mostrar los 3 escenarios deja al
 *  cliente comparar manzanas con manzanas. */
export function getRendimientoTable(product: Product): RendimientoRow[] | null {
  /**
   * EN CUBIERTAS NO SE CALCULA: SE TRASLAPAN.
   *
   * Un ladrillo teja el plano, así que de su cara y la junta sale cuántos caben en un metro.
   * Una teja no: se monta sobre la de abajo y sobre la de al lado, y lo que queda a la vista
   * es menos que su medida. La geometría da una cifra plausible y falsa.
   *
   * La Teja S lo mostró. Su medida «30*45*9» daba tres números, así que se le calculaba una
   * tabla —22 piezas/m² con junta de 1 cm— que ninguna ficha llega a mostrar, pero que sí
   * mandaba sobre el titular del catálogo: la tarjeta anunciaba «≈ $ 73.040/m²» cuando el
   * ERP publica 10,5 und/m², o sea $ 34.860. Un precio por metro inflado 2,1 veces, justo en
   * la cifra con la que un cliente compara cubiertas.
   *
   * Para una cubierta manda el rendimiento que publica el ERP, que es el medido. Por eso las
   * otras tejas salían bien: no tenían con qué calcular y caían en el dato real.
   */
  if (product.category === "Techos") return null;

  const largoCm = parseCm(product.dimensions?.largo);
  const altoCm = parseCm(product.dimensions?.alto);
  if (!largoCm || !altoCm) return null;

  const largoM = largoCm / 100;
  const altoM = altoCm / 100;
  // Las piezas por m² se cuentan igual se venda el producto por unidad o por m²
  // —es geometría—, pero el precio por m² solo se deriva cuando el precio es
  // por pieza. En un enchape cotizado por m² multiplicar piezas × precio daría
  // una cifra absurda, así que esa columna queda vacía.
  const porUnidad = !product.priceUnitLabel || product.priceUnitLabel === "unidad";
  const unitAmount = porUnidad ? parseCopAmount(product.pricePerUnit ?? "") : null;
  const fmtPrice = (units: number) => (unitAmount ? `${formatCop(units * unitAmount)}/m²` : null);

  const scenarios: { label: string; jointCm: number }[] = [
    { label: "Junta perdida", jointCm: 0 },
    { label: "Pega 1 cm", jointCm: 1 },
    { label: "Pega 2 cm", jointCm: 2 },
  ];

  return scenarios.map(({ label, jointCm }) => {
    const j = jointCm / 100;
    const units = Math.ceil(1 / ((largoM + j) * (altoM + j)));
    return { label, jointCm, unitsPerM2: units, pricePerM2: fmtPrice(units) };
  });
}

export interface RendimientoVariantData {
  variantId: string;
  label: string;
  table: RendimientoRow[];
}

/** Cuando un producto tiene variantes con dimensiones/precio distintos
 *  (ej. Macizo en formato 5×10×20 y 6×12×24), devuelve una tabla de
 *  rendimiento por variante. Si ninguna variante sobrescribe las dims,
 *  devuelve null (se usa getRendimientoTable normal). */
export function getRendimientoTablesByVariant(
  product: Product,
  variants: ReadonlyArray<{
    id: string;
    label: string;
    pricePerUnit?: string;
    dimensions?: { largo: string; alto: string };
  }>
): RendimientoVariantData[] | null {
  const overriders = variants.filter((v) => v.dimensions);
  if (overriders.length < 2) return null;

  const result: RendimientoVariantData[] = [];
  for (const v of overriders) {
    const composite: Product = {
      ...product,
      pricePerUnit: v.pricePerUnit ?? product.pricePerUnit,
      dimensions: {
        ...(product.dimensions ?? {}),
        largo: v.dimensions!.largo,
        alto: v.dimensions!.alto,
      },
    };
    const table = getRendimientoTable(composite);
    if (table) result.push({ variantId: v.id, label: v.label, table });
  }
  return result.length >= 2 ? result : null;
}

export interface RendiFormato {
  /** id de variante ERP, o null si el producto tiene un solo formato */
  variantId: string | null;
  label: string;
  largoCm: number;
  altoCm: number;
}

/** Formatos (largo × alto) para la calculadora interactiva de m². Devuelve un
 *  formato por variante con dimensiones propias (ej. rayados, macizo-brix) o
 *  uno solo para el producto. null si no aplica (no se vende por unidad o no
 *  tiene largo/alto numéricos). */
export function getRendimientoFormats(
  product: Product,
  variants?: ReadonlyArray<{
    id: string;
    label: string;
    dimensions?: { largo: string; alto: string };
  }>
): RendiFormato[] | null {
  // Las tejas (Techos) y los decorativos (celosías) no se cotizan por pieza/m²
  // con junta, así que no llevan la calculadora.
  if (product.category === "Techos" || product.category === "Decorativos") return null;
  const overriders = (variants ?? []).filter((v) => v.dimensions);
  if (overriders.length >= 2) {
    const fmts = overriders
      .map((v) => {
        const l = parseCm(v.dimensions!.largo);
        const a = parseCm(v.dimensions!.alto);
        return l && a ? { variantId: v.id, label: v.label, largoCm: l, altoCm: a } : null;
      })
      .filter((x) => x !== null);
    return fmts.length ? fmts : null;
  }
  const l = parseCm(product.dimensions?.largo);
  const a = parseCm(product.dimensions?.alto);
  if (!l || !a) return null;
  return [{ variantId: null, label: product.name, largoCm: l, altoCm: a }];
}

export interface FloorRendimientoRow {
  /** Etiqueta humana (ej. "Pega 5 mm") */
  label: string;
  /** Espesor en mm (3, 5, 8, 10) — usado como discriminante del ícono */
  jointMm: number;
  /** Piezas por m² con 1 decimal. Para pisos grandes (30×30) las diferencias
   *  entre escenarios de mm son fraccionales y Math.ceil las aplanaba todas
   *  al mismo entero; mostrar un decimal preserva la información. */
  unitsPerM2: number;
}

/** Rendimiento para pisos. La categoría "Pisos" se retiró del catálogo, por lo
 *  que esta tabla ya no aplica a ningún producto y siempre devuelve null. Se
 *  conserva la firma por si se reintroduce una línea de pisos en el futuro. */
export function getFloorRendimientoTable(_product: Product): FloorRendimientoRow[] | null {
  return null;
}
