# Estructura CMS Framer — Clay House

## Productos (`cms/products.csv`)

Importar manualmente o copiar fila por fila en CMS.

| Campo | Tipo | Obligatorio |
|-------|------|-------------|
| name | Text | Sí |
| slug | Slug | Sí |
| category | Enum | Sí |
| shortDescription | Text | Sí |
| description | Rich text | Sí |
| heroImage | Image | Sí |
| gallery | Gallery | No |
| color | Text | No |
| texture | Text | No |
| technicalPdf | File | No |
| featured | Boolean | No |
| seoTitle | Text | Sí |
| seoDescription | Text | Sí |

**Enum category:** `F-PV` | `Macizo` | `Especiales` | `Pisos`

## Colores (`cms/colors.csv`) — Fase 2

| Campo | Tipo |
|-------|------|
| name | Text |
| slug | Slug |
| hexReference | Text |
| description | Text |
| sampleImage | Image |
| relatedProducts | Multi-reference → Productos |

## Proyectos (`cms/projects.csv`) — Fase 2

| Campo | Tipo |
|-------|------|
| title | Text |
| slug | Slug |
| location | Text |
| architect | Text |
| typology | Enum: Residencial, Comercial, Restauración, Paisajismo |
| description | Rich text |
| heroImage | Image |
| gallery | Gallery |
| productsUsed | Multi-reference → Productos |
| featured | Boolean |
| year | Number |

## Descargas (`cms/downloads.csv`)

| Campo | Tipo |
|-------|------|
| title | Text |
| slug | Slug |
| type | Enum: NTC, Catálogo, Certificado, Detalle constructivo |
| description | Text |
| file | File |
| order | Number |

## Artículos (`cms/articles.csv`) — Fase 2

| Campo | Tipo |
|-------|------|
| title | Text |
| slug | Slug |
| publishDate | Date |
| category | Enum: Técnico, Proyecto, Prensa |
| excerpt | Text |
| body | Rich text |
| coverImage | Image |

## FAQs (`cms/faqs.csv`)

| Campo | Tipo |
|-------|------|
| question | Text |
| answer | Rich text |
| category | Enum: Técnico, Instalación, Comercial, Logística |
