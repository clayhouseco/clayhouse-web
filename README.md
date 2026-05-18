# Clay House — Sitio web

Vitrina B2B en **Astro** (rápida, editable en código). Sustituye el enfoque Framer/Nuvra cuando prefieras no pelear con capas del template.

## Ver el sitio en tu Mac

```bash
cd "/Users/davidmedina/Proyectos AI/Pagina web Clay House"
npm install
npm run dev
```

Abre **http://localhost:4321**

## Páginas incluidas

| Ruta | Contenido |
|------|-----------|
| `/` | Home estilo Todobarro |
| `/productos` | Catálogo con filtros |
| `/productos/[slug]` | Ficha de producto |
| `/nosotros` | Historia + horno túnel |
| `/contacto` | Formulario + WhatsApp |
| `/descargas` | Listado PDFs (enlazar archivos cuando los tengas) |

## Editar contenido (sin Framer)

| Qué cambiar | Archivo |
|-------------|---------|
| Productos | [`src/data/products.ts`](src/data/products.ts) |
| Colores | [`src/data/colors.ts`](src/data/colors.ts) |
| Descargas | [`src/data/downloads.ts`](src/data/downloads.ts) |
| Teléfono, email, menú | [`src/data/site.ts`](src/data/site.ts) |
| Textos largos | carpeta [`content/`](content/) (referencia) + páginas en `src/pages/` |

## Colores y tipos (manual de marca)

Definidos en [`src/styles/global.css`](src/styles/global.css) y [`design-tokens.json`](design-tokens.json).

- Inter Bold → titulares (sustituto de Helvetica Neue)
- Montserrat Light → cuerpo

## Formulario de contacto

1. Crea un formulario gratis en [formspree.io](https://formspree.io)
2. Copia `.env.example` → `.env`
3. Pega tu ID: `PUBLIC_FORMSPREE_ID=xxxxxxxx`

Sin `.env`, la página muestra email y WhatsApp.

## Publicar en internet (Vercel + GitHub)

Guía paso a paso: **[`docs/deploy-vercel-github.md`](docs/deploy-vercel-github.md)**

Resumen:

1. `npm run build` → `npx vercel login` → `npx vercel --prod`
2. `gh auth login` → commit → `git push origin main`
3. Vercel → Import `clayhouseco/clayhouse-web` → dominio `clayhouse.com.co`

Redirects WordPress: [`vercel.json`](vercel.json) · Exclusión de videos en deploy: [`.vercelignore`](.vercelignore)

## Fotos y PDFs

- **Fotos:** cambia URLs en `src/data/products.ts` o pon archivos en `public/images/` y usa `/images/tu-foto.jpg`
- **PDFs:** guarda en `public/downloads/` y actualiza enlaces en `src/pages/descargas.astro`

## Documentación Framer (pausado)

Si retomas Nuvra: [`docs/nuvra-setup.md`](docs/nuvra-setup.md)

## Contacto de marca

- ventas@clayhouse.com.co
- +57 320 672 33 65
- Km 2, vía Amagá - Angelópolis, Amagá, Antioquia
