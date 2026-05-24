# Imágenes del bloque "Redescubre el ladrillo"

Esta carpeta contiene las fotos que rotan en el bloque chocolate de la home:

> "Redescubre el ladrillo — Enchapes y fachadas que elevan espacios comerciales y residenciales..."

## Cómo agregar / cambiar imágenes

1. Suelta las fotos aquí (mínimo 4, idealmente JPG/PNG ~1200×900 px).
2. Edita `src/pages/index.astro` en el bloque `const featuredProjects = [...]` para
   apuntar a los nuevos archivos. Cada slide acepta: `src`, `alt` y `label`.

## Formato y peso recomendado

| Aspect ratio | Mínimo | Peso ideal |
|---|---|---|
| 4:3 o 3:2 (apaisado) | 1200×900 px | <500 KB cada una |

- Comprime imágenes pesadas con `node scripts/optimize-images.mjs` después de subirlas.
- Si quieres más de 4 slides, basta con añadir entradas al array `featuredProjects`.

## Ejemplo de entrada en `featuredProjects`

```ts
{
  src: assetUrl("/images/home/redescubre/mi-obra.jpg"),
  alt: "Descripción accesible de la imagen",
  label: "Nombre que aparece debajo",
},
```
