export interface BrandEntry {
  id: string;
  name: string;
  /** Ruta en /public (ej. /images/clientes/starbucks.svg); sin logo → wordmark */
  logo?: string;
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
];

/** Proyectos de obra y arquitectura */
export const projectPartners: BrandEntry[] = [
  { id: "casa-retiro", name: "Casa Retiro" },
  { id: "plaza-envigado", name: "Plaza de Mercado Envigado" },
  { id: "bar-provenza", name: "Bar Provenza" },
  { id: "boschetto", name: "Boschetto" },
  { id: "casa-senderos", name: "Casa Senderos" },
  { id: "edificio-solar", name: "Edificio El Solar" },
];
