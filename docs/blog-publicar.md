# Blog — Cómo publicar

Cada entrada es un archivo `.md` en `src/content/blog/`.

## Campos del encabezado (frontmatter)

```yaml
---
title: "Título visible"
description: "Resumen para Google y tarjetas del listado"
pubDate: 2025-05-19          # fecha de publicación
type: articulo               # articulo | proyecto | video | podcast
coverImage: "/images/..."    # opcional, ruta en public/
videoUrl: "https://..."      # YouTube, Vimeo o /ruta/video.mp4
audioUrl: "https://..."      # Spotify o /ruta/episodio.mp3
duration: "12 min"           # opcional
featured: false
draft: false                 # true = no se publica en el sitio
tags: ["fachada", "obra"]
relatedProducts: ["romano"]  # opcional, slugs del catálogo
---
```

Cuerpo del texto en Markdown debajo del `---`.

## Tipos

| type | Uso |
|------|-----|
| `proyecto` | Obra o caso sin depender de un solo producto |
| `articulo` | Nota, reflexión, noticia |
| `video` | Videoblog (YouTube, Vimeo o MP4 en `public/`) |
| `podcast` | Audio (Spotify, Anchor o MP3 en `public/`) |

## Imágenes

Coloque fotos en `public/images/blog/` (cree la carpeta) y referéncielas como `/images/blog/mi-foto.jpg`.

## Tras agregar un archivo

Ejecute `npm run build` o espere el despliegue en Vercel tras `git push`.
