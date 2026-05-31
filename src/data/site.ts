export const site = {
  name: "Clay House",
  legalName: "Clay House",
  tagline: "Convirtiendo piezas en sueños",
  description:
    "Ladrillos, pisos, tejas y enchapes hechos a mano en Amagá, Antioquia. Fabricación neoartesanal con cumplimiento NTC 4205. Cotización para arquitectos y constructores.",
  /** Imagen por defecto para Open Graph y Twitter (1200×630 recomendado) */
  defaultOgImage: "/og-image.jpg",
  url: "https://clayhouse.com.co",
  email: "ventas@clayhouse.com.co",
  phone: "+57 320 672 33 65",
  phoneHref: "tel:+573206723365",
  whatsapp: "https://wa.me/573206723365",
  address: "Km 2, vía Amagá - Angelópolis, Amagá, Antioquia, Colombia",
  /** Coordenadas exactas de la planta (de la ficha en Google Maps). */
  lat: 6.0444695,
  lng: -75.695905,
  hours:
    "Lunes a viernes 7:00 a.m. – 4:00 p.m. · Sábados 7:00 a.m. – 12:00 m.",
  /** Mapa embebido con el CID real de Clay House en Google Maps (1204017223360503098)
   *  → debería mostrar la ficha del negocio sin API key. */
  mapsEmbedUrl:
    "https://maps.google.com/maps?cid=1204017223360503098&hl=es&z=17&output=embed",
  /** Indicaciones en Google Maps al CID real del negocio. */
  mapsDirectionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=Clay+House&destination_cid=1204017223360503098",
  /** Navegación en Waze con coordenadas exactas. */
  wazeUrl: "https://waze.com/ul?ll=6.0444695,-75.695905&navigate=yes",
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
  { label: "Reseñas", href: "/resenas" },
  { label: "Contacto", href: "/contacto" },
] as const;
