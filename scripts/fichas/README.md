# Generador de fichas técnicas

Crea las fichas técnicas de los productos como PDF de alta calidad, todas con el
**mismo diseño** (infografía de marca Clay House). El resultado reemplaza el
`ficha.pdf` de cada producto, que es lo que descarga el botón "Ficha técnica" en
la página del producto.

Ventaja frente a exportar desde una herramienta de diseño: el texto y los íconos
quedan **vectoriales** (nítidos a cualquier zoom o impresión) y todo el catálogo
queda **consistente** automáticamente.

## Uso rápido

```bash
# Regenerar TODAS las fichas
node scripts/fichas/generate.mjs --all

# Regenerar una (o varias, separadas por coma)
node scripts/fichas/generate.mjs --only romano
node scripts/fichas/generate.mjs --only romano,toscano

# Ver el resultado sin tocar las fichas de producto (queda en scripts/fichas/_preview/)
node scripts/fichas/generate.mjs --only romano --preview
```

Requiere **Google Chrome** instalado (se usa headless para renderizar el PDF).
Si Chrome está en otra ruta, exportar `CHROME_PATH=/ruta/a/chrome`.

## Cómo agregar un producto nuevo

1. Abrir **`scripts/fichas/fichas.data.mjs`** y copiar el bloque de un producto
   parecido. Cambiar:
   - `slug`: debe coincidir con la carpeta en `public/images/products/<slug>/`.
   - `titulo`, `subtitulo`, `clasificacion`, `norma`.
   - `foto`: ruta a una foto del producto (empieza por `/public/images/...`).
   - `features`: 4 bloques `[icono, TÍTULO, descripción]`.
   - `dims`: largo, ancho, alto.
   - `colores`: lista de `[nombre, "#hex"]`.
   - `usos`: lista de textos.
   - `specsRow`: celdas `[icono, ETIQUETA, valor, subtexto]`. En `valor`, usar
     ` · ` para partir en dos líneas (ej. `"Promedio 14 MPa · Individual 10 MPa"`).
2. Generar: `node scripts/fichas/generate.mjs --only <slug>`
3. Revisar y commitear el `public/images/products/<slug>/ficha.pdf`.

## Cómo modificar una ficha existente

Editar sus datos en `fichas.data.mjs` y regenerar con `--only <slug>`. Para
cambiar el **diseño** (colores, tamaños, layout), editar la plantilla HTML en
`generate.mjs`.

## Íconos disponibles

`shield`, `thermo`, `leaf`, `ruler`, `weight`, `cube`, `grid`, `compress`,
`drop`, `flame`, `arrows`, `home`, `tool`, `wash`, `warn`.

## Archivos

- `fichas.data.mjs` — los datos de cada ficha (esto es lo que se edita a diario).
- `generate.mjs` — la plantilla + el render. Solo se toca para cambiar el diseño.
- `README.md` — este archivo.

> Los datos de dimensiones/specs se transcribieron de las fichas oficiales
> (Ed. Abril 2026) y del catálogo. Si una especificación cambia, actualízala
> aquí y regenera.

## Productos con varias dimensiones (fichas por variante)

Algunos productos tienen varias dimensiones (rayados: 10/12/15; macizo-brix:
5x10x20 / 6x12x24). Para estos, en `fichas.data.mjs` el producto lleva un array
`variants` en vez de los campos de ficha única:

```js
{
  slug: "rayados-verticales",
  subtitulo: "...", norma: "...", features: [...], colores: [...],  // compartido
  variants: [
    { id: "10", titulo: "RAYADO 10 VERTICAL", clasificacion: "...",
      foto: "/public/.../rayado 10 vertical dimensiones.webp",
      dims: { largo, ancho, alto }, specsRow: [...] },
    { id: "12", ... }, { id: "15", ... },
  ],
}
```

El `id` de cada variante debe coincidir con el `id` de la variante en
`src/data/productVariants.ts`. El generador produce un PDF por dimensión en
`public/images/products/<slug>/fichas/<id>.pdf` (no crea `ficha.pdf` único).

En la página de producto, el botón "Ficha técnica" sigue la dimensión
seleccionada y además se listan las tres. Si agregas/cambias una dimensión,
recuerda actualizar también `products.ts` (el `technicalPdf` apunta a la
dimensión por defecto, ej. `fichas/10.pdf`, para la página /descargas).
