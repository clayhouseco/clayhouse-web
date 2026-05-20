# Dominio personalizado — clayhouse.com.co

El sitio Astro ya usa `site: https://clayhouse.com.co` en `astro.config.mjs` y en `src/data/site.ts` (canonical, Open Graph, sitemap).

## 1. Vercel — agregar dominios

1. Proyecto **clayhouse-web** → **Settings** → **Domains**.
2. Agregar:
   - `clayhouse.com.co` (apex / raíz)
   - `www.clayhouse.com.co`
3. Vercel mostrará los registros DNS que debe crear en su proveedor (GoDaddy, Cloudflare, etc.).

## 2. DNS en el proveedor del dominio

Siga **exactamente** lo que indique Vercel. Suele ser uno de estos esquemas:

### Opción A — Apex con registro A (común)

| Tipo | Nombre / Host | Valor |
|------|----------------|-------|
| A | `@` | `76.76.21.21` (IP de Vercel; confirmar en el panel) |
| CNAME | `www` | `cname.vercel-dns.com` |

### Opción B — Cloudflare u otro con CNAME en apex

| Tipo | Nombre | Valor |
|------|--------|-------|
| CNAME | `@` | `cname.vercel-dns.com` |
| CNAME | `www` | `cname.vercel-dns.com` |

Espere propagación (minutos a 48 h). Vercel marcará el dominio como **Valid**.

## 3. Canónico: apex sin www

En `vercel.json` está configurado:

- `www.clayhouse.com.co` → redirección 301 a `https://clayhouse.com.co`

El canónico del sitio es **sin www** (`clayhouse.com.co`).

## 4. Proyecto en Vercel

- Asigne el dominio al entorno **Production** (rama `main`).
- Puede dejar `clayhouse-web.vercel.app` como preview; Google indexará `clayhouse.com.co` una vez el DNS esté activo.

## 5. Comprobar

- https://clayhouse.com.co carga el sitio.
- https://www.clayhouse.com.co redirige al apex.
- En el HTML: `<link rel="canonical" href="https://clayhouse.com.co/...">`.
- [Google Search Console](https://search.google.com/search-console): propiedad con prefijo de URL `https://clayhouse.com.co`.

## 6. Email

El correo `@clayhouse.com.co` (MX) es **independiente** del hosting web. No cambie registros MX al apuntar el sitio a Vercel.
