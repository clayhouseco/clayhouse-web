export type AboutSection = {
  id: string;
  eyebrow: string;
  title: string;
  paragraphs: string[];
};

export const aboutSections: AboutSection[] = [
  {
    id: "sobre-nosotros",
    eyebrow: "Quiénes somos",
    title: "Sobre nosotros",
    paragraphs: [
      "Somos Clay House: una ladrillera neoartesanal en Amagá, Antioquia, donde el oficio manual y la especificación técnica se encuentran para crear materiales con identidad territorial.",
      "Hoy somos un showroom de materiales derivados de la arcilla con enfoque de alta gama: calidad estética, trazabilidad de origen y soluciones integrales para arquitectos, constructores y diseñadores.",
    ],
  },
  {
    id: "historia",
    eyebrow: "Origen",
    title: "Historia",
    paragraphs: [
      "Desde 1965, en el corazón de la tradición ladrillera del suroeste antioqueño, nuestra historia comenzó como Ladrillera San Fernando: ladrillos macizos, atanores, tejas y pisos hechos con las manos y el conocimiento de generaciones.",
      "Con el tiempo evolucionamos hacia Alfarera Pueblo Viejo y, en 2022, adoptamos el nombre Clay House para honrar el pasado y abrazar la innovación.",
    ],
  },
  {
    id: "mision",
    eyebrow: "Propósito",
    title: "Misión",
    paragraphs: [
      "Ofrecer piezas de barro cocido con estándar técnico, asesoría cercana y trazabilidad de origen, para que cada obra integre fachada, estructura, pisos y cubiertas con coherencia material.",
      "Acompañamos a quien especifica con fichas, muestras y conocimiento del material — como un colega que conoce el ladrillo, no como un catálogo frío.",
    ],
  },
  {
    id: "vision",
    eyebrow: "Horizonte",
    title: "Visión",
    paragraphs: [
      "Ser la referencia en ladrillo neoartesanal en Colombia: tradición alfarera del suroeste antioqueño con cocción controlada, cumplimiento NTC 4205 y carácter artesanal en cada lote.",
      "Neoartesanal no es nostalgia: es estándar contemporáneo con raíz territorial — convirtiendo piezas en sueños para proyectos que buscan diferenciación.",
    ],
  },
  {
    id: "territorio",
    eyebrow: "Amagá",
    title: "El barro de un lugar con nombre",
    paragraphs: [
      "Amagá no es solo nuestra fábrica: es nuestra materia prima narrativa. La cuenca del Sinifaná aporta arcillas con un comportamiento único en cocción — el Rojizo Amagá que define nuestra paleta.",
      "Extraemos, preparamos y cocinamos a pocos kilómetros del taller. Kilómetro cero ladrillero: menos huella logística, más vínculo con el territorio.",
    ],
  },
  {
    id: "materiales",
    eyebrow: "Catálogo",
    title: "Materiales para cada obra",
    paragraphs: [
      "Nuestro catálogo está pensado por aplicación: fachadas a la vista, muros estructurales, enchapes decorativos, pisos de barro y cubiertas en teja.",
      "La cocción se realiza en horno Hoffman, lo que nos permite lotes consistentes sin dejar de lado el carácter artesanal de cada pieza.",
    ],
  },
];
