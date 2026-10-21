# Auditoría del sitio — informe final

Nueve fases, del 14 al 21 de octubre de 2026. Qué se cambió, qué se midió, qué quedó
pendiente y de quién es cada decisión que falta.

---

## 1. Resumen

El sitio funcionaba. Lo que no funcionaba era la confianza en que siguiera funcionando: cada
comprobación dependía de que alguien se acordara de mirar, y varias cosas llevaban meses
roto sin que nada lo dijera.

Los tres hallazgos que más costaban dinero:

1. **La API del ERP devolvía respuestas en caché.** Los cambios que gerencia hacía en el ERP
   podían tardar en llegar a la web, o no llegar. Explica meses de «lo cambié en el ERP y la
   página no lo muestra». (Fase 2)
2. **El cotizador multiplicaba metros cuadrados por el precio de una pieza.** La teja
   colonial se despacha por m² y su precio estaba escrito por unidad: 60 m² salían en
   $ 96.000 cuando son 1.320 tejas, $ 2.112.000. Un error de 22 veces en un documento con
   precios. (Fase 2)
3. **El mapa de la ubicación de obra nunca cargó en producción.** El código del cotizador
   iba en un `<script>` en línea, y ahí un `import("leaflet")` no lo puede resolver ningún
   navegador. Comprobado contra el sitio publicado: `TypeError: Failed to resolve module
specifier 'leaflet'`. El cliente podía escribir la dirección, pero el pin —lo que el
   equipo necesita para cotizar el flete— no aparecía. (Fase 9)

Y el riesgo que **sigue abierto**: la política de escritura de la tabla de cotizaciones es
`with check (true)`. Cualquiera con la clave pública —que viaja en el HTML, como corresponde—
puede escribir en esa tabla. La migración que lo cierra está escrita y sin ejecutar, porque
exige dos decisiones que no son mías.

Al cerrar: **0 errores de tipos, 0 errores de lint, 81 pruebas en verde, 0 vulnerabilidades
en lo que viaja al navegador, 0 enlaces internos rotos, 0 violaciones de accesibilidad en
9 páginas**, y rendimiento entre 92 y 100 en las cuatro páginas clave.

---

## 2. Qué se hizo en cada fase

**Fase 1 — El cotizador perdía solicitudes en silencio.** La solicitud se mandaba al ERP sin
esperar la respuesta y justo después el navegador abría WhatsApp, imprimía o navegaba: la
petición se cortaba a medio camino. Y si el servidor la rechazaba, el error se tragaba — el
cliente veía su WhatsApp abierto y creía que había cotizado. Ahora se registra, se espera, y
solo entonces se abre el canal; el fallo se le dice. Se preparó la migración de RLS, sin
ejecutar.

**Fase 2 — Los datos del ERP.** Se arregló la caché de la API. La unidad de venta pasó a
tener una sola fuente (`src/data/unidades.ts`) y la decide el ERP, que es quien factura;
donde no hay con qué convertir un precio, la línea dice «Consultar» en vez de inventar una
cifra. Sincronizar dejó de ser parte del build: `npm run sync` es un paso aparte cuyo
resultado queda en git para revisarlo antes de publicar.

**Fase 3 — Seguridad.** Astro 6 → 7 cerró 12 vulnerabilidades. Se añadieron cabeceras de
seguridad y una política de contenido (CSP) con un comando que la verifica contra el sitio
construido. Las reseñas dejaron de cargarse con JSONP —que es ejecutar código ajeno— y pasaron
a `fetch` con CORS.

**Fase 4 — Rendimiento e imágenes.** Pipeline de imágenes a cuatro anchos en WebP y AVIF.
Medido en producción: rendimiento 83–98 → **100**, LCP hasta 4,7 s → **1,2–1,9 s**, peso de
página hasta 3.199 KB → **475–768 KB**. Detalle en [`rendimiento.md`](rendimiento.md).

**Fase 5 — Medición.** La conversión dejó de ser el clic y pasó a ser la fila escrita en el
ERP. Consent Mode v2. El origen de la campaña (UTM, gclid) viaja con la solicitud, así que
quien la abre en el ERP ve de dónde llegó. Detalle en
[`marketing-y-medicion.md`](marketing-y-medicion.md).

**Fase 6 — Accesibilidad.** De 57 elementos con problemas a **0** en 9 páginas, medido con
axe. Foco atrapado en los diálogos, `Escape` que cierra y devuelve el foco, contraste
corregido —el botón «Rechazar» del banner de cookies era crema sobre gris, 1,11:1, es decir
invisible—. Se añadió una prueba de teclado automatizada.

**Fase 7 — SEO y promesas.** Títulos que dicen qué se vende, categorías con texto propio,
datos estructurados de producto con su unidad de precio. Se contrastó lo que la página
promete con lo que la fábrica hace: gerencia confirmó cuatro promesas comerciales y descartó
publicar plazos de producción, así que las FAQ dicen lo que sí es cierto —que se confirma al
cotizar—.

**Fase 8 — El camino comercial.** De la primera pantalla al acuse de recibo: portada
reordenada, página de gracias propia, el error de validación junto al campo que lo causa en
vez de un `alert()`.

**Fase 9 — El código.** Lo de abajo.

---

## 3. La Fase 9 en detalle

### Lo que se partió

| Archivo                            | Antes | Ahora     |
| ---------------------------------- | ----- | --------- |
| `src/components/QuoteCart.astro`   | 880   | **114**   |
| `src/pages/cotizacion.astro`       | 1.101 | **434**   |
| `src/pages/productos/[slug].astro` | 2.195 | **2.108** |

El cajón lateral de cotización (880 líneas) duplicaba exactamente lo que hace `/cotizacion`,
y casi nunca se veía: desde que agregar un producto lleva directo al cotizador, solo aparecía
si alguien volvía a una ficha con cosas guardadas. Dos interfaces para lo mismo, una
escondida, y la escondida se llevaba 17 de los 54 errores de tipos del proyecto.

Las 440 líneas que vivían dentro del `<script>` de `/cotizacion` eran el problema de fondo:
un `<script define:vars>` no admite `import`, así que la validación, el precio, el texto de
WhatsApp y la fila del ERP tenían que estar ahí, sin tipos y sin forma de probarlas. Ahora:

- **`src/utils/cotizador.ts`** — la lógica, sin DOM: qué es válido, cuánto vale, cómo se
  escribe la solicitud, qué fila recibe el ERP, qué se le reporta al medidor. 20 pruebas.
- **`src/scripts/cotizacion/`** — seis módulos que solo leen el formulario y pintan:
  `config`, `lineas`, `documento`, `ubicacion`, `envio`, `index`.
- **`src/components/cotizacion/LineaDeCotizacion.astro`** — el selector de producto, ahora
  renderizado por el servidor.
- **`src/utils/fichaProducto.ts`** — las 190 líneas de preparación de datos que estaban
  encima de la plantilla de la ficha: galería, fichas en PDF con versión por contenido,
  filas de especificaciones. 15 pruebas.
- **`src/utils/pesos.ts`** — las dos funciones de dinero, sin dependencias, para que el
  navegador las use sin arrastrar el feed del ERP.

### Lo que se encontró al partirlo

1. **El mapa nunca cargó en producción** (ver el resumen). Al pasar a un módulo empaquetado,
   Leaflet se resuelve y se carga en diferido: quien recoge en planta no lo descarga.
2. **Dos canales pulsados rápido insertaban dos filas en el ERP.** Cada botón se deshabilita
   a sí mismo, así que pulsar WhatsApp y enseguida Imprimir dejaba dos manejadores corriendo;
   el segundo leía la bandera «ya registrada» todavía en falso y mandaba una segunda
   solicitud. Dos pedidos idénticos en la bandeja y el equipo llamando dos veces. Lo encontró
   ESLint (`require-atomic-updates`); se arregló compartiendo la petición en vuelo.
3. **Dos mapas sobre el mismo div.** Dos clics seguidos en «Editar ubicación» entraban los
   dos mientras Leaflet cargaba; el segundo mapa tapaba al primero y el pin dejaba de
   responder.
4. **`/productos/teja-s` publicaba un `<img>` roto y un enlace a ninguna parte.** La foto
   venía del ERP con su propio prefijo (`/productos/products/…` donde acá es `/images/…`), y
   la pastilla «Rendimiento» se dibujaba con una condición distinta a la de la sección, así
   que el clic no llevaba a ningún lado.
5. **`.chip`, `aria-hidden` duplicado, un array disperso, un `return` inalcanzable** y 17
   funciones exportadas que ya no usaba nadie — restos del cajón borrado y de versiones
   viejas de la galería. También dos comentarios de Astro escritos _entre atributos_, que
   compilan pero impedían a ESLint leer dos archivos, uno de ellos la página más larga.

### Las herramientas que no existían

```
npm run check              tipos (astro check)
npm run lint               ESLint con reglas elegidas a mano
npm run format[:check]     Prettier
npm test                   81 pruebas en 6 archivos
npm run verificar          las cuatro de arriba, en orden
npm run verificar:enlaces  enlaces internos, anclas y sitemap  ← nuevo
npm run verificar:imagenes toda referencia de imagen del HTML
npm run probar:cotizador   el camino de la ficha al cotizador  ← nuevo
```

Más `.github/workflows/verificar.yml`, que corre todo eso en cada empujón —incluidas las
pruebas de navegador— y no publica nada. Y `scripts/lib/navegador.mjs` ahora busca Chrome en
macOS y en Linux: la búsqueda estaba escrita tres veces y solo una sabía mirar en Linux, que
es justo donde hacía falta.

Las reglas de ESLint están elegidas y comentadas: las que `astro check` ya cubre están
apagadas a propósito. Cómo se usa todo esto está en [`desarrollo.md`](desarrollo.md).

### Tres regresiones que introduje, y cómo salieron

Las digo porque son la prueba de que las comprobaciones sirven:

- **CLS 0,236 en `/cotizacion`.** El módulo empaquetado es diferido: el formulario se pintaba
  vacío y crecía de golpe. Producción, con el script en línea, medía 0,002. Se arregló
  renderizando la primera línea en el servidor; el módulo la adopta en vez de crearla. Ahora
  **0,000** en móvil, y la página subió de 88 a **100**.
- **Un `TypeError` en consola en todas las páginas.** Al filtrar las fotos que faltan añadí
  `node:fs` a `erpProductos.ts`, que sí viaja al navegador por la cadena del carrito. El
  chequeo en disco se movió a `fichaProducto.ts`, que solo corre en el servidor.
- **Una fila «Dimensiones» vacía en `/productos/calado`.** La condición miraba el objeto de
  dimensiones y no la línea; el calado los tiene vacíos. La encontró una comparación del HTML
  construido, página por página, antes y después del cambio. Hay una prueba que la fija.

---

## 4. Decisiones técnicas que conviene conocer

**El ERP manda en los datos; la web manda en los textos.** Precio, unidad, código y
disponibilidad los decide el ERP, que es quien factura. Los textos de venta, las fotos de
marca y las promesas las decide la web. `npm run verificar:datos` lista todo lo que no
coincide con la fuente que debería prevalecer en cada caso.

**Donde no hay dato, no hay cifra.** Si un precio no se puede expresar en la unidad en que se
cotiza, la línea dice «Consultar». Si una foto que el ERP nombra no está en el repositorio,
no se publica. Si un producto no tiene código del ERP, no entra al cotizador: ofrecer algo
que el ERP no sabe atender genera solicitudes que nadie puede procesar.

**La conversión es la fila escrita, no el clic.** `generate_lead` se dispara solo cuando el
servidor confirma. Si el cliente usa los tres canales, cuenta una sola vez.

**Sincronizar es un paso deliberado.** `npm run build` no toca ningún archivo versionado.

**La medición nunca lleva datos personales.** Al medidor viaja el pedido —código, categoría,
cantidad, valor, moneda, canal—; el nombre, el teléfono, el correo y la dirección se quedan
en la solicitud. Hay una prueba que lo comprueba en un navegador real.

**Lo que decidí NO hacer, y por qué:**

- **No formateé el repositorio.** Pasar Prettier cambia unos 65 archivos (+3.200 / −3.700
  líneas) sin cambiar comportamiento. Mezclado con esta auditoría haría la revisión
  imposible. `npm run format` está listo; conviene hacerlo en un commit propio. Por eso
  `format:check` no está en el CI.
- **No partí el CSS de `[slug].astro` ni de `index.astro`.** De sus 2.108 y 1.296 líneas, la
  mayoría es CSS con ámbito acoplado al marcado. En Astro, mover una sección a un componente
  cambia en silencio a qué elementos llega cada regla, y no tengo con qué demostrar que no
  rompe nada visual: haría falta una comparación de estilos calculados en el navegador, antes
  y después, página por página. Sí saqué lo que podía verificar —la lógica— y la comparación
  del HTML construido salió idéntica en las 45 páginas.

---

## 5. Rendimiento

Fases 1–8, **medido en producción** tras desplegar (detalle en
[`rendimiento.md`](rendimiento.md)):

| Página           | Rendimiento  | LCP               | Peso               |
| ---------------- | ------------ | ----------------- | ------------------ |
| Inicio           | 94 → **100** | 3,0 s → **1,3 s** | 1.902 → **664 KB** |
| Ficha del Romano | 91 → **99**  | 3,5 s → **1,9 s** | 835 → **516 KB**   |
| Cotizador        | 98 → **100** | 1,8 s → **1,2 s** | 3.199 → **475 KB** |
| Artículo técnico | 83 → **100** | 4,7 s → **1,4 s** | 1.491 → **635 KB** |

Fase 9, **medido en local** sobre el sitio construido (la Fase 9 no está desplegada; conviene
repetirlo en producción después de publicar):

| Página                                     |            | Rend.   | Acces. | Prácticas | SEO | LCP       | CLS       |
| ------------------------------------------ | ---------- | ------- | ------ | --------- | --- | --------- | --------- |
| `/`                                        | móvil      | 99      | 100    | 96        | 100 | 1,6 s     | 0,002     |
|                                            | escritorio | 99      | 100    | 96        | 100 | 0,9 s     | 0,006     |
| `/productos/romano`                        | móvil      | 99      | 100    | 96        | 100 | 1,6 s     | 0,000     |
|                                            | escritorio | 100     | 100    | 96        | 100 | 0,7 s     | 0,000     |
| `/cotizacion`                              | móvil      | **100** | 100    | 100       | 100 | 1,4 s     | **0,000** |
|                                            | escritorio | **100** | 100    | 100       | 100 | 0,4 s     | 0,007     |
| `/blog/especificacion-de-ladrillo-en-obra` | móvil      | 92–98   | 100    | 96        | 100 | 2,2–2,7 s | 0,014     |
|                                            | escritorio | 100     | 100    | 96        | 100 | 0,5 s     | 0,001     |

Fase 9, **medido en producción** tras desplegar (21 de octubre, 12eea44):

| Página                                     |            | Rend. | Acces. | Prácticas | SEO | LCP   | CLS   |
| ------------------------------------------ | ---------- | ----- | ------ | --------- | --- | ----- | ----- |
| `/`                                        | móvil      | 97    | 100    | 92→       | 100 | 2,4 s | 0,005 |
|                                            | escritorio | 100   | 100    | 92→       | 100 | 0,6 s | 0,006 |
| `/productos/romano`                        | móvil      | 91    | 100    | 92→       | 100 | 3,3 s | 0,008 |
|                                            | escritorio | 97    | 100    | 92→       | 100 | 1,3 s | 0,000 |
| `/cotizacion`                              | móvil      | 99    | 100    | 92→       | 100 | 1,7 s | 0,002 |
|                                            | escritorio | 100   | 100    | 92→       | 100 | 0,5 s | 0,008 |
| `/blog/especificacion-de-ladrillo-en-obra` | móvil      | 95    | 100    | 92→       | 100 | 2,7 s | 0,05  |
|                                            | escritorio | 100   | 100    | 92→       | 100 | 0,4 s | 0,001 |

Medido minutos después del despliegue, con la caché de borde de Vercel fría para los
archivos nuevos: los LCP de móvil están por encima de los locales por eso, y conviene
repetirlo en unos días. El CLS sí es definitivo y está en orden en las ocho.

El **92 de «prácticas recomendadas»** llevó al hallazgo del punto 10: la CSP bloqueaba
`pagead2.googlesyndication.com`, el endpoint al que el gtag de Google Ads manda las
conversiones. Ya está corregido —`4afb0d7`— y vuelto a medir: **100 en las cuatro páginas, sin
un solo bloqueo y sin errores de consola**. La columna dice «92→» porque se midió antes.

### Una medición que no cierra, y conviene decirlo

`/productos/romano` en móvil da **89–90 con LCP 3,5 s** desde esta máquina contra producción,
repetido tres veces (el 91 y el 73 de la tabla son el mismo número con ruido de red: 73 fue
un valor atípico). En la Fase 4, la misma página se registró en 99 con LCP 1,9 s, y hoy en
local da 99 con 1,6 s.

Lo que sí está comprobado: el HTML de esa página es **idéntico byte a byte** al de antes de
los cambios de la Fase 9, su foto principal lleva el `srcset` completo de cuatro anchos en
WebP con `width`/`height` y `loading="eager"`, el servidor responde en 82–139 ms, el TBT es
de 70–90 ms y **ninguna auditoría de oportunidad de Lighthouse falla**. Ese perfil —primer
pintado lento sin nada que lo explique— es latencia de red, no código.

Lo que no puedo zanjar desde acá: si el 1,9 s de la Fase 4 y el 3,5 s de hoy son la misma
página en dos redes distintas, o si algo cambió en el medio. Una sola máquina no lo
distingue. El instrumento que lo resuelve es PageSpeed Insights en el navegador
(pagespeed.web.dev, que corre desde la infraestructura de Google; su API por cuota anónima
está agotada) o los datos de campo de CrUX en Search Console, que es lo que de verdad miden
los visitantes reales.

Y una mejora concreta que apareció al mirarlo: **la ficha de producto no precarga su foto
principal**, mientras la portada sí lo hace (`heroPreloadSrcset` en `index.astro`). Sobre una
conexión lenta el navegador no descubre esa imagen hasta haber leído el HTML y el CSS. Es
barato y probablemente explica parte de la diferencia, pero es un cambio de rendimiento —hay
que medirlo antes y después— y no entra en esta fase.

---

## 6. Build, tipos, pruebas y vulnerabilidades

Corrido entero, en este orden, sobre una instalación limpia:

```
npm ci                   → 0 vulnerabilidades
npm run check            → 0 errores, 0 advertencias, 1 aviso¹
npm run lint             → 0 errores, 19 advertencias²
npm test                 → 81 pruebas, 6 archivos, todas en verde
npm run build            → 45 páginas
npm run verificar:enlaces → 0 enlaces internos rotos · 0 anclas rotas · sitemap coincide
npm run verificar:imagenes → 2.256 referencias de imagen, ninguna rota
npm run verificar:csp    → todo lo que la página carga está permitido
npm run probar:cotizador → 17 comprobaciones en verde
npm run probar:medicion  → 13 comprobaciones en verde
npm run probar:accesibilidad → 0 violaciones en 9 páginas + 10 de teclado
npm audit --omit=dev     → 0 vulnerabilidades
```

Los tipos pasaron de **80 errores a 0**. Las pruebas, de **0 a 81**.

¹ El único aviso es un falso positivo: el comprobador no ve las variables que Astro inyecta
con `define:vars` en `ReviewForm.astro`.
² Las 19 advertencias son `no-non-null-assertion` y `no-explicit-any`, dejadas como
advertencia a propósito: son decisiones de estilo, no errores.

Además, el JSON-LD de las páginas clave se revisó a mano: 10 bloques, 0 inválidos
(`LocalBusiness`, `Product`, `BreadcrumbList`, `BlogPosting`).

---

## 7. Conflictos del ERP que piden una decisión humana

`npm run verificar:datos` lista **80**, con la acción de cada uno en `erp-divergencias.md`.
Por tipo: 47 en fichas técnicas en PDF, 8 de fotos, 7 de precio, 5 de dimensiones, 4 de
publicación, 4 de peso, 3 de código, 1 de unidad de venta.

Ninguno es un error de código: son dos fuentes que dicen cosas distintas y alguien tiene que
decidir cuál vale. Hoy **ninguno bloquea el despliegue**: `verificar-datos --strict` sale con
código 0. Los que no deberían esperar:

**Cinco fotos que el ERP nombra y el repositorio no tiene.** La ficha ya no publica una
imagen rota, pero la foto sigue faltando:

```
teja-s            /productos/products/teja-s/DSC_9381.jpg
cartagena         …/cartagena/natural/Cartagena Claro.webp
teja-plana        …/teja-plana/natural/Teja Plana Natural.webp
teja-colonial     /productos/teja-colonial.jpg
macizo-campesino  …/macizo-campesino/matizado claro/Campesino Claro.webp
```

Hay que subirlas al repositorio en esa ruta, o quitar la referencia en el ERP.

**Tres productos que la web tiene y el ERP ya no publica:** Napolitano, Enchape Rústico y
Enchape Bocadillo. Tienen ficha escrita a mano, PDF publicado y un código en el mapa de la
web —`NAP`, `ENC-RUS`, `ENC-BOC`— que el ERP no reconoce. No entran al cotizador, por el
criterio de no ofrecer lo que el ERP no sabe atender, pero sus páginas siguen en pie. Hay que
decidir: o el ERP los vuelve a publicar con su código, o se bajan de la web.

_(Corrección: una versión anterior de este informe decía que eran «productos publicados sin
código» y que eso cortaba el despliegue. Las dos cosas estaban mal. Es al revés —la web
tiene códigos que el ERP no tiene— y no corta nada: `verificar-datos --strict` sale con
código 0. La regla que sí bloquea existe, para un producto que el ERP publique sin código,
pero hoy no la incumple ninguno.)_

**Teja Colonial: el campo manda, y está bien.** Su registro en el ERP se contradice —el
campo «unidad de venta» dice `unidad`, la descripción dice «Unidad de venta m²»— y es el
mismo producto del error de veinte veces de la Fase 2. **Gerencia confirmó el 21 de octubre
de 2026 que el campo es el correcto**: se vende por unidad, a $ 1.600 la teja. La frase de la
descripción es texto que quedó viejo cuando se corrigió el campo.

No hay nada que arreglar en la web: sigue el campo. `verificar:datos` seguirá mostrando esa
fila mientras la frase siga escrita así en el ERP, y conviene que lo haga —es la única señal
de que ese texto miente— pero ya está adjudicada: no hay que volver a investigarla.

**La hoja de inventario nunca se publicó.** La disponibilidad sigue siendo la semilla inicial
del 9 de julio de 2026: hoy el único filtro real es lo que el ERP marque para la web.

**Teja S no tiene textos de venta.** Su ficha está armada sola con los datos del ERP —nombre,
medidas, rendimiento, peso, norma—, que son ciertos. No se le inventó prosa comercial.

---

## 8. La escritura en la tabla de cotizaciones: cerrada el 21 de octubre

`supabase/cotizaciones-rls.sql`, aplicado por gerencia sobre `clayhouse-erp-dmo`
(`xmgsljwxiyyporczsrum`). **Estado final: una sola política, de inserción, para el rol
`anon`; RLS activo; ninguna restricción de tabla.** Ya no es cierto que cualquiera con la
clave publicable pueda escribir lo que quiera.

Conviene dejar escrito cómo se llegó ahí, porque hubo dos errores míos y los dos son de
entrega, no de SQL.

**No hay proyecto de Supabase para la web, y no debe haberlo.** La web escribe dentro de la
base del ERP, para que la solicitud aparezca en su bandeja como borrador `WEB-…` en vez de en
una base aparte que nadie mira. El mismo proyecto sirve las fotos de producto del ERP y la
tabla `cotizaciones`: es el del ERP.

**Primer error: el archivo asumía que se podía correr paso a paso.** Venía en tres pasos con
la instrucción de leer el Paso 0 antes de seguir, pero el editor SQL de Supabase ejecuta todo
lo que se le pega y muestra solo el último resultado con filas. Pegarlo entero corrió los
tres pasos, y en pantalla salió la comprobación del Paso 1 —parecía que solo había corrido
eso—. La instrucción estaba en un comentario, y la herramienta no lee comentarios. (Volvió a
pasar con el archivo de comprobación, que tenía cinco consultas: se veía la quinta. Ahora
todo va en una sola consulta que devuelve una fila.)

**Segundo error, el de fondo: metí restricciones de tabla en una tabla compartida.** El Paso 2
añadía dos —nombre ≤ 120 y líneas ≤ 40—, y una restricción de tabla aplica a todos, incluidas
las credenciales de servicio con las que entra el ERP. Peor: el tope de 40 líneas lo
justifiqué con que el catálogo cotizable de la web tiene 23 opciones, un argumento que no
dice nada sobre el ERP. **28 de las 34 filas de esa tabla las puso el ERP**, y una cotización
interna de un proyecto grande puede pasar de 40 renglones sin que eso sea un abuso: habría
empezado a fallar al guardar, días o semanas después, sin que nadie lo conectara con esto.

Lo detectó gerencia preguntando «¿no será que vamos a descontrolar el ERP?». Se retiraron con
`cotizaciones-rls-quitar-paso2.sql` y se verificó: `restricciones_que_quedan = 0`, política
intacta, RLS activo.

**La política sí se queda, y no toca al ERP.** Es demostrable: antes de tocar nada, leer esa
tabla con la clave publicable devolvía cero filas cuando ya tenía 34. RLS estaba activo y
ninguna política daba acceso a nadie salvo a la web, y sin embargo el ERP llevaba 28
cotizaciones escritas y leyéndolas. La única explicación es que entra con credenciales de
servicio, que se saltan RLS. Una política ataña a un rol; una restricción, a la tabla. **En
una tabla compartida, lo que se le pone a un invitado se le pone por su rol.**

**Confirmado el 21 de octubre con `cotizaciones-rls-diagnostico.sql`: `web_rechazadas = 0`.**
Las 6 solicitudes que la web ha mandado pasan la política nueva, así que el cotizador no
rechaza nada. Las 9 que no pasan son todas del ERP —4 por no traer teléfono, que una
cotización interna no tiene por qué traer— y la política no lo gobierna a él.

El mismo diagnóstico obliga a matizar lo dicho arriba: `viola_restriccion_nombre` y
`viola_restriccion_lineas` dieron **0**. Ninguna fila existente incumplía las dos
restricciones que se retiraron, así que no había nada roto; el riesgo era futuro, la primera
cotización del ERP con más de 40 renglones. Retirarlas seguía siendo lo correcto —cero
beneficio para la web, riesgo distinto de cero para el ERP— pero no se estaba apagando un
incendio, y conviene que quede escrito con esa proporción.

**Lo que sigue sin resolver:** no hay límite de peticiones por IP. Nada impide insertar miles
de filas válidas con la clave pública. Exige una Edge Function delante o el rate limiting del
propio Supabase. Lo aplicado acota QUÉ se puede escribir; no CUÁNTAS veces.

## 9. Configuración externa pendiente (no se puede hacer desde el código)

1. **Marcar `generate_lead` y `whatsapp_click` como eventos clave en GA4** e importarlos a
   Google Ads. Sin esto la medición está bien instalada pero no se usa para optimizar.
2. **Añadir la columna `empresa` a la hoja de reseñas y a su Apps Script.** Tres pasos,
   documentados en [`marketing-y-medicion.md`](marketing-y-medicion.md).
3. **Publicar la hoja de inventario**, o decidir que la disponibilidad la decide solo el ERP.
4. **Decidir sobre la migración de RLS** (punto 8).

---

## 10. Riesgos que quedan

**Corregido al verificar en producción, y vale contarlo porque explica cómo apareció:** la
CSP bloqueaba `pagead2.googlesyndication.com`, el endpoint al que el gtag de Google Ads manda
las conversiones (`/ccm/collect?tid=AW-11432934112`). El navegador lo bloqueaba sin decir
nada, en las cuatro páginas medidas. La medición de Ads llegaba incompleta, justo cuando el
pendiente es importar esas conversiones. `verificar:csp` no podía encontrarlo: ese comando
compara la política con los dominios que aparecen en el sitio construido, y este no aparece
en ningún archivo —lo decide la librería de Google en tiempo de ejecución—. La única
comprobación que sirve para dominios así es cargar la página publicada en un navegador, que
es lo que hace Lighthouse. **Conviene repetirlo cada vez que se toque la medición.**

**El envío de reseñas no puede confirmar.** `ReviewForm` escribe en Apps Script con
`mode: "no-cors"`: el navegador no puede leer la respuesta, así que la página lleva al
visitante a «gracias» aunque la fila no se haya escrito. Es el mismo patrón que se corrigió
en el cotizador en la Fase 1, y es el único camino del sitio que sigue a ciegas.

**La escritura en la tabla de cotizaciones quedó cerrada** el 21 de octubre (punto 8). Lo que sigue
abierto de ese frente es el límite de peticiones por IP.

**El CSS de las dos páginas grandes sigue sin partir** (punto 4). No es un riesgo de
funcionamiento; es deuda que encarece cada cambio futuro en esas páginas.

**No hay prueba de regresión visual.** Las comprobaciones cubren tipos, lógica, enlaces,
imágenes, accesibilidad, medición y el recorrido comercial. Lo que ninguna cubre es el
aspecto: un cambio de CSS que descoloque algo pasaría todas las puertas. Es lo que haría
falta para poder partir el CSS con tranquilidad.

**El peso del repositorio, medido bien el 21 de octubre.** Lo que decía antes este punto
—«38,5 MB de fotos sin referenciar»— estaba mal medido y llevaba a la acción equivocada.

Hay 68,2 MB de imágenes que no aparecen referenciadas en ninguna parte, pero los dos bloques
grandes son **fotografía de obra de los productos que el ERP dejó de publicar**: 26,3 MB del
proyecto Boro (Enchape Bocadillo) y 4,3 MB del edificio Gres (Enchape Rústico). No es basura;
son activos que quedaron sin usar porque el producto está fuera del catálogo, y borrarlos
sería destruir trabajo por un estado temporal. Quedan atados a la decisión del punto 7.

De las variantes generadas en `_responsive` —86,3 MB en 1.438 archivos— **ninguna está
huérfana**: `generate-responsive.mjs` ya limpia las obsoletas. Lo único discutible ahí es que
sean salida de build versionada; sacarlas de git las haría regenerarse en cada despliegue, lo
cual es una decisión con su contrapartida, no higiene.

**Lo que sí es desperdicio claro: 26 originales de cámara por encima de 900 KB, 101,6 MB en
total**, a resoluciones de 3944 × 7008. El sitio nunca sirve esos archivos —la cadena de
imágenes genera variantes de hasta 1.200 px en las fichas y 1.920 px en la portada—, así que
su tamaño no afecta en nada a lo que descarga un visitante: solo al peso del repositorio y al
tiempo de build. Reducirlos a 2.400 px con calidad 82 ahorra entre el 58 % y el 86 % por
archivo —medido sobre copias— sin tocar ninguna resolución que el sitio use. Unos 70 MB.

El historial de git pesa 2,45 GB, y eso no lo arregla borrar ni optimizar nada de lo anterior:
exige reescribir el historial, que no se toca sin autorización expresa.

Queda además un `audit.json` suelto en la raíz, de una revisión del catálogo del 14 de
octubre. Sin seguimiento en git, 4,7 KB.

**La Fase 9 no está desplegada.** Todo lo de arriba está verificado en local y, donde se
podía, contra producción. Los números de rendimiento de la Fase 9 y el 96 de «prácticas
recomendadas» conviene repetirlos en producción después de publicar.
