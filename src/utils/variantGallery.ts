import fs from "node:fs";
import path from "node:path";
import type { GalleryImage } from "@/components/ProductGallery.astro";
import { assetUrl, productFolderImage } from "@/utils/paths";

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;
const SKIP = new Set([".ds_store", ".gitkeep"]);
const SKIP_DIRS = new Set(["web", "_shared", "proyectos"]);
const PROJECTS_DIR = "proyectos";

/** Archivos generados por IA o legado — no mostrar en galería */
const SKIP_FILES =
  /^(fachada|unitario|romano solo)\.(jpg|jpeg|png|webp)$/i;

interface ProductGalleryConfig {
  heroProductByVariant: Record<string, string>;
  sharedRootPattern: RegExp;
  dimensionesPattern: RegExp;
  fichaPattern?: RegExp;
  /** Patrones de dimensiones/ficha por id de variante (cuando hay varios formatos) */
  dimensionesByVariant?: Record<string, RegExp>;
  fichaByVariant?: Record<string, RegExp>;
  productFilePattern: RegExp;
}

const GALLERY_CONFIG: Record<string, ProductGalleryConfig> = {
  romano: {
    heroProductByVariant: {
      "matizado claro": "Romano Matizado.webp",
      "matizado-oscuro": "Romano Matizado Oscuro.webp",
      natural: "Romano Natural.webp",
    },
    sharedRootPattern: /^romano (dimensiones|ficha)/i,
    dimensionesPattern: /romano dimensiones/i,
    fichaPattern: /romano ficha/i,
    productFilePattern: /^romano /i,
  },
  toscano: {
    heroProductByVariant: {
      natural: "toscano natural.webp",
      "matizado claro": "toscano matizado claro.webp",
      "matizado oscuro": "toscano matizado oscuro.webp",
    },
    sharedRootPattern: /^(toscano |isometrico toscano)/i,
    dimensionesPattern: /isometrico toscano|toscano dimensiones/i,
    fichaPattern: /toscano ficha/i,
    productFilePattern: /^toscano /i,
  },
  napolitano: {
    heroProductByVariant: {
      matizado: "Napolitano Oscuro.webp",
      natural: "Napolitano Claro.webp",
    },
    sharedRootPattern: /^napolitano (dimensiones|ficha)/i,
    dimensionesPattern: /napolitano dimensiones/i,
    fichaPattern: /napolitano ficha/i,
    productFilePattern: /^napolitano/i,
  },
  cartagena: {
    heroProductByVariant: {
      natural: "Cartagena Claro.webp",
      "matizado claro": "Cartagena Matizado.webp",
      "matizado oscuro": "Cartagena Oscuro.webp",
    },
    sharedRootPattern: /^cartagena (dimensiones|ficha)/i,
    dimensionesPattern: /cartagena dimensiones/i,
    fichaPattern: /cartagena ficha/i,
    productFilePattern: /^cartagena /i,
  },
  "macizo-campesino": {
    heroProductByVariant: {
      "matizado claro": "Campesino Claro.webp",
      "matizado oscuro": "Campesino Oscuro.webp",
    },
    sharedRootPattern: /^macizo campesino (dimensiones|ficha)/i,
    dimensionesPattern: /macizo campesino dimensiones/i,
    fichaPattern: /macizo campesino ficha/i,
    productFilePattern: /^campesino/i,
  },
  "macizo-brix": {
    heroProductByVariant: {
      pieza: "DSC_9310.jpg",
    },
    sharedRootPattern: /^macizo \d/i,
    dimensionesPattern: /macizo 5x10x20 dimensiones/i,
    fichaPattern: /macizo 5x10x20 ficha/i,
    dimensionesByVariant: {
      "5x10x20": /macizo 5x10x20 dimensiones/i,
      "6x12x24": /macizo 6x12x24 dimensiones/i,
    },
    fichaByVariant: {
      "5x10x20": /macizo 5x10x20 ficha/i,
      "6x12x24": /macizo 6x12x24 ficha/i,
    },
    productFilePattern: /^DSC_9310|^Macizo /i,
  },
  "rayados-verticales": {
    heroProductByVariant: {
      "rayado 10-vertical": "rayado 10 vertical apilados.webp",
      "rayado 12-vertical": "rayado 12 vertical apilado.webp",
      "rayado 15-vertical": "rayado 15 vertical apilados.webp",
    },
    sharedRootPattern: /^$/,
    dimensionesPattern: /dimensiones/i,
    fichaPattern: /ficha/i,
    productFilePattern: /apilad|vertical imagen/i,
  },
  "rayados-horizontales": {
    heroProductByVariant: {
      "rayado 10-horizontal": "rayado 10 imagen.webp",
      "rayado 12-horizontal": "rayado 12 horizontal apilados.webp",
      "rayado 15-horizontal": "rayado 15 horizontal apilados.webp",
    },
    sharedRootPattern: /^$/,
    dimensionesPattern: /dimensiones/i,
    fichaPattern: /ficha/i,
    productFilePattern: /apilad|imagen/i,
  },
  "enchape-rustico": {
    heroProductByVariant: {
      producto: "enchape-rustico-producto.jpg",
    },
    sharedRootPattern: /^(dimensiones|fachada)\.(jpe?g|png|webp)$/i,
    dimensionesPattern: /^dimensiones\./i,
    productFilePattern: /producto/i,
  },
  "enchape-romano": {
    heroProductByVariant: {
      natural: "Enchape Natural.webp",
      matizado: "Chapa Matizada Clara.webp",
      "matizado oscuro": "Enchape Matizado Oscuro.webp",
    },
    sharedRootPattern: /^enchape romano (dimensiones|ficha)/i,
    dimensionesPattern: /enchape romano dimensiones/i,
    fichaPattern: /enchape romano ficha/i,
    productFilePattern: /^chapa |^enchape |^enchapematizado/i,
  },
  "piso-30x30": {
    heroProductByVariant: {
      ".": "DSC_9524.jpg",
    },
    sharedRootPattern: /^piso 30x30 /i,
    dimensionesPattern: /piso 30x30 dimensiones/i,
    fichaPattern: /piso 30x30 ficha/i,
    productFilePattern: /^DSC_95/i,
  },
  "piso-10x30": {
    heroProductByVariant: {
      ".": "piso 10x30.jpg",
    },
    sharedRootPattern: /^piso 10x30 /i,
    dimensionesPattern: /piso 10x30 dimensiones/i,
    fichaPattern: /piso 10x30 ficha/i,
    productFilePattern: /^piso 10x30\.jpg|^DSC_95/i,
  },
  "teja-plana": {
    heroProductByVariant: {
      chocolate: "Teja Plana Chocolate Lisa.webp",
      natural: "Teja Plana Natural.webp",
    },
    sharedRootPattern: /^$/,
    dimensionesPattern: /teja plana(?: \S+)? dimensiones/i,
    fichaPattern: /teja plana(?: \S+)? ficha/i,
    productFilePattern: /^teja plana (natural|chocolate)/i,
  },
  "bocadillo-prensado": {
    heroProductByVariant: {
      adobe: "bocadillo-prensado-adobe.webp",
      arena: "bocadillo-prensado-arena.webp",
      rojo: "bocadillo-prensado-rojo.webp",
      cocoa: "bocadillo-prensado-cocoa.webp",
    },
    sharedRootPattern: /^$/,
    dimensionesPattern: /bocadillo prensado dimensiones/i,
    productFilePattern: /^bocadillo-prensado/i,
  },
  "gran-formato-prensado": {
    heroProductByVariant: {
      adobe: "gran-formato-prensado-adobe.webp",
      arena: "gran-formato-prensado-arena.webp",
      rojo: "gran-formato-prensado-rojo.webp",
      cocoa: "gran-formato-prensado-cocoa.webp",
    },
    sharedRootPattern: /^$/,
    dimensionesPattern: /-dimensiones\.webp/i,
    productFilePattern: /^gran-formato-prensado/i,
  },
  "teja-colonial": {
    heroProductByVariant: {
      roja: "teja colonial natural.webp",
    },
    sharedRootPattern: /^teja colonial (dimensiones|ficha)/i,
    dimensionesPattern: /teja colonial dimensiones/i,
    fichaPattern: /teja colonial ficha/i,
    productFilePattern: /^teja colonial natural/i,
  },
};

function labelForFilename(filename: string): string {
  const n = filename.toLowerCase();
  if (/dimensiones/.test(n)) return "Dimensiones";
  if (/ficha/.test(n)) return "Ficha técnica";
  if (/\bunitario\b/.test(n)) return "Pieza unitaria";
  if (/fachada/.test(n)) return "En obra";
  if (/render/.test(n)) return "Otras ideas";
  if (/^romano |^toscano |^napolitano|^cartagena |^campesino|^teja |^chapa |enchapematizado|rayado \d|natural|matizado|arena|oscuro|claro|roj|tabaco|chocolate|brix|apilad|imagen\.(?:png|webp)/i.test(n) && !/casa|living|dsc_|gemini|dos santos|starbucks|milano|referencias|cubiertas/i.test(n))
    return "Producto";
  if (/casa|living|ecommerce|edificio|ch-|dos santos|starbucks|milano|referencias|cubiertas|dsc_/.test(n))
    return "Proyecto";
  return "Detalle";
}

function sortKey(filename: string): number {
  const n = filename.toLowerCase();
  if (/render|^romano |^toscano |^cartagena |^campesino|rayado \d|arena|oscuro|natural|matizado|claro|tabaco|chocolate|apilad|imagen\.(?:png|webp)|^DSC_93|^DSC_95|^teja /i.test(n) && !/dimensiones|ficha|casa|living|dsc_|gemini|dos santos|starbucks|referencias|cubiertas/i.test(n))
    return 0;
  if (/dimensiones/.test(n)) return 2;
  if (/ficha/.test(n)) return 3;
  return 5;
}

function listImages(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(
      (f) =>
        IMAGE_EXT.test(f) &&
        !SKIP.has(f.toLowerCase()) &&
        !SKIP_FILES.test(f)
    )
    .sort((a, b) => sortKey(a) - sortKey(b) || a.localeCompare(b));
}

function pickImageDir(abs: string): string | null {
  if (!fs.existsSync(abs)) return null;
  if (listImages(abs).length > 0) return abs;
  return null;
}

function pushImage(
  images: GalleryImage[],
  seen: Set<string>,
  slug: string,
  relDir: string,
  file: string,
  productName: string,
  colorLabel: string
) {
  const key = `${relDir}/${file}`;
  if (seen.has(key)) return;
  seen.add(key);
  const absPath = relDir
    ? path.join(process.cwd(), "public/images/products", slug, relDir, file)
    : path.join(process.cwd(), "public/images/products", slug, file);
  if (!fs.existsSync(absPath)) return;

  const relPath = relDir ? productFolderImage(slug, `${relDir}/${file}`) : productFolderImage(slug, file);
  images.push({
    src: assetUrl(relPath),
    alt: `${productName} — ${colorLabel} — ${file.replace(/\.[^.]+$/, "")}`,
    label: labelForFilename(file),
  });
}

export function buildVariantGallery(
  slug: string,
  variantFolder: string,
  productName: string,
  colorLabel: string
): GalleryImage[] {
  const images: GalleryImage[] = [];
  const seen = new Set<string>();
  const productRoot = path.join(process.cwd(), "public/images/products", slug);
  const sharedRoot = GALLERY_CONFIG[slug]?.sharedRootPattern;

  const variantAbs = path.join(productRoot, variantFolder);
  const variantDir = pickImageDir(variantAbs);
  if (variantDir) {
    for (const file of listImages(variantDir)) {
      pushImage(images, seen, slug, variantFolder, file, productName, colorLabel);
    }
  }

  if (sharedRoot) {
    for (const file of fs.existsSync(productRoot) ? fs.readdirSync(productRoot) : []) {
      if (!IMAGE_EXT.test(file) || !sharedRoot.test(file)) continue;
      pushImage(images, seen, slug, "", file, productName, colorLabel);
    }
  }

  images.sort((a, b) => {
    const fileA = decodeURIComponent(a.src.split("/").pop() ?? "");
    const fileB = decodeURIComponent(b.src.split("/").pop() ?? "");
    return sortKey(fileA) - sortKey(fileB) || a.src.localeCompare(b.src);
  });

  return images;
}

export function getVariantGalleryMap(
  slug: string,
  variants: { id: string; folder: string; colorLabel: string }[],
  productName: string
): Record<string, GalleryImage[]> {
  const map: Record<string, GalleryImage[]> = {};
  for (const v of variants) {
    map[v.id] = buildVariantGallery(slug, v.folder, productName, v.colorLabel);
  }
  return map;
}

export interface SplitVariantGallery {
  hero: GalleryImage[];
  inspiration: GalleryImage[];
}

function filenameFromSrc(src: string): string {
  return decodeURIComponent(src.split("/").pop() ?? "");
}

/** Hero: foto de color → dimensiones → ficha (si aplica) */
export function splitHeroGallery(
  slug: string,
  images: GalleryImage[],
  variantFolder: string,
  variantId?: string
): SplitVariantGallery {
  const config = GALLERY_CONFIG[slug];
  if (!config) {
    return { hero: images.slice(0, Math.min(3, images.length)), inspiration: [] };
  }

  const file = (img: GalleryImage) => filenameFromSrc(img.src);
  const preferred = config.heroProductByVariant[variantFolder];

  const dimensionesPattern =
    (variantId && config.dimensionesByVariant?.[variantId]) ?? config.dimensionesPattern;
  const fichaPattern =
    (variantId && config.fichaByVariant?.[variantId]) ?? config.fichaPattern;

  const product =
    (preferred && images.find((img) => file(img) === preferred)) ||
    images.find((img) => {
      const f = file(img);
      return (
        config.productFilePattern.test(f) &&
        !dimensionesPattern.test(f) &&
        !(fichaPattern?.test(f) ?? false) &&
        !/render/i.test(f)
      );
    });

  const dimensiones = images.find((img) => dimensionesPattern.test(file(img)));

  const hero = [product, dimensiones].filter(Boolean) as GalleryImage[];
  const heroSrcs = new Set(hero.map((img) => img.src));

  return {
    hero,
    inspiration: images.filter((img) => !heroSrcs.has(img.src)),
  };
}

/** @deprecated use splitHeroGallery */
export function splitRomanoGallery(images: GalleryImage[], variantFolder: string): SplitVariantGallery {
  return splitHeroGallery("romano", images, variantFolder);
}

export function getSplitVariantGalleryMap(
  slug: string,
  variants: { id: string; folder: string; colorLabel: string }[],
  productName: string
): Record<string, SplitVariantGallery> {
  const full = getVariantGalleryMap(slug, variants, productName);
  const map: Record<string, SplitVariantGallery> = {};
  for (const [id, images] of Object.entries(full)) {
    const folder = variants.find((v) => v.id === id)?.folder ?? "";
    const split = GALLERY_CONFIG[slug]
      ? splitHeroGallery(slug, images, folder, id)
      : { hero: images, inspiration: [] };
    map[id] = { hero: split.hero, inspiration: [] };
  }
  return map;
}

export interface InspirationCard {
  title: string;
  category: "Proyecto" | "Otras ideas";
  images: GalleryImage[];
}

function isRenderFile(filename: string): boolean {
  return /^render \d+\.(?:png|webp)$/i.test(filename);
}

/** Títulos especiales: las carpetas en kebab-case se titulan capitalizando
 *  cada palabra, pero eso destroza iniciales (casa-jt → "Casa Jt"). Acá se
 *  fuerza el título exacto para esos casos. */
const PROJECT_TITLES: Record<string, string> = {
  "casa-jt": "Casa JT",
  "casa-zq": "Casa ZQ",
  "casa-hdb": "Casa HDB",
  "edificio-8k": "Edificio 8K",
  "action-sport-padel": "Action Sport Pádel",
  "living-3450": "Living 3450",
  "plaza-mercado-envigado": "Plaza de Mercado Envigado",
};

function projectFolderTitle(dirname: string): string {
  const override = PROJECT_TITLES[dirname.toLowerCase()];
  if (override) return override;
  return dirname
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getProjectsRoot(productRoot: string): string | null {
  if (!fs.existsSync(productRoot)) return null;
  const dir = fs
    .readdirSync(productRoot, { withFileTypes: true })
    .find((d) => d.isDirectory() && d.name.toLowerCase() === PROJECTS_DIR);
  return dir ? path.join(productRoot, dir.name) : null;
}

function listProjectFolders(productRoot: string): string[] {
  const projectsRoot = getProjectsRoot(productRoot);
  if (!projectsRoot) return [];
  return fs
    .readdirSync(projectsRoot, { withFileTypes: true })
    .filter((d) => d.isDirectory() && !d.name.startsWith("."))
    .map((d) => d.name)
    .sort((a, b) => a.localeCompare(b, "es"));
}

/** Inspiración: `proyectos/{carpeta}/` = un proyecto; renders en carpetas de color */
export function buildProjectsInspirationGallery(
  slug: string,
  variants: { folder: string }[],
  productName: string
): InspirationCard[] {
  const productRoot = path.join(process.cwd(), "public/images/products", slug);
  const renderImages: GalleryImage[] = [];
  const seenRenders = new Set<string>();

  const projects: InspirationCard[] = [];

  const projectsRoot = getProjectsRoot(productRoot);

  if (projectsRoot) {
    const projectsDirName = path.basename(projectsRoot);
    for (const projectDir of listProjectFolders(productRoot)) {
      const absDir = path.join(projectsRoot, projectDir);
      const files = listImages(absDir);
      if (files.length === 0) continue;

      const images: GalleryImage[] = files.map((file) => {
        const relPath = productFolderImage(slug, `${projectsDirName}/${projectDir}/${file}`);
        return {
          src: assetUrl(relPath),
          alt: `${productName} — ${projectFolderTitle(projectDir)}`,
          label: "Proyecto",
        };
      });

      projects.push({
        title: projectFolderTitle(projectDir),
        category: "Proyecto",
        images,
      });
    }

    const looseFiles = fs
      .readdirSync(projectsRoot, { withFileTypes: true })
      .filter((d) => d.isFile() && IMAGE_EXT.test(d.name) && !SKIP.has(d.name.toLowerCase()))
      .map((d) => d.name);
    if (looseFiles.length > 0) {
      const images: GalleryImage[] = looseFiles.map((file) => {
        const relPath = productFolderImage(slug, `${projectsDirName}/${file}`);
        return {
          src: assetUrl(relPath),
          alt: `${productName} — ${file.replace(/\.[^.]+$/, "")}`,
          label: /render/i.test(file) ? "Otras ideas" : "Proyecto",
        };
      });
      projects.push({
        title: /render/i.test(looseFiles[0] ?? "") ? "Otras ideas" : "Galería",
        category: /render/i.test(looseFiles[0] ?? "") ? "Otras ideas" : "Proyecto",
        images,
      });
    }
  }

  for (const v of variants) {
    const variantAbs = path.join(productRoot, v.folder);
    if (!fs.existsSync(variantAbs)) continue;
    for (const file of listImages(variantAbs)) {
      if (!isRenderFile(file)) continue;
      const fileKey = `${v.folder}/${file}`;
      if (seenRenders.has(fileKey)) continue;
      seenRenders.add(fileKey);

      const relPath = productFolderImage(slug, `${v.folder}/${file}`);
      renderImages.push({
        src: assetUrl(relPath),
        alt: `${productName} — ${file.replace(/\.[^.]+$/, "")}`,
        label: "Otras ideas",
      });
    }
  }

  const otrasIdeas: InspirationCard[] =
    renderImages.length > 0
      ? [
          {
            title: "Otras ideas",
            category: "Otras ideas",
            images: renderImages.sort((a, b) =>
              filenameFromSrc(a.src).localeCompare(filenameFromSrc(b.src))
            ),
          },
        ]
      : [];

  return [...projects, ...otrasIdeas];
}

/** @deprecated use buildProjectsInspirationGallery */
export const buildRomanoInspirationGallery = buildProjectsInspirationGallery;
