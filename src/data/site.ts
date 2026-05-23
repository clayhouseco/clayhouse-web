export const site = {
  name: "Clay House",
  legalName: "Clay House",
  tagline: "Convirtiendo piezas en sueños",
  description:
    "Ladrillos, pisos, tejas y enchapes en barro cocido. Fabricación neoartesanal en Amagá, Antioquia. Cotización para arquitectos y constructores. NTC 4205.",
  /** Imagen por defecto para Open Graph y Twitter (1200×630 recomendado) */
  defaultOgImage: "/og-image.jpg",
  url: "https://clayhouse.com.co",
  email: "ventas@clayhouse.com.co",
  phone: "+57 320 672 33 65",
  phoneHref: "tel:+573206723365",
  whatsapp: "https://wa.me/573206723365",
  address: "Km 2, vía Amagá - Angelópolis, Amagá, Antioquia, Colombia",
  hours:
    "Lunes a viernes 7:00 a.m. – 4:00 p.m. · Sábados 7:00 a.m. – 12:00 m.",
  /** Mapa embebido (sin API key) y enlace a indicaciones en Google Maps */
  mapsEmbedUrl:
    "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3972.184!2d-75.7035!3d6.0397!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e44286b5f7f2f0d%3A0x0!2sKm%202%2C%20v%C3%ADa%20Amag%C3%A1%20-%20Angel%C3%B3polis%2C%20Amag%C3%A1!5e0!3m2!1ses!2sco!4v1!5m2!1ses!2sco",
  mapsDirectionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=Clay+House,+Km+2,+vía+Amagá+-+Angelópolis,+Amagá,+Antioquia,+Colombia",
} as const;

export type SocialId =
  | "facebook"
  | "instagram"
  | "youtube"
  | "pinterest"
  | "tiktok"
  | "linkedin";

export const socialLinks: {
  id: SocialId;
  label: string;
  href: string;
}[] = [
  { id: "facebook", label: "Facebook", href: "https://www.facebook.com/clayhousecol" },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/clayhouseco/" },
  { id: "youtube", label: "YouTube", href: "https://www.youtube.com/@clayhouse-v1x" },
  { id: "pinterest", label: "Pinterest", href: "https://co.pinterest.com/clayhousecol/" },
  { id: "tiktok", label: "TikTok", href: "https://www.tiktok.com/@clayhouseco" },
  {
    id: "linkedin",
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/clayhouseco",
  },
];

/** Navegación principal del header */
export const primaryNav = [
  { label: "Inicio", href: "/" },
  { label: "Productos", href: "/productos" },
  { label: "Proyectos", href: "/proyectos" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Blog", href: "/blog" },
  { label: "Contacto", href: "/contacto" },
] as const;

/** Navegación completa, usada en el footer (incluye Descargas y Reseñas) */
export const nav = [
  { label: "Inicio", href: "/" },
  { label: "Productos", href: "/productos" },
  { label: "Proyectos", href: "/proyectos" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Blog", href: "/blog" },
  { label: "Descargas", href: "/descargas" },
  { label: "Reseñas", href: "/reseñas" },
  { label: "Contacto", href: "/contacto" },
] as const;
