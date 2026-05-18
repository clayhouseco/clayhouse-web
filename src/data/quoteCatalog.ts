import { products } from "@/data/products";
import { assetUrl } from "@/utils/paths";
import { normalizePriceDisplay, type QuoteCartItem } from "@/utils/quoteCart";

/** Metadatos de producto para el carrito (solo datos estáticos, sin node:fs) */
export const quoteProductCatalog: Pick<
  QuoteCartItem,
  "slug" | "name" | "category" | "image" | "pricePerUnit" | "unitLabel" | "texture" | "productUrl"
>[] = products.map((p) => ({
  slug: p.slug,
  name: p.name,
  category: p.category,
  image: assetUrl(p.image),
  pricePerUnit: normalizePriceDisplay(p.pricePerUnit ?? "Consultar"),
  unitLabel: p.priceUnitLabel ?? "unidad",
  texture: p.texture,
  productUrl: `/productos/${p.slug}/`,
}));
