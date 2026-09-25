import type { GalleryImage } from "@/components/ProductGallery.astro";
import {
  buildProjectsInspirationGallery,
  getSplitVariantGalleryMap,
  type InspirationCard,
  type SplitVariantGallery,
} from "@/utils/variantGallery";
import { assetUrl, downloadUrl } from "@/utils/paths";
import { variantesDeErp, idDeColor, codigoDeVariante } from "@/data/erpVariants";

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
  /**
   * EL CÓDIGO DE ESE COLOR EN EL ERP (NAT, MC, MO, ARE, TOPO…).
   *
   * Solo hace falta cuando la web y el ERP le dicen distinto al mismo color: acá el enchape se
   * vende como «Matizado» y en el ERP es «Matizado Claro». Sin esta llave el cruce por nombre
   * no los reconoce como el mismo y aparece un botón repetido; y no se puede resolver
   * comparando el principio del texto, porque «Matizado» también es el principio de «Matizado
   * Oscuro», que sí es otro color.
   *
   * Cuando los dos nombres coinciden —que es lo normal— no hace falta ponerlo.
   */
  erpColor?: string;
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

/**
 * EL ERP DECIDE QUÉ COLORES HAY Y CUÁNTO VALEN; LA WEB PONE LAS FOTOS.
 *
 * Gerencia: «nada que salen las variantes de colores de los productos nuevos». Los botones de
 * color eran esta lista escrita a mano, y el feed del ERP solo rellenaba fotos y precio DE LO
 * QUE YA ESTUVIERA ACÁ. Un color creado en el ERP no aparecía hasta que alguien viniera a
 * escribirlo otra vez en este archivo.
 *
 * SE AÑADE, NO SE BORRA. Un color que el ERP publica y acá no está, se agrega solo. Un color
 * escrito acá que el ERP no publica SE QUEDA: puede que no coincida el nombre por una tilde o
 * una mayúscula, y hacer desaparecer un color que lleva meses en línea —con sus fotos, su URL
 * y su posición en Google— por una diferencia de texto es un daño mucho peor que mostrar uno
 * de más. `npm run verificar-erp` es el que señala esas diferencias para revisarlas a mano.
 *
 * EL PRECIO SÍ LO PISA EL ERP SIEMPRE. El de este archivo estaba escrito a mano y se quedaba
 * viejo sin que nada lo delatara: subir un precio en el ERP no cambiaba la página.
 */
function buildManifest(
  slug: string,
  productName: string,
  variants: ProductColorVariant[],
  options?: { variantSelectorLabel?: string }
): ProductAssetManifest {
  const fusionadas = fusionarConErp(slug, variants);
  return {
    slug,
    variants: fusionadas,
    galleriesByVariant: conFotosDelErp(
      getSplitVariantGalleryMap(slug, fusionadas, productName),
      fusionadas,
      productName,
    ),
    inspirationGallery: buildProjectsInspirationGallery(slug, fusionadas, productName),
    extraDownloads: [manualFachadas],
    variantSelectorLabel: options?.variantSelectorLabel,
  };
}

/** ¿Este botón escrito a mano y este color del ERP son el mismo? Se comparan sin tildes ni
 *  mayúsculas contra las tres formas en que puede estar escrito acá. */
const mismaVariante = (v: ProductColorVariant, e: { id: string; erpColor?: string }) => {
  /* El código manda cuando está: es la llave que no cambia aunque cambie el nombre comercial. */
  const cod = codigoDeVariante(v);
  if (cod && e.erpColor) return cod === e.erpColor.toUpperCase();
  return idDeColor(v.id) === e.id || idDeColor(v.colorLabel) === e.id || idDeColor(v.label) === e.id;
};

function fusionarConErp(slug: string, manuales: ProductColorVariant[]): ProductColorVariant[] {
  const delErp = variantesDeErp(slug);
  if (!delErp || !delErp.length) return manuales;   // el ERP no opina de esta página

  const out: ProductColorVariant[] = manuales.map((v) => {
    const e = delErp.find((x) => mismaVariante(v, x));
    /* El precio del ERP manda; lo demás —carpeta de fotos, cómo se llama el botón, la medida
       de un formato— se respeta, que es lo que este archivo sabe y el ERP no. */
    return e?.pricePerUnit ? { ...v, pricePerUnit: e.pricePerUnit } : v;
  });

  for (const e of delErp) {
    if (out.some((v) => mismaVariante(v, e))) continue;
    out.push(e);   // color nuevo del ERP: entra con sus fotos y su precio
  }
  return out;
}

/**
 * La galería de un color que la web todavía no ha fotografiado.
 *
 * Las fotos de `public/images/products/` están tomadas con el protocolo de marca, recortadas y
 * nombradas para que la galería sepa cuál es la pieza y cuál el plano de dimensiones; una foto
 * de WhatsApp subida al ERP no las reemplaza. Pero un color nuevo no tiene carpeta el primer
 * día, y entre la foto del ERP y un recuadro vacío, la del ERP.
 */
function conFotosDelErp(
  galerias: Record<string, SplitVariantGallery>,
  variantes: ProductColorVariant[],
  productName: string,
): Record<string, SplitVariantGallery> {
  for (const v of variantes) {
    const fotos = (v as { fotosErp?: string[] }).fotosErp ?? [];
    if (!fotos.length) continue;
    if (galerias[v.id]?.hero.length) continue;   // la web ya tiene las suyas
    galerias[v.id] = {
      hero: fotos.map((src, i) => ({
        src,
        alt: `${productName} — ${v.colorLabel}`,
        label: i === 0 ? v.colorLabel : undefined,
      })),
      inspiration: [],
    };
  }
  return galerias;
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

/** Colores y precios los publica el ERP (SUP-ARE / SUP-TOPO); las fotos por
 *  color se bajaron de su almacenamiento a public/images/products/superterras/. */
const superTerrasVariants: ProductColorVariant[] = [
  { id: "arena", label: "Arena", colorLabel: "Arena", folder: "arena", pricePerUnit: "$ 2.500" },
  { id: "topo", label: "Topo", colorLabel: "Topo", folder: "topo", pricePerUnit: "$ 2.950" },
];

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
    // El id sigue siendo 6x12x24: es la llave del código MAC-624 y del PDF de
    // la ficha. Lo que cambia es la medida que se muestra y se calcula.
    id: "6x12x24",
    label: "6×13×25 cm",
    colorLabel: "6×13×25 cm",
    folder: "pieza",
    pricePerUnit: "$ 2.290",
    dimensions: { largo: "25 cm", alto: "6 cm" },
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
  // El ERP lo llama «Matizado Claro» (MC); acá se vende como «Matizado».
  { id: "matizado", label: "Matizado", colorLabel: "Matizado", folder: "matizado", erpColor: "MC" },
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

const enchapeBocadilloVariants: ProductColorVariant[] = [
  { id: "natural", label: "Natural", colorLabel: "Natural", folder: "natural" },
];

const caladoVariants: ProductColorVariant[] = [
  { id: "10", label: "10 cm", colorLabel: "Espesor 10 cm", folder: "10", pricePerUnit: "$ 3.500" },
  { id: "15", label: "15 cm", colorLabel: "Espesor 15 cm", folder: "15", pricePerUnit: "$ 4.000" },
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

export const superTerrasAssets = buildManifest(
  "superterras",
  "Super Terras 11 Liso",
  superTerrasVariants
);
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
export const enchapeBocadilloAssets = buildManifest(
  "enchape-bocadillo",
  "Enchape Bocadillo",
  enchapeBocadilloVariants
);
export const caladoAssets = buildManifest("calado", "Calado", caladoVariants, {
  variantSelectorLabel: "Espesor",
});
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
  superterras: superTerrasAssets,
  "macizo-campesino": macizoCampesinoAssets,
  "macizo-brix": macizoBrixAssets,
  "rayados-verticales": rayadosVerticalesAssets,
  "rayados-horizontales": rayadosHorizontalesAssets,
  "enchape-rustico": enchapeRusticoAssets,
  "enchape-romano": enchapeRomanoAssets,
  "enchape-thinbrick": enchapeThinBrickAssets,
  "enchape-bocadillo": enchapeBocadilloAssets,
  "calado": caladoAssets,
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
    "enchape-bocadillo": 1,
    "calado": 1,
    "teja-plana": 1.05,
    "teja-colonial": 1.05,
  };
  return scales[slug] ?? 1;
}
