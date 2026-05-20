import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { products } from "@/data/products";
import { catalogCategories, getCategorySlug } from "@/data/catalogCategories";
import { site } from "@/data/site";

export const prerender = true;

const staticPaths = [
  "/",
  "/productos/",
  "/nosotros/",
  "/blog/",
  "/descargas/",
  "/privacidad/",
  "/contacto/",
  "/contacto/gracias/",
];

function locFor(path: string): string {
  if (path === "/") return `${site.url}/`;
  return `${site.url}${path}`;
}

export const GET: APIRoute = async () => {
  const blogPosts = await getCollection("blog", ({ data }) => !data.draft);

  const paths = [
    ...staticPaths,
    ...catalogCategories.map((c) => `/productos/categoria/${getCategorySlug(c.id)}/`),
    ...products.map((p) => `/productos/${p.slug}/`),
    ...blogPosts.map((post) => `/blog/${post.id}/`),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (path) => `  <url>
    <loc>${locFor(path)}</loc>
  </url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(body, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
};
