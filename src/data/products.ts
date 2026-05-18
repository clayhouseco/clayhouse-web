import { fichaPdf, productAiImage } from "@/utils/paths";
import { romanoAssets } from "@/data/productVariants";

export type ProductCategory =
  | "Fachada"
  | "Macizo"
  | "Enchape"
  | "Piso"
  | "Techo"
  | "Rayado";

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

const editada = (folder: string, file: string) => `/images/Editadas/${folder}/${file}`;

export const products: Product[] = [
  {
    name: "Ladrillo Toscano",
    slug: "toscano",
    category: "Fachada",
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
    color: "Claro / oscuro",
    texture: "Rústico toscano",
    featured: true,
    seoTitle: "Ladrillo Toscano | Clay House Amagá",
    seoDescription:
      "Ladrillo Toscano Claro para fachada e interiores. Estilo cálido y contemporáneo. Clay House, Amagá.",
    image: editada("Romano Liso", "DSC_6514.jpg"),
    gallery: [
      editada("Romano Liso", "DSC_6501.jpg"),
      editada("romano curvo", "DSC_9287.jpg"),
    ],
    imageDimensiones: productAiImage("toscano", "dimensiones"),
    imageFachada: productAiImage("toscano", "fachada"),
    dimensions: { largo: "24 cm", ancho: "5.5 cm", alto: "11 cm", rendimiento: "Ver ficha técnica" },
    technicalPdf: fichaPdf("Toscano.pdf"),
  },
  {
    name: "Ladrillo Napolitano",
    slug: "napolitano",
    category: "Fachada",
    shortDescription:
      "Proporción alargada y ritmo vertical para fachadas con presencia elegante y acabado artesanal.",
    description:
      "El Ladrillo Napolitano aporta verticalidad y refinamiento a los cerramientos a la vista. Su formato alargado crea un ritmo ordenado en el aparejo, con tonalidades rojizas y matizadas que enriquecen la fachada sin perder sobriedad.\n\nEs una referencia versátil para vivienda de autor, locales comerciales y proyectos que combinan tradición ladrillera con lenguaje arquitectónico actual. Funciona especialmente bien en muros de gran altura y en composiciones donde la luz resalta la textura del barro cocido.",
    applications: [
      "Fachadas de vivienda y comercio",
      "Muros perimetrales a la vista",
      "Remodelaciones con lenguaje clásico-contemporáneo",
    ],
    color: "Rojizo / matizado",
    texture: "Napolitano",
    featured: true,
    seoTitle: "Ladrillo Napolitano | Clay House",
    seoDescription: "Ladrillo Napolitano para fachada. Clay House, Amagá.",
    image: editada("Liso vertical 15", "DSC_5715.jpg"),
    gallery: [editada("Liso vertical 15", "DSC_5692.jpg")],
    imageDimensiones: productAiImage("napolitano", "dimensiones"),
    imageFachada: productAiImage("napolitano", "fachada"),
    technicalPdf: fichaPdf("Napolitano.pdf"),
  },
  {
    name: "Ladrillo Romano",
    slug: "romano",
    category: "Fachada",
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
    image: "/images/products/romano/matizado/render 1.png",
    pricePerUnit: "Consultar",
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
    category: "Fachada",
    shortDescription:
      "Tonos claros, oscuros y matizados para fachadas con identidad, contraste y calidez regional.",
    description:
      "El Ladrillo Cartagena ofrece una paleta amplia para composiciones monocromáticas o contrastadas. Su acabado permite proyectos con carácter costero-contemporáneo o fachadas sobrias con puntos de luz y sombra bien definidos.\n\nFunciona en vivienda, restaurantes y espacios comerciales que buscan personalidad sin renunciar a la durabilidad del barro cocido. Ideal para destacar volúmenes, ingresos y franjas decorativas en muro a la vista.",
    applications: [
      "Fachadas residenciales",
      "Locales comerciales y restaurantes",
      "Proyectos con identidad regional-contemporánea",
    ],
    color: "Claro / oscuro / matizado",
    texture: "Cartagena",
    featured: false,
    seoTitle: "Ladrillo Cartagena | Clay House",
    seoDescription: "Ladrillo Cartagena para fachadas. Clay House.",
    image: editada("Catalán vertical rojo", "DSC_5831.jpg"),
    gallery: [editada("Catalán vertical pálido", "DSC_6472.jpg")],
    imageDimensiones: productAiImage("cartagena", "dimensiones"),
    imageFachada: productAiImage("cartagena", "fachada"),
    technicalPdf: fichaPdf("Cartagena.pdf"),
  },
  {
    name: "Macizo Campesino",
    slug: "macizo-campesino",
    category: "Macizo",
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
    color: "Terracota natural",
    texture: "Macizo liso",
    featured: true,
    seoTitle: "Macizo Campesino | Clay House",
    seoDescription: "Ladrillo macizo campesino. Amagá, Antioquia.",
    image: editada("Macizo 6x12x24", "DSC_9310.jpg"),
    gallery: [editada("Macizo 6x12x24", "DSC_9294.jpg")],
    imageDimensiones: productAiImage("macizo-campesino", "dimensiones"),
    imageFachada: productAiImage("macizo-campesino", "fachada"),
    technicalPdf: fichaPdf("Macizo Campesino.pdf"),
  },
  {
    name: "Macizo Brix",
    slug: "macizo-brix",
    category: "Macizo",
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
    image: editada("Macizo 5x10x20", "DSC_9315.jpg"),
    imageDimensiones: productAiImage("macizo-brix", "dimensiones"),
    imageFachada: productAiImage("macizo-brix", "fachada"),
    technicalPdf: fichaPdf("Macizo Brix.pdf"),
  },
  {
    name: "Ladrillo Rayado Vertical",
    slug: "rayados-verticales",
    category: "Rayado",
    shortDescription:
      "Textura vertical que acentúa la altura del muro y el juego de luz en fachada.",
    description:
      "El Ladrillo Rayado Vertical introduce ritmo y profundidad en el plano del muro. Los surcos verticales captan la luz a lo largo del día, aportando dinamismo a fachadas residenciales y comerciales.\n\nExcelente para portones, ingresos principales y muros que buscan identidad sin recurrir a color adicional. Una pieza expresiva para arquitectura contemporánea en Antioquia y el Eje Cafetero.",
    applications: [
      "Fachadas principales de vivienda",
      "Muros de acceso y portones",
      "Locales comerciales con fachada texturizada",
    ],
    color: "Rojizo Amagá",
    texture: "Rayado vertical",
    featured: false,
    seoTitle: "Ladrillo Rayado Vertical | Clay House",
    seoDescription: "Ladrillo rayado vertical para fachada.",
    image: editada("Rayado vertical 12", "DSC_5608.jpg"),
    gallery: [editada("Rayado vertical 12", "DSC_5625.jpg")],
    imageDimensiones: productAiImage("rayados-verticales", "dimensiones"),
    imageFachada: productAiImage("rayados-verticales", "fachada"),
    technicalPdf: fichaPdf("Rayados Verticales.pdf"),
  },
  {
    name: "Ladrillo Rayado Horizontal",
    slug: "rayados-horizontales",
    category: "Rayado",
    shortDescription:
      "Rayado horizontal que ensancha visualmente la fachada y enfatiza el aparejo.",
    description:
      "El Ladrillo Rayado Horizontal suaviza la escala del muro y enfatiza su longitud. Ideal para fachadas extensas, restaurantes y vivienda urbana donde se busca calidez material con lectura horizontal clara.\n\nCombina bien con otras referencias Clay House en bandas o franjas. Su textura aporta interés táctil y visual sin competir con vanos amplios ni carpintería minimalista.",
    applications: [
      "Fachadas horizontales y muros largos",
      "Vivienda urbana y campestre",
      "Restaurantes y espacios gastronómicos",
    ],
    color: "Rojizo",
    texture: "Rayado horizontal",
    featured: false,
    seoTitle: "Ladrillo Rayado Horizontal | Clay House",
    seoDescription: "Ladrillo rayado horizontal. Clay House.",
    image: editada("Rayado horizontal 12", "DSC_6535.jpg"),
    gallery: [editada("Rayado horizontal 12", "DSC_6538.jpg")],
    imageDimensiones: productAiImage("rayados-horizontales", "dimensiones"),
    imageFachada: productAiImage("rayados-horizontales", "fachada"),
    technicalPdf: fichaPdf("Rayados Horizontales.pdf"),
  },
  {
    name: "Enchape Rústico",
    slug: "enchape-rustico",
    category: "Enchape",
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
    image: editada("Bocadillo liso rojo", "DSC_6589.jpg"),
    imageDimensiones: productAiImage("enchape-rustico", "dimensiones"),
    imageFachada: productAiImage("enchape-rustico", "fachada"),
    technicalPdf: fichaPdf("Enchape Rustico.pdf"),
  },
  {
    name: "Enchape Romano",
    slug: "enchape-romano",
    category: "Enchape",
    shortDescription:
      "Perfil romano en formato delgado para detalles con profundidad y acabado premium.",
    description:
      "El Enchape Romano aporta sombra y ritmo en columnas, rodapiés y muros de acento. Su perfil alargado crea un relieve sutil que eleva la percepción de calidad en interiores y exteriores.\n\nIndicado para baños, cocinas, chimeneas y zonas comerciales con diseño cuidado. Un revestimiento que dialoga con la línea de fachada Romano y Toscano en proyectos integrales.",
    applications: [
      "Columnas, chimeneas y detalles",
      "Baños y cocinas (según especificación)",
      "Muros de acento en comercio y vivienda",
    ],
    color: "Semimatizado",
    texture: "Romano",
    featured: false,
    seoTitle: "Enchape Romano | Clay House",
    seoDescription: "Enchape romano Clay House.",
    image: editada("Enchape romano 6x27,5", "DSC_9510.jpg"),
    gallery: [editada("Enchape romano 6x27,5", "DSC_9507.jpg")],
    imageDimensiones: productAiImage("enchape-romano", "dimensiones"),
    imageFachada: productAiImage("enchape-romano", "fachada"),
    technicalPdf: fichaPdf("Enchape Romano.pdf"),
  },
  {
    name: "Piso 30×30",
    slug: "piso-30x30",
    category: "Piso",
    shortDescription:
      "Piso de barro 30×30 cm con acabado artesanal para espacios cálidos y luminosos.",
    description:
      "El Piso 30×30 de barro cocido aporta calidez y continuidad visual a interiores y exteriores cubiertos. Sus tonos tabaco y natural crean ambientes acogedores, con la nobleza del material tierra bajo los pies.\n\nIdeal para salones, comedores, patios cubiertos y hotelería con identidad regional. Consulte asesoría de instalación para zonas húmedas y exteriores según su proyecto.",
    applications: [
      "Salones y comedores",
      "Patios cubiertos y galerías",
      "Locales comerciales y hotelería",
      "Zonas húmedas con tratamiento adecuado",
    ],
    color: "Tabaco / natural",
    texture: "Rústico",
    featured: false,
    seoTitle: "Piso de barro 30x30 | Clay House",
    seoDescription: "Piso 30x30 de barro cocido. Amagá.",
    image: editada("piso artesanal 30x30", "DSC_9524.jpg"),
    gallery: [editada("piso 20x30", "DSC_9530.jpg")],
    imageDimensiones: productAiImage("piso-30x30", "dimensiones"),
    imageFachada: productAiImage("piso-30x30", "fachada"),
    dimensions: { largo: "30 cm", ancho: "30 cm", alto: "2.5 cm", rendimiento: "Ver ficha técnica" },
    technicalPdf: fichaPdf("Piso 30x30.pdf"),
  },
  {
    name: "Teja Plana",
    slug: "teja-plana",
    category: "Techo",
    shortDescription:
      "Teja plana de barro para cubiertas visibles con estética tradicional y contemporánea.",
    description:
      "La Teja Plana define cubiertas con carácter y presencia material. En tonos chocolate y rojizo, aporta calidez a vivienda campestre, pérgolas y proyectos turísticos que valoran la tradición del barro.\n\nRecomendada para techos visibles desde el jardín o la calle. Requiere pendiente y detalle de instalación según el diseño del arquitecto; nuestro equipo puede orientar la especificación.",
    applications: [
      "Cubiertas visibles en vivienda campestre",
      "Pérgolas y cubiertas de terraza",
      "Proyectos patrimoniales y turísticos",
    ],
    color: "Chocolate / rojizo",
    texture: "Plana",
    featured: false,
    seoTitle: "Teja Plana | Clay House Amagá",
    seoDescription: "Teja plana de barro cocido.",
    image: editada("Teja plana lisa", "DSC_9351.jpg"),
    gallery: [editada("Teja plana lisa", "DSC_9356.jpg")],
    imageDimensiones: productAiImage("teja-plana", "dimensiones"),
    imageFachada: productAiImage("teja-plana", "fachada"),
    technicalPdf: fichaPdf("Teja Plana.pdf"),
  },
];

export function getProduct(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((p) => p.featured);
}

export const productCategories: ProductCategory[] = [
  "Fachada",
  "Macizo",
  "Rayado",
  "Enchape",
  "Piso",
  "Techo",
];
