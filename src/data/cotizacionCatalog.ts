import { getVisibleProducts, getProduct } from "@/data/products";
import { erpDeCodigo, erpDeSlug } from "@/data/erpFeed";
import { getProductAssets } from "@/data/productVariants";
import { precioDeVariante } from "@/utils/productPricing";
import { assetUrl } from "@/utils/paths";
import { thumbSrcFor } from "@/utils/responsive";
import {
  erpEquivalencia,
  erpVariantIds,
  colorCodigo,
  ERP_COLORES,
  ERP_CALIDADES,
  ERP_UNIDAD_LABEL,
  type ColorCodigo,
  type CalidadCodigo,
  type UnidadVenta,
} from "@/data/erpCatalog";
import { normalizarUnidad, numeroACop, precioEnUnidadDeVenta } from "@/data/unidades";

/** Una opción cotizable, a la granularidad del ERP (cada dimensión de
 *  rayado/macizo es una opción distinta). Es lo que se elige por línea en
 *  /cotizacion. */
export interface CotizableItem {
  /** id único de la opción (slug o slug::variantId). */
  id: string;
  label: string;
  slug: string;
  /** Categoría del producto. La usa la medición para agrupar sin tener que cruzar
   *  el catálogo en el navegador. */
  categoria: string;
  variantId: string | null;
  /** Código ERP (null si el producto aún no existe en el ERP). */
  erpCodigo: string | null;
  coloresPermitidos: { codigo: ColorCodigo; nombre: string; hex: string }[];
  calidadesPermitidas: { codigo: CalidadCodigo; nombre: string }[];
  unidad: UnidadVenta;
  unidadLabel: string;
  image: string;
  /** La misma foto, reducida a 320 px. Las tarjetas del selector y la línea elegida la
   *  pintan a 56-72 px: con `image` se bajaban 22 fotos de 250-350 KB para eso. `image`
   *  se conserva porque el feed de Merchant necesita la grande. */
  thumb: string;
  /** Precio de referencia de la web (no es el precio final de la cotización). */
  refPrice: string;
  /** Precio de referencia por color (código ERP → precio), cuando el producto
   *  tiene precio distinto según el color (prensados). Sobrescribe a refPrice. */
  preciosPorColor?: Record<string, string>;
}

function variantLabel(name: string, slug: string, id: string): string {
  if (slug.startsWith("rayados")) {
    const orient = slug.includes("vertical") ? "Vertical" : "Horizontal";
    return `Rayado ${orient} ${id} cm`;
  }
  if (slug === "macizo-brix") return `Macizo ${id}`;
  if (slug === "calado") return `Calado ${id} cm`;
  return `${name} ${id}`;
}

/**
 * El precio que el ERP publica para ESE código, en la unidad del ERP.
 *
 * Los rayados son tres códigos en una sola página —R10V, R12V, R15V, a $ 2.360, $ 2.690 y
 * $ 3.190— y el precio del producto es el más barato de los tres. Tomando ese para las tres
 * líneas, el cotizador cobraba el formato de 15 al precio del de 10.
 */
function precioDelCodigo(codigo: string | null): string | null {
  const p = erpDeCodigo(codigo);
  if (!p) return null;
  const colores = (p.colores ?? [])
    .map((c) => c.precio)
    .filter((v): v is number => typeof v === "number" && v > 0);
  const valor = colores.length ? Math.min(...colores) : (p.precio ?? null);
  return typeof valor === "number" && valor > 0 ? numeroACop(valor) : null;
}

/**
 * Precio de referencia expresado SIEMPRE en la unidad en que se cotiza.
 *
 * Sin esto el cotizador multiplicaba metros cuadrados por el precio de una pieza: la teja
 * colonial se vende por m² según el ERP, pero la web tenía su precio por unidad ($ 1.600), y
 * 60 m² salían en $ 96.000 cuando son 1.320 tejas — $ 2.112.000. Un error de 22 veces en un
 * documento con precios.
 *
 * El orden es el que manda en todo lo demás: primero el ERP para ese código, después lo
 * escrito a mano para ese formato —convertido, porque está en la unidad de la ficha— y por
 * último el precio del producto, que `conDatosDelErp` ya dejó en la unidad de venta.
 *
 * Si no hay forma de expresarlo en la unidad que se cotiza, no se inventa un número: la
 * línea queda "Consultar" y el equipo la confirma.
 */
function refPrecio(
  slug: string,
  codigo: string | null,
  variantId: string | null,
  unidad: UnidadVenta
): string | null {
  const delErp = precioDelCodigo(codigo);
  if (delErp) return delErp;

  const producto = getProduct(slug);
  const literal = variantId ? PRECIO_POR_VARIANTE[slug]?.[variantId] : undefined;
  if (literal) {
    const unidadDelLiteral = normalizarUnidad(
      producto?.priceLiteralUnit ?? producto?.priceUnitLabel
    );
    return precioEnUnidadDeVenta(slug, literal, unidadDelLiteral, unidad)?.texto ?? null;
  }
  return producto?.pricePerUnit ?? null;
}

/** Precio de referencia por dimensión, cuando difiere del precio base del
 *  producto (el precio del producto es solo el punto de partida). */
const PRECIO_POR_VARIANTE: Record<string, Record<string, string>> = {
  "rayados-verticales": { "10": "$ 2.360", "12": "$ 2.690", "15": "$ 3.190" },
  "rayados-horizontales": { "10": "$ 1.790", "12": "$ 2.190", "15": "$ 2.390" },
  "macizo-brix": { "6x12x24": "$ 2.290" },
  calado: { "10": "$ 3.500", "15": "$ 4.000" },
};

/** Precio por color (código ERP → precio) derivado de las variantes del
 *  producto, cuando el color determina el precio (prensados). Devuelve undefined
 *  si el color no afecta el precio (todas las variantes valen igual o las
 *  variantes son de dimensión, no de color). Así el precio vive en un solo
 *  lugar: las variantes en productVariants.ts. */
function preciosPorColorDe(slug: string): Record<string, string> | undefined {
  // 1) El ERP manda: publica el precio dentro de cada color, que es la
  //    granularidad real con la que se vende. Super Terras cuesta $ 2.500 en
  //    Arena y $ 2.950 en Topo, y sin esto el cotizador cobraba 2.500 por los
  //    dos: $ 450 menos por unidad en cada pedido de Topo.
  const minimo: Record<string, number> = {};
  for (const p of erpDeSlug(slug)) {
    for (const c of p.colores || []) {
      if (typeof c.precio !== "number" || !(c.codigo in ERP_COLORES)) continue;
      /* Un color repetido en dos acabados trae dos precios. El cotizador solo maneja el
         color, así que publica el menor y la cotización dice «preliminar»: el equipo
         confirma el acabado y ajusta. Cobrar el mayor por defecto encarecería el acabado
         más común, que es el liso. */
      minimo[c.codigo] = Math.min(minimo[c.codigo] ?? Infinity, c.precio);
    }
  }
  const delErp: Record<string, string> = {};
  for (const [cod, v] of Object.entries(minimo)) delErp[cod] = numeroACop(v);
  if (new Set(Object.values(delErp)).size >= 2) return delErp;

  // 2) Respaldo: los precios por variante escritos en la web (prensados).
  const assets = getProductAssets(slug);
  if (!assets) return undefined;
  const out: Record<string, string> = {};
  const producto = getProduct(slug);
  for (const v of assets.variants) {
    const codigo = colorCodigo(v.colorLabel);
    if (!codigo || !producto) continue;
    /* Estos precios están escritos en la unidad de la ficha, no en la del ERP: se convierten
       igual que el del producto, o la línea queda sin cifra en vez de con una de otra escala. */
    const precio = precioDeVariante(producto, v);
    if (precio) out[codigo] = precio;
  }
  // Solo tiene sentido si el precio realmente varía según el color (≥2 precios
  // distintos); si todos valen igual, el precio base (refPrice) ya lo cubre.
  const distintos = new Set(Object.values(out));
  return distintos.size >= 2 ? out : undefined;
}

/** Catálogo cotizable completo (todas las opciones a nivel ERP). */
export const cotizableCatalog: CotizableItem[] = getVisibleProducts()
  .flatMap((p) => {
    const variantes = erpVariantIds(p.slug);
    const ids: (string | null)[] = variantes.length ? variantes : [null];
    // El precio por color solo aplica a productos sin variantes de dimensión.
    const preciosPorColor = variantes.length ? undefined : preciosPorColorDe(p.slug);
    return ids.map((variantId) => {
      const eq = erpEquivalencia(p.slug, variantId);
      // Sin código del ERP —o con uno que el ERP no publica— la cotización no se
      // puede cargar allá, así que el producto no se ofrece aquí: la ficha sigue
      // publicada y visible, pero no entra al cotizador hasta que el ERP le
      // asigne código. Es el mismo criterio con el que se retiraron los enchapes
      // que el ERP dejó de publicar — ofrecer algo que el ERP no sabe atender
      // genera solicitudes que nadie puede procesar.
      //
      // `reconocido` es la segunda mitad: ERP_MAP guarda tres códigos que se
      // asignaron desde la web —NAP, ENC-RUS, ENC-BOC— y que el ERP no tiene.
      // Hoy esos productos ya no son visibles por otras razones; esto hace que
      // volver a publicarlos en la web no alcance para colarlos al cotizador.
      if (!eq.codigo || !eq.reconocido) return null;
      return {
        id: variantId ? `${p.slug}::${variantId}` : p.slug,
        label: variantId ? variantLabel(p.name, p.slug, variantId) : p.name,
        slug: p.slug,
        categoria: p.category,
        variantId,
        erpCodigo: eq.codigo,
        coloresPermitidos: eq.coloresPermitidos.map((c) => ({ codigo: c, ...ERP_COLORES[c] })),
        calidadesPermitidas: eq.calidadesPermitidas.map((c) => ({
          codigo: c,
          nombre: ERP_CALIDADES[c],
        })),
        unidad: eq.unidad,
        unidadLabel: ERP_UNIDAD_LABEL[eq.unidad],
        image: assetUrl(p.image),
        thumb: thumbSrcFor(p.image),
        refPrice: refPrecio(p.slug, eq.codigo, variantId, eq.unidad) ?? "Consultar",
        preciosPorColor,
      };
    });
  })
  .filter((x) => x !== null);
