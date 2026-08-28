export type AboutIconId =
  | "history"
  | "manifesto"
  | "mission"
  | "vision"
  | "territory"
  | "catalog";

export type AboutSection = {
  id: string;
  eyebrow: string;
  title: string;
  icon: AboutIconId;
  paragraphs: string[];
};

export const aboutHeroImage = "/images/nosotros/hero-ladrillo.webp";

export const aboutHero = {
  eyebrow: "Conócenos",
  title: "Sobre nosotros",
  lead:
    "Más de cinco décadas transformando arcilla en soluciones que honran nuestras raíces y se adaptan a las necesidades contemporáneas.",
};

/** Trayectoria oficial (1965 → Clay House) */
export const aboutStory = {
  eyebrow: "Trayectoria",
  title: "Nuestra historia",
  milestones: [
    {
      year: "1965",
      text: "Nuestra trayectoria comienza con la creación de Ladrillera San Fernando: ladrillos macizos, atanores, tejas y pisos hechos a mano, con la esencia de la casa tradicional antioqueña para restaurar fachadas históricas y construir nuevas viviendas.",
    },
    {
      year: "~1995",
      text: "Transformamos nuestra identidad y adoptamos el nombre Alfarera Pueblo Viejo, destacando el carácter rústico y auténtico de nuestros materiales — desde el inicio, nuestra mayor distinción.",
    },
    {
      year: "2022",
      text: "Guiados por los desafíos del mercado y un firme compromiso con la innovación, lanzamos Clay House: tradición del oficio con enfoque moderno, herencia artesanal de la región y visión de futuro.",
    },
  ],
  closing:
    "Con más de cinco décadas de experiencia, seguimos transformando arcilla en soluciones que honran nuestras raíces y se adaptan a las necesidades contemporáneas.",
};

export const aboutManifesto = {
  eyebrow: "Identidad",
  title: "Manifiesto",
  paragraphs: [
    "En Clay House, creemos en el poder de la tierra como base de la creación. Cada pieza que producimos es un testimonio vivo de nuestra historia, un puente entre el pasado y el futuro, y una expresión de las manos que moldean nuestra identidad.",
    "Somos guardianes de una tradición artesanal que honra la arquitectura rústica y auténtica de nuestra región, mientras miramos hacia adelante con innovación y visión. Transformamos la arcilla en algo más que ladrillos o tejas: la convertimos en historias, en sueños, en hogares.",
    "Nos mueve la pasión por la calidad, el compromiso con la sostenibilidad y el deseo de aportar belleza y durabilidad a cada proyecto. Creemos en el valor del trabajo bien hecho, en los materiales que cuentan historias y en la conexión entre lo natural y lo humano.",
  ],
  pillars: [
    "Hacemos más que productos, construimos legados.",
    "Respetamos nuestras raíces, pero caminamos hacia el futuro.",
    "Creamos con la tierra, para que tú crees con nosotros.",
  ],
};

export const aboutMission = {
  eyebrow: "Propósito",
  title: "Nuestra misión",
  text: "Fabricar productos de arcilla de alta calidad que preserven la tradición artesanal y el encanto rústico de la arquitectura regional, mientras innovamos en diseño y procesos sostenibles. Nuestro propósito es ofrecer soluciones únicas que combinen la herencia cultural con las demandas modernas de la construcción, aportando valor a los proyectos de nuestros clientes y fortaleciendo el desarrollo de nuestras comunidades.",
};

export const aboutVision = {
  eyebrow: "Horizonte",
  title: "Nuestra visión",
  text: "Ser reconocidos como líderes en el mercado de productos de arcilla a nivel nacional e internacional, destacándonos por nuestra innovación, sostenibilidad y compromiso con la excelencia. Aspiramos a mantener viva la tradición artesanal, mientras evolucionamos como una marca icónica que inspira la construcción de espacios únicos, duraderos y llenos de historia.",
};

/** Complementos técnicos y territoriales (útiles para especificadores) */
export const aboutExtras: AboutSection[] = [
  {
    id: "territorio",
    eyebrow: "Amagá",
    title: "El barro de un lugar con nombre",
    icon: "territory",
    paragraphs: [
      "Amagá no es solo nuestra fábrica: es nuestra materia prima narrativa. La cuenca del Sinifaná aporta arcillas con un comportamiento único en cocción — el Rojizo Amagá que define nuestra paleta.",
      "Extraemos, preparamos y cocinamos a pocos kilómetros del taller. Kilómetro cero ladrillero: menos huella logística, más vínculo con el territorio.",
    ],
  },
  {
    id: "materiales",
    eyebrow: "Catálogo",
    title: "Materiales para cada obra",
    icon: "catalog",
    paragraphs: [
      "Nuestro catálogo está pensado por aplicación: fachadas a la vista, muros estructurales, enchapes decorativos y cubiertas en teja. Cada referencia con ficha técnica y asesoría cuando aplica.",
      "La cocción en horno Hoffman permite lotes consistentes sin renunciar al carácter artesanal de cada pieza.",
    ],
  },
];
