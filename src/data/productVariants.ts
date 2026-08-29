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
  /** Dimensiones específicas del formato (cuando una variante representa
   *  un tamaño distinto, ej. 5×10×20 vs 6×12×24 en Macizo). Solo necesita
   *  largo y alto para el cálculo de rendimiento por m². */
  dimensions?: { largo: string; alto: string };
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
    folder: "matizado-oscuro",
  },
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
    dimensions: { largo: "20 cm", alto: "5 cm" },
  },
  {
    id: "6x12x24",
    label: "6×12×24 cm",
    colorLabel: "6×12×24 cm",
    folder: "pieza",
    pricePerUnit: "$ 1.850",
    dimensions: { largo: "24 cm", alto: "6 cm" },
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

const enchapeThinBrickVariants: ProductColorVariant[] = [
  { id: "natural", label: "Natural", colorLabel: "Natural", folder: "natural" },
  { id: "bianco", label: "Bianco", colorLabel: "Bianco", folder: "bianco" },
  { id: "capuccino", label: "Capuccino", colorLabel: "Capuccino", folder: "capuccino" },
  { id: "cocoa", label: "Cocoa", colorLabel: "Cocoa", folder: "cocoa" },
];

const tejaPlanaVariants: ProductColorVariant[] = [
  {
    id: "natural",
    label: "Natural",
    colorLabel: "Natural",
    folder: "natural",
    pricePerUnit: "$ 60.000",
  },
  {
    id: "chocolate",
    label: "Chocolate",
    colorLabel: "Chocolate",
    folder: "chocolate",
    pricePerUnit: "$ 60.000",
  },
];

const bocadilloPrensadoVariants: ProductColorVariant[] = [
  { id: "adobe", label: "Adobe", colorLabel: "Adobe", folder: "adobe", pricePerUnit: "$ 2.400" },
  { id: "arena", label: "Arena", colorLabel: "Arena", folder: "arena", pricePerUnit: "$ 2.300" },
  { id: "natural", label: "Natural", colorLabel: "Natural", folder: "natural", pricePerUnit: "$ 2.350" },
  { id: "cocoa", label: "Cocoa", colorLabel: "Cocoa", folder: "cocoa", pricePerUnit: "$ 2.700" },
];

const granFormatoPrensadoVariants: ProductColorVariant[] = [
  { id: "adobe", label: "Adobe", colorLabel: "Adobe", folder: "adobe", pricePerUnit: "$ 3.600" },
  { id: "arena", label: "Arena", colorLabel: "Arena", folder: "arena", pricePerUnit: "$ 3.850" },
  { id: "natural", label: "Natural", colorLabel: "Natural", folder: "natural", pricePerUnit: "$ 3.100" },
  { id: "cocoa", label: "Cocoa", colorLabel: "Cocoa", folder: "cocoa", pricePerUnit: "$ 4.250" },
];

const granFormatoVariants: ProductColorVariant[] = [
  { id: "cobrizo", label: "Cobrizo", colorLabel: "Cobrizo", folder: "cobrizo" },
  { id: "cocoa", label: "Cocoa", colorLabel: "Cocoa", folder: "cocoa" },
  { id: "duna", label: "Duna", colorLabel: "Duna", folder: "duna" },
  { id: "terracota", label: "Terracota", colorLabel: "Terracota", folder: "terracota" },
  { id: "tierra", label: "Tierra", colorLabel: "Tierra", folder: "tierra" },
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
export const enchapeThinBrickAssets = buildManifest(
  "enchape-thinbrick",
  "Enchape Thin Brick",
  enchapeThinBrickVariants
);
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

export const granFormatoPrensadoAssets = buildManifest(
  "gran-formato-prensado",
  "Gran Formato Prensado",
  granFormatoPrensadoVariants
);

export const granFormatoAssets = buildManifest(
  "gran-formato",
  "Gran Formato",
  granFormatoVariants
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
  "enchape-thinbrick": enchapeThinBrickAssets,
  "teja-plana": tejaPlanaAssets,
  "teja-colonial": tejaColonialAssets,
  "bocadillo-prensado": bocadilloPrensadoAssets,
  "gran-formato-prensado": granFormatoPrensadoAssets,
  "gran-formato": granFormatoAssets,
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
    "enchape-thinbrick": 1,
    "teja-plana": 1.05,
    "teja-colonial": 1.05,
  };
  return scales[slug] ?? 1;
}
