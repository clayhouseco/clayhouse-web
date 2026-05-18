# Despliegue: Vercel → GitHub

Sitio estático Astro. Dominio previsto: **clayhouse.com.co** (`astro.config.mjs`).

## Requisitos en tu Mac

- Node 20+ (`node -v`)
- Cuenta en [vercel.com](https://vercel.com) (misma cuenta que usarás para el dominio)
- Acceso al repo **clayhouseco/clayhouse-web** en GitHub

---

## Paso 1 — Vercel (primera publicación desde tu computador)

```bash
cd "/Users/davidmedina/Proyectos AI/Pagina web Clay House"
npm install
npm run build
```

Instala la CLI e inicia sesión (solo la primera vez):

```bash
npx vercel login
```

Despliegue de **producción**:

```bash
npx vercel --prod
```

Responde al asistente:

| Pregunta | Respuesta |
|----------|-----------|
| Set up and deploy? | **Y** |
| Which scope? | Tu equipo o cuenta personal |
| Link to existing project? | **N** la primera vez (o **Y** si ya existe) |
| Project name | `clayhouse-web` |
| Directory | `./` |
| Override settings? | **N** (usa `vercel.json`) |

Al terminar verás una URL tipo `https://clayhouse-web-xxx.vercel.app`.

### Variables de entorno (formulario de contacto)

En [vercel.com](https://vercel.com) → proyecto → **Settings → Environment Variables**:

| Nombre | Valor | Entornos |
|--------|-------|----------|
| `PUBLIC_FORMSPREE_ID` | Tu ID de Formspree | Production, Preview |

Luego **Redeploy** el último deployment para que el build incluya la variable.

### Dominio clayhouse.com.co

1. Vercel → proyecto → **Settings → Domains** → Add `clayhouse.com.co` y `www.clayhouse.com.co`
2. En el registrador del dominio, crea los registros DNS que indique Vercel (normalmente `A` + `CNAME` para www)
3. Espera propagación (minutos a 48 h)

---

## Paso 2 — GitHub (código y despliegues automáticos)

### 2.1 Autenticación GitHub CLI

```bash
gh auth login
```

Elige: GitHub.com → HTTPS → Login with browser.

### 2.2 Subir cambios

```bash
cd "/Users/davidmedina/Proyectos AI/Pagina web Clay House"
git status
git add -A
git commit -m "Sitio Astro: catálogo, precios, imágenes y despliegue Vercel"
git push origin main
```

Si el push falla por tamaño, revisa que no estés añadiendo videos `.mp4` o `.heic` (ya están en `.gitignore`).

### 2.3 Conectar Vercel ↔ GitHub

1. [vercel.com/new](https://vercel.com/new) → **Import** `clayhouseco/clayhouse-web`
2. Framework: **Astro** (auto)
3. **Deploy**
4. Cada `git push` a `main` generará un deploy automático

Si ya creaste el proyecto con `npx vercel`, en el dashboard: **Settings → Git** → Connect Repository.

---

## Comprobaciones rápidas

```bash
npm run build
npm run verify:images
```

Abrir en producción:

- `/` — home
- `/productos` — catálogo
- `/productos/romano` — ficha con galería
- `/contacto` — formulario

---

## Redirects WordPress

Definidos en [`vercel.json`](../vercel.json) (tienda → productos, carrito → contacto, etc.).

---

## Notas

- **`.vercelignore`**: excluye HEIC/MP4/RAF del deploy (más rápido; la web no los usa).
- Carpeta `public/images` puede ser pesada en disco; en Git solo deben ir **jpg/png/webp** usados por el sitio.
- El archivo `.env` local **no** se sube; en Vercel usa Environment Variables.
