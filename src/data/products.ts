import { fichaPdf, productFolderImage } from "@/utils/paths";
import { isAvailable } from "@/data/availability";
import { romanoAssets } from "@/data/productVariants";

export type { ProductCategory } from "@/data/catalogCategories";
export { productCategories } from "@/data/catalogCategories";
import type { ProductCategory } from "@/data/catalogCategories";

export interface ProductDimensions {
  largo?: string;
  ancho?: string;
  alto?: string;
  espesor?: string;
  pesoAprox?: string;
  rendimiento?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface Product {
  name: string;
  slug: string;
  category: ProductCategory;
  shortDescription: string;
  description: string;
  applications: string[];
  color: string;
  texture: string;
  featured: boolean;
  /** Si true, no aparece en listados (catálogo, destacados, relacionados, formulario, proyectos).
   *  La página /productos/{slug} sigue accesible para no romper enlaces externos. */
  hidden?: boolean;
  seoTitle: string;
  seoDescription: string;
  image: string;
  gallery?: string[];
  imageDimensiones?: string;
  imageFachada?: string;
  dimensions?: ProductDimensions;
  /** Precio mostrado en ficha (ej. "$ 2.450") */
  pricePerUnit?: string;
  priceUnitLabel?: string;
  /** Filas extra de ficha técnica */
  specs?: ProductSpec[];
  technicalPdf: string;
}

export const products: Product[] = [
  {
    name: "Ladrillo Toscano",
    slug: "toscano",
    category: "Fachadas",
    shortDescription:
      "Acabado limpio y elegante en tonos tierra claros. Ideal para fachadas y espacios con estilo cálido, minimalista y atemporal.",
    description:
      "Acabado limpio en diferentes tonos para fachadas cálidas y minimalistas.",
    applications: [
      "Fachadas modernas residenciales y comerciales",
      "Interiores decorativos y muros de acento",
      "Proyectos minimalistas y contemporáneos",
      "Patios y zonas sociales con diseño atemporal",
    ],
    color: "Natural, Matizado claro, Matizado oscuro",
    texture: "Tallada",
    featured: true,
    seoTitle: "Ladrillo Toscano | Clay House Amagá",
    seoDescription:
      "Ladrillo Toscano de arcilla para fachadas e interiores: acabado limpio y elegante en tonos tierra claros, estilo cálido y atemporal. Clay House, Amagá.",
    image: productFolderImage("toscano", "natural/toscano natural.webp"),
    pricePerUnit: "$ 2.250",
    priceUnitLabel: "unidad",
    dimensions: {
      alto: "4,6 cm",
      ancho: "14,5 cm",
      largo: "28,5 cm",
      pesoAprox: "2,1 kg",
      rendimiento: "76 und/m²",
    },
    specs: [
      { label: "Norma", value: "NTC 4205-2 / 4205-3" },
      { label: "Tipo de uso", value: "Fachada" },
      { label: "Tolerancia dimensional", value: "± 2%" },
      { label: "Absorción de agua", value: "Promedio 13% · Individual 17%" },
      { label: "Resistencia a la compresión", value: "Promedio 14 MPa · Individual 10 MPa" },
    ],
    technicalPdf: fichaPdf("toscano"),
  },
  {
    name: "Ladrillo Napolitano",
    slug: "napolitano",
    category: "Fachadas",
    shortDescription:
      "Proporción alargada y ritmo vertical para fachadas con presencia elegante y acabado artesanal.",
    description:
      "Formato alargado con ritmo vertical para fachadas refinadas y de gran altura.",
    applications: [
      "Fachadas de vivienda y comercio",
      "Muros perimetrales a la vista",
      "Remodelaciones con lenguaje clásico-contemporáneo",
    ],
    color: "Matizado, Natural",
    texture: "Texturizado",
    featured: false,
    seoTitle: "Ladrillo Napolitano | Clay House",
    seoDescription:
      "Ladrillo Napolitano de proporción alargada y ritmo vertical para fachadas con presencia elegante y acabado artesanal. Clay House, Amagá, Colombia.",
    image: productFolderImage("napolitano", "matizado/Napolitano Oscuro.webp"),
    pricePerUnit: "$ 2.090",
    priceUnitLabel: "unidad",
    dimensions: {
      alto: "5 cm",
      ancho: "10 cm",
      largo: "20 cm",
      pesoAprox: "1,8 kg",
      rendimiento: "68 und/m²",
    },
    specs: [
      { label: "Norma", value: "NTC 4205-2 / 4205-3" },
      { label: "Tipo de uso", value: "Fachada" },
      { label: "Tolerancia dimensional", value: "± 2%" },
      { label: "Absorción de agua", value: "Promedio 13% · Individual 17%" },
      { label: "Resistencia a la compresión", value: "Promedio 14 MPa · Individual 10 MPa" },
    ],
    technicalPdf: fichaPdf("napolitano"),
  },
  {
    name: "Ladrillo Romano",
    slug: "romano",
    category: "Fachadas",
    shortDescription:
      "Perfil romano con volumen y juego de sombras. Referencia clásica para fachadas con carácter.",
    description:
      "Diseño rústico con texturas versátiles para espacios modernos y clásicos.",
    applications: [
      "Fachadas patrimoniales y contemporáneas",
      "Muros a la vista en vivienda campestre",
      "Cerramientos y muros de acento",
    ],
    color: "Natural, Matizado claro, Matizado oscuro",
    texture: "Corcho",
    featured: true,
    seoTitle: "Ladrillo Romano | Clay House Amagá",
    seoDescription:
      "Ladrillo Romano de fachada con volumen y juego de sombras: la referencia clásica para fachadas con carácter. Fabricado en Amagá por Clay House.",
    image: productFolderImage("romano", "matizado claro/Romano Matizado.webp"),
    pricePerUnit: "$ 2.450",
    priceUnitLabel: "unidad",
    dimensions: {
      largo: "28,3 cm",
      ancho: "14,5 cm",
      alto: "6 cm",
      pesoAprox: "2,9 kg",
      rendimiento: "59 und/m²",
    },
    specs: [
      { label: "Norma", value: "NTC 4205-2 / 4205-3" },
      { label: "Tipo de uso", value: "Fachada" },
      { label: "Tolerancia dimensional", value: "± 2%" },
      { label: "Absorción de agua", value: "Promedio 13% · Individual 17%" },
      { label: "Resistencia a la compresión", value: "Promedio 14 MPa · Individual 10 MPa" },
    ],
    technicalPdf: fichaPdf("romano"),
  },
  {
    name: "Ladrillo Cartagena",
    slug: "cartagena",
    category: "Fachadas",
    shortDescription:
      "Tonos claro, matizado y oscuro para fachadas con identidad, contraste y calidez regional.",
    description:
      "Acabado rústico hecho a mano para fachadas con la textura natural del barro.",
    applications: [
      "Fachadas residenciales y comerciales",
      "Muros estructurales interiores con revoque",
      "Divisiones internas y obra residencial",
    ],
    color: "Natural, Matizado claro, Matizado oscuro",
    texture: "Texturizado",
    featured: true,
    seoTitle: "Ladrillo Cartagena | Clay House Amagá",
    seoDescription:
      "Ladrillo Cartagena para fachada en tonos claro, matizado y oscuro: identidad, contraste y calidez regional. Clay House, Amagá, Antioquia.",
    image: productFolderImage("cartagena", "natural/Cartagena Claro.webp"),
    pricePerUnit: "$ 2.700",
    priceUnitLabel: "unidad",
    dimensions: {
      alto: "4,5 cm",
      ancho: "11 cm",
      largo: "30 cm",
      pesoAprox: "1,6 kg",
    },
    specs: [
      { label: "Norma", value: "NTC 4205" },
      { label: "Tipo de uso", value: "Fachada y muro" },
      { label: "Tolerancia dimensional", value: "± 4%" },
      { label: "Absorción de agua", value: "Promedio 14% · Individual 17%" },
      { label: "Resistencia a la compresión", value: "Promedio 14 MPa · Individual 10 MPa" },
    ],
    technicalPdf: fichaPdf("cartagena"),
  },
  {
    name: "Macizo Campesino",
    slug: "macizo-campesino",
    category: "Fachadas",
    shortDescription:
      "Macizo con carácter artesanal para muros estructurales y acabados con textura auténtica de barro.",
    description:
      "Solidez y calidez en tono terracota para obra tradicional y muros estructurales a la vista.",
    applications: [
      "Muros estructurales y de carga",
      "Cercas y muros perimetrales",
      "Construcción tradicional y campestre",
      "Fachadas con acabado macizo",
    ],
    color: "Matizado claro, Matizado oscuro",
    texture: "Macizo liso",
    featured: true,
    seoTitle: "Macizo Campesino | Clay House",
    seoDescription:
      "Ladrillo macizo campesino con carácter artesanal para muros estructurales y acabados con textura auténtica de barro. Clay House, Amagá.",
    image: productFolderImage("macizo-campesino", "matizado claro/Campesino Claro.webp"),
    pricePerUnit: "$ 1.650",
    priceUnitLabel: "unidad",
    dimensions: {
      alto: "6 cm",
      ancho: "10 cm",
      largo: "20 cm",
    },
    specs: [
      { label: "Norma", value: "NTC 4205" },
      { label: "Tipo de uso", value: "Estructural y fachada" },
    ],
    technicalPdf: fichaPdf("macizo-campesino"),
  },
  {
    name: "Macizo",
    slug: "macizo-brix",
    category: "Fachadas",
    shortDescription:
      "Formato macizo optimizado para obra moderna con buen rendimiento y acabado uniforme.",
    description:
      "Precisión dimensional y acabado uniforme para obra moderna con estructura visible.",
    applications: [
      "Muros estructurales en vivienda y edificios",
      "Ampliaciones y obra nueva",
      "Proyectos con especificación NTC 4205",
    ],
    color: "Rojizo",
    texture: "Macizo",
    featured: false,
    seoTitle: "Macizo Brix | Clay House",
    seoDescription:
      "Ladrillo macizo Brix en formato optimizado para obra moderna: buen rendimiento y acabado uniforme. Fabricado en Amagá por Clay House.",
    image: productFolderImage("macizo-brix", "pieza/DSC_9310.jpg"),
    pricePerUnit: "$ 1.500",
    priceUnitLabel: "unidad",
    dimensions: {
      alto: "5 / 6 cm",
      ancho: "10 / 12 cm",
      largo: "20 / 24 cm",
    },
    specs: [
      { label: "Norma", value: "NTC 4205" },
      { label: "Tipo de uso", value: "Estructural" },
    ],
    technicalPdf: productFolderImage("macizo-brix", "fichas/5x10x20.pdf"),
  },
  {
    name: "Bocadillo Prensado",
    slug: "bocadillo-prensado",
    category: "Fachadas",
    shortDescription:
      "Pieza prensada de formato compacto, disponible en adobe, arena, rojo y cocoa. Acabado homogéneo para fachadas con detalle fino.",
    description:
      "Pieza compacta en adobe, arena, rojo o cocoa para composiciones finas en fachadas y divisorios.",
    applications: [
      "Fachadas con detalle fino",
      "Muros divisorios y de acento",
      "Remates y entrecalles",
      "Proyectos con aparejo de formato pequeño",
    ],
    color: "Adobe, Arena, Rojo, Cocoa",
    texture: "Prensado",
    featured: false,
    seoTitle: "Bocadillo Prensado | Clay House Amagá",
    seoDescription:
      "Ladrillo Bocadillo Prensado de formato compacto en arcilla cocida, colores adobe, arena, rojo y cocoa. Acabado homogéneo para fachadas con detalle fino. Clay House, Amagá.",
    image: productFolderImage("bocadillo-prensado", "rojo/bocadillo-prensado-rojo.webp"),
    priceUnitLabel: "unidad",
    dimensions: {
      largo: "24,5 cm",
      ancho: "11,5 cm",
      alto: "6 cm",
      pesoAprox: "2,3 kg",
      rendimiento: "56 und/m²",
    },
    specs: [
      { label: "Norma", value: "NTC 4205 · NSR-10" },
      { label: "Tipo de uso", value: "Fachada" },
      { label: "Tolerancia dimensional", value: "± 2%" },
      { label: "Absorción de agua", value: "Máx. 11% (promedio)" },
      { label: "Resistencia a la compresión", value: "Mínimo 25 MPa (promedio)" },
    ],
    technicalPdf: fichaPdf("bocadillo-prensado"),
  },
  {
    name: "Gran Formato Prensado",
    slug: "gran-formato-prensado",
    category: "Fachadas",
    shortDescription:
      "Pieza prensada de gran formato (39 × 11,5 × 5 cm), en adobe, arena, rojo y cocoa. Cara larga y limpia para fachadas de gran escala.",
    description:
      "Pieza larga de gran formato en adobe, arena, rojo o cocoa. Su cara extendida agiliza el aparejo y da un lenguaje horizontal y contemporáneo a fachadas y muros de acento.",
    applications: [
      "Fachadas de gran escala",
      "Muros de acento y divisorios",
      "Proyectos con lenguaje horizontal",
      "Aparejo de formato grande",
    ],
    color: "Adobe, Arena, Rojo, Cocoa",
    texture: "Prensado",
    featured: false,
    seoTitle: "Gran Formato Prensado | Clay House Amagá",
    seoDescription:
      "Ladrillo Gran Formato Prensado (39 × 11,5 × 5 cm) en arcilla cocida, colores adobe, arena, rojo y cocoa. Cara larga para fachadas de gran escala. Clay House, Amagá.",
    image: productFolderImage("gran-formato-prensado", "rojo/gran-formato-prensado-rojo.webp"),
    priceUnitLabel: "unidad",
    dimensions: {
      largo: "39 cm",
      ancho: "11,5 cm",
      alto: "5 cm",
      pesoAprox: "3,3 kg",
      rendimiento: "41,7 und/m²",
    },
    specs: [
      { label: "Norma", value: "NTC 4205 · NSR-10" },
      { label: "Tipo de uso", value: "Fachada / muro divisorio" },
      { label: "Tolerancia dimensional", value: "± 2%" },
      { label: "Absorción de agua", value: "Máx. 11% (promedio)" },
      { label: "Resistencia a la compresión", value: "Mínimo 25 MPa (promedio)" },
    ],
    technicalPdf: fichaPdf("gran-formato-prensado"),
  },
  {
    name: "Gran Formato",
    slug: "gran-formato",
    category: "Fachadas",
    shortDescription:
      "Ladrillo tolete de gran formato (39 × 11,5 × 5 cm) de textura rugosa, en cinco colores. Fachadas, muros divisorios y estructurales.",
    description:
      "Ladrillo tolete de gran formato y perforación vertical, con cara vista rugosa, en cobrizo, cocoa, duna, terracota y tierra. Alto rendimiento (41,7 und/m²) para fachadas y muros divisorios o estructurales.",
    applications: [
      "Muros de fachada",
      "Muros divisorios",
      "Muros estructurales",
      "Proyectos con lenguaje horizontal",
    ],
    color: "Cobrizo, Cocoa, Duna, Terracota, Tierra",
    texture: "Rugoso",
    featured: false,
    seoTitle: "Gran Formato | Clay House Amagá",
    seoDescription:
      "Ladrillo Gran Formato tolete 39 × 11,5 × 5 cm, textura rugosa, en cobrizo, cocoa, duna, terracota y tierra. Fachadas y muros. Clay House, Amagá.",
    image: productFolderImage("gran-formato", "tierra/gran-formato-tierra-dimensiones.webp"),
    priceUnitLabel: "unidad",
    dimensions: {
      largo: "39 cm",
      ancho: "11,5 cm",
      alto: "5 cm",
      pesoAprox: "2,9 kg",
      rendimiento: "41,7 und/m²",
    },
    specs: [
      { label: "Norma", value: "NTC 4205-1 / 4205-3 · NSR-10" },
      { label: "Tipo de uso", value: "Fachada, divisorio y estructural" },
      { label: "Clasificación", value: "Mampostería PV (perforación vertical)" },
      { label: "Resistencia a la compresión", value: "Promedio 30 MPa · Individual 25 MPa" },
      { label: "Absorción de agua", value: "4–13% (según color)" },
      { label: "Tolerancia dimensional", value: "± 5 / ± 3 / ± 2 mm" },
    ],
    technicalPdf: fichaPdf("gran-formato"),
  },
  {
    name: "Ladrillo Rayado Vertical",
    slug: "rayados-verticales",
    category: "Divisorios",
    shortDescription:
      "Textura vertical para muros divisorios y cerramientos con ritmo y juego de luz.",
    description:
      "Surcos verticales que aportan ritmo y juego de luz a divisiones y cerramientos.",
    applications: [
      "Muros divisorios interiores y exteriores",
      "Cerramientos y muros de acceso",
      "Locales comerciales con textura vertical",
    ],
    color: "Natural",
    texture: "Rayado",
    featured: false,
    seoTitle: "Ladrillo Rayado Vertical | Clay House",
    seoDescription:
      "Ladrillo rayado vertical con textura para muros divisorios y cerramientos con ritmo y juego de luz. Clay House, Amagá, Antioquia.",
    image: productFolderImage(
      "rayados-verticales",
      "rayado 12-vertical/rayado 12 vertical apilado.webp"
    ),
    pricePerUnit: "$ 2.360",
    priceUnitLabel: "unidad",
    dimensions: {
      largo: "40 cm",
      ancho: "10 / 12 / 15 cm",
      alto: "20 cm",
    },
    specs: [
      { label: "Norma", value: "NTC 4205" },
      { label: "Tipo de uso", value: "Divisorios y cerramientos" },
    ],
    technicalPdf: productFolderImage("rayados-verticales", "fichas/10.pdf"),
  },
  {
    name: "Bloquelón",
    slug: "bloquelon",
    category: "Divisorios",
    shortDescription:
      "Bloque hueco de arcilla de gran formato (80 × 23 × 8 cm) para muros divisorios livianos y rápidos. Rinde 5 unidades por m².",
    description:
      "Bloque de arcilla cocida de gran formato para levantar muros divisorios de forma rápida y liviana. Sus celdas huecas aligeran el muro y su tamaño rinde 5 bloquelones por metro cuadrado.",
    applications: [
      "Muros divisorios interiores",
      "Cerramientos y divisiones livianas",
      "Obra residencial y comercial",
      "Construcción rápida de gran formato",
    ],
    color: "Natural",
    texture: "Liso",
    featured: false,
    seoTitle: "Bloquelón | Clay House Amagá",
    seoDescription:
      "Bloquelón de arcilla cocida 80 × 23 × 8 cm para muros divisorios livianos y rápidos. Rinde 5 unidades por m². Clay House, Amagá, Antioquia.",
    image: productFolderImage("bloquelon", "bloquelon-iso.webp"),
    imageDimensiones: productFolderImage("bloquelon", "bloquelon-dimensiones.webp"),
    gallery: [
      productFolderImage("bloquelon", "bloquelon-celdas.webp"),
      productFolderImage("bloquelon", "bloquelon-cara.webp"),
    ],
    pricePerUnit: "$ 4.400",
    priceUnitLabel: "unidad",
    dimensions: {
      largo: "80 cm",
      ancho: "8 cm",
      alto: "23 cm",
      pesoAprox: "10 kg",
      rendimiento: "5 und/m²",
    },
    specs: [
      { label: "Norma", value: "NTC 4205-2 / 4205-3" },
      { label: "Tipo de uso", value: "Muros divisorios (no estructural)" },
      { label: "Resistencia a la compresión", value: "Promedio 20 MPa · Individual 15 MPa" },
      { label: "Absorción de agua", value: "Promedio 17% · Individual 19%" },
      { label: "Tolerancia dimensional", value: "± 2%" },
    ],
    technicalPdf: fichaPdf("bloquelon"),
  },
  {
    name: "Calado",
    slug: "calado",
    category: "Decorativos",
    shortDescription:
      "Celosía de arcilla con patrón cuatrifolio (20 × 20 cm) para muros que ventilan, tamizan la luz y decoran. Disponible en 10 y 15 cm de espesor.",
    description:
      "Bloque calado de arcilla cocida con calado cuatrifolio inspirado en la celosía tradicional. Permite el paso del aire y la luz manteniendo privacidad, ideal para fachadas, divisiones y jardines. Se ensambla pieza a pieza formando patrones continuos.",
    applications: [
      "Muros y fachadas caladas",
      "Divisiones y cerramientos que ventilan",
      "Jardines, terrazas y patios",
      "Detalles decorativos y de acento",
    ],
    color: "Natural",
    texture: "Artesanal",
    featured: false,
    seoTitle: "Calado de arcilla (celosía) | Clay House Amagá",
    seoDescription:
      "Calado de arcilla cocida 20 × 20 cm con patrón cuatrifolio para muros que ventilan y decoran. Espesores de 10 y 15 cm. Clay House, Amagá, Antioquia.",
    image: productFolderImage("calado", "calado-frente.webp"),
    imageDimensiones: productFolderImage("calado", "calado-dimensiones.webp"),
    gallery: [productFolderImage("calado", "calado-muro.webp")],
    priceUnitLabel: "unidad",
    dimensions: {
      rendimiento: "≈ 26 und/m²",
    },
    specs: [
      { label: "Calado 10 cm", value: "Cara 19,5 × 19,5 cm · espesor 9,3 cm · 3,5 kg" },
      { label: "Calado 15 cm", value: "Cara 19,5 × 20 cm · espesor 14 cm · 5,0 kg" },
      { label: "Patrón", value: "Cuatrifolio calado" },
      { label: "Tipo de uso", value: "Celosía divisoria / decorativa (no estructural)" },
      { label: "Acabado", value: "Arcilla natural a la vista" },
    ],
  },
  {
    name: "Ladrillo Rayado Horizontal",
    slug: "rayados-horizontales",
    category: "Divisorios",
    shortDescription:
      "Rayado horizontal para divisiones y muros largos con lectura material cálida.",
    description:
      "Surcos horizontales que enfatizan la longitud del muro con calidez material.",
    applications: [
      "Muros divisorios y cerramientos largos",
      "Vivienda urbana y campestre",
      "Restaurantes y espacios gastronómicos",
    ],
    color: "Natural",
    texture: "Rayado",
    featured: false,
    seoTitle: "Ladrillo Rayado Horizontal | Clay House",
    seoDescription:
      "Ladrillo rayado horizontal para divisiones y muros largos con lectura material cálida. Clay House, Amagá, Antioquia.",
    image: productFolderImage(
      "rayados-horizontales",
      "rayado 12-horizontal/rayado 12 horizontal apilados.webp"
    ),
    pricePerUnit: "$ 1.790",
    priceUnitLabel: "unidad",
    dimensions: {
      largo: "40 cm",
      ancho: "10 / 12 / 15 cm",
      alto: "20 cm",
    },
    specs: [
      { label: "Norma", value: "NTC 4205" },
      { label: "Tipo de uso", value: "Divisorios y cerramientos" },
    ],
    technicalPdf: productFolderImage("rayados-horizontales", "fichas/10.pdf"),
  },
  {
    name: "Enchape Rústico",
    slug: "enchape-rustico",
    category: "Enchapes",
    shortDescription:
      "Revestimiento de ladrillo con acabado rústico para transformar muros interiores y exteriores.",
    description:
      "Revestimiento delgado con acabado artesanal para muros con carácter y calidez.",
    applications: [
      "Salas, comedores y zonas sociales",
      "Fachadas de acento y muros de entrada",
      "Restaurantes, hoteles y comercio",
    ],
    color: "Natural / matizado",
    texture: "Rústico",
    featured: false,
    seoTitle: "Enchape Rústico | Clay House",
    seoDescription:
      "Enchape de ladrillo con acabado rústico para revestir y transformar muros interiores y exteriores. Clay House, Amagá, Antioquia.",
    image: productFolderImage("enchape-rustico", "producto/enchape-rustico-producto.jpg"),
    pricePerUnit: "$ 85.000",
    priceUnitLabel: "m²",
    specs: [
      { label: "Norma", value: "NTC 4205" },
      { label: "Tipo de uso", value: "Revestimiento interior y exterior" },
    ],
    technicalPdf: fichaPdf("enchape-rustico"),
  },
  {
    name: "Enchape Romano",
    slug: "enchape-romano",
    category: "Enchapes",
    shortDescription:
      "Perfil romano en formato delgado para detalles con profundidad y acabado premium.",
    description:
      "Perfil alargado en versión enchape para columnas, rodapiés y muros de acento.",
    applications: [
      "Columnas, chimeneas y detalles",
      "Baños y cocinas (según especificación)",
      "Muros de acento en comercio y vivienda",
    ],
    color: "Natural, Matizado, Matizado oscuro",
    texture: "Romano",
    featured: false,
    seoTitle: "Enchape Romano | Clay House",
    seoDescription:
      "Enchape Romano en formato delgado con perfil romano para revestimientos con profundidad y acabado premium. Clay House, Amagá.",
    image: productFolderImage("enchape-romano", "natural/Enchape Natural.webp"),
    pricePerUnit: "$ 89.500",
    priceUnitLabel: "m²",
    dimensions: {
      alto: "6 cm",
      ancho: "27,5 cm",
      largo: "Según pieza",
    },
    specs: [
      { label: "Norma", value: "NTC 4205" },
      { label: "Tipo de uso", value: "Revestimiento y detalle" },
    ],
    technicalPdf: fichaPdf("enchape-romano"),
  },
  {
    name: "Teja Plana",
    slug: "teja-plana",
    category: "Techos",
    shortDescription:
      "Teja plana de barro para cubiertas visibles con estética tradicional y contemporánea.",
    description:
      "Cubierta plana en chocolate para vivienda campestre y proyectos con tradición del barro.",
    applications: [
      "Cubiertas visibles en vivienda campestre",
      "Pérgolas y cubiertas de terraza",
      "Proyectos patrimoniales y turísticos",
    ],
    color: "Natural, Chocolate",
    texture: "Plana",
    featured: false,
    seoTitle: "Teja Plana | Clay House Amagá",
    seoDescription:
      "Teja plana de barro para cubiertas visibles con estética tradicional y contemporánea. Clay House, Amagá, Antioquia.",
    image: productFolderImage("teja-plana", "natural/Teja Plana Natural.webp"),
    pricePerUnit: "$ 60.000",
    priceUnitLabel: "m²",
    specs: [
      { label: "Norma", value: "NTC 4205" },
      { label: "Tipo de uso", value: "Cubierta visible" },
    ],
    technicalPdf: fichaPdf("teja-plana"),
  },
  {
    name: "Teja Colonial",
    slug: "teja-colonial",
    category: "Techos",
    shortDescription:
      "Teja colonial de barro para cubiertas tradicionales con perfil clásico y presencia.",
    description:
      "Perfil curvo tradicional para cubiertas con carácter patrimonial y calidez del ladrillo.",
    applications: [
      "Cubiertas visibles en vivienda campestre",
      "Proyectos patrimoniales y turísticos",
      "Ampliaciones con lenguaje tradicional",
    ],
    color: "Roja",
    texture: "Colonial",
    featured: false,
    seoTitle: "Teja Colonial | Clay House Amagá",
    seoDescription:
      "Teja colonial de barro para cubiertas tradicionales con perfil clásico y gran presencia. Clay House, Amagá, Antioquia.",
    image: productFolderImage("teja-colonial", "roja/teja colonial natural.webp"),
    pricePerUnit: "$ 1.600",
    priceUnitLabel: "unidad",
    specs: [
      { label: "Norma", value: "NTC 4205" },
      { label: "Tipo de uso", value: "Cubierta visible" },
    ],
    technicalPdf: fichaPdf("teja-colonial"),
  },
];

/** Productos que deben aparecer primero en listados (orden definido por su posición en el array). */
export const priorityProductSlugs: readonly string[] = ["romano"];

/** Ordena una lista de productos colocando primero los slugs prioritarios
 *  (en el orden de priorityProductSlugs), y preservando el orden original para el resto. */
export function sortProductsByPriority(list: Product[]): Product[] {
  const priorityIndex = (slug: string) => {
    const i = priorityProductSlugs.indexOf(slug);
    return i === -1 ? Number.POSITIVE_INFINITY : i;
  };
  return [...list].sort((a, b) => {
    const ia = priorityIndex(a.slug);
    const ib = priorityIndex(b.slug);
    if (ia !== ib) return ia - ib;
    return 0;
  });
}

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

/** Un producto se muestra si no está oculto por código (hidden) y si el
 *  inventario de planta no lo desactivó desde la hoja.
 *  Úsalo en cualquier listado que genere enlaces a /productos/{slug}: esas
 *  páginas solo se construyen para productos visibles, así que enlazar uno
 *  oculto o desactivado produce un 404. */
export function isVisible(p: Product): boolean {
  return !p.hidden && isAvailable(p.slug);
}

/** Productos visibles en listados (excluye hidden:true y los desactivados
 *  desde la hoja de inventario). */
export function getVisibleProducts(): Product[] {
  return products.filter(isVisible);
}

export function getFeaturedProducts(): Product[] {
  return sortProductsByPriority(products.filter((p) => p.featured && isVisible(p)));
}

