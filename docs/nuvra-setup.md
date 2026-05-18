# Clay House con plantilla Nuvra

**Plantilla:** [Nuvra](https://www.framer.com/marketplace/templates/nuvra/) (~79 USD)  
**Preview en vivo:** [nuvra-template.framer.website](https://nuvra-template.framer.website/)

Nuvra encaja bien con Clay House: estudio + catálogo, casos de obra, estética editorial y CMS potente. Solo hay que **quitar el enfoque “tienda”** y orientarlo a vitrina B2B (cotización, muestras, NTC 4205).

---

## Paso 0 — Duplicar la plantilla

1. Comprar / duplicar **Nuvra** desde el marketplace.
2. Renombrar el proyecto: `Clay House`.
3. Abrir el preview lateral y la **Home** al mismo tiempo.

---

## Paso 1 — Marca (antes de tocar textos)

### Colores (Site Settings → Colors)

Reemplazar la paleta de Nuvra por la del manual:

| Variable | HEX |
|----------|-----|
| chocolateProfundo | `#472410` |
| terracotaClay | `#7C482C` |
| salmonSuave | `#F99A91` |
| coralVivo | `#EF5843` |
| ambarArcilla | `#F2A141` |
| fondoNeutro | `#FFFBF9` |
| blanco | `#FFFFFF` |

Seleccionar cada capa de la plantilla que use el color de acento de Nuvra y asignar `terracotaClay` o `chocolateProfundo`.

**Glassmorphism:** Nuvra usa paneles de vidrio. Para Clay House (más tierra, menos “tech”):
- Bajar opacidad del blur o sustituir por fondo `fondoNeutro` sólido en Nav y cards.
- Mantener vidrio solo en modales ligeros si te gusta el efecto.

### Tipografía (Site Settings → Fonts / Text Styles)

| Estilo Nuvra | Reemplazar por |
|--------------|----------------|
| Titulares display | **Helvetica Neue** Bold (o Neue Haas Grotesk Bold) |
| Cuerpo | **Montserrat** Light (300) |
| Botones / labels | Montserrat Medium (500) |

Convención Todobarro + manual: **titulares en minúsculas** donde aplique.

### Logo

Sustituir el logo de Nuvra por Clay House (versiones del manual: positiva sobre fondo claro).

---

## Paso 2 — Mapeo Home Nuvra → Clay House (Todobarro)

Usa `content/home.md` para el copy. Tabla de equivalencias:

| Sección en Nuvra (aprox.) | Bloque Clay House / Todobarro | Acción |
|---------------------------|-------------------------------|--------|
| Hero cinematográfico | Hero: video proceso / ladrillo | Copy: *tradición antioqueña, fuego moderno* |
| Intro / statement | “Redescubre el ladrillo a la vista” | Imagen fachada en obra |
| **Collections** (Lounge, Studio, Dining…) | **4 categorías de producto** | Renombrar a: F-PV, Macizo, Especiales, Pisos |
| Grid producto destacado | Paleta de colores | 6 swatches: Rojizo Amagá, Salmón Suroeste, etc. |
| About / philosophy | Innovación + horno túnel | *horno túnel, fuego limpio* + 3 pilares |
| **Projects** | Inspiración / proyectos | 4 tarjetas CMS Proyectos |
| Services / Trade | Muestras + 5 servicios | Cotización, asesoría, tiempos, stock, visita taller |
| Newsletter / CTA final | Footer + contacto | *Convirtiendo piezas en sueños* |

**Eliminar o ocultar en MVP:**
- Before/After slider (salvo que tengas foto obra antes/después)
- Bloques muy “furniture shop” que empujen al carrito

---

## Paso 3 — Navegación

Editar el componente **Nav** de Nuvra:

| Link Nuvra (original) | Link Clay House MVP |
|-----------------------|---------------------|
| Shop | **Productos** → `/productos` |
| Projects | Ocultar en MVP o → `/proyectos` (Fase 2) |
| Collections | → `/productos` (filtro categoría) |
| About | **Nosotros** → `/nosotros` |
| Blog | Ocultar en MVP |
| Contact / Trade | **Contacto** → `/contacto` |
| — | **Descargas** → `/descargas` (añadir) |

---

## Paso 4 — CMS: renombrar colecciones de Nuvra

Nuvra trae Shop + Projects. Adaptación:

### Shop → **Productos**

| Campo Nuvra | Campo Clay House |
|-------------|------------------|
| Product name | `name` |
| Price | **Eliminar** o ocultar (no es tienda) |
| Add to cart | **Solicitar cotización** → `/contacto` |
| Description | `description` + ficha NTC |
| Images | `heroImage` + `gallery` |
| Category | F-PV / Macizo / Especiales / Pisos |

Importar filas desde `cms/products.csv`.

### Projects → **Proyectos** (Fase 2)

| Campo | Uso |
|-------|-----|
| Title | Nombre obra |
| Location | Ciudad |
| Client / Architect | Arquitecto |
| Gallery | Fotos fachada |
| Body | Descripción 150–200 palabras |

Datos iniciales: `cms/projects.csv`.

### Blog → **Historias** (Fase 2)

`cms/articles.csv` — 3 artículos técnicos.

### Nueva colección: **Descargas**

No suele venir en Nuvra; créala según `docs/cms-collections.md` y página `/descargas`.

---

## Paso 5 — Páginas MVP

| Página | Base en Nuvra | Copy |
|--------|---------------|------|
| `/` | Home | `content/home.md` |
| `/productos` | Shop index | `content/productos-index.md` |
| `/productos/[slug]` | Product detail | `content/producto-detalle-template.md` |
| `/nosotros` | About / Studio | `content/nosotros.md` |
| `/contacto` | Contact / Trade consultation | `content/contacto.md` |
| `/descargas` | Nueva (duplicar layout lista simple) | `content/descargas-index.md` |

**Trade Consultations** de Nuvra → reutilizar como página **Contacto** (formulario B2B + muestras).

**Design & Direction** → renombrar a **Asesoría técnica** o fusionar en bloque servicios de la Home.

---

## Paso 6 — Quitar e-commerce, mantener conversión

En todas las plantillas de producto de Nuvra:

1. Eliminar botón **Add to cart** / precio.
2. Añadir botón primario: **solicitar cotización** → `/contacto?producto={slug}`.
3. Añadir secundario: **pedir muestra** → mismo formulario.
4. Enlace **descargar ficha técnica** → `/descargas` o PDF del CMS.

WhatsApp flotante: `https://wa.me/573206723365`

---

## Paso 7 — Orden de trabajo (semana 1–2)

```
Día 1   Colores + tipografía + logo + Nav/Footer
Día 2   Hero + bloque “redescubre” + 4 categorías
Día 3   CMS Productos (5 ítems) + página shop → productos
Día 4   Contacto (formulario) + Nosotros
Día 5   Descargas + SEO básico por página
```

Guía semanal completa: `docs/mvp-weekly-guide.md`.

---

## Checklist rápido Nuvra + Clay House

- [ ] Paleta manual aplicada (no colores default Nuvra)
- [ ] Montserrat + Helvetica en todo el sitio
- [ ] Menú MVP: Inicio, Productos, Nosotros, Descargas, Contacto
- [ ] Sin precios ni carrito
- [ ] Collections renombradas a categorías ladrillo
- [ ] Copy Home desde `content/home.md`
- [ ] 5+ productos en CMS
- [ ] Formulario a ventas@clayhouse.com.co

---

## Recursos

- Tokens: `design-tokens.json`
- Redirects WordPress: `redirects.csv`
- Lanzamiento: `docs/launch-checklist.md`

Cuando tengas el proyecto duplicado, comparte el **link de preview** de Framer y revisamos sección por sección si algo no encaja.
