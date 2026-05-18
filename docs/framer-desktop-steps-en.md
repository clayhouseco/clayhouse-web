# Clay House en Framer Desktop — paso a paso (UI en inglés)

Guía detallada para la app de escritorio. Asumes que **ya cambiaste el fondo** de la Home.

---

## Cómo leer la pantalla

```
┌─────────────┬──────────────────────────────┬─────────────┐
│  Barra      │         CANVAS               │  Panel      │
│  izquierda  │    (diseño Desktop 1200)     │  DERECHO    │
│  (iconos)   │                              │  (Properties)│
└─────────────┴──────────────────────────────┴─────────────┘
     ↑                                              ↑
  Insert, Pages, Assets, CMS              Aparece al seleccionar algo
```

- **Arriba centro:** nombre del proyecto `Clay House` + badge `FREE`
- **Arriba derecha:** botón azul **Publish**, icono **Play** (preview)
- **Abajo centro:** zoom (ej. 50%), botón **Upgrade Now**

---

## Barra izquierda — qué hace cada icono

De arriba hacia abajo (los iconos verticales, **no** el panel Insert que ya conoces):

| Si el icono parece… | Se llama | Para qué |
|---------------------|--------|----------|
| Páginas / lista | **Pages** | Ver Home, Shop, About, Contact… |
| Signo **+** | **Insert** | Añadir Sections, Forms… (ya lo tienes abierto) |
| Cuadrados / capas apiladas | **Assets** | **Colors** y **Text** styles (marca) |
| Base de datos | **CMS** | Productos, proyectos, blog |
| Cubo / piezas | **Components** | Piezas reutilizables (Nav, Footer…) |

**Importante:** Colores y fuentes globales están en **Assets**, no en Insert.

Si no ves la barra: menú macOS **Window** → marca **Toolbar**, **Pages**, **Assets**.

---

## PASO 1 — Crear los colores de marca (Assets)

1. Clic en el icono **Assets** (barra izquierda).
2. En el panel que se abre, busca la sección **Colors** (o pestaña **Styles** → **Colors**).
3. Clic en **+** (Add) o **New Color Style**.
4. Crea cada color con **nombre** y **HEX**:

| Name (en Assets) | Hex |
|------------------|-----|
| chocolateProfundo | `#472410` |
| terracotaClay | `#7C482C` |
| salmonSuave | `#F99A91` |
| coralVivo | `#EF5843` |
| ambarArcilla | `#F2A141` |
| fondoNeutro | `#FFFBF9` |

5. Para asignar un color a un elemento:
   - Clic en ese elemento en el **canvas**
   - Panel **derecho** → sección **Fill** (o **Background**)
   - Clic en el cuadro de color → elige tu **Color Style** (ej. `terracotaClay`)

*(El fondo de página ya lo hiciste; usa el mismo método para botones y el menú superior.)*

---

## PASO 2 — Tipografía (Assets → Text)

1. **Assets** → sección **Text** (Text Styles).
2. Verás estilos del template (ej. Heading, Body, Display…). Abre el que use el título grande de la Home.
3. Panel derecho al editar el style:
   - **Font** → busca **Helvetica Neue** → **Bold**  
     (si no está: **Neue Haas Grotesk** → Bold)
   - **Size** → 64 (desktop; luego ajustas en móvil)
   - **Letter spacing** → ligeramente abierto si quieres look “extended”
4. Abre el estilo de **cuerpo / párrafo**:
   - **Font** → **Montserrat**
   - **Weight** → **Light** (300)
   - **Size** → 17
   - **Line height** → 1.6

5. Aplicar en el canvas:
   - Clic en un texto (ej. el párrafo bajo el título)
   - Panel derecho → **Type** → dropdown **Style** → elige el Text Style que editaste

---

## PASO 3 — Abrir el panel Layers (capas)

Necesitas Layers para borrar el “0%” y el bloque de instrucciones.

**Opción A — Atajo Mac:** selecciona algo en el canvas y mira el **panel derecho**; arriba suele haber una lista de capas anidadas (breadcrumb: `Desktop > Frame > …`).

**Opción B — Menú:** **View** → **Show Layers** (si existe).

**Opción C — Clic derecho** en el canvas → **Select Layer** / buscar en la lista.

En el panel derecho, al seleccionar un frame verás hijos como:
- `Navigation` / `Nav` / `Header`
- `Hero`
- `Preloader` / `0` / texto `0%`
- `Collections`
- Frame largo de **Instructions** (documentación Nuvra)

---

## PASO 4 — Quitar el “0%” (preloader)

1. En **Layers** (panel derecho), busca una capa con texto **0%** o nombre **Preloader**, **Loader**, **Progress**.
2. Clic en esa capa para seleccionarla (debe resaltarse en el canvas).
3. Tecla **Delete** (o clic derecho → **Delete**).
4. **Preview** (▶ arriba derecha) para confirmar que ya no aparece al cargar.

---

## PASO 5 — Quitar el documento de instrucciones Nuvra

1. En el canvas, a la **izquierda** del diseño principal hay un frame alto con mucho texto (guía del autor).
2. Clic en ese frame → **Delete**.
   - Si no se selecciona: en Layers busca `Instructions`, `Readme`, `Docs`.

---

## PASO 6 — Editar el menú superior (Navigation)

1. Clic en el texto **Nuvra Studio** (parte superior del diseño).
2. Si seleccionas solo una letra, sube en Layers hasta el grupo **Navigation** o **Nav**.
3. **Logo / nombre:**
   - Sustituir texto por **Clay House**, o
   - Panel derecho → **Image** → **Replace** → sube tu PNG/SVG de logo.
4. **Links del menú** (clic en cada ítem: Shop, Projects, About…):

| Texto actual (Nuvra) | Cambiar a | Link (panel derecho → Link) |
|----------------------|-----------|------------------------------|
| Shop | **Products** | Página **Shop** (luego renombrarás) |
| Projects | *(ocultar en MVP)* | — o delete del menú |
| About | **About** | Página About / Studio |
| Contact | **Contact** | Página Contact / Trade |
| — | **Downloads** | *(crear página después)* |

Para **ocultar** un ítem del menú: selecciónalo → **Delete**, o en Layers clic en el **ojo** (Hide).

5. **Fondo del Nav** (glass):
   - Con **Navigation** seleccionado → **Fill**
   - Sube **Opacity** a 90–100% y color `fondoNeutro` o blanco, o baja **Background Blur** si ves “Blur”.

---

## PASO 7 — Textos del Hero (bloque principal)

1. Clic en el párrafo: *"In a world of noise, we create calm…"*
2. Sustituye por (puedes pegar):

```
tradición antioqueña, fuego moderno
```

3. Si hay un subtítulo más pequeño debajo, pega:

```
Ladrillo de fachada neoartesanal, fabricado en Amagá con cumplimiento NTC 4205.
```

4. **Botón** del hero (si dice Discover / Shop):
   - Selecciona el botón → panel derecho → **Link** → elige página **Shop** (Products)
   - Texto del botón: **explore catalog** o **ver productos**

5. **Type → Style** en títulos: usa tu Heading style; cuerpo usa Body/Montserrat Light.

---

## PASO 8 — Sección “Collections (05)”

1. Clic en el título **Collections (05)**.
2. Cambia texto a: **product categories** o **categorías**
3. Las tarjetas debajo (Lounge, Studio, Dining en Nuvra):
   - Clic en cada tarjeta → cambia título a:
     - **f-pv facade**
     - **solid brick**
     - **special pieces**
     - **floors & clay**
   - **Link** de cada tarjeta → página Shop con filtro (o Shop por ahora)

*(Los nombres finales en español los puedes poner después; primero estructura en inglés del template está bien.)*

---

## PASO 9 — Footer

1. Scroll en el canvas hacia abajo (o en Layers busca **Footer**).
2. Edita:
   - Email → `ventas@clayhouse.com.co`
   - Phone → `+57 320 672 33 65`
   - Address → `Km 2, vía Amagá - Angelópolis, Amagá, Colombia`
3. Tagline: **Convirtiendo piezas en sueños**

---

## PASO 10 — Ver preview y publicar (plan FREE)

1. Arriba derecha → icono **Play** (▶) = **Preview** en el navegador.
2. Para link público: **Publish** (botón azul) → sigue los pasos → copia URL `….framer.website`.
3. Comparte ese link para revisión.

---

## Renombrar páginas (Pages panel)

1. Icono **Pages** (barra izquierda).
2. Lista de páginas → clic derecho en **Shop** → **Rename** → `Products`
3. Clic en la página → panel derecho o doble clic en slug → cambia URL a `/products` o `/productos`

---

## CMS — cuando llegues a productos

1. Icono **CMS** (barra izquierda).
2. Abre collection **Products** (o como la llame Nuvra).
3. Clic **+ Add** en la tabla → rellena campos (ver `cms/products.csv`).
4. En la página **Products**, selecciona el grid de productos → panel derecho debe decir **CMS** → lista vinculada a esa collection.

**Quitar precio / carrito (Nuvra shop):**
- Abre página **Shop** / **Products**
- Selecciona texto de **price** → Delete
- Selecciona botón **Add to Cart** → Delete
- Duplica un botón → texto **Request quote** → Link → página **Contact**

---

## Orden sugerido HOY (ya con fondo hecho)

1. ✅ Fondo — hecho  
2. PASO 1 — Colors en Assets (si faltan estilos nombrados)  
3. PASO 2 — Text styles  
4. PASO 4 — Delete `0%`  
5. PASO 5 — Delete instructions frame  
6. PASO 6 — Navigation + logo  
7. PASO 7 — Hero copy  
8. PASO 9 — Footer  
9. Play ▶ Preview  

---

## Si algo no coincide con tu pantalla

Escribe exactamente qué ves en la barra izquierda (nombres de iconos o tooltips al pasar el mouse) y en el panel derecho (títulos de secciones: Fill, Type, Link, etc.). Con eso ajustamos el paso que falte.

Copia de textos en español: carpeta `content/` del repo (`home.md`, `contacto.md`).
