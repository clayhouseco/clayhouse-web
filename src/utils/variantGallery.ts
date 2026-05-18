import fs from "node:fs";
import path from "node:path";
import type { GalleryImage } from "@/components/ProductGallery.astro";
import { assetUrl, productFolderImage } from "@/utils/paths";

const IMAGE_EXT = /\.(jpe?g|png|webp)$/i;
const SKIP = new Set([".ds_store", ".gitkeep"]);
const SKIP_DIRS = new Set(["web", "proyectos", "_shared"]);

/** Archivos generados por IA o legado procesado — no mostrar en galería */
const SKIP_FILES =
  /^(fachada|unitario|romano solo|dimensiones)\.(jpg|jpeg|png|webp)$/i;

/** En la raíz de products/{slug}/ — mismas en todos los colores */
const ROOT_SHARED_PATTERN = /^romano (dimensiones|ficha)/i;

function labelForFilename(filename: string): string {
  const n = filename.toLowerCase();
  if (/romano dimensiones|dimensiones/.test(n)) return "Dimensiones";
  if (/romano ficha|ficha/.test(n)) return "Ficha técnica";
  if (/\bunitario\b/.test(n) || /\bromano solo\b/.test(n)) return "Pieza unitaria";
  if (/fachada/.test(n)) return "En obra";
  if (/render/.test(n)) return "Otras ideas";
  if (/^romano |natural|matizado|oscuro/.test(n) && !/casa|living|ecommerce|edificio/.test(n))
    return "Producto";
  if (/casa|living|ecommerce|edificio|ch-/.test(n)) return "Proyecto";
  return "Detalle";
}

function sortKey(filename: string): number {
  const n = filename.toLowerCase();
  if (/render|^romano |natural|matizado/.test(n) && !/dimensiones|ficha|casa|living/.test(n))
    return 0;
  if (/\bunitario\b|\bromano solo\b/.test(n)) return 1;
  if (/dimensiones/.test(n)) return 2;
  if (/ficha/.test(n)) return 3;
  if (/fachada/.test(n)) return 4;
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

  const variantAbs = path.join(productRoot, variantFolder);
  const variantDir = pickImageDir(variantAbs);
  if (variantDir) {
    for (const file of listImages(variantDir)) {
      pushImage(images, seen, slug, variantFolder, file, productName, colorLabel);
    }
  }

  for (const file of fs.existsSync(productRoot) ? fs.readdirSync(productRoot) : []) {
    if (!IMAGE_EXT.test(file) || !ROOT_SHARED_PATTERN.test(file)) continue;
    pushImage(images, seen, slug, "", file, productName, colorLabel);
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

/** Carrusel: foto de producto → dimensiones → ficha; resto en inspiración */
export function splitRomanoGallery(images: GalleryImage[]): SplitVariantGallery {
  const file = (img: GalleryImage) => filenameFromSrc(img.src);

  const product = images.find((img) => {
    const f = file(img);
    return (
      /^romano /i.test(f) &&
      !/dimensiones|ficha|render/i.test(f) &&
      IMAGE_EXT.test(f)
    );
  });

  const dimensiones = images.find((img) => /romano dimensiones/i.test(file(img)));
  const ficha = images.find((img) => /romano ficha/i.test(file(img)));

  const hero = [product, dimensiones, ficha].filter(Boolean) as GalleryImage[];
  const heroSrcs = new Set(hero.map((img) => img.src));

  return {
    hero,
    inspiration: images.filter((img) => !heroSrcs.has(img.src)),
  };
}

export function getSplitVariantGalleryMap(
  slug: string,
  variants: { id: string; folder: string; colorLabel: string }[],
  productName: string
): Record<string, SplitVariantGallery> {
  const full = getVariantGalleryMap(slug, variants, productName);
  const map: Record<string, SplitVariantGallery> = {};
  for (const [id, images] of Object.entries(full)) {
    const split = slug === "romano" ? splitRomanoGallery(images) : { hero: images, inspiration: [] };
    map[id] = { hero: split.hero, inspiration: [] };
  }
  return map;
}

export interface InspirationCard {
  title: string;
  category: "Proyecto" | "Otras ideas";
  images: GalleryImage[];
}

function isRomanoProductPhoto(filename: string): boolean {
  const n = filename.toLowerCase();
  if (/^render \d+\.png$/i.test(filename)) return false;
  if (/romano dimensiones|romano ficha/i.test(n)) return true;
  if (/^romano /i.test(n)) return true;
  if (/^romano matizado|^romano oscuro|^romano natural/i.test(n)) return true;
  return false;
}

function isRenderFile(filename: string): boolean {
  return /^render \d+\.png$/i.test(filename);
}

/** Nombre de proyecto sin sufijo _1, _2, (2), etc. */
function projectBaseName(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/_\d+$/, "")
    .replace(/\s+\d+$/, "")
    .replace(/\s+\(\d+\)$/, "")
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeProjectKey(name: string): string {
  return name.toLowerCase().replace(/\s+/g, " ");
}

/** Inspiración única: todos los colores, sin fotos de producto; renders al final */
export function buildRomanoInspirationGallery(
  slug: string,
  variants: { folder: string }[],
  productName: string
): InspirationCard[] {
  const productRoot = path.join(process.cwd(), "public/images/products", slug);
  const projectMap = new Map<string, InspirationCard>();
  const renderImages: GalleryImage[] = [];
  const seenFiles = new Set<string>();

  const addFile = (folder: string, file: string) => {
    const fileKey = `${folder}/${file}`;
    if (seenFiles.has(fileKey)) return;
    seenFiles.add(fileKey);

    if (isRomanoProductPhoto(file)) return;

    const absPath = path.join(productRoot, folder, file);
    if (!fs.existsSync(absPath)) return;

    const relPath = productFolderImage(slug, `${folder}/${file}`);
    const img: GalleryImage = {
      src: assetUrl(relPath),
      alt: `${productName} — ${file.replace(/\.[^.]+$/, "")}`,
      label: isRenderFile(file) ? "Otras ideas" : "Proyecto",
    };

    if (isRenderFile(file)) {
      renderImages.push(img);
      return;
    }

    const base = projectBaseName(file);
    const key = normalizeProjectKey(base);
    const existing = projectMap.get(key);
    if (existing) {
      existing.images.push(img);
    } else {
      projectMap.set(key, {
        title: base,
        category: "Proyecto",
        images: [img],
      });
    }
  };

  for (const v of variants) {
    const variantAbs = path.join(productRoot, v.folder);
    if (!fs.existsSync(variantAbs)) continue;
    for (const file of listImages(variantAbs)) {
      addFile(v.folder, file);
    }
  }

  const projects = [...projectMap.values()].sort((a, b) =>
    a.title.localeCompare(b.title, "es")
  );

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
