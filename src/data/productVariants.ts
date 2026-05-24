import type { GalleryImage } from "@/components/ProductGallery.astro";
import {
  buildProjectsInspirationGallery,
  getSplitVariantGalleryMap,
  type InspirationCard,
  type SplitVariantGallery,
} from "@/utils/variantGallery";
import { assetUrl, downloadUrl } from "@/utils/paths";

export interface ProductColorVariant {
  id: string;
  label: string;
  colorLabel: string;
  folder: string;
  /** Precio por unidad para esta variante (ej. "$ 1.500") */
  pricePerUnit?: string;
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
  /** Etiqueta del selector (Color, Formato, etc.) */
  variantSelectorLabel?: string;
}

const manualFachadas: ProductDownload = {
  title: "Manual de fachadas Clay House",
  meta: "Guía de especificación, instalación y buenas prácticas",
  href: downloadUrl("Manual de Fachadas Clay House.pdf"),
};

function buildManifest(
  slug: string,
  productName: string,
  variants: ProductColorVariant[],
  options?: { variantSelectorLabel?: string }
): ProductAssetManifest {
  return {
    slug,
    variants,
    galleriesByVariant: getSplitVariantGalleryMap(slug, variants, productName),
    inspirationGallery: buildProjectsInspirationGallery(slug, variants, productName),
    extraDownloads: [manualFachadas],
    variantSelectorLabel: options?.variantSelectorLabel,
  };
}

const romanoVariants: ProductColorVariant[] = [
  {
    id: "matizado-claro",
    label: "Matizado claro",
    colorLabel: "Matizado claro",
    folder: "matizado claro",
  },
  {
    id: "matizado-oscuro",
    label: "Matizado oscuro",
    colorLabel: "Matizado oscuro",
    folder: "matizado-oscuro",
  },
  { id: "natural", label: "Natural", colorLabel: "Natural", folder: "natural" },
];

const romanoGalleries = getSplitVariantGalleryMap("romano", romanoVariants, "Ladrillo Romano");
const romanoInspiration = buildProjectsInspirationGallery(
  "romano",
  romanoVariants,
  "Ladrillo Romano"
);

const toscanoVariants: ProductColorVariant[] = [
  { id: "natural", label: "Natural", colorLabel: "Natural", folder: "natural" },
  {
    id: "matizado-claro",
    label: "Matizado claro",
    colorLabel: "Matizado claro",
    folder: "matizado claro",
  },
  {
    id: "matizado-oscuro",
    label: "Matizado oscuro",
    colorLabel: "Matizado oscuro",
    folder: "matizado oscuro",
  },
];

const toscanoGalleries = getSplitVariantGalleryMap("toscano", toscanoVariants, "Ladrillo Toscano");
const toscanoInspiration = buildProjectsInspirationGallery(
  "toscano",
  toscanoVariants,
  "Ladrillo Toscano"
);

export const toscanoAssets: ProductAssetManifest = {
  slug: "toscano",
  variants: toscanoVariants,
  galleriesByVariant: toscanoGalleries,
  inspirationGallery: toscanoInspiration,
  extraDownloads: [
    {
      title: "Manual de fachadas Clay House",
      meta: "Guía de especificación, instalación y buenas prácticas",
      href: downloadUrl("Manual de Fachadas Clay House.pdf"),
    },
  ],
};

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

/**
 * Manifiestos por producto con variantes de color.
 * Plantilla Romano (replicar para Toscano, etc.):
 * 1. Carpetas en public/images/products/{slug}/{color}/
 * 2. variants[] + getSplitVariantGalleryMap + build*InspirationGallery
 * 3. Registrar aquí y usar getProductAssets en la ficha
 */
const napolitanoVariants: ProductColorVariant[] = [
  { id: "matizado", label: "Matizado", colorLabel: "Matizado", folder: "matizado" },
  { id: "natural", label: "Natural", colorLabel: "Natural", folder: "natural" },
];

const napolitanoGalleries = getSplitVariantGalleryMap(
  "napolitano",
  napolitanoVariants,
  "Ladrillo Napolitano"
);
const napolitanoInspiration = buildProjectsInspirationGallery(
  "napolitano",
  napolitanoVariants,
  "Ladrillo Napolitano"
);

export const napolitanoAssets: ProductAssetManifest = {
  slug: "napolitano",
  variants: napolitanoVariants,
  galleriesByVariant: napolitanoGalleries,
  inspirationGallery: napolitanoInspiration,
  extraDownloads: [
    {
      title: "Manual de fachadas Clay House",
      meta: "Guía de especificación, instalación y buenas prácticas",
      href: downloadUrl("Manual de Fachadas Clay House.pdf"),
    },
  ],
};

const cartagenaVariants: ProductColorVariant[] = [
  { id: "natural", label: "Natural", colorLabel: "Natural", folder: "natural" },
  {
    id: "matizado-claro",
    label: "Matizado claro",
    colorLabel: "Matizado claro",
    folder: "matizado claro",
  },
  {
    id: "matizado-oscuro",
    label: "Matizado oscuro",
    colorLabel: "Matizado oscuro",
    folder: "matizado oscuro",
  },
];

const cartagenaGalleries = getSplitVariantGalleryMap(
  "cartagena",
  cartagenaVariants,
  "Ladrillo Cartagena"
);
const cartagenaInspiration = buildProjectsInspirationGallery(
  "cartagena",
  cartagenaVariants,
  "Ladrillo Cartagena"
);

export const cartagenaAssets: ProductAssetManifest = {
  slug: "cartagena",
  variants: cartagenaVariants,
  galleriesByVariant: cartagenaGalleries,
  inspirationGallery: cartagenaInspiration,
  extraDownloads: [
    {
      title: "Manual de fachadas Clay House",
      meta: "Guía de especificación, instalación y buenas prácticas",
      href: downloadUrl("Manual de Fachadas Clay House.pdf"),
    },
  ],
};

const macizoCampesinoVariants: ProductColorVariant[] = [
  {
    id: "matizado-claro",
    label: "Matizado claro",
    colorLabel: "Matizado claro",
    folder: "matizado claro",
  },
  {
    id: "matizado-oscuro",
    label: "Matizado oscuro",
    colorLabel: "Matizado oscuro",
    folder: "matizado oscuro",
  },
];

const macizoBrixVariants: ProductColorVariant[] = [
  {
    id: "5x10x20",
    label: "5×10×20 cm",
    colorLabel: "5×10×20 cm",
    folder: "pieza",
    pricePerUnit: "$ 1.500",
  },
  {
    id: "6x12x24",
    label: "6×12×24 cm",
    colorLabel: "6×12×24 cm",
    folder: "pieza",
    pricePerUnit: "$ 1.850",
  },
];

const rayadosVerticalesVariants: ProductColorVariant[] = [
  {
    id: "10",
    label: "10 cm",
    colorLabel: "Rayado 10 cm",
    folder: "rayado 10-vertical",
    pricePerUnit: "$ 2.360",
  },
  {
    id: "12",
    label: "12 cm",
    colorLabel: "Rayado 12 cm",
    folder: "rayado 12-vertical",
    pricePerUnit: "$ 2.690",
  },
  {
    id: "15",
    label: "15 cm",
    colorLabel: "Rayado 15 cm",
    folder: "rayado 15-vertical",
    pricePerUnit: "$ 3.190",
  },
];

const rayadosHorizontalesVariants: ProductColorVariant[] = [
  {
    id: "10",
    label: "10 cm",
    colorLabel: "Rayado 10 cm",
    folder: "rayado 10-horizontal",
    pricePerUnit: "$ 1.790",
  },
  {
    id: "12",
    label: "12 cm",
    colorLabel: "Rayado 12 cm",
    folder: "rayado 12-horizontal",
    pricePerUnit: "$ 2.190",
  },
  {
    id: "15",
    label: "15 cm",
    colorLabel: "Rayado 15 cm",
    folder: "rayado 15-horizontal",
    pricePerUnit: "$ 2.390",
  },
];

const enchapeRusticoVariants: ProductColorVariant[] = [
  { id: "producto", label: "Rústico", colorLabel: "Natural / matizado", folder: "producto" },
];

const enchapeRomanoVariants: ProductColorVariant[] = [
  { id: "natural", label: "Natural", colorLabel: "Natural", folder: "natural" },
  { id: "matizado", label: "Matizado", colorLabel: "Matizado", folder: "matizado" },
  {
    id: "matizado-oscuro",
    label: "Oscuro",
    colorLabel: "Matizado oscuro",
    folder: "matizado oscuro",
  },
];

const piso30Variants: ProductColorVariant[] = [
  { id: "natural", label: "Natural", colorLabel: "Natural", folder: "." },
];

const tejaPlanaVariants: ProductColorVariant[] = [
  {
    id: "chocolate",
    label: "Chocolate",
    colorLabel: "Chocolate",
    folder: "chocolate",
    pricePerUnit: "$ 60.000",
  },
  {
    id: "natural",
    label: "Natural",
    colorLabel: "Natural",
    folder: "natural",
  },
];

const piso10x30Variants: ProductColorVariant[] = [
  { id: "producto", label: "Piso 10×30", colorLabel: "Tabaco, Natural", folder: "." },
];

const bocadilloPrensadoVariants: ProductColorVariant[] = [
  { id: "arena", label: "Arena", colorLabel: "Arena", folder: "arena" },
  { id: "rojo", label: "Rojo", colorLabel: "Rojo", folder: "rojo" },
];

const tejaColonialVariants: ProductColorVariant[] = [
  {
    id: "roja",
    label: "Roja",
    colorLabel: "Roja",
    folder: "roja",
    pricePerUnit: "$ 1.600",
  },
];

export const macizoCampesinoAssets = buildManifest(
  "macizo-campesino",
  "Macizo Campesino",
  macizoCampesinoVariants
);
export const macizoBrixAssets = buildManifest("macizo-brix", "Macizo Brix", macizoBrixVariants, {
  variantSelectorLabel: "Formato",
});
export const rayadosVerticalesAssets = buildManifest(
  "rayados-verticales",
  "Ladrillo Rayado Vertical",
  rayadosVerticalesVariants,
  { variantSelectorLabel: "Formato" }
);
export const rayadosHorizontalesAssets = buildManifest(
  "rayados-horizontales",
  "Ladrillo Rayado Horizontal",
  rayadosHorizontalesVariants,
  { variantSelectorLabel: "Formato" }
);
export const enchapeRusticoAssets = buildManifest(
  "enchape-rustico",
  "Enchape Rústico",
  enchapeRusticoVariants
);
export const enchapeRomanoAssets = buildManifest(
  "enchape-romano",
  "Enchape Romano",
  enchapeRomanoVariants
);
export const piso30Assets = buildManifest("piso-30x30", "Piso 30×30", piso30Variants);
export const piso10x30Assets = buildManifest("piso-10x30", "Piso 10×30", piso10x30Variants);
export const tejaPlanaAssets = buildManifest("teja-plana", "Teja Plana", tejaPlanaVariants);
export const tejaColonialAssets = buildManifest(
  "teja-colonial",
  "Teja Colonial",
  tejaColonialVariants
);
export const bocadilloPrensadoAssets = buildManifest(
  "bocadillo-prensado",
  "Bocadillo Prensado",
  bocadilloPrensadoVariants
);

const manifests: Record<string, ProductAssetManifest> = {
  romano: romanoAssets,
  toscano: toscanoAssets,
  napolitano: napolitanoAssets,
  cartagena: cartagenaAssets,
  "macizo-campesino": macizoCampesinoAssets,
  "macizo-brix": macizoBrixAssets,
  "rayados-verticales": rayadosVerticalesAssets,
  "rayados-horizontales": rayadosHorizontalesAssets,
  "enchape-rustico": enchapeRusticoAssets,
  "enchape-romano": enchapeRomanoAssets,
  "piso-30x30": piso30Assets,
  "piso-10x30": piso10x30Assets,
  "teja-plana": tejaPlanaAssets,
  "teja-colonial": tejaColonialAssets,
  "bocadillo-prensado": bocadilloPrensadoAssets,
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

/** Misma foto que el primer slide del hero (catálogo / destacados) */
export function getCatalogImage(slug: string, fallbackPath: string): string {
  const manifest = getProductAssets(slug);
  const firstId = manifest?.variants[0]?.id;
  const raw =
    (firstId && manifest.galleriesByVariant[firstId]?.hero[0]?.src) || fallbackPath;
  return assetUrl(raw);
}

/** Ajuste fino si la foto trae mucho margen en el archivo (ej. JPG de obra) */
export function getCatalogImageScale(slug: string): number {
  const scales: Record<string, number> = {
    romano: 1.22,
    napolitano: 1.1,
    toscano: 1,
    cartagena: 1.08,
    "macizo-campesino": 1.05,
    "macizo-brix": 1,
    "rayados-verticales": 1.1,
    "rayados-horizontales": 1.1,
    "enchape-rustico": 1,
    "enchape-romano": 1.05,
    "piso-30x30": 1,
    "piso-10x30": 1,
    "teja-plana": 1.05,
    "teja-colonial": 1.05,
  };
  return scales[slug] ?? 1;
}
