import { downloadUrl } from "@/utils/paths";

export interface GeneralDownload {
  id: string;
  title: string;
  type: string;
  description: string;
  file: string;
  filename: string;
}

/** Catálogo, guías y documentos transversales (nombres legibles en /public/downloads) */
export const generalDownloads: GeneralDownload[] = [
  {
    id: "catalogo-fachadas",
    title: "Manual de fachadas Clay House",
    type: "Catálogo general",
    description:
      "Referencia de sistemas de fachada, paleta y criterios de especificación para arquitectura y obra.",
    file: downloadUrl("Manual de Fachadas Clay House.pdf"),
    filename: "Manual de Fachadas Clay House.pdf",
  },
  {
    id: "guia-instalacion-fachadas",
    title: "Guía de instalación de fachadas",
    type: "Guía de instalación",
    description:
      "Buenas prácticas de montaje, juntas y recomendaciones constructivas para muros en ladrillo y enchape a la vista.",
    file: downloadUrl("Manual de Fachadas Clay House.pdf"),
    filename: "Manual de Fachadas Clay House.pdf",
  },
];
