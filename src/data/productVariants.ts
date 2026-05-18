import type { GalleryImage } from "@/components/ProductGallery.astro";
import {
  buildRomanoInspirationGallery,
  getSplitVariantGalleryMap,
  type InspirationCard,
  type SplitVariantGallery,
} from "@/utils/variantGallery";
import { downloadUrl } from "@/utils/paths";

export interface ProductColorVariant {
  id: string;
  label: string;
  colorLabel: string;
  folder: string;
}

export interface ProductDownload {
  title: string;
  meta?: string;
  href: string;
}

export interface ProductAssetManifest {
  slug: string;
  variants: ProductColorVariant[];
  galleriesByVariant: Record<string, SplitVariantGallery>;
  inspirationGallery?: InspirationCard[];
  extraDownloads?: ProductDownload[];
}

const romanoVariants: ProductColorVariant[] = [
  { id: "matizado", label: "Matizado", colorLabel: "Matizado", folder: "matizado" },
  {
    id: "matizado-oscuro",
    label: "Matizado oscuro",
    colorLabel: "Matizado oscuro",
    folder: "matizado-oscuro",
  },
  { id: "natural", label: "Natural", colorLabel: "Natural", folder: "natural" },
];

const romanoGalleries = getSplitVariantGalleryMap("romano", romanoVariants, "Ladrillo Romano");
const romanoInspiration = buildRomanoInspirationGallery(
  "romano",
  romanoVariants,
  "Ladrillo Romano"
);

export const romanoAssets: ProductAssetManifest = {
  slug: "romano",
  variants: romanoVariants,
  galleriesByVariant: romanoGalleries,
  inspirationGallery: romanoInspiration,
  extraDownloads: [
    {
      title: "Manual de fachadas Clay House",
      meta: "Guía de especificación, instalación y buenas prácticas",
      href: downloadUrl("Manual de Fachadas Clay House.pdf"),
    },
  ],
};

const manifests: Record<string, ProductAssetManifest> = {
  romano: romanoAssets,
};

export function getProductAssets(slug: string): ProductAssetManifest | undefined {
  return manifests[slug];
}

export function getVariantGallery(
  manifest: ProductAssetManifest,
  variantId: string
): GalleryImage[] {
  return manifest.galleriesByVariant[variantId]?.hero ?? [];
}

export function getProductInspiration(manifest: ProductAssetManifest): InspirationCard[] {
  return manifest.inspirationGallery ?? [];
}
