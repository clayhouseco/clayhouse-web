# Plantilla: post nuevo del blog

Copia este archivo a `_inbox/blog/{slug}/post.md` y escribe el contenido directamente abajo del frontmatter.

> El blog admite 4 tipos: **artículo, proyecto, video, podcast**. Cambia `type:` según corresponda.

---

```markdown
---
title: "Título del post"
description: "Resumen de 1-2 líneas para Google y para compartir en redes."
pubDate: 2026-05-22                  # Fecha en formato YYYY-MM-DD
type: articulo                       # articulo | proyecto | video | podcast
coverImage: "/images/blog/{slug}/portada.jpg"
featured: false                      # true si quieres destacarlo en /blog
draft: false                         # true si NO debe publicarse aún
tags: ["fachadas", "Romano"]         # 2-4 tags relevantes

# --- Campos extra según el tipo ---

# Si type es "video":
# videoUrl: "https://www.youtube.com/watch?v=..."
# duration: "3 min"

# Si type es "podcast":
# audioUrl: "https://open.spotify.com/episode/..."
# duration: "28 min"
---

## Subtítulo

Aquí va el cuerpo del post. Usa **Markdown**:

- Listas con guiones
- **Negrita** con dos asteriscos
- _Cursiva_ con guion bajo
- [Enlaces](https://clayhouse.com.co/contacto/)

## Imágenes dentro del post

Pon tus imágenes en `_inbox/blog/{slug}/imagenes/` y refiérelas así:

![Pie de foto](/images/blog/{slug}/foto-1.jpg)

Yo me encargo de moverlas a `public/images/blog/{slug}/` al integrar.

## Más secciones

Lo que necesites.

> Citas con `>` al inicio de línea.

```

---

## Estructura de archivos a entregar

```
_inbox/blog/{slug}/
├── post.md                  ← este archivo, con tu contenido
└── imagenes/
    ├── portada.jpg          ← imagen principal (sale en /blog y al compartir)
    ├── foto-1.jpg
    └── foto-2.jpg
```

## Tips de redacción

- **Longitud ideal**: 400-800 palabras para artículos. Para videos/podcasts, basta con 100-200 palabras de contexto + el embed.
- **Título**: corto y específico. No "Reflexiones sobre el ladrillo" sino "Por qué el barro cocido aguanta 100 años en obra".
- **Primera línea**: debe enganchar. Empieza con la idea más fuerte, no con introducciones genéricas.
- **Imágenes**: la portada idealmente 1600×900 (horizontal). Las del cuerpo, lo que se sienta natural.
