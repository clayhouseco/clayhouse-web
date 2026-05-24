import type { Product } from "@/data/products";
import { products, sortProductsByPriority } from "@/data/products";
import {
  catalogCategories,
  type CatalogCategoryDef,
  type ProductCategory,
} from "@/data/catalogCategories";
import { getCatalogImage } from "@/data/productVariants";
import { assetUrl } from "@/utils/paths";

export function getCatalogCategoryDef(id: ProductCategory): CatalogCategoryDef | undefined {
  return catalogCategories.find((c) => c.id === id);
}

export function filterProductsByCategory(id: ProductCategory): Product[] {
  return sortProductsByPriority(products.filter((p) => p.category === id && !p.hidden));
}

export function groupProductsByCategory(): { def: CatalogCategoryDef; products: Product[] }[] {
  return catalogCategories
    .map((def) => ({
      def,
      products: sortProductsByPriority(products.filter((p) => p.category === def.id && !p.hidden)),
    }))
    .filter((g) => g.products.length > 0);
}

export function getCatalogCoverImage(def: CatalogCategoryDef): string {
  const product = products.find((p) => p.slug === def.coverProductSlug);
  if (product) return getCatalogImage(product.slug, product.image);
  return assetUrl(def.coverFallback);
}
