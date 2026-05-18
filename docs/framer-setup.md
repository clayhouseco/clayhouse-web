# Guía de configuración Framer — Clay House

Sigue esta guía en orden. Tiempo estimado: 4–6 horas para el setup base.

## 1. Cuenta y proyecto

**Plantilla elegida: [Nuvra](https://www.framer.com/marketplace/templates/nuvra/)** — guía detallada en [`docs/nuvra-setup.md`](nuvra-setup.md).

1. Crear cuenta en [framer.com](https://framer.com) con plan **Pro** (dominio custom + CMS completo).
2. **New Project** → duplicar **Nuvra** desde el marketplace.
3. Renombrar el proyecto: `Clay House`.
4. Seguir el mapeo Nuvra → Clay House en `docs/nuvra-setup.md`.

## 2. Design tokens (colores)

**Site Settings → Colors** — crear estas variables exactas (ver también `design-tokens.json`):

| Variable Framer | HEX |
|-----------------|-----|
| chocolateProfundo | `#472410` |
| terracotaClay | `#7C482C` |
| salmonSuave | `#F99A91` |
| coralVivo | `#EF5843` |
| ambarArcilla | `#F2A141` |
| fondoNeutro | `#FFFBF9` |
| blanco | `#FFFFFF` |

**Uso recomendado:**
- Fondo página: `fondoNeutro` o `blanco`
- Texto: `chocolateProfundo`
- Botón primario: fondo `terracotaClay`, texto `blanco`
- Botón hover: `coralVivo`
- Bloques destacados: fondo `salmonSuave` al 15–30% opacidad

## 3. Text Styles

**Site Settings → Text Styles:**

| Style | Fuente | Peso | Tamaño desktop | Notas |
|-------|--------|------|----------------|-------|
| H1 | Helvetica Neue | Bold | 64px | lowercase |
| H2 | Helvetica Neue | Bold | 40px | lowercase |
| H3 | Montserrat | Medium (500) | 24px | |
| Body | Montserrat | Light (300) | 17px | line-height 1.6 |
| Caption | Montserrat | Light | 14px | color terracotaClay o gris |

Si Helvetica Neue no aparece: usar **Neue Haas Grotesk Display** Bold.

## 4. CMS Collections

Crear en **CMS → Collections** (campos según `cms/` CSVs):

### MVP (activar primero)

**Productos**
- `name` (string)
- `slug` (slug)
- `category` (enum: F-PV, Macizo, Especiales, Pisos)
- `shortDescription` (string)
- `description` (formatted text)
- `heroImage` (image)
- `gallery` (gallery)
- `color` (string)
- `texture` (string)
- `technicalPdf` (file, opcional)
- `featured` (boolean)
- `seoTitle`, `seoDescription` (string)

**Descargas**
- `title`, `slug`, `type` (enum: NTC, Catálogo, Certificado, Detalle constructivo)
- `file` (file)
- `description` (string)

### Fase 2

**Colores**, **Proyectos**, **Artículos**, **FAQs** — ver `docs/cms-collections.md`.

## 5. Componentes reutilizables

Crear como **Components** en la página Home y reutilizar:

| Componente | Contenido |
|------------|-----------|
| `Nav` | Logo + menú MVP: Inicio, Productos, Nosotros, Descargas, Contacto |
| `Footer` | Contacto, mapa embed, NTC 4205, redes, tagline |
| `Hero` | Video/imagen + H1 + subtítulo + CTA |
| `CategoryCard` | Imagen + título + link |
| `ColorSwatch` | Muestra color + nombre |
| `ProjectCard` | Foto + título + ubicación + arquitecto |
| `ServiceIcon` | Ícono línea + título + texto corto |
| `SectionHeading` | Eyebrow + H2 + párrafo |
| `CTABanner` | Título + botón contacto |
| `DownloadRow` | Título + tipo + botón descarga |

## 6. Páginas MVP

| Página | Ruta | Archivo de copy |
|--------|------|-----------------|
| Home | `/` | `content/home.md` |
| Productos índice | `/productos` | CMS list |
| Producto detalle | `/productos/[slug]` | CMS template |
| Nosotros | `/nosotros` | `content/nosotros.md` |
| Descargas | `/descargas` | CMS list |
| Contacto | `/contacto` | `content/contacto.md` |

## 7. Formulario de contacto

**Insert → Form** con campos de `content/contacto.md`.

Configurar envío a: `ventas@clayhouse.com.co`

Añadir botón flotante WhatsApp: `https://wa.me/573206723365`

## 8. Plantilla Nuvra

Ver guía completa: [`docs/nuvra-setup.md`](nuvra-setup.md) (mapeo Home, CMS Shop→Productos, quitar carrito, Nav MVP).

## 9. Checklist semana 1

- [ ] Variables de color creadas
- [ ] Text Styles aplicados
- [ ] Nav + Footer con datos de `design-tokens.json`
- [ ] Collections Productos y Descargas creadas
- [ ] Importar filas de `cms/products.csv` y `cms/downloads.csv`
