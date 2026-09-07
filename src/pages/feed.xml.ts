import type { APIRoute } from "astro";
import { cotizableCatalog } from "@/data/cotizacionCatalog";
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

/** "$ 2.450" → 2450. null si no hay importe. */
function priceNumber(raw?: string): number | null {
  const digits = (raw ?? "").replace(/[^\d]/g, "");
  return digits ? Number.parseInt(digits, 10) : null;
}

export const GET: APIRoute = async () => {
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
      <g:mpn>${esc(item.id)}</g:mpn>
      <g:identifier_exists>no</g:identifier_exists>
      <g:product_type>${esc(product.category)}</g:product_type>
      <g:unit_pricing_measure>1 ${esc(item.unidadLabel)}</g:unit_pricing_measure>
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
