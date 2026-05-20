export interface BrandEntry {
  id: string;
  name: string;
  /** Ruta en /public (ej. /images/clientes/starbucks.svg); sin logo → wordmark */
  logo?: string;
}

/** Marcas y clientes comerciales */
export const brandClients: BrandEntry[] = [
  { id: "starbucks", name: "Starbucks" },
  { id: "dos-santos", name: "Dos Santos" },
  { id: "gress", name: "Gress" },
  { id: "action-sport", name: "Action Sport Club" },
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
