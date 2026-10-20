import type { Product } from "@/data/products";
import type { Review } from "@/data/reviews";
import { erpEquivalencia } from "@/data/erpCatalog";
import { site } from "@/data/site";
import { UNIDAD_PRECIO_LABEL, normalizarUnidad } from "@/data/unidades";
import { assetUrl } from "@/utils/paths";

function parsePriceNumber(price?: string): string | undefined {
  if (!price) return undefined;
  const digits = price.replace(/[^\d]/g, "");
  return digits || undefined;
}

function endOfCurrentYearIso(): string {
  return `${new Date().getFullYear()}-12-31`;
}

function buildReviewNode(review: Review) {
  return {
    "@type": "Review",
    author: { "@type": "Person", name: review.author },
    datePublished: review.date,
    reviewRating: {
      "@type": "Rating",
      ratingValue: review.rating,
      bestRating: 5,
      worstRating: 1,
    },
    reviewBody: review.text,
  };
}

function buildAggregateRatingNode(reviews: Review[]) {
  const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
  const value = Math.round((sum / reviews.length) * 10) / 10;
  return {
    "@type": "AggregateRating",
    ratingValue: value,
    bestRating: 5,
    worstRating: 1,
    reviewCount: reviews.length,
  };
}

export function buildProductJsonLd(
  product: Product,
  imagePath?: string,
  productReviews: Review[] = []
) {
  const url = new URL(`/productos/${product.slug}`, site.url).href;
  const price = parsePriceNumber(product.pricePerUnit);
  /* El código con el que se factura, no el slug de la web. Google lo usa para reconocer el
     mismo artículo entre el sitio, el feed de Merchant y los anuncios; con «romano» en vez
     de «ROM» estaba nombrando algo que no existe en ningún sistema de la empresa. */
  const eq = erpEquivalencia(product.slug);
  const unidad = normalizarUnidad(product.priceUnitLabel);

  const offer: Record<string, unknown> = {
    "@type": "Offer",
    priceCurrency: "COP",
    /* Gerencia confirmó que todo se produce bajo pedido: «InStock» significa listo para
       despachar y eso no es lo que pasa. `MadeToOrder` es exactamente esto, y no obliga a
       declarar una fecha que no se puede dar de antemano. */
    availability: "https://schema.org/MadeToOrder",
    itemCondition: "https://schema.org/NewCondition",
    url,
    priceValidUntil: endOfCurrentYearIso(),
    seller: { "@type": "Organization", name: site.legalName },
  };

  if (price) {
    offer.price = price;
    /* EN QUÉ UNIDAD. «110.000» sin más se lee como el precio de una pieza, y el enchape se
       vende por metro cuadrado. Lo dice la misma unidad que publica la ficha. */
    offer.priceSpecification = {
      "@type": "UnitPriceSpecification",
      priceCurrency: "COP",
      price,
      unitText: UNIDAD_PRECIO_LABEL[unidad],
      ...(unidad === "m2" ? { unitCode: "MTK" } : { unitCode: "C62" }),
    };
  } else {
    offer.priceSpecification = {
      "@type": "PriceSpecification",
      priceCurrency: "COP",
      description: "Precio bajo cotización según volumen y referencia",
    };
  }

  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: eq.codigo ?? product.slug,
    ...(eq.codigo ? { mpn: eq.codigo } : {}),
    description: product.shortDescription,
    image: new URL(assetUrl(imagePath ?? product.image), site.url).href,
    brand: { "@type": "Brand", name: site.name },
    category: product.category,
    url,
    offers: offer,
  };

  if (productReviews.length > 0) {
    node.aggregateRating = buildAggregateRatingNode(productReviews);
    node.review = productReviews.map(buildReviewNode);
  }

  return node;
}
