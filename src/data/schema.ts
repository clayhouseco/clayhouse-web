import { site } from "@/data/site";
import { logos } from "@/utils/media";

/** Horario de atención para Schema.org (Lun–Vie 7–16, Sáb 7–12) */
const openingHoursSpecification = [
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    opens: "07:00",
    closes: "16:00",
  },
  {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: "Saturday",
    opens: "07:00",
    closes: "12:00",
  },
];

export const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${site.url}/#localbusiness`,
  name: site.name,
  legalName: site.legalName,
  description: site.description,
  url: site.url,
  image: new URL(logos.header, site.url).href,
  logo: new URL(logos.header, site.url).href,
  telephone: site.phone,
  email: site.email,
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Km 2, vía Amagá - Angelópolis",
    addressLocality: "Amagá",
    addressRegion: "Antioquia",
    postalCode: "055020",
    addressCountry: "CO",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 6.0397,
    longitude: -75.7035,
  },
  openingHoursSpecification,
  areaServed: {
    "@type": "Country",
    name: "Colombia",
  },
};
