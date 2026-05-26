export type BlogPostType = "articulo" | "proyecto" | "video" | "podcast";

export const blogTypeLabels: Record<BlogPostType, string> = {
  articulo: "Artículo",
  proyecto: "Proyecto",
  video: "Video",
  podcast: "Podcast",
};

export const blogFilters: { id: "all" | BlogPostType; label: string }[] = [
  { id: "all", label: "Todos" },
  { id: "articulo", label: "Artículos" },
  { id: "video", label: "Video" },
];

export function formatBlogDate(date: Date): string {
  return new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}
