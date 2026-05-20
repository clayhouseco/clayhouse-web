export const site = {
  name: "Clay House",
  legalName: "Clay House",
  tagline: "Convirtiendo piezas en sueños",
  description:
    "Ladrillo de fachada neoartesanal fabricado en Amagá, Antioquia. Cumplimiento NTC 4205. Cotización y muestras para arquitectos y constructores.",
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
    "https://maps.google.com/maps?q=Clay+House,+Km+2,+vía+Amagá+-+Angelópolis,+Amagá,+Antioquia,+Colombia&hl=es&z=15&output=embed",
  mapsDirectionsUrl:
    "https://www.google.com/maps/dir/?api=1&destination=Clay+House,+Km+2,+vía+Amagá+-+Angelópolis,+Amagá,+Antioquia,+Colombia",
} as const;

export const nav = [
  { label: "Inicio", href: "/" },
  { label: "Productos", href: "/productos" },
  { label: "Nosotros", href: "/nosotros" },
  { label: "Blog", href: "/blog" },
  { label: "Descargas", href: "/descargas" },
  { label: "Contacto", href: "/contacto" },
] as const;
