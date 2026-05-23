import type { Product } from "@/data/products";
import type { Review } from "@/data/reviews";
import { site } from "@/data/site";
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
  const url = new URL(`/productos/${product.slug}/`, site.url).href;
  const price = parsePriceNumber(product.pricePerUnit);

  const offer: Record<string, unknown> = {
    "@type": "Offer",
    priceCurrency: "COP",
    availability: "https://schema.org/InStock",
    itemCondition: "https://schema.org/NewCondition",
    url,
    priceValidUntil: endOfCurrentYearIso(),
    seller: { "@type": "Organization", name: site.legalName },
  };

  if (price) {
    offer.price = price;
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
    sku: product.slug,
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
