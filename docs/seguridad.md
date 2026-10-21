# Seguridad de la página

Qué se cerró, qué sigue abierto y qué hay que tocar cuando se añada un servicio nuevo.

---

## 1. Las 12 vulnerabilidades de npm: dónde dolían de verdad

`npm audit` reportaba 12 (una crítica, diez altas, una baja). Hoy reporta **0**, con Astro 7
y `sharp` declarado como dependencia propia. Pero conviene separar lo que podía afectar a un
visitante de lo que solo afectaba a la máquina que construye el sitio, porque la diferencia
cambia la urgencia.

**La página es estática.** Se construye en Vercel y lo que el visitante descarga es HTML, CSS
e imágenes ya generadas. No hay servidor nuestro atendiendo peticiones: no hay dónde ejecutar
la mayoría de estos fallos.

| Riesgo                                                                                                             | Dónde vivía                 | Qué podía pasar                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------------------------------------------------ | --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `vite`, `esbuild`, `postcss`, `source-map-js`, `js-yaml`, `smol-toml`, `nanoid`, `devalue`, `http-cache-semantics` | Solo en el build            | Lectura de archivos o bloqueo del proceso en la máquina que compila, con un proyecto o un archivo malicioso. Ninguno llega al visitante. Varios solo aplican en Windows o con el servidor de desarrollo abierto.                                                                     |
| `svgo` (scripts dentro de un SVG)                                                                                  | Build                       | Un SVG con script dentro podría quedar sin limpiar y publicarse. Solo importa si se añade un SVG que no vino de nosotros.                                                                                                                                                            |
| `sharp` / libvips                                                                                                  | Build                       | Imágenes malformadas podían hacer caer o desbordar el procesador de imágenes. Las fotos las subimos nosotros.                                                                                                                                                                        |
| **`astro` (XSS por nombres de atributo en spread props)**                                                          | **Build → sale en el HTML** | Es la única con efecto en producción: si un dato con el que se arma la página trajera el nombre de un atributo manipulado, el HTML publicado quedaría con código ejecutable. En la práctica exigiría que el ERP entregara datos manipulados, pero es el que no se podía dejar pasar. |

El ERP entra en la web a través de `erpFeed.json`, así que vale decirlo: **el catálogo del ERP
es una entrada de datos, no código**, y el único camino por el que un dato suyo podría
convertirse en algo ejecutable era precisamente ese fallo de Astro.

### Qué cambió al subir a Astro 7

- `src/pages/contacto.astro` tenía un `return` suelto en un `<script>`. El compilador nuevo
  —escrito en Rust— ya no envuelve el script en una función y eso es un error de sintaxis.
- Dos reglas escribían `-webkit-backdrop-filter` **después** de la propiedad estándar; el
  minificador nuevo conserva la última y borraba la estándar. Se quitó el prefijo escrito a
  mano y se declaró el objetivo de navegadores en `astro.config.mjs`, así que ahora el
  compilador pone los dos. Hay más prefijos en la salida que antes, no menos.
- Todo lo demás se comprobó comparando el sitio construido antes y después: mismas 43
  páginas, mismos archivos, las 30 imágenes generadas idénticas byte a byte, el mismo CSS
  —rota la serialización, no las reglas— y 36 de 43 páginas con estructura y texto idénticos
  (las otras 7 solo reparten el CSS en línea en distinto número de bloques).

---

## 2. Cabeceras de seguridad

Viven en `vercel.json`, en una regla que cubre todas las rutas.

| Cabecera                                           | Qué hace                                                                                                                                                                |
| -------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Content-Security-Policy`                          | La lista de dominios desde los que el navegador puede cargar algo. Ver abajo.                                                                                           |
| `X-Content-Type-Options: nosniff`                  | Un archivo se interpreta como lo que dice ser, no como lo que parezca.                                                                                                  |
| `Referrer-Policy: strict-origin-when-cross-origin` | Al salir del sitio se envía el dominio, nunca la ruta completa. Una cotización no filtra qué producto miraba el visitante.                                              |
| `Permissions-Policy`                               | Apaga cámara, micrófono, ubicación, pagos, USB y sensores: la página no usa ninguno. Deja en paz la pantalla completa y el audio, que el video de YouTube sí necesita.  |
| `Strict-Transport-Security: max-age=63072000`      | Dos años de HTTPS obligatorio para `clayhouse.com.co`. **Sin `includeSubDomains`**, a propósito: el ERP vive en un subdominio y esa decisión no es de este repositorio. |
| `Cross-Origin-Opener-Policy: same-origin`          | Una ventana abierta desde acá no puede manipular la nuestra.                                                                                                            |

No se pone `X-Frame-Options`: `frame-ancestors 'none'` en la CSP hace lo mismo y lo entienden
todos los navegadores que importan.

---

## 3. La CSP, dominio por dominio

Solo entra lo que la página usa de verdad:

| Dominio                                                                                         | Para qué                                                 | Directiva                              |
| ----------------------------------------------------------------------------------------------- | -------------------------------------------------------- | -------------------------------------- |
| `*.googletagmanager.com`                                                                        | GA4 (`gtag.js`)                                          | `script-src`, `img-src`, `connect-src` |
| `*.google-analytics.com`, `*.analytics.google.com`                                              | Envío de las mediciones                                  | `connect-src`, `img-src`               |
| `stats.g.doubleclick.net`, `googleads.g.doubleclick.net`, `www.google.com`, `www.google.com.co` | Señales de Google Ads y remarketing                      | `img-src`, `connect-src`               |
| `xmgsljwxiyyporczsrum.supabase.co`                                                              | Guardar la cotización **y** las fotos que el ERP publica | `connect-src`, `img-src`               |
| `formspree.io`                                                                                  | Envío del formulario de contacto                         | `form-action`, `connect-src`           |
| `script.google.com`, `script.googleusercontent.com`                                             | Reseñas aprobadas (Apps Script)                          | `connect-src`                          |
| `nominatim.openstreetmap.org`                                                                   | Buscar la dirección de obra                              | `connect-src`                          |
| `*.tile.openstreetmap.org`, `server.arcgisonline.com`                                           | Los mapas del cotizador                                  | `img-src`                              |
| `www.youtube-nocookie.com`                                                                      | Videos del blog, sin cookies                             | `frame-src`                            |
| `i.ytimg.com`                                                                                   | Miniaturas de esos videos                                | `img-src`                              |
| `maps.google.com`                                                                               | Mapa de la planta en contacto                            | `frame-src`                            |

WhatsApp, Waze y las redes sociales no aparecen: son enlaces que el visitante abre, no
recursos que la página cargue, y la CSP no gobierna una navegación.

**`npm run verificar:csp`** compara las dos listas sobre el sitio ya construido y falla si la
página carga algo que la política no permite. Corre dentro de `npm run build:prod`, que es lo
que ejecuta Vercel, así que un servicio nuevo sin permiso detiene el despliegue en vez de
aparecer roto en producción.

### Lo que la CSP NO resuelve

`script-src` y `style-src` llevan `'unsafe-inline'`. No es un descuido: Astro publica scripts
y estilos dentro del HTML, el sitio es estático —no hay servidor que ponga un _nonce_
distinto en cada visita— y las cabeceras de Vercel son fijas. Con hashes habría que
recalcularlos en cada build y escribirlos en `vercel.json`, que está versionado y que el
build no debe tocar (ver README).

Lo que sí hace, aun así: **ningún script puede venir de un dominio ajeno**. Un comentario, un
dato del ERP o un enlace manipulado no pueden traer código de fuera; solo podrían ejecutar
algo que ya estuviera escrito en nuestras páginas. Y `object-src 'none'`, `base-uri 'self'` y
`frame-ancestors 'none'` cierran tres de las vías clásicas.

### Si se enciende Plausible

`plausible.io` **no está permitido**. El código sabe cargarlo si se define
`PUBLIC_PLAUSIBLE_DOMAIN`, pero el navegador lo bloquearía sin avisar. Para encenderlo hay que
añadirlo antes a `script-src` y `connect-src`. `verificar:csp` lo recuerda en cada corrida.

---

### Lo que la CSP bloqueaba sin avisar (corregido el 21 oct 2026)

`pagead2.googlesyndication.com` no estaba en la política, y es a donde el gtag de Google Ads
manda las conversiones: `/ccm/collect?tid=AW-11432934112&en=page_view`. El navegador lo
bloqueaba —en `fetch` y como baliza de imagen— sin decir nada a quien publica. Medido con
Lighthouse contra el sitio publicado: 20 bloqueos en las 8 mediciones de las cuatro páginas
clave, es decir en todas.

Consecuencia: la medición de Google Ads llegaba incompleta. Importa porque el pendiente de
marcar los eventos clave e importarlos a Ads se habría hecho sobre datos recortados.

Se añadió a `img-src` y a `connect-src`, y solo ese: `www.googleadservices.com` y
`td.doubleclick.net` aparecen en otras configuraciones de gtag pero esta no los usa, y abrir
la política por si acaso es lo contrario de tener una política.

**Por qué `verificar:csp` no lo encontró.** Ese comando compara la política con los dominios
que aparecen en el sitio **construido**, y este no aparece en ningún archivo: lo decide la
librería de Google en tiempo de ejecución. Para dominios así la única comprobación que sirve
es cargar la página publicada en un navegador y leer el panel de problemas —que es lo que
hace Lighthouse—. Conviene repetirlo cada vez que se toque la medición.

---

## 4. Lo que sigue abierto

1. **La clave de Supabase viaja en el HTML, y eso está bien; la política que la respalda, no.**
   Es la clave _publicable_ (`sb_publishable_…`), diseñada para ser pública. Lo que la hace
   segura es RLS, y hoy la política de inserción es `with check (true)`: cualquiera puede
   escribir lo que quiera en la tabla de cotizaciones. La migración que lo cierra está escrita
   y **sin ejecutar**, esperando dos decisiones. Ver [`pendientes-cotizador.md`](pendientes-cotizador.md).
   Es el riesgo de producción más real que tiene hoy el sitio.
2. **No hay límite de peticiones por IP.** Nada impide insertar miles de cotizaciones válidas
   con esa clave. Exige una Edge Function o el rate limiting de Supabase.
3. **El envío de reseñas no puede confirmar.** `ReviewForm` escribe en Apps Script con
   `mode: "no-cors"`: el navegador no puede leer la respuesta, así que la página lleva al
   visitante a «gracias» aunque la fila no se haya escrito. Es el mismo patrón que se corrigió
   en el cotizador en la Fase 1. La lectura de reseñas ya no usa JSONP —ahora es `fetch` con
   CORS, y lo que llega son datos, no código—, pero el envío sigue a ciegas.
4. **Ninguna clave privada está en el repositorio.** Se comprobó: no hay `service_role`, ni
   tokens del ERP, ni certificados. Las únicas variables que llegan al navegador son las
   `PUBLIC_*`, y todas son publicables por diseño. Ver [`.env.example`](../.env.example).

---

## 5. Al añadir un servicio nuevo

1. Añadir su dominio a la directiva que corresponda en `vercel.json`.
2. `npm run build && npm run verificar:csp`.
3. Si es un servicio que recibe datos de clientes, decir qué datos y por qué en
   [`privacidad`](../src/pages/privacidad.astro); la Ley 1581 pide informar a quién se entregan.
