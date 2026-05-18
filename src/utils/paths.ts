/** Codifica rutas con espacios y tildes; tolera doble codificación (%2520) */
export function assetUrl(path: string): string {
  if (!path || path.startsWith("http://") || path.startsWith("https://")) return path;

  let decoded = path;
  try {
    let previous = "";
    while (decoded !== previous) {
      previous = decoded;
      decoded = decodeURI(decoded);
    }
  } catch {
    return encodeURI(path);
  }

  // Carpetas en public/ (macOS) suelen estar en NFD; encodeURI usa NFC por defecto.
  return encodeURI(decoded.normalize("NFD"));
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
