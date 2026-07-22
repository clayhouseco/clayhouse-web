# Activar y desactivar productos (inventario)

El equipo controla qué productos se ven en la web desde un **Google Sheet**, sin
tocar código. Al publicar, la web se reconstruye y el cambio queda en vivo en
1–2 minutos.

Cuando un producto se desactiva **desaparece de verdad**: no sale en los
listados, su página deja de existir y se quita del sitemap (Google deja de
ofrecerlo). No queda oculto "a medias".

---

## Cómo se usa (día a día)

1. Abrir la hoja **Inventario Clay House**.
2. Marcar o desmarcar la casilla **activo** del producto.
3. Menú **Clay House → Publicar cambios**.
4. Esperar 1–2 minutos y recargar la web.

La hoja guarda historial (Archivo → Historial de versiones), así que queda
registro de quién cambió qué y cuándo.

### Columnas de la hoja

| Columna    | Obligatoria | Qué va                                                   |
|------------|-------------|----------------------------------------------------------|
| `slug`     | Sí          | Identificador del producto (ver lista abajo). Debe ser exacto |
| `producto` | No          | Nombre legible, solo como referencia visual              |
| `activo`   | Sí          | Casilla marcada = se muestra. También acepta SÍ/NO, 1/0, X |
| `motivo`   | No          | Nota interna, ej. "sin stock hasta agosto"               |

Reglas útiles:

- Un producto que **no aparezca en la hoja se muestra**. Así una referencia
  nueva nunca queda oculta por accidente.
- Si un `slug` está mal escrito, se ignora y el build lo avisa en el log. No
  rompe nada, pero ese producto no se verá afectado.

### Slugs del catálogo

`romano`, `toscano`, `napolitano`, `cartagena`, `macizo-campesino`,
`macizo-brix`, `bocadillo-prensado`, `rayados-verticales`,
`rayados-horizontales`, `enchape-rustico`, `enchape-romano`, `piso-30x30`,
`piso-10x30`, `teja-plana`, `teja-colonial`.

---

## Configuración inicial (una sola vez)

### 1. Crear la hoja

Crear un Google Sheet llamado *Inventario Clay House* con los encabezados
`slug`, `producto`, `activo`, `motivo` en la primera fila, y una fila por
producto. Para `activo` conviene usar **Insertar → Casilla de verificación**.

Compartir con el equipo (permiso de edición).

### 2. Publicar la hoja como CSV

**Archivo → Compartir → Publicar en la web** → seleccionar la hoja → formato
**CSV** → *Publicar*. Copiar la URL resultante.

> Esta URL es de solo lectura y solo expone qué productos están activos.

### 3. Configurar la web

En Vercel → proyecto → **Settings → Environment Variables**, agregar:

```
PRODUCTS_SHEET_CSV_URL = <la URL del CSV publicado>
```

### 4. Crear el Deploy Hook

En Vercel → **Settings → Git → Deploy Hooks**: crear uno (rama `main`) y copiar
la URL.

> Esta URL **es sensible**: cualquiera que la tenga puede disparar despliegues.
> Va solo dentro del Apps Script, nunca en el repositorio.

### 5. Botón "Publicar cambios" en la hoja

En la hoja: **Extensiones → Apps Script**, pegar esto y guardar:

```javascript
const DEPLOY_HOOK = 'PEGAR_AQUI_LA_URL_DEL_DEPLOY_HOOK';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Clay House')
    .addItem('Publicar cambios', 'publicarCambios')
    .addToUi();
}

function publicarCambios() {
  const res = UrlFetchApp.fetch(DEPLOY_HOOK, {
    method: 'post',
    muteHttpExceptions: true,
  });
  const ok = res.getResponseCode() < 300;
  SpreadsheetApp.getUi().alert(
    ok
      ? 'Listo. La web se está actualizando, en 1–2 minutos verás los cambios.'
      : 'No se pudo publicar (código ' + res.getResponseCode() + '). Avisar a soporte.'
  );
}
```

Recargar la hoja: aparece el menú **Clay House**.

---

## Cómo funciona por dentro

En cada build, `scripts/fetch-availability.mjs` lee el CSV y regenera
`src/data/availability.json`. Ese archivo se versiona a propósito: es el último
estado bueno conocido.

- `src/data/availability.ts` lo expone como `isAvailable(slug)`.
- `getVisibleProducts()` y `getFeaturedProducts()` en `src/data/products.ts` lo
  respetan, y `getStaticPaths` de la ficha de producto solo genera páginas de
  productos visibles.

**Si la hoja no responde, viene vacía o le faltan columnas, el build no falla**:
conserva el `availability.json` que ya estaba y sigue. El sitio nunca se cae por
un problema con la hoja.

### Ocultar un producto permanentemente

Para casos que no son de inventario (un producto descontinuado), existe
`hidden: true` en `src/data/products.ts`. Eso lo oculta siempre, sin importar la
hoja, y requiere un cambio de código.
