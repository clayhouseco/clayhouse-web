# Rendimiento e imágenes

Qué pesaba, qué pesa ahora y qué queda por decidir.

---

## 1. Lo que ve un cliente

Lighthouse móvil, contra el sitio publicado, antes y después de la Fase 4:

| Página | Rendimiento | LCP | CLS | Peso total |
|---|---|---|---|---|
| Inicio | 94 → **100** | 3,0 s → **1,8 s** | 0,000 → 0,003 | 1.902 → 1.645 KB |
| Ficha del Romano | 91 → **99** | 3,5 s → **1,9 s** | 0,000 → 0,004 | 835 → 882 KB |
| Cotizador | 98 → **100** | 1,8 s → **1,2 s** | 0,026 → **0,000** | 3.199 → **475 KB** |
| Artículo técnico | 83 → **100** | 4,7 s → **1,5 s** | 0,014 → 0,014 | 1.491 → **635 KB** |

Los objetivos de la auditoría —LCP bajo 2,5 s, rendimiento sobre 90, CLS cerca de 0— se
cumplen en las cuatro.

Y lo que se descarga al abrir la página, simulando un teléfono de 390 px:

| | Antes | Ahora |
|---|---|---|
| Inicio | 506 KB | **241 KB** |
| Catálogo | 217 KB | **162 KB** |
| Ficha del Romano | 577 KB | **354 KB** |
| Artículo del blog | 365 KB | **157 KB** |
| Carrusel del cotizador | 2.784 KB | **90 KB** |

---

## 2. Qué estaba mal

Las cuatro cosas eran la misma: se servía el archivo grande donde se ve chico.

**El hero se descargaba dos veces.** La portada precargaba un AVIF de 1920 px con
`fetchpriority="high"` —202 KB en un teléfono— y el `<img>` de abajo ofrecía un srcset de
WebP, así que el navegador se traía además el WebP de 960 y pintaba ese. El archivo más
pesado de la página no llegaba a verse nunca. Ahora el `<picture>` ofrece AVIF con WebP
detrás y el `preload` lleva el **mismo** `imagesrcset` y el mismo `sizes`: es la única forma
de que las dos cosas resuelvan al mismo candidato. Una descarga, 40 KB.

**`<Image formats={["avif","webp"]}>` no hacía nada.** `formats` es una propiedad de
`<Picture>`, no de `<Image>`: los seis héroes del sitio salían solo en WebP. Convertidos, el
del catálogo pasó de 117 a 57 KB.

**El generador de variantes solo miraba los JPG.** Las fotos de producto —las que abren la
ficha y llenan el catálogo— son casi todas `.webp`, así que se quedaban sin reducir justo
las que más pesan en la primera pantalla: la ficha del Romano abría con 247 KB para pintar
la foto a 390 px. Ahora entran jpg, png y webp, en cuatro anchos y en WebP.

**El cotizador pedía la foto completa para una miniatura de 72 px.** Veintidós fotos de
250-350 KB, 2,8 MB, para un carrusel de cuadritos. Ahora pide la de 320 px: 90 KB en total.
La foto grande se conserva porque el feed de Merchant Center la necesita.

Y en los artículos: la portada —que es el LCP— servía 1.600 px sin `srcset`, y las fotos del
cuerpo no declaraban medidas, que es lo que provoca el salto de maquetación mientras cargan.

### Los cuatro anchos

`scripts/generate-responsive.mjs` genera, de cada foto, lo que hace falta en cada sitio:

| Ancho | Dónde se usa |
|---|---|
| 320 | miniaturas: carrusel del cotizador, tira del visor |
| 480 | tarjeta en teléfono |
| 800 | tarjeta en escritorio, galería en teléfono |
| 1200 | galería grande y visor a pantalla completa |

Se exportan en WebP —pesa ~15% menos que el JPEG equivalente— y el archivo original queda
como `src` de respaldo para quien no lo soporte. Son artefactos de build: no se versionan y
se regeneran solos. Un arranque en frío tarda unos 50 segundos.

---

## 3. Lo que queda, y es una decisión suya

Nada de esto afecta a quien visita la página: hoy ninguna de estas fotos se descarga. Pesan
en el repositorio y en cada despliegue.

**a. 38,5 MB de fotos que ninguna página nombra.** Casi todas son de `enchape-bocadillo`
(26,7 MB) y `enchape-rustico` (4,6 MB), los dos productos que el ERP dejó de publicar: sin
ficha que las muestre, viajan en cada despliegue sin que nadie las pida. Si vuelven al ERP,
se usan otra vez; si no van a volver, lo suyo es sacarlas de `public/` a una carpeta de
archivo. Es la misma decisión que aparece en la tabla de conflictos de la Fase 2.

**b. Quince fotos de cámara de entre 1,5 y 6,5 MB.** Nada las sirve a ese tamaño —lo más
grande que se publica son 1.200 px— así que están ahí como original de archivo. Reducirlas a
1.600 px ahorraría unos 40 MB sin que cambie nada de lo que se ve. Requiere su visto bueno:
son los originales.

**c. El historial de Git pesa 2,45 GB.** No es el sitio: son archivos que se subieron y
luego se borraron —videos `.MOV` de 22 MB, fotos de 47 MB de una línea de pisos que ya no se
fabrica— y que siguen dentro del historial. Lo único que lo arregla es reescribir el
historial, que rompe todas las copias que ya existen del repositorio y **no se hace sin su
autorización expresa**. Git LFS tampoco arregla lo ya subido; serviría de aquí en adelante.
Mientras tanto el costo es clonar lento, y nada más: Vercel no descarga todo el historial
para desplegar.

---

## 4. Cómo medir otra vez

```bash
npm run build
npx lighthouse https://clayhouse.com.co/ --form-factor=mobile --screenEmulation.mobile \
  --only-categories=performance --chrome-flags="--headless=new"
```

Conviene medir contra el sitio publicado y no contra `localhost`: en local no hay red de por
medio y los números salen siempre mejores de lo que vive un cliente en una obra.
