# Marketing y medición — estado y contexto

Documento de contexto para retomar el trabajo de SEO, analítica y publicidad.
Última actualización: **21 de octubre de 2026**.

Aquí vive lo que no se deduce leyendo el código: qué cuentas existen, qué
decisiones se tomaron y por qué, y qué queda pendiente. Los detalles de
implementación están en el código y en los mensajes de commit.

---

## 1. Cuentas e identificadores

| Servicio                 | Identificador                | Notas                                              |
| ------------------------ | ---------------------------- | -------------------------------------------------- |
| Google Analytics 4       | `G-VJPB3P55VJ`               | Propiedad `424484816`, flujo web `6668511270`      |
| Google Ads               | `147-572-9888`               | Cuenta a nombre de `clayhousecontacto@gmail.com`   |
| Merchant Center          | `5531850706`                 | Vinculado a Ads                                    |
| Search Console           | `sc-domain:clayhouse.com.co` | Tipo **Dominio** (cubre www y no-www)              |
| Tag Manager              | `GTM-M74WK37L`               | **Creado pero NO instalado**, a propósito (ver §4) |
| Ficha de Google Business | CID `1204017223360503098`    | Enlazada desde `site.ts`                           |

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

Los de clic están cableados con atributos `data-track` en el HTML; los del cotizador los
dispara su propio script. Todos pasan por `trackEvent` en `src/utils/analytics.client.ts`.

| Evento                     | Cuándo                                              | Qué lleva                              |
| -------------------------- | --------------------------------------------------- | -------------------------------------- |
| `view_item`                | Se abre la ficha de un producto                     | SKU del ERP, nombre, categoría, precio |
| `add_to_quote`             | «Agregar a cotización», en ficha y catálogo         | SKU o slug, dónde se pulsó             |
| `begin_quote`              | Primer contacto con el cotizador                    | moneda                                 |
| `quote_product_selected`   | Se elige un producto en una línea                   | SKU, categoría, precio                 |
| `quote_submit_attempt`     | Se pulsa enviar, por cualquiera de los tres canales | canal, valor, líneas, artículos        |
| `generate_lead`            | **El servidor confirmó la solicitud**               | canal, valor, líneas, artículos        |
| `quote_whatsapp_open`      | Se abre WhatsApp con la cotización                  | ídem                                   |
| `quote_email_open`         | Se envía por correo                                 | ídem                                   |
| `quote_print`              | Se imprime o se guarda en PDF                       | ídem                                   |
| `technical_sheet_download` | Descarga de una ficha técnica                       | producto, dónde                        |
| `cotizar_click`            | Botones de «cotizar» repartidos por el sitio        | dónde                                  |
| `whatsapp_click`           | Enlaces de WhatsApp fuera del cotizador             | dónde                                  |
| `form_start`               | Primer foco en el formulario de contacto            | formulario                             |
| `form_submit_attempt`      | Se envía el formulario de contacto                  | formulario, canal                      |

**Lo que NO viaja al medidor:** nombre, teléfono, correo, dirección, coordenadas ni texto
libre. Lo que viaja describe el pedido —código, categoría, cantidad, valor, moneda, canal—,
nunca a la persona. Los datos de contacto van a la solicitud que recibe el ERP, por su
propio camino. Está comprobado en una prueba de navegador: ver más abajo.

### `generate_lead` es la fila escrita, no el clic

Antes se disparaba al enviar el formulario. Un envío no es un lead: Formspree puede
rechazarlo, la red puede caerse y el visitante puede cerrar la pestaña. Ahora:

- **Cotizador:** se dispara en el punto exacto donde Supabase responde que guardó la
  solicitud. Ni antes ni por otro camino.
- **Formulario de contacto:** en `/contacto/gracias`, a la que solo se llega si Formspree
  aceptó el mensaje.

**No se duplica entre canales.** Un cliente puede mandar la misma cotización por WhatsApp,
por correo y además imprimirla. La solicitud se registra una sola vez —`erpSaved` corta las
siguientes— y la conversión cuelga de ese mismo punto, así que cuenta una. Los eventos de
canal (`quote_whatsapp_open`, `quote_email_open`, `quote_print`) sí se disparan cada vez:
sirven para saber qué canal prefiere la gente, y no son conversión.

### Lo que hay que marcar en GA4 y en Google Ads

En **GA4 → Administrar → Eventos clave**, marcar solo estos dos:

| Evento           | Por qué                                                            |
| ---------------- | ------------------------------------------------------------------ |
| `generate_lead`  | Es el lead: solicitud confirmada por el servidor                   |
| `whatsapp_click` | Contacto directo fuera del cotizador, que no deja rastro en la web |

Y en **Google Ads → Objetivos → Conversiones → Importar desde GA4**, importar esos dos:

- `generate_lead` → categoría _Enviar formulario de clientes potenciales_
- `whatsapp_click` → categoría _Contacto_

**Qué NO marcar como conversión, y por qué.** `quote_submit_attempt`, `begin_quote`,
`add_to_quote`, `view_item`, `technical_sheet_download` y los tres de canal se siguen
midiendo, pero marcarlos haría que Ads optimizara hacia la señal más fácil de conseguir en
vez de hacia la venta. `quote_submit_attempt` es el caso claro: se dispara aunque el
registro falle, que es justo lo contrario de una conversión.

Ambas conversiones con **recuento «una»**, no «todas»: la gente
reenvía formularios y toca varios botones de WhatsApp mientras navega.

**Sobre el valor:** `generate_lead` ahora lleva `value` —la suma de la cotización en pesos—
y `currency: "COP"`. Es el valor del PEDIDO, no el del lead: no toda cotización se cierra.
Si algún día se puja por valor, hay que fijar en Ads un valor de conversión realista (el
valor del pedido por la tasa de cierre), no este. Mientras tanto, no se pone valor
predeterminado en Ads: una cifra inventada corrompe cualquier puja por valor.

### Reseñas: dónde está la hoja

**[Reseñas Clay House](https://docs.google.com/spreadsheets/d/1BCDckXxmxmbR1A5ee641pdAV8OoCtH3Kd0uHabipG9w/edit)**
— la propietaria es la cuenta `clayhousecontacto@gmail.com`, no `gerencia@`.

Columnas, en este orden: `Fecha · Nombre · Rol · Email · Calificacion · Producto · Resena ·
Aprobada`. Una reseña se publica marcando la casilla **Aprobada**; el Apps Script de la misma
hoja (**Extensiones → Apps Script**) la recibe en `doPost` y la sirve en `doGet`.

Estaba documentado todo el flujo de moderación menos dónde vivía la hoja, que es lo primero
que hace falta para usarlo.

**Estado al 21 de octubre de 2026: 2 reseñas, las dos del 11 de junio, las dos aprobadas.
Ninguna fila sin aprobar.** Es decir, en cuatro meses no ha llegado ninguna. Hasta hoy el
formulario mandaba a ciegas —ver `ReviewForm.astro`— así que no había forma de distinguir
«nadie escribe» de «se pierden al llegar». Eso ya está corregido de aquí en adelante, pero
para saber qué pasó en esos cuatro meses hace falta mandar una reseña de prueba y ver si
aterriza: una fila nueva sin aprobar no se publica en la web, y se borra después.

### Reseñas: falta una columna en la hoja

El formulario de `/resenas` ya pide **empresa, obra o proyecto**, que es lo que hace
comprobable una reseña: un nombre y un rol no se pueden verificar, una obra sí.

**Mientras la hoja no tenga la columna, ese dato se pierde al llegar.** El Apps Script
guarda las columnas que conoce e ignora el resto. Para que quede:

1. En la hoja «Reseñas Clay House», añadir una columna `empresa`.
2. En el Apps Script, en `doPost`, añadirla al arreglo que se escribe en la fila, en el
   mismo orden que la cabecera.
3. En `doGet`, incluirla en el objeto que devuelve (`empresa: fila[n]`).

La página ya la muestra en cuanto empiece a llegar: no hay que tocar nada más acá.

### Cómo comprobar que mide

**GA4 DebugView** (lo que de verdad llega a Google):

1. Instalar la extensión _Google Analytics Debugger_ en Chrome y activarla, o abrir el sitio
   con `?debug_mode=1` en la URL.
2. GA4 → Administrar → **DebugView**. Aparece el dispositivo en cuanto cargue una página.
3. Aceptar el banner de cookies: sin consentimiento los eventos viajan sin identificador y
   DebugView puede no mostrarlos.
4. Recorrer: abrir una ficha (`view_item`) → «agregar a cotización» (`add_to_quote`) → ir a
   `/cotizacion`, elegir producto (`begin_quote`, `quote_product_selected`) → llenar nombre y
   teléfono → WhatsApp (`quote_submit_attempt`, `generate_lead`, `quote_whatsapp_open`).
5. Pulsar cada evento en DebugView y revisar sus parámetros: tiene que haber `item_id`,
   `item_category`, `value`, `currency` y `canal`, y **no** puede haber nombre ni teléfono.

Ojo: ese recorrido **escribe una solicitud real** en la bandeja del ERP. Conviene avisar al
equipo comercial, o usar un nombre reconocible como «PRUEBA MEDICIÓN».

**Tag Assistant** (lo que la página dispara, sin esperar a GA4):

1. Abrir [tagassistant.google.com](https://tagassistant.google.com) → _Add domain_ →
   `https://clayhouse.com.co`.
2. Se abre una ventana con la etiqueta instrumentada. Hacer el mismo recorrido.
3. En _Tags fired_ debe aparecer `G-VJPB3P55VJ` con los eventos en orden, y en _Consent_ el
   estado `denied` antes de aceptar el banner y `granted` después.

**Sin tocar producción**, el repositorio trae la prueba en navegador que se usó para
verificar esta fase: levanta el sitio construido, sustituye `fetch` por un doble que no
escribe en Supabase y comprueba la secuencia, que no haya conversión cuando el servidor
falla, que un segundo canal no duplique y que no viaje ningún dato personal.

---

## 3. Consentimiento — Consent Mode v2 implementado

La etiqueta de Google carga con consentimiento denegado por defecto. Antes de
aceptar el banner no escribe cookies ni usa un identificador persistente; Google
puede recibir señales anónimas para modelar conversiones. Al aceptar, la web
actualiza `ad_storage`, `analytics_storage`, `ad_user_data` y
`ad_personalization` a `granted`.

La implementación está dividida entre `src/components/Analytics.astro` —estado
inicial antes de cargar `gtag`— y `src/utils/analytics.client.ts` —actualización
cuando el visitante responde al banner—. No se debe volver a condicionar la
carga completa de GA4 al botón de aceptar: eso reabriría la brecha de atribución.

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
  Está enviado en Search Console, figura correcto y Google lo leyó el 16 de octubre.
- **JSON-LD** alineado con el canónico (`Product.url`, `offers.url`, breadcrumbs).
- **`sameAs`** en el `LocalBusiness`, derivado de `socialLinks`.
- **Feed de Merchant Center** en `/feed.xml`: 23 ítems, todos con código del ERP,
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

- El informe que contaba **41 imágenes sin `alt`** era un falso positivo: es la
  misma imagen decorativa del pie en 41 páginas y tiene texto alternativo vacío
  de forma intencional (`alt=""` en el componente).
- Están corregidos localmente dos 404 detectados por Search Console: la ficha
  inexistente de Rayados Horizontales y la categoría antigua `/productos/categoria/pisos`.
  Falta desplegar `vercel.json` para que las redirecciones entren en producción.
- **Dos artículos del blog** siguen con un solo enlace entrante (el podcast y el
  del proceso). No se enlazaron a productos porque sería forzado.
- **Google Business Profile**: la ficha existe. Para una ladrillera que vende en
  Medellín es probablemente la mayor fuente de exposición local, por encima del
  SEO del sitio. Vale revisarla: fotos, horario, productos, pedir reseñas.

### Sprint SEO local — ejecutado el 21 de octubre

Se trabajó sobre las páginas que ya reciben impresiones en lugar de abrir URLs
competidoras para las mismas búsquedas:

- `/comprar-ladrillo-medellin` conserva su URL y ahora apunta de forma explícita a
  **ladrillos en Medellín y Antioquia**. Añade referencias enlazadas, explicación
  de precio y flete, preguntas de compra, breadcrumb y llamadas al cotizador en
  lugar de usar WhatsApp como salida principal.
- `/productos/categoria/fachadas` apunta a **ladrillo para fachada en Medellín** y
  enlaza la página comercial local. No se creó otra categoría que compita con ella.
- `/productos/teja-colonial` amplió su texto y snippet con los datos del ERP:
  40 × 23 cm y rendimiento aproximado de 20 und/m². Se quitó del snippet la
  afirmación de fabricación propia para esa referencia: el ERP la describe como
  producto comercializado.
- Se publicó `/blog/cuantos-ladrillos-por-m2`, una guía de cálculo con enlaces a
  Romano, Toscano, Cartagena, Macizo Campesino, Fachadas y el cotizador. Entra al
  sitemap con fecha real y las fichas relacionadas devuelven el enlace.
- El `LocalBusiness` declara el año 1965 y la cobertura real: Medellín, Valle de
  Aburrá, Antioquia y Colombia, sin presentar una sede falsa en Medellín.
- La revisión automática de accesibilidad creció de 9 a 12 páginas para cubrir
  estas cuatro rutas prioritarias. El resultado final fue 0 violaciones, incluida
  navegación por teclado.

No se publicó una página de **pisos en barro**: las antiguas referencias de piso
redirigen al catálogo general y hoy no están publicadas ni cotizables. Esa página
solo debe volver cuando inventario, fotos, precio y código ERP estén confirmados.

Después del despliegue: inspeccionar las cuatro URLs en Search Console, solicitar
indexación de la guía nueva y registrar semanalmente consultas, posición, CTR y
cotizaciones orgánicas. No hace falta reactivar publicidad para ejecutar esta fase.

---

## 6. Publicidad — estado verificado el 21 de octubre

### Performance Max pausada

`Website traffic-Performance Max-3` está pausada; conserva un presupuesto
configurado de **COP 93.000/día**, pero no puede gastarlo mientras siga detenida.
En los últimos 30 días registró 492.445 impresiones, 43.087 clics, CTR 8,75 %,
costo aproximado de COP 2,70 millones y 1.773 conversiones.

El valor de conversión de COP 4,12 millones no era ingreso: casi todo provenía
de `whatsapp_click` con un valor importado de GA4 sin fundamento comercial. El
21 de octubre se hicieron dos correcciones coordinadas:

- `whatsapp_click` quedó **sin valor monetario**;
- la campaña pasó de **Maximizar valor de conversión** a **Maximizar
  conversiones**, sin cambiar el presupuesto;
- `whatsapp_click` pasó a **secundaria**, solo para observación;
- la campaña quedó con un objetivo específico: únicamente **Enviar formulario
  de clientes potenciales**, cuya única acción primaria es `generate_lead`;
- la campaña se pausó para no seguir comprando contactos accidentales mientras
  `generate_lead` todavía no tiene historial real en Ads.

No se debe reactivar hasta comprobar una cotización real de punta a punta y
revisar anuncios, ubicaciones y términos que originaron contactos irrelevantes.
Tampoco debe volver a pujar por valor hasta importar ventas cerradas o asignar a
cada lead un valor esperado basado en la tasa de cierre real.

### Campaña de Búsqueda

`Ladrillos medellin` conserva un presupuesto configurado de COP 20.000/día,
pero figura como **Finalizada**. En los últimos 30 días acumuló 3.316
impresiones, 270 clics, CTR 8,14 %, costo de COP 140.001 y cero conversiones. No
se reactivó: antes hay que corregir su estructura —actualmente tiene un solo
grupo genérico— y revisar anuncios, palabras clave y fecha de finalización.

### Merchant Center

La fuente programada `Clay House - feed web` apunta a
`https://clayhouse.com.co/feed.xml`, Colombia, español, todos los métodos de
marketing y actualización cada 24 horas. Merchant Center aceptó el archivo sin
errores el 21 de octubre: reconoció los 23 registros y añadió 2 productos
nuevos. El panel muestra 31 productos en total: 19 proporcionados por el feed y
12 adicionales encontrados por Google. Cinco todavía no se muestran mientras
termina su revisión; la sección de incidencias no reporta errores de archivo ni
de atributos.

### Pendiente en las consolas

1. Revisar cuando termine la evaluación inicial de los cinco productos que aún
   no se muestran y confirmar que no aparezcan duplicados visibles.
2. Configurar costos de envío. Merchant Center marca este apartado como
   incompleto y las tarifas para materiales pesados dependen de la política
   comercial; no se debe inventar una tarifa.
3. Limpiar a nivel de cuenta las acciones antiguas con cero actividad: compra de
   WooCommerce, carrito con URL mal formada y vista de `/fachadas/`. Ya no
   influyen en esta PMax porque la campaña usa solo `generate_lead`.
4. Probar un lead real controlado para que `generate_lead` aparezca en GA4. La
   prueba local de navegador pasa completa; no se envió una solicitud falsa al
   ERP durante esta revisión.
5. Agregar el recurso de llamada a PMax y reconstruir la campaña de Búsqueda
   antes de activarla.

---

## 7. Comandos útiles

```bash
npm run build            # genera imágenes responsivas, OG y el build de Astro
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
