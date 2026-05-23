import type { CollectionEntry } from "astro:content";
import { site } from "@/data/site";
import { assetUrl } from "@/utils/paths";
import { logos } from "@/utils/media";

type BlogPost = CollectionEntry<"blog">;

/** Construye un JSON-LD BlogPosting para una entrada del blog.
 *  BlogPosting es subtipo de Article y suficiente para que Google
 *  muestre tarjetas enriquecidas en Discover y resultados. */
export function buildArticleJsonLd(post: BlogPost) {
  const { title, description, pubDate, updatedDate, coverImage, tags, type } = post.data;
  const url = new URL(`/blog/${post.id}/`, site.url).href;

  const imageUrl = coverImage
    ? new URL(coverImage.startsWith("/") ? coverImage : `/${coverImage}`, site.url).href
    : new URL(site.defaultOgImage, site.url).href;

  const logoUrl = new URL(assetUrl(logos.header), site.url).href;

  const node: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: title,
    description,
    image: imageUrl,
    datePublished: pubDate.toISOString(),
    dateModified: (updatedDate ?? pubDate).toISOString(),
    author: {
      "@type": "Organization",
      name: site.name,
      url: site.url,
    },
    publisher: {
      "@type": "Organization",
      name: site.name,
      logo: {
        "@type": "ImageObject",
        url: logoUrl,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    url,
    inLanguage: "es-CO",
    articleSection: typeToSection(type),
  };

  if (tags && tags.length > 0) {
    node.keywords = tags.join(", ");
  }

  return node;
}

function typeToSection(type: string): string {
  switch (type) {
    case "articulo":
      return "Artículos";
    case "proyecto":
      return "Proyectos";
    case "video":
      return "Video";
    case "podcast":
      return "Podcast";
    default:
      return "Blog";
  }
}
