# Carpeta de entrada — `_inbox/`

Aquí se deposita el material **antes de publicarlo en la web**. Yo (Claude) lo proceso desde aquí y lo integro al sitio.

## Estructura

```
_inbox/
├── README.md                ← este archivo
├── _plantillas/             ← copia las plantillas desde aquí
│   ├── producto.md
│   ├── proyecto.md
│   └── blog.md
├── productos/               ← productos nuevos o cambios en existentes
│   └── {slug}/
│       ├── info.md
│       ├── ficha.pdf
│       └── fotos/
├── proyectos/               ← obras nuevas para la galería
│   └── {slug}/
│       ├── info.md
│       └── fotos/
└── blog/                    ← posts nuevos para el blog
    └── {slug}/
        ├── post.md
        └── imagenes/
```

## Cómo trabajar

### 1) Crea una carpeta nueva
Por cada producto, proyecto o post, crea una carpeta con un **nombre corto en kebab-case**:

- ✅ `bocadillo-prensado`
- ✅ `casa-finca-llanogrande`
- ❌ `Bocadillo Prensado` (espacios y mayúsculas)
- ❌ `bocadillo_prensado` (subrayados)

### 2) Copia la plantilla correspondiente
Copia `_inbox/_plantillas/producto.md` (o `proyecto.md` / `blog.md`) dentro de tu carpeta nueva como `info.md` y llénala.

### 3) Suelta las fotos
Dentro de la subcarpeta `fotos/`. Puedes nombrarlas como sea — yo las renombro al integrarlas.

### 4) Avísame
Escríbeme "ya cargué `bocadillo-prensado`" y yo lo integro al sitio (lo muevo a `public/images/`, lo agrego a `products.ts`, etc.).

### 5) Limpieza
Una vez integrado, podemos borrar tu carpeta de `_inbox/` (la info ya queda en el sitio).

## Reglas para las fotos

- **Formato**: JPG, PNG o WebP. Nada de HEIC o RAW.
- **Tamaño mínimo**: 1200px en el lado más largo.
- **Tamaño máximo**: ~3000px (más grande es derroche de banda).
- **Peso**: idealmente <500 KB por foto. Si pesa más, comprímela en [TinyPNG](https://tinypng.com) primero.
- **Orientación**: vertical u horizontal según corresponda; no fuerces recortes cuadrados.

## Convenciones de nombre de carpeta (slugs)

| Tipo | Slug ejemplo |
|---|---|
| Producto nuevo | `bocadillo-prensado`, `milano-prensado`, `teja-s` |
| Variante de un producto existente | usar la carpeta del producto + `/variantes/` (ver plantilla de producto) |
| Proyecto / obra | `casa-finca-llanogrande`, `edificio-aurora`, `plaza-mercado-envigado` |
| Post de blog | `tendencias-ladrillo-2026`, `proyecto-casa-finca-llanogrande` |

---

**Tip:** Si tienes muchas cosas para subir, no me las pases todas juntas — házlo de a una categoría (ej. primero todas las tejas, luego los milanos). Así puedo revisar bien y no se pierde nada.
