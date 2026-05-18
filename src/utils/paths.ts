/** Codifica rutas con espacios; evita doble codificación (%2520) */
export function assetUrl(path: string): string {
  if (!path || path.startsWith("http://") || path.startsWith("https://")) return path;

  return path
    .split("/")
    .map((segment, i) => {
      if (i === 0 || segment === "") return segment;
      try {
        return encodeURIComponent(decodeURIComponent(segment));
      } catch {
        return encodeURIComponent(segment);
      }
    })
    .join("/");
}

export function productAiImage(slug: string, type: "dimensiones" | "fachada"): string {
  return `/images/products/${slug}/${type}.jpg`;
}

/** Imagen en carpeta del producto (ej. producto.jpg, detalle-1.jpg) */
export function productFolderImage(slug: string, filename: string): string {
  return `/images/products/${slug}/${filename}`;
}

export function fichaPdf(filename: string): string {
  return assetUrl(`/Fichas Tecnicas/${filename}`);
}

export function downloadUrl(filename: string): string {
  return assetUrl(`/downloads/${filename}`);
}

/** Fotos retocadas en public/images/Editadas/{carpeta}/{archivo} */
export function editadaUrl(folder: string, file: string): string {
  return assetUrl(`/images/Editadas/${folder}/${file}`);
}
