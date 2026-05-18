export interface ColorSwatch {
  name: string;
  slug: string;
  hex: string;
  description: string;
}

export const colors: ColorSwatch[] = [
  {
    name: "Rojizo Amagá",
    slug: "rojizo-amaga",
    hex: "#7C482C",
    description: "Color base de la arcilla local. Tonalidad cálida del territorio.",
  },
  {
    name: "Salmón Suroeste",
    slug: "salmon-suroeste",
    hex: "#F99A91",
    description: "Gama clara, ideal para fachadas luminosas.",
  },
  {
    name: "Tierra Sinifaná",
    slug: "tierra-sinifana",
    hex: "#472410",
    description: "Tono profundo de alta cocción. Sobriedad en obra.",
  },
  {
    name: "Flameado Pueblo Viejo",
    slug: "flameado-pueblo-viejo",
    hex: "#EF5843",
    description: "Destonificaciones naturales del horno. Cada lote único.",
  },
  {
    name: "Carbón",
    slug: "carbon",
    hex: "#1A1A1A",
    description: "Contraste dramático en detalles y piezas especiales.",
  },
  {
    name: "Blanco antiguo",
    slug: "blanco-antiguo",
    hex: "#FFFBF9",
    description: "Engobe blanco artesanal para acabados patrimoniales.",
  },
];
