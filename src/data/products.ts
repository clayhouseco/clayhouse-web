import { assetUrl, fichaPdf, productFolderImage } from "@/utils/paths";
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
      "El Ladrillo Toscano Claro se destaca por su acabado limpio, uniforme y elegante, ideal para proyectos arquitectónicos que buscan un estilo cálido, minimalista y atemporal. Fabricado en arcilla cocida, este producto ofrece una textura suave y tonalidades tierra claras que aportan luminosidad y sofisticación a cualquier espacio.\n\nSu apariencia natural y homogénea lo convierte en una excelente opción para fachadas modernas, interiores decorativos y proyectos residenciales o comerciales con diseño contemporáneo. También disponible en tono oscuro. Comparte perforación interior con el Ladrillo Romano; las dimensiones y la cara vista definen su carácter toscano.",
    applications: [
      "Fachadas modernas residenciales y comerciales",
      "Interiores decorativos y muros de acento",
      "Proyectos minimalistas y contemporáneos",
      "Patios y zonas sociales con diseño atemporal",
    ],
    color: "Arena, Oscuro",
    texture: "Texturizado",
    featured: true,
    seoTitle: "Ladrillo Toscano | Clay House Amagá",
    seoDescription:
      "Ladrillo Toscano para fachada e interiores. Tonos arena y oscuro. Clay House, Amagá.",
    image: productFolderImage("toscano", "arena/Toscano Arena.png"),
    pricePerUnit: "$ 2.250",
    priceUnitLabel: "unidad",
    dimensions: {
      alto: "5 cm",
      ancho: "14 cm",
      largo: "29 cm",
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
    technicalPdf: fichaPdf("Toscano.pdf"),
  },
  {
    name: "Ladrillo Napolitano",
    slug: "napolitano",
    category: "Fachadas",
    shortDescription:
      "Proporción alargada y ritmo vertical para fachadas con presencia elegante y acabado artesanal.",
    description:
      "El Ladrillo Napolitano aporta verticalidad y refinamiento a los cerramientos a la vista. Su formato alargado crea un ritmo ordenado en el aparejo, con tonalidades rojizas y matizadas que enriquecen la fachada sin perder sobriedad.\n\nEs una referencia versátil para vivienda de autor, locales comerciales y proyectos que combinan tradición ladrillera con lenguaje arquitectónico actual. Funciona especialmente bien en muros de gran altura y en composiciones donde la luz resalta la textura del barro cocido.",
    applications: [
      "Fachadas de vivienda y comercio",
      "Muros perimetrales a la vista",
      "Remodelaciones con lenguaje clásico-contemporáneo",
    ],
    color: "Rojo, Matizado claro, Matizado oscuro",
    texture: "Texturizado",
    featured: true,
    seoTitle: "Ladrillo Napolitano | Clay House",
    seoDescription: "Ladrillo Napolitano para fachada. Clay House, Amagá.",
    image: productFolderImage("napolitano", "rojo/Napolitano Roj.jpg"),
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
    technicalPdf: fichaPdf("Napolitano.pdf"),
  },
  {
    name: "Ladrillo Romano",
    slug: "romano",
    category: "Fachadas",
    shortDescription:
      "Perfil romano con volumen y juego de sombras. Referencia clásica para fachadas con carácter.",
    description:
      "El ladrillo Romano combina carácter artesanal y diseño contemporáneo para crear espacios con personalidad y calidez. Su formato estilizado aporta ritmo visual y textura a los proyectos arquitectónicos, permitiendo composiciones elegantes tanto en interiores como en exteriores. Disponible en tonalidades Matizado, Matizado Oscuro y Natural, ofrece versatilidad para adaptarse a diferentes estilos, desde ambientes cálidos y orgánicos hasta propuestas más sobrias y sofisticadas.",
    applications: [
      "Fachadas patrimoniales y contemporáneas",
      "Muros a la vista en vivienda campestre",
      "Cerramientos y muros de acento",
    ],
    color: "Matizado, Matizado oscuro, Natural",
    texture: "Liso y corcho",
    featured: true,
    seoTitle: "Ladrillo Romano | Clay House Amagá",
    seoDescription: "Ladrillo Romano de fachada. Amagá, Colombia.",
    image: productFolderImage("romano", "matizado/Romano Matizado Claro.jpg"),
    pricePerUnit: "$ 2.450",
    priceUnitLabel: "unidad",
    dimensions: {
      largo: "30 cm",
      ancho: "15 cm",
      alto: "6 cm",
      pesoAprox: "2,6 kg",
      rendimiento: "60 und/m²",
    },
    specs: [
      { label: "Norma", value: "NTC 4205-2 / 4205-3" },
      { label: "Tipo de uso", value: "Fachada" },
      { label: "Tolerancia dimensional", value: "± 2%" },
      { label: "Absorción de agua", value: "Promedio 13% · Individual 17%" },
      { label: "Resistencia a la compresión", value: "Promedio 14 MPa · Individual 10 MPa" },
    ],
    technicalPdf: fichaPdf("Romano.pdf"),
  },
  {
    name: "Ladrillo Cartagena",
    slug: "cartagena",
    category: "Fachadas",
    shortDescription:
      "Tonos claro, matizado y oscuro para fachadas con identidad, contraste y calidez regional.",
    description:
      "El Ladrillo Cartagena ofrece una paleta amplia para composiciones monocromáticas o contrastadas. Su acabado texturizado y perforación vertical permiten proyectos con carácter costero-contemporáneo o fachadas sobrias con puntos de luz y sombra bien definidos.\n\nFabricado en arcilla cocida natural, combina resistencia, durabilidad y variaciones artesanales propias del barro. Funciona en vivienda, restaurantes y espacios comerciales que buscan personalidad sin renunciar al cumplimiento NTC 4205.",
    applications: [
      "Fachadas residenciales y comerciales",
      "Muros estructurales interiores con revoque",
      "Divisiones internas y obra residencial",
    ],
    color: "Claro, Matizado, Oscuro",
    texture: "Texturizado",
    featured: true,
    seoTitle: "Ladrillo Cartagena | Clay House Amagá",
    seoDescription:
      "Ladrillo Cartagena para fachada. Tonos claro, matizado y oscuro. Clay House, Amagá.",
    image: productFolderImage("cartagena", "claro/Cartagena Claro.png"),
    pricePerUnit: "$ 2.700",
    priceUnitLabel: "unidad",
    dimensions: {
      alto: "4,5 cm",
      ancho: "11 cm",
      largo: "30 cm",
      pesoAprox: "1,6 kg",
    },
    specs: [
      { label: "Norma", value: "NTC 4205 / NTC 3829" },
      { label: "Tipo de uso", value: "Fachada y muro" },
      { label: "Tolerancia dimensional", value: "± 4%" },
      { label: "Absorción de agua", value: "Promedio 14% · Individual 17%" },
      { label: "Resistencia a la compresión", value: "Promedio 14 MPa · Individual 10 MPa" },
    ],
    technicalPdf: fichaPdf("Cartagena.pdf"),
  },
  {
    name: "Macizo Campesino",
    slug: "macizo-campesino",
    category: "Fachadas",
    shortDescription:
      "Macizo con carácter artesanal para muros estructurales y acabados con textura auténtica de barro.",
    description:
      "El Macizo Campesino combina resistencia estructural con una estética honesta y terracota. Su superficie lisa y tonos naturales lo hacen apto para obra tradicional y para proyectos que quieren mostrar el material sin artificios.\n\nRecomendado en cercas, muros de contención visibles, vivienda campestre y fachadas donde el macizo es protagonista. Un ladrillo versátil para quien busca solidez y calidez en el mismo material.",
    applications: [
      "Muros estructurales y de carga",
      "Cercas y muros perimetrales",
      "Construcción tradicional y campestre",
      "Fachadas con acabado macizo",
    ],
    color: "Claro, Matizado, Oscuro, Natural",
    texture: "Macizo liso",
    featured: true,
    seoTitle: "Macizo Campesino | Clay House",
    seoDescription: "Ladrillo macizo campesino. Amagá, Antioquia.",
    image: productFolderImage("macizo-campesino", "claro/Campesino Claro.png"),
    pricePerUnit: "$ 1.650",
    priceUnitLabel: "unidad",
    dimensions: {
      alto: "6 cm",
      ancho: "12 cm",
      largo: "24 cm",
    },
    specs: [
      { label: "Norma", value: "NTC 4205" },
      { label: "Tipo de uso", value: "Estructural y fachada" },
    ],
    technicalPdf: fichaPdf("Macizo Campesino.pdf"),
  },
  {
    name: "Macizo Brix",
    slug: "macizo-brix",
    category: "Fachadas",
    shortDescription:
      "Formato macizo optimizado para obra moderna con buen rendimiento y acabado uniforme.",
    description:
      "El Macizo Brix está pensado para proyectos que exigen precisión dimensional y eficiencia en obra. Su apariencia rojiza uniforme permite muros estructurales con acabado limpio y predecible.\n\nAdecuado para vivienda urbana, ampliaciones y edificaciones bajo especificación técnica. Una solución confiable cuando el diseño requiere estructura y estética coherente en todo el muro.",
    applications: [
      "Muros estructurales en vivienda y edificios",
      "Ampliaciones y obra nueva",
      "Proyectos con especificación NTC 4205",
    ],
    color: "Rojizo",
    texture: "Macizo",
    featured: false,
    seoTitle: "Macizo Brix | Clay House",
    seoDescription: "Ladrillo macizo Brix. Clay House Amagá.",
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
    technicalPdf: fichaPdf("Macizo Brix.pdf"),
  },
  {
    name: "Ladrillo Rayado Vertical",
    slug: "rayados-verticales",
    category: "Divisorios",
    shortDescription:
      "Textura vertical para muros divisorios y cerramientos con ritmo y juego de luz.",
    description:
      "El Ladrillo Rayado Vertical introduce ritmo y profundidad en el plano del muro. Los surcos verticales captan la luz a lo largo del día, aportando dinamismo a divisiones interiores, cerramientos y fachadas de acento.\n\nExcelente para muros divisorios, ingresos y cerramientos que buscan identidad sin recurrir a color adicional. Una pieza expresiva para arquitectura contemporánea en Antioquia y el Eje Cafetero.",
    applications: [
      "Muros divisorios interiores y exteriores",
      "Cerramientos y muros de acceso",
      "Locales comerciales con textura vertical",
    ],
    color: "Rojizo Amagá",
    texture: "Rayado vertical",
    featured: false,
    seoTitle: "Ladrillo Rayado Vertical | Clay House",
    seoDescription: "Ladrillo rayado vertical para fachada.",
    image: productFolderImage(
      "rayados-verticales",
      "rayado 12-vertical/rayado 12 vertical apilado.png"
    ),
    pricePerUnit: "$ 2.360",
    priceUnitLabel: "unidad",
    dimensions: {
      ancho: "10 / 12 / 15 cm",
      espesor: "Según formato",
    },
    specs: [
      { label: "Norma", value: "NTC 4205" },
      { label: "Tipo de uso", value: "Divisorios y cerramientos" },
    ],
    technicalPdf: fichaPdf("Rayados Verticales.pdf"),
  },
  {
    name: "Ladrillo Rayado Horizontal",
    slug: "rayados-horizontales",
    category: "Divisorios",
    shortDescription:
      "Rayado horizontal para divisiones y muros largos con lectura material cálida.",
    description:
      "El Ladrillo Rayado Horizontal suaviza la escala del muro y enfatiza su longitud. Ideal para muros divisorios extensos, restaurantes y vivienda donde se busca calidez material con lectura horizontal clara.\n\nCombina bien con otras referencias Clay House en bandas o franjas. Su textura aporta interés táctil y visual sin competir con vanos amplios ni carpintería minimalista.",
    applications: [
      "Muros divisorios y cerramientos largos",
      "Vivienda urbana y campestre",
      "Restaurantes y espacios gastronómicos",
    ],
    color: "Rojizo",
    texture: "Rayado horizontal",
    featured: false,
    seoTitle: "Ladrillo Rayado Horizontal | Clay House",
    seoDescription: "Ladrillo rayado horizontal. Clay House.",
    image: productFolderImage(
      "rayados-horizontales",
      "rayado 12-horizontal/rayado 12 horizontal apilados.png"
    ),
    pricePerUnit: "$ 1.790",
    priceUnitLabel: "unidad",
    dimensions: {
      ancho: "10 / 12 / 15 cm",
      espesor: "Según formato",
    },
    specs: [
      { label: "Norma", value: "NTC 4205" },
      { label: "Tipo de uso", value: "Divisorios y cerramientos" },
    ],
    technicalPdf: fichaPdf("Rayados Horizontales.pdf"),
  },
  {
    name: "Enchape Rústico",
    slug: "enchape-rustico",
    category: "Enchapes",
    shortDescription:
      "Revestimiento de barro con acabado rústico para transformar muros interiores y exteriores.",
    description:
      "El Enchape Rústico añade calidez y textura a superficies que necesitan carácter. Su formato delgado permite revestir muros existentes o diseñar planos nuevos con apariencia artesanal y tonos tierra naturales.\n\nMuy usado en salas, restaurantes, hoteles y fachadas de acento. Una solución decorativa versátil para proyectos residenciales y comerciales con atmósfera acogedora.",
    applications: [
      "Salas, comedores y zonas sociales",
      "Fachadas de acento y muros de entrada",
      "Restaurantes, hoteles y comercio",
    ],
    color: "Natural / matizado",
    texture: "Rústico",
    featured: false,
    seoTitle: "Enchape Rústico | Clay House",
    seoDescription: "Enchape rústico de barro cocido.",
    image: productFolderImage("enchape-rustico", "producto/enchape-rustico-producto.jpg"),
    pricePerUnit: "$ 85.000",
    priceUnitLabel: "m²",
    specs: [
      { label: "Norma", value: "NTC 4205" },
      { label: "Tipo de uso", value: "Revestimiento interior y exterior" },
    ],
    technicalPdf: fichaPdf("Enchape Rustico.pdf"),
  },
  {
    name: "Enchape Romano",
    slug: "enchape-romano",
    category: "Enchapes",
    shortDescription:
      "Perfil romano en formato delgado para detalles con profundidad y acabado premium.",
    description:
      "El Enchape Romano aporta sombra y ritmo en columnas, rodapiés y muros de acento. Su perfil alargado crea un relieve sutil que eleva la percepción de calidad en interiores y exteriores.\n\nIndicado para baños, cocinas, chimeneas y zonas comerciales con diseño cuidado. Un revestimiento que dialoga con la línea de fachada Romano y Toscano en proyectos integrales.",
    applications: [
      "Columnas, chimeneas y detalles",
      "Baños y cocinas (según especificación)",
      "Muros de acento en comercio y vivienda",
    ],
    color: "Natural, Matizado, Oscuro",
    texture: "Romano",
    featured: false,
    seoTitle: "Enchape Romano | Clay House",
    seoDescription: "Enchape romano Clay House.",
    image: productFolderImage("enchape-romano", "natural/Chapa Natural.jpg"),
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
    technicalPdf: fichaPdf("Enchape Romano.pdf"),
  },
  {
    name: "Piso 30×30",
    slug: "piso-30x30",
    category: "Pisos",
    shortDescription:
      "Piso de barro 30×30 cm con acabado artesanal para espacios cálidos y luminosos.",
    description:
      "El Piso 30×30 de barro cocido aporta calidez y continuidad visual a interiores y exteriores cubiertos. Tono natural con la nobleza del material tierra bajo los pies.\n\nIdeal para salones, comedores, patios cubiertos y hotelería con identidad regional. Consulte asesoría de instalación para zonas húmedas y exteriores según su proyecto.",
    applications: [
      "Salones y comedores",
      "Patios cubiertos y galerías",
      "Locales comerciales y hotelería",
      "Zonas húmedas con tratamiento adecuado",
    ],
    color: "Natural",
    texture: "Rústico",
    featured: false,
    seoTitle: "Piso de barro 30x30 | Clay House",
    seoDescription: "Piso 30x30 de barro cocido. Amagá.",
    image: productFolderImage("piso-30x30", "DSC_9516.jpg"),
    pricePerUnit: "$ 88.500",
    priceUnitLabel: "m²",
    dimensions: {
      alto: "2,5 cm",
      ancho: "30 cm",
      largo: "30 cm",
      rendimiento: "Ver ficha técnica",
    },
    specs: [
      { label: "Norma", value: "NTC 4205" },
      { label: "Tipo de uso", value: "Piso interior y exterior cubierto" },
    ],
    technicalPdf: fichaPdf("Piso 30x30.pdf"),
  },
  {
    name: "Piso 10×30",
    slug: "piso-10x30",
    category: "Pisos",
    shortDescription:
      "Piso de barro en formato alargado 10×30 cm para recorridos lineales y detalle artesanal.",
    description:
      "El Piso 10×30 de barro cocido aporta ritmo longitudinal a interiores y exteriores cubiertos. Su formato estrecho permite composiciones en espiga, franjas o continuidad visual en pasillos, galerías y zonas sociales.\n\nIdeal para proyectos que buscan calidez material con una lectura distinta al cuadrado 30×30. Consulte asesoría de instalación según pendientes, juntas y zonas húmedas.",
    applications: [
      "Pasillos, galerías y circulaciones",
      "Patios cubiertos y terrazas",
      "Locales comerciales y hotelería",
    ],
    color: "Tabaco, Natural",
    texture: "Rústico",
    featured: false,
    seoTitle: "Piso de barro 10x30 | Clay House",
    seoDescription: "Piso 10x30 de barro cocido. Clay House, Amagá.",
    image: productFolderImage("piso-10x30", "DSC_9574.jpg"),
    pricePerUnit: "$ 80.000",
    priceUnitLabel: "m²",
    dimensions: {
      alto: "2,5 cm",
      ancho: "10 cm",
      largo: "30 cm",
      rendimiento: "Ver ficha técnica",
    },
    specs: [
      { label: "Norma", value: "NTC 4205" },
      { label: "Tipo de uso", value: "Piso interior y exterior cubierto" },
    ],
    technicalPdf: assetUrl("/Fichas Tecnicas/Viejos/Fichas Técnicas Piso 10-30.pdf"),
  },
  {
    name: "Teja Plana",
    slug: "teja-plana",
    category: "Techos",
    shortDescription:
      "Teja plana de barro para cubiertas visibles con estética tradicional y contemporánea.",
    description:
      "La Teja Plana define cubiertas con carácter y presencia material. Tono chocolate que aporta calidez a vivienda campestre, pérgolas y proyectos turísticos que valoran la tradición del barro.\n\nRecomendada para techos visibles desde el jardín o la calle. Requiere pendiente y detalle de instalación según el diseño del arquitecto; nuestro equipo puede orientar la especificación.",
    applications: [
      "Cubiertas visibles en vivienda campestre",
      "Pérgolas y cubiertas de terraza",
      "Proyectos patrimoniales y turísticos",
    ],
    color: "Chocolate",
    texture: "Plana",
    featured: false,
    seoTitle: "Teja Plana | Clay House Amagá",
    seoDescription: "Teja plana de barro cocido.",
    image: productFolderImage("teja-plana", "teja plana ppal.png"),
    pricePerUnit: "$ 60.000",
    priceUnitLabel: "m²",
    specs: [
      { label: "Norma", value: "NTC 4205" },
      { label: "Tipo de uso", value: "Cubierta visible" },
    ],
    technicalPdf: fichaPdf("Teja Plana.pdf"),
  },
  {
    name: "Teja Colonial",
    slug: "teja-colonial",
    category: "Techos",
    shortDescription:
      "Teja colonial de barro para cubiertas tradicionales con perfil clásico y presencia.",
    description:
      "La Teja Colonial define cubiertas con carácter patrimonial y calidez del barro cocido. Su perfil curvo aporta volumen y sombra en vivienda campestre, casas de campo y proyectos que valoran la tradición constructiva antioqueña.\n\nRequiere pendiente y detalle de instalación según el diseño del arquitecto.",
    applications: [
      "Cubiertas visibles en vivienda campestre",
      "Proyectos patrimoniales y turísticos",
      "Ampliaciones con lenguaje tradicional",
    ],
    color: "Roja",
    texture: "Colonial",
    featured: false,
    seoTitle: "Teja Colonial | Clay House Amagá",
    seoDescription: "Teja colonial de barro cocido. Clay House, Amagá.",
    image: productFolderImage("teja-colonial", "roja/DSC_9435.jpg"),
    pricePerUnit: "$ 1.600",
    priceUnitLabel: "unidad",
    specs: [
      { label: "Norma", value: "NTC 4205" },
      { label: "Tipo de uso", value: "Cubierta visible" },
    ],
    technicalPdf: assetUrl("/Fichas Tecnicas/Viejos/Fichas Técnicas Teja.pdf"),
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

