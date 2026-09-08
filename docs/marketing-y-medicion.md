# Marketing y medición — estado y contexto

Documento de contexto para retomar el trabajo de SEO, analítica y publicidad.
Última actualización: **7 de septiembre de 2026**.

Aquí vive lo que no se deduce leyendo el código: qué cuentas existen, qué
decisiones se tomaron y por qué, y qué queda pendiente. Los detalles de
implementación están en el código y en los mensajes de commit.

---

## 1. Cuentas e identificadores

| Servicio | Identificador | Notas |
|---|---|---|
| Google Analytics 4 | `G-VJPB3P55VJ` | Propiedad `424484816`, flujo web `6668511270` |
| Google Ads | `147-572-9888` | Cuenta a nombre de `clayhousecontacto@gmail.com` |
| Merchant Center | `5531850706` | Vinculado a Ads |
| Search Console | `sc-domain:clayhouse.com.co` | Tipo **Dominio** (cubre www y no-www) |
| Tag Manager | `GTM-M74WK37L` | **Creado pero NO instalado**, a propósito (ver §4) |
| Ficha de Google Business | CID `1204017223360503098` | Enlazada desde `site.ts` |

Ojo con los permisos: GA4 se administra desde `gerencia@clayhouse.com.co` y Ads
desde `clayhousecontacto@gmail.com`. Cualquier vinculación nueva entre productos
exige ser administrador en ambos lados.

---

## 2. Cómo está montada la medición

**El sitio manda.** La etiqueta de GA4 se emite desde
`src/components/Analytics.astro`, que solo la activa si existe la variable de
entorno `PUBLIC_GA4_MEASUREMENT_ID` (o `PUBLIC_PLAUSIBLE_DOMAIN`). Esa variable
vive en **Vercel → Settings → Environment Variables**, solo en Production.

Se puso solo en Production a propósito: si Preview también midiera, cada
despliegue de prueba mandaría visitas falsas a la misma propiedad.

Como es una variable `PUBLIC_*`, se hornea en el HTML durante el build.
**Cambiarla en Vercel no afecta al sitio ya publicado**: hay que redesplegar.
Si el build sale sin analítica, `Analytics.astro` lo avisa por consola.

### Eventos instrumentados

Están cableados con atributos `data-track` en el HTML y los recoge
`src/utils/analytics.client.ts`:

| Evento | Dónde |
|---|---|
| `cotizar_click` | Botones de cotizar (82 en el sitio) |
| `whatsapp_click` | Enlaces de WhatsApp (60) |
| `producto_agregado` | Añadir al carrito de cotización (34) |
| `ficha_descargada` | Descarga de ficha técnica PDF (21) |
| `form_start` | Primer foco en un campo del formulario |
| `generate_lead` | Envío del formulario de contacto |

### Eventos clave y conversiones

En GA4 solo dos están marcados como **evento clave**, y son los dos importados a
Google Ads como conversión:

- `generate_lead` → categoría *Enviar formulario de clientes potenciales*
- `whatsapp_click` → categoría *Contacto*

Los otros cuatro **se siguen midiendo** pero no son conversión. Es deliberado:
si todo es conversión, Google Ads optimiza hacia la señal más fácil de
conseguir. `form_start` es el caso extremo — se dispara con tocar un campo, sin
enviar nada.

Ambas conversiones usan **recuento "una vez por sesión"**, no "una vez por
evento" (que es lo que Google recomienda por defecto). Razón: la gente reenvía
formularios y toca varios botones de WhatsApp mientras navega; contar cada uno
inflaría los leads.

Ninguna lleva **valor predeterminado**. Google propone 1 USD, que es moneda
equivocada y cifra inventada; un valor falso corrompe cualquier puja por valor.
Cuando se sepa cuánto vale un lead, se pone en pesos.

---

## 3. Consentimiento — la brecha conocida

GA4 **solo carga después de que el visitante acepta el banner de cookies**
(`src/components/CookieConsent.astro`). Es correcto para tratamiento de datos
personales, pero tiene un costo real:

- Quien no acepta hace clic en el anuncio, escribe por WhatsApp, y **Ads nunca
  lo sabe**. Las campañas subestiman resultados.
- El verificador de etiquetas de Google marca el sitio como "requiere atención"
  porque no ve la etiqueta dispararse sin aceptar.

La solución estándar es **Consent Mode v2**: envía señales anónimas sin cookies
para que Ads estime las conversiones perdidas. **No está implementado.** Es la
mayor brecha de medición que queda.

---

## 4. Por qué NO hay Tag Manager

El contenedor `GTM-M74WK37L` existe en la cuenta pero **no está instalado en el
sitio, y no debe instalarse sin más**.

GA4 ya está puesto directamente, con eventos personalizados en código. Si se
instala GTM y alguien le agrega dentro una etiqueta de GA4 con el mismo
`G-VJPB3P55VJ`, **cada visita se cuenta dos veces**. Es un error difícil de
detectar después, porque los números "se ven bien".

Si algún día hace falta GTM (píxeles de Meta, TikTok, LinkedIn sin tocar el
repo), se instala en `src/layouts/BaseLayout.astro` — el `<script>` tras
`<head>` y el `<noscript>` tras `<body>` — pero **GA4 se queda fuera del
contenedor**.

Por la misma razón no hay etiqueta de conversión de Ads (`AW-`): importando
desde GA4 queda cubierto, y ponerla además duplicaría.

---

## 5. SEO — qué se arregló y qué falta

### Hecho (desplegado)

El disparador fue Search Console: ~2.130 de 7.400 impresiones caían en URLs que
devolvían 404, toda la estructura de la tienda WooCommerce que quedó sin
redirección al migrar a Astro.

- **45 redirecciones 301** en `vercel.json` para las rutas heredadas. Verificado
  en producción: todas resuelven y terminan en 200. Son **308**, no 301 — es lo
  que emite `"permanent": true`, y Google los trata igual.
- **`trailingSlash: false`** y una sola forma de URL en todo el sitio. Los
  enlaces internos que redirigían pasaron de **287 a 0**; la raíz era
  `getCatalogCategoryHref`, que explicaba 266 de ellos.
- **Sitemap** alineado con el canónico, con `lastmod` solo donde hay fecha real.
- **JSON-LD** alineado con el canónico (`Product.url`, `offers.url`, breadcrumbs).
- **`sameAs`** en el `LocalBusiness`, derivado de `socialLinks`.
- **Feed de Merchant Center** en `/feed.xml`: 22 ítems, todos con código del ERP,
  construido sobre `cotizableCatalog` para que la granularidad coincida con la
  del ERP.
- **Enlaces producto ↔ blog**: los artículos pasaron de 1 enlace entrante a 2-4.
- **Títulos y descripciones** dentro de los límites de Google (0 pasados).
- **Visor de fotos**: dejó de servir los originales de cámara. El carrusel de
  Boro pasó de 26,3 MB a 1,5 MB.

### Decisión sensible: reseñas fuera del JSON-LD

Había **una** reseña publicada, cuyo autor coincide con el titular de la cuenta,
y alimentaba el `aggregateRating` de **todos** los productos — las estrellas en
los resultados de Google.

Google prohíbe marcar reseñas que el negocio escribe sobre sí mismo, y la
sanción es una acción manual que retira los fragmentos enriquecidos del dominio
entero. El riesgo es asimétrico, así que el marcado se apagó.

La reseña **se sigue mostrando en la página**; solo se omite el JSON-LD. Se
reactiva poniendo `schemaOk: true` en `src/data/reviews.ts` cuando haya reseñas
de clientes reales e independientes.

### Pendiente

- **41 `<img>` sin `alt`.** Hay que escribirlos uno a uno con criterio; también
  es exposición (búsqueda de imágenes).
- **Dos artículos del blog** siguen con un solo enlace entrante (el podcast y el
  del proceso). No se enlazaron a productos porque sería forzado.
- **Reenviar el sitemap** en Search Console para acelerar el reprocesamiento.
- **Google Business Profile**: la ficha existe. Para una ladrillera que vende en
  Medellín es probablemente la mayor fuente de exposición local, por encima del
  SEO del sitio. Vale revisarla: fotos, horario, productos, pedir reseñas.

---

## 6. Publicidad — estado

### Campaña de Máximo rendimiento: pausada

Corrió del 11 de agosto al 7 de septiembre:

| | |
|---|---|
| Impresiones | 763 (~27/día) |
| Clics | 62 (CTR 8,1%) |
| CPC | $399 |
| Costo | $24.700 COP |
| Conversiones | **0** |

Tres problemas simultáneos: no tenía conversiones configuradas (no existían
hasta el 7 de sept), el diagnóstico decía **"No hay productos en Google Ads"**
porque Merchant Center no le entregaba nada, y la calidad del anuncio era
"deficiente" por falta de recursos.

PMax necesita 30-50 conversiones al mes para funcionar. Se pausó, no se borró.

### Lo que sigue: campaña de Búsqueda

Preparada y validada, sin lanzar. Cuatro grupos:

| Grupo | Destino |
|---|---|
| Ladrillo fachada | `/productos/categoria/fachadas` |
| Enchape de ladrillo | `/productos/categoria/enchapes` |
| Teja de barro | `/productos/categoria/techos` |
| Ladrillera Medellín | `/comprar-ladrillo-medellin` |

Cada uno con 15 títulos y 4 descripciones validados contra los límites (30 y 90
caracteres), más 28 palabras clave negativas a nivel de campaña.

Ajustes: presupuesto $20.000-30.000 diarios, **Maximizar clics** (no
conversiones: no hay historial para que el algoritmo aprenda), Medellín +
Antioquia, y **Red de Display desactivada** — Google la deja marcada por defecto
y se lleva el presupuesto en impresiones de baja intención.

A las 2-3 semanas, con conversiones acumuladas, se pasa a Maximizar
conversiones.

El grupo "Ladrillera Medellín" es el de mayor intención: quien busca eso ya
decidió qué quiere y solo busca a quién comprarle.

### Pendiente en las consolas

1. **Subir el feed a Merchant Center**: `https://clayhouse.com.co/feed.xml` como
   fuente programada. Sin esto no hay fichas gratuitas de Shopping ni productos
   para PMax.
2. **Revisar las conversiones preexistentes** en Ads. Al montar la campaña de
   PMax se crearon solas acciones en las categorías *Compra*, *Vista de página*
   y *Participación*. Una de "Compra" en un sitio sin pago en línea nunca se
   disparará; una de "Vista de página" contaría cualquier visita. Si alguna
   quedó como conversión principal, compite con las buenas.
3. **Lanzar la campaña de Búsqueda.**

---

## 7. Comandos útiles

```bash
npm run build            # incluye sync:erp, fetch-availability y generate-responsive
npm run verificar:erp    # compara los códigos de la web contra el catálogo del ERP
npm run verify:products  # comprueba que las imágenes del build existan en public/
```

Verificaciones rápidas contra producción:

```bash
# ¿la etiqueta de GA4 está en el HTML?
curl -s https://clayhouse.com.co/ | grep -c VJPB3P55VJ

# ¿el feed responde y cuántos ítems trae?
curl -s https://clayhouse.com.co/feed.xml | grep -c '<item>'

# ¿quedan enlaces internos con barra final? (deben ser 0)
npm run build && grep -ro 'href="/[^"]*/"' dist --include=index.html | wc -l
```
