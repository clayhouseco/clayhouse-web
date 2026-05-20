import type { Product } from "@/data/products";
import { site } from "@/data/site";
import { assetUrl } from "@/utils/paths";

function parsePriceNumber(price?: string): string | undefined {
  if (!price) return undefined;
  const digits = price.replace(/[^\d]/g, "");
  return digits || undefined;
}

export function buildProductJsonLd(product: Product, imagePath?: string) {
  const price = parsePriceNumber(product.pricePerUnit);
  const offer: Record<string, unknown> = {
    "@type": "Offer",
    priceCurrency: "COP",
    availability: "https://schema.org/InStock",
    url: new URL(`/productos/${product.slug}/`, site.url).href,
  };

  if (price) {
    offer.price = price;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    image: new URL(assetUrl(imagePath ?? product.image), site.url).href,
    brand: { "@type": "Brand", name: site.name },
    category: product.category,
    offers: offer,
  };
}
