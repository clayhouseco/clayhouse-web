import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    /** Título para la pestaña y el resultado de Google. El <title> añade
     *  " | Clay House" (14 caracteres) y Google corta cerca de 60: cuando el
     *  titular del artículo es más largo, aquí va la versión corta. El h1 sigue
     *  usando `title` completo. */
    seoTitle: z.string().optional(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    /** articulo | proyecto | video | podcast */
    type: z.enum(["articulo", "proyecto", "video", "podcast"]),
    coverImage: z.string().optional(),
    /** YouTube, Vimeo o ruta en /public (ej. /images/Videos/...mp4) */
    videoUrl: z.string().optional(),
    /** Spotify, Anchor o archivo .mp3 en /public */
    audioUrl: z.string().optional(),
    duration: z.string().optional(),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
    tags: z.array(z.string()).default([]),
    /** Slugs de producto opcionales; el proyecto puede no estar ligado a ninguno */
    relatedProducts: z.array(z.string()).optional(),
  }),
});

export const collections = { blog };
