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

/** Proyectos de obra y arquitectura — usan foto en lugar de logo */
export const projectPartners: BrandEntry[] = [
  {
    id: "casa-retiro",
    name: "Casa Retiro",
    image: "/images/products/romano/proyectos/casa-retiro/Casa Retiro matizado_2.jpg",
    href: "/productos/romano",
  },
  {
    id: "plaza-envigado",
    name: "Plaza de Mercado Envigado",
    image: "/images/products/romano/proyectos/plaza-mercado-envigado/DSCF2720.jpg",
    href: "/productos/romano",
  },
  {
    id: "bar-provenza",
    name: "Bar Provenza",
    image:
      "/images/products/enchape-romano/proyectos/bar-provenza/1A872775-D341-430A-9047-790315D81686 2.JPG",
    href: "/productos/enchape-romano",
  },
  {
    id: "boschetto",
    name: "Boschetto",
    image:
      "/images/products/macizo-brix/proyectos/boschetto/DJI_20250512120419_0043_D.JPG",
    href: "/productos/macizo-brix",
  },
  {
    id: "casa-senderos",
    name: "Casa Senderos",
    image:
      "/images/products/romano/proyectos/casa-senderos/Casa Senderos romano oscuro_2.jpg",
    href: "/productos/romano",
  },
  {
    id: "edificio-solar",
    name: "Edificio El Solar",
    image: "/images/products/romano/proyectos/edificio-el-solar/edificio-el-solar-01.jpg",
    href: "/productos/romano",
  },
];
