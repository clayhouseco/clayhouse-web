import type { APIRoute } from "astro";
import { cotizableCatalog } from "@/data/cotizacionCatalog";
import type { UnidadVenta } from "@/data/unidades";
import { getProduct } from "@/data/products";
import { site } from "@/data/site";

export const prerender = true;

/**
 * Feed de productos para Google Merchant Center (RSS 2.0 con el espacio de
 * nombres `g:`), que habilita las fichas gratuitas de Shopping y las campañas
 * de Shopping.
 *
 * Se arma sobre `cotizableCatalog` y no sobre la lista de productos porque ese
 * catálogo ya está a la granularidad del ERP: cada dimensión cotizable (rayado
 * 10/12/15, macizo 6x12x24) es un artículo distinto con su propio código, que
 * es justo lo que Merchant Center espera en `g:id`. Así el feed, la web y la
 * facturación nombran el mismo artículo.
 *
 * Solo entran ítems con precio numérico: Merchant Center rechaza el artículo si
 * `g:price` no trae importe y moneda, y un feed con errores termina en cuenta
 * suspendida. Lo que se cotiza por volumen queda fuera a propósito.
 */

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * La unidad de venta como la escribe Merchant Center.
 *
 * `g:unit_pricing_measure` solo acepta sus propios tokens —`sqm`, `m`, `ct`…—, y hasta ahora
 * se enviaba la etiqueta de la web: «1 m²» y «1 unidad», que Merchant no reconoce y que le
 * cuestan al artículo una advertencia en un feed que ya estuvo sancionado. Para lo que se
 * vende por pieza se omite: el campo es opcional y «1 ct» no le dice nada a nadie.
 */
function medidaMerchant(unidad: UnidadVenta): string | null {
  if (unidad === "m2") return "1 sqm";
  if (unidad === "ml") return "1 m";
  return null;
}

/** "$ 2.450" → 2450. null si no hay importe. */
function priceNumber(raw?: string): number | null {
  const digits = (raw ?? "").replace(/[^\d]/g, "");
  return digits ? Number.parseInt(digits, 10) : null;
}

export const GET: APIRoute = async () => {
  /* Cuántas referencias cotizables cuelgan de cada página. */
  const grupos = new Map<string, number>();
  for (const it of cotizableCatalog) grupos.set(it.slug, (grupos.get(it.slug) ?? 0) + 1);

  const items = cotizableCatalog
    .map((item) => {
      const price = priceNumber(item.refPrice);
      if (!price) return null;
      const product = getProduct(item.slug);
      if (!product) return null;

      // La página del producto es la misma para todas sus dimensiones; el
      // parámetro deja al visitante en la variante que vio en el anuncio.
      const url = item.variantId
        ? `${site.url}/productos/${item.slug}?color=${encodeURIComponent(item.variantId)}`
        : `${site.url}/productos/${item.slug}`;
      const image = new URL(item.image, site.url).href;
      const medida = medidaMerchant(item.unidad);

      return `    <item>
      <g:id>${esc(item.erpCodigo ?? item.id)}</g:id>
      <g:title>${esc(item.label)}</g:title>
      <g:description>${esc(product.shortDescription)}</g:description>
      <g:link>${esc(url)}</g:link>
      <g:image_link>${esc(image)}</g:image_link>
      <g:availability>in_stock</g:availability>
      <g:condition>new</g:condition>
      <g:price>${price}.00 COP</g:price>
      <g:brand>${esc(site.name)}</g:brand>
      <g:mpn>${esc(item.erpCodigo ?? item.id)}</g:mpn>${
        /* Se declaraba `identifier_exists: no` —«este artículo no tiene identificadores»— y
           al mismo tiempo se mandaba un MPN. Con marca y MPN, Google ya tiene con qué
           identificarlo: la contradicción sobraba y le costaba avisos al feed. */
        ""
      }${
        /* Las referencias que comparten página son variantes de un mismo artículo (los tres
           formatos de rayado). Sin agruparlas, Merchant las trata como productos sueltos que
           compiten entre sí. */
        (grupos.get(item.slug) ?? 0) > 1
          ? `\n      <g:item_group_id>${esc(item.slug)}</g:item_group_id>`
          : ""
      }
      <g:product_type>${esc(product.category)}</g:product_type>${
        medida ? `\n      <g:unit_pricing_measure>${esc(medida)}</g:unit_pricing_measure>` : ""
      }
    </item>`;
    })
    .filter(Boolean);

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${esc(site.name)}</title>
    <link>${site.url}</link>
    <description>Ladrillo y teja de arcilla fabricados en Amagá, Antioquia.</description>
${items.join("\n")}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
};
