# Cómo subir logos, fotos y fichas técnicas

Sí: subes los archivos al proyecto y el agente (o tú con `npm run dev`) los integra en el sitio.

## Paso 1 — Arrastra archivos a estas carpetas

En Finder, abre la carpeta del proyecto:

`Pagina web Clay House`

### Logo
| Archivo | Dónde |
|---------|--------|
| `logo.png` o `logo.svg` | carpeta `public/` |

### Fotos reales de productos
Ya están en `public/images/Fotos Productos/` y se enlazan desde `src/data/products.ts`.

### Imágenes por producto (carpetas del catálogo)
Sube a `public/images/products/{slug}/`:

- `producto.jpg` — foto principal
- `detalle-1.jpg`, `detalle-2.jpg` — extras en galería
- `dimensiones.jpg` — diagrama técnico
- `fachada.jpg` — en obra o ambiente

Lista de slugs: ver `public/images/products/README.md`.

### Logo
| Archivo | Dónde |
|---------|--------|
| `logo.png` | carpeta `public/` (cabecera del sitio) |

Origen recomendado: exportar desde `public/Logos/MASTERMesa de trabajo 1.png`.

### Imágenes IA (dimensiones y fachada)
Por cada producto, crea la carpeta `public/images/products/{slug}/` y sube:

| Archivo | Contenido |
|---------|-----------|
| `dimensiones.jpg` | Diagrama técnico con medidas |
| `fachada.jpg` | Render en muro (o ambiente, en pisos/tejas) |

Slugs: `toscano`, `napolitano`, `romano`, `cartagena`, `macizo-campesino`, `macizo-brix`, `rayados-verticales`, `rayados-horizontales`, `enchape-rustico`, `enchape-romano`, `piso-30x30`, `teja-plana`.

**Prompts sugeridos:** ver [`docs/prompts-imagenes-ia.md`](prompts-imagenes-ia.md).

### Fotos del home (opcional)
| Archivo | Dónde |
|---------|--------|
| `hero.jpg` | `public/images/hero/` |
| `redescubre.jpg` | `public/images/hero/` |
| `horno.jpg` | `public/images/hero/` |

### Fichas técnicas PDF
| Archivo | Dónde |
|---------|--------|
| `Toscano.pdf`, `Napolitano.pdf`, etc. | `public/Fichas Tecnicas/` |

Listado completo en la página **Descargas** del sitio.

## Paso 2 — Avisa en el chat de Cursor

Escribe por ejemplo:

> Ya subí los archivos. Integra todo.

Indica si:
- Añadiste productos nuevos (no están en la lista)
- Los nombres de archivo son distintos
- Tienes varias fotos por producto (galería)

## Paso 3 — Revisar en el navegador

```bash
npm run dev
```

Abre http://localhost:4321

---

## Formatos aceptados

- Imágenes: `.jpg`, `.jpeg`, `.png`, `.webp`
- Logo: `.png` o `.svg` (fondo transparente recomendado)
- Documentos: `.pdf`

## Tamaño recomendado

- Productos: 1200–1600 px de ancho, comprimidas (Squoosh o similar)
- Hero: 1920 px de ancho
- Logo: altura ~80–120 px en PNG

---

Mientras no subas fotos, el sitio muestra imágenes de referencia temporales.
