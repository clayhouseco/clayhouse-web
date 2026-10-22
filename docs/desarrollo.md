# Trabajar en este repositorio

Qué se corre, cuándo, y qué comprueba cada cosa.

---

## 1. Lo mínimo

```bash
npm ci            # instala exactamente lo que dice el lock
npm run dev       # servidor de desarrollo
npm run build     # construye dist/
npm run preview   # sirve dist/ como lo servirá Vercel
```

`npm run build` **no toca ningún archivo versionado**. Traer datos del ERP es un paso
aparte y deliberado:

```bash
npm run sync      # ERP + hoja de inventario → src/data/erpFeed.json, inventario.json
```

Lo que `sync` baja queda en git, se revisa y se publica. Antes esto pasaba dentro del build,
así que cada despliegue traía datos distintos sin que nadie los hubiera visto.

---

## 2. La puerta antes de publicar

```bash
npm run verificar     # tipos + lint + pruebas + catálogo del ERP
```

Y lo que necesita el sitio ya construido:

```bash
npm run build
npm run verificar:enlaces     # enlaces internos, anclas y sitemap (--strict corta)
npm run verificar:csp         # la política de seguridad contra lo que la página carga
npm run verificar:imagenes    # toda referencia de imagen del HTML construido
npm run probar:cotizador      # el camino de la ficha al cotizador, en Chrome
npm run probar:resenas        # el envío de una reseña, con `fetch` doblado
npm run probar:medicion       # los eventos y el registro en el ERP, con `fetch` doblado
npm run probar:accesibilidad  # axe en 9 páginas + navegación con teclado
npm audit --omit=dev          # vulnerabilidades en lo que viaja al navegador
npm run vigilar:cotizaciones  # ritmo de entrada de cotizaciones (sin secretos)
```

`npm run build:prod` —el que corre Vercel— encadena las que pueden cortar un despliegue:
verificación de datos en modo estricto, build, política de seguridad y enlaces.

**Ninguna de estas pruebas escribe en producción.** `probar:medicion` sustituye `fetch` por
un doble antes de pulsar cualquier botón; `probar:cotizador` no pulsa ningún botón de envío;
`verificar:datos` lee el feed versionado del repositorio, no la API del ERP.

---

## 3. Qué comprueba cada herramienta, y qué no

| Herramienta                     | Para qué sirve                                                                       | Qué NO cubre                   |
| ------------------------------- | ------------------------------------------------------------------------------------ | ------------------------------ |
| `npm run check` (`astro check`) | Tipos, imports sin usar, variables muertas, también dentro de los `.astro`           | Lo que compila bien y está mal |
| `npm run lint` (ESLint)         | Lo que los tipos dejan pasar: carreras entre `await`, `==` flojo, llaves repetidas   | Estilo (eso es Prettier)       |
| `npm test` (vitest)             | Precios, unidades, catálogo, sitemap, feed de Merchant, cotizador, ficha de producto | Nada que necesite navegador    |
| `probar:*`                      | El navegador de verdad: medición, accesibilidad, teclado, el recorrido comercial     | El aspecto visual              |

Las reglas de ESLint están elegidas a mano y comentadas en `eslint.config.mjs`: las que
`astro check` ya cubre están apagadas a propósito, para no leer el mismo aviso dos veces.

**Formato.** `npm run format` pasa Prettier; `format:check` lo verifica y está en el CI. El
repositorio quedó formateado el 21 de octubre de 2026, en un commit propio.

**Las plantillas `.astro` quedan fuera, y es a propósito.** `prettier-plugin-astro` mete
espacios dentro de los elementos en línea: `<a class="btn">ver catálogo</a>` pasa a
`<a class="btn"> ver catálogo </a>`. Eso no es cosmético —el espacio se renderiza—, así que
un botón en `inline-block` queda unos píxeles más ancho y el subrayado de un enlace se
estira. Se comprobó comparando el HTML construido antes y después: cambiaban las 46 páginas.
`htmlWhitespaceSensitivity: "strict"` no lo evita. Sin prueba de regresión visual no hay con
qué acotar ese cambio, así que el formato se aplica donde no puede alterar lo que se publica:
TypeScript, scripts, markdown, CSS y JSON.

Fuera también los artefactos generados (`docs/flujo-datos-erp-web.html`), donde formatear es
ruido: 20.000 líneas que no escribió nadie a mano.

---

## 4. El CI

`.github/workflows/verificar.yml` corre todo lo de arriba en cada empujón y en cada pull
request, en este orden: primero lo que cuesta segundos (tipos, lint, pruebas), después el
build, y al final lo que necesita el sitio construido. No publica nada.

Node se fija en `22.22.0`, la misma versión que exige `engines` en `package.json`. Chrome
viene en la imagen del runner y `scripts/lib/navegador.mjs` lo encuentra solo —busca en las
rutas de macOS y de Linux, o en `CHROME_PATH`—.

---

## 5. Dónde vive cada cosa

```
src/data/        los datos: catálogo, feed del ERP, reseñas, textos
src/utils/       lógica sin DOM, probable con vitest
src/scripts/     lo que corre en el navegador, empaquetado
src/components/  componentes de Astro
src/pages/       una página por archivo
scripts/         mantenimiento: sync, verificaciones, generadores, pruebas de navegador
tests/           vitest
docs/            esto
```

La separación que importa es `src/utils` contra `src/scripts`: lo primero no toca el DOM y
por eso se prueba sin navegador. El cotizador está partido así a propósito —`utils/cotizador.ts`
decide qué es válido, cómo se escribe la solicitud y qué fila recibe el ERP;
`scripts/cotizacion/` solo lee el formulario y pinta—. Es la parte del sitio donde un error
cuesta dinero, y era la única sin una sola prueba.
