/**
 * LO QUE LA FICHA DE PRODUCTO SABE ANTES DE DIBUJARSE.
 *
 * `[slug].astro` tenía 190 líneas de preparación de datos encima de la plantilla: armar la
 * galería, buscar las fichas en PDF y calcularles una versión, decidir qué filas lleva la
 * tabla de especificaciones. Nada de eso dibuja nada, todo depende del disco y de media
 * docena de reglas que solo estaban escritas ahí, en medio de la página más larga del
 * proyecto.
 *
 * Acá las reglas se pueden leer sin leer la plantilla, y se pueden probar sin construir el
 * sitio: cada función recibe el producto y devuelve datos.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import type { GalleryImage } from "@/components/ProductGallery.astro";
import type { Product } from "@/data/products";
import type { ProductAssetManifest, ProductColorVariant } from "@/data/productVariants";
import { getVariantGallery } from "@/data/productVariants";
import { assetUrl } from "@/utils/paths";
import { getErpRendimiento } from "@/utils/productPricing";

/**
 * La ficha en PDF, con una versión pegada según su contenido.
 *
 * Los PDF viven en `/public` con URL fija, así que al reemplazar el archivo el navegador
 * seguía sirviendo el viejo de su caché. El hash del contenido cambia la URL solo cuando el
 * archivo cambia.
 *
 * Devuelve `null` si el archivo no está: una descarga rota es peor que ninguna, y pasa con
 * los productos que el ERP publica sin ficha adjunta.
 */
export function fichaConVersion(pdfUrl: string): string | null {
  const archivo = "public" + decodeURIComponent(pdfUrl.split("?")[0]!);
  try {
    const hash = crypto
      .createHash("md5")
      .update(fs.readFileSync(archivo))
      .digest("hex")
      .slice(0, 8);
    return `${pdfUrl}?v=${hash}`;
  } catch {
    return null;
  }
}

export interface FichaDeVariante {
  id: string;
  label: string;
  url: string;
}

export interface DescargasDeFicha {
  /** Una ficha por dimensión (rayados, macizo-brix). Vacío si el producto tiene una sola. */
  variantes: FichaDeVariante[];
  /** La que abre el botón principal: sigue la dimensión elegida, o la única que haya. */
  principal: string | null;
  /** El mapa que el navegador usa para cambiar de ficha al cambiar de dimensión. */
  mapaJson: string | null;
  hayDescargas: boolean;
}

/**
 * Las fichas técnicas que ofrece la página.
 *
 * Los rayados y el macizo brix tienen una ficha por dimensión, en
 * `public/images/products/<slug>/fichas/<id>.pdf`. Se listan todas y el botón principal
 * sigue la que esté seleccionada; el resto de productos tiene una sola.
 */
export function descargasDeFicha(
  product: Product,
  assets: ProductAssetManifest | undefined
): DescargasDeFicha {
  const principalDelProducto = product.technicalPdf ? fichaConVersion(product.technicalPdf) : null;
  const carpeta = `public/images/products/${product.slug}/fichas`;

  const variantes: FichaDeVariante[] =
    fs.existsSync(carpeta) && assets
      ? assets.variants
          .filter((v) => fs.existsSync(`${carpeta}/${v.id}.pdf`))
          .flatMap((v) => {
            const url = fichaConVersion(`/images/products/${product.slug}/fichas/${v.id}.pdf`);
            return url ? [{ id: v.id, label: v.label, url }] : [];
          })
      : [];

  const principal = variantes[0]?.url ?? principalDelProducto;
  return {
    variantes,
    principal,
    mapaJson: variantes.length
      ? JSON.stringify(
          Object.fromEntries(variantes.map((v) => [v.id, { url: v.url, label: v.label }]))
        )
      : null,
    hayDescargas: Boolean(principal) || (assets?.extraDownloads?.length ?? 0) > 0,
  };
}

/**
 * Las fotos de la galería.
 *
 * Con manifiesto de variantes, la galería la arma `getVariantGallery` a partir de las
 * carpetas. Sin manifiesto —los productos que nacen en el ERP— se arma con lo que el
 * producto tenga: la foto principal, sus detalles, el dibujo de dimensiones y la foto en
 * obra, cada una con su etiqueta, porque la galería las agrupa por eso.
 */
export function galeriaDeProducto(
  product: Product,
  assets: ProductAssetManifest | undefined,
  variantId: string
): GalleryImage[] {
  if (assets) return getVariantGallery(assets, variantId);

  const fotos: GalleryImage[] = [
    { src: assetUrl(product.image), alt: product.name, label: "Producto" },
  ];
  product.gallery?.forEach((ruta, i) => {
    fotos.push({
      src: assetUrl(ruta),
      alt: `${product.name} — detalle ${i + 1}`,
      label: "Detalle",
    });
  });
  if (product.imageDimensiones) {
    fotos.push({
      src: assetUrl(product.imageDimensiones),
      alt: `Dimensiones ${product.name}`,
      label: "Dimensiones",
    });
  }
  if (product.imageFachada) {
    fotos.push({
      src: assetUrl(product.imageFachada),
      alt: `${product.name} en fachada`,
      label: "En obra",
    });
  }
  /* Una foto que el ERP nombra y el repositorio no tiene no se publica: era una diapositiva
     vacía y una miniatura rota en la galería. Las URLs del propio ERP sí se sirven (están
     permitidas en la política de seguridad); las rutas locales tienen que existir. Lo que
     falte aparece en el informe de `npm run verificar:datos` para que alguien lo suba. */
  return fotos.filter(({ src }) => /^https?:/i.test(src) || existeEnPublic(src));
}

function existeEnPublic(ruta: string): boolean {
  return fs.existsSync("public" + decodeURIComponent(ruta.split("?")[0]!));
}

/** Una fila de la tabla de especificaciones. */
export interface FilaDeEspecificacion {
  label: string;
  value: string;
  key?: string;
}

/**
 * Las filas de la tabla de especificaciones, en el orden en que se leen.
 *
 * Dos decisiones que no se ven en la plantilla:
 *
 *  · La textura la manda la variante cuando el producto se vende en varias. Al elegir «Arena
 *    Rústico» la ficha decía «Liso», que es el acabado de otra referencia.
 *  · El rendimiento sale como fila suelta SOLO si no hay tabla calculable. Si la hay, la
 *    sección Rendimiento de más abajo ya muestra los escenarios completos y la fila sobra.
 *    Cuando no hay tabla se publica el dato del producto o, si no tiene, el del ERP: las
 *    tejas dependen de ese último —se traslapan, no se calculan— y sin él la ficha no
 *    explicaba de dónde sale el precio por m².
 */
export function filasDeEspecificacion(
  product: Product,
  variante: ProductColorVariant | undefined,
  opciones: { hayTablaDeRendimiento: boolean }
): FilaDeEspecificacion[] {
  const dimensiones = product.dimensions;
  const rendimiento = dimensiones?.rendimiento ?? getErpRendimiento(product.slug);
  /* La condición es la LÍNEA, no el objeto: el calado tiene `dimensions` con los tres
     campos vacíos —sus formatos se eligen en el cotizador—, y preguntando por el objeto
     salía una fila «Dimensiones» sin nada al lado. */
  const linea = lineaDeDimensiones(product);

  const filas: (FilaDeEspecificacion | null)[] = [
    { label: "Textura", value: variante?.texturaNombre ?? product.texture, key: "textura" },
    { label: "Color", value: product.color },
    linea ? { label: "Dimensiones", value: linea } : null,
    /* En enchapes el espesor es el dato que decide si la pieza cabe en el muro, y no entra
       en la línea de dimensiones (que solo lleva alto × ancho × largo). */
    dimensiones?.espesor ? { label: "Espesor", value: dimensiones.espesor } : null,
    dimensiones?.pesoAprox ? { label: "Peso", value: dimensiones.pesoAprox } : null,
    !opciones.hayTablaDeRendimiento && rendimiento
      ? { label: "Rendimiento", value: rendimiento }
      : null,
    ...(product.specs ?? []),
  ];
  return filas.filter((f): f is FilaDeEspecificacion => Boolean(f));
}

/** «5 × 14 × 29 cm»: de menor a mayor, que es como se dicta una medida en obra. */
export function lineaDeDimensiones(product: Product): string | null {
  const d = product.dimensions;
  if (!d) return null;
  return [d.alto, d.ancho, d.largo].filter(Boolean).join(" × ") || null;
}

/**
 * La imagen de compartir (WhatsApp, redes).
 *
 * La genera `scripts/generate-og.mjs` a 1200×630 en JPEG. Si falta se devuelve `undefined`
 * y la página cae en la genérica del sitio, en vez de publicar una vista previa rota.
 */
export function imagenDeCompartir(slug: string): string | undefined {
  return fs.existsSync(`public/images/og/${slug}.jpg`) ? `/images/og/${slug}.jpg` : undefined;
}
