export interface BrandEntry {
  id: string;
  name: string;
  /** Ruta en /public (ej. /images/clientes/starbucks.svg); sin logo → wordmark */
  logo?: string;
  /** Para proyectos: foto representativa de la obra (sobreescribe logo si está) */
  image?: string;
  /** Link opcional al producto/categoría asociado (para proyectos) */
  href?: string;
}

/** Marcas y clientes comerciales.
 *  Agrega/cambia el logo soltando un archivo en /public/images/clientes/
 *  con nombre = id de la entrada (kebab-case). Ver el README en esa carpeta. */
export const brandClients: BrandEntry[] = [
  { id: "gutierrez-group", name: "Gutiérrez Group" },
  { id: "oblicuo", name: "Oblicuo" },
  { id: "homecenter", name: "Homecenter" },
  { id: "titan", name: "Titán" },
  { id: "5-solidos", name: "5 Sólidos" },
  { id: "torrealta", name: "Torrealta" },
  { id: "pergamino", name: "Pergamino" },
  { id: "mundo-verde", name: "Mundo Verde" },
  { id: "velez", name: "Vélez" },
  { id: "lenos-y-carbon", name: "Leños y Carbón" },
  { id: "starbucks", name: "Starbucks" },
  { id: "dos-santos", name: "Dos Santos" },
  { id: "area", name: "Ar_ea" },
  { id: "base-taller", name: "Base Taller" },
  { id: "conexo", name: "Conexo" },
  { id: "inge-sas", name: "Inge SAS" },
];

