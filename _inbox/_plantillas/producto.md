# Plantilla: producto nuevo o cambios en uno existente

Copia este archivo a `_inbox/productos/{slug}/info.md` y llénalo.

> **¿Es producto nuevo o variante de uno existente?**
> - **Nuevo**: tiene su propia ficha (ej. Bocadillo Prensado, Teja S).
> - **Variante**: vive dentro de un producto que ya existe como color/formato (ej. "Teja Plana Chocolate" es variante de "Teja Plana").
>
> Si es variante, en "Datos básicos" indica de qué producto es. Si es nuevo, déjalo en blanco.

---

## Datos básicos

- **Nombre comercial**: <!-- ej. "Bocadillo Prensado" -->
- **Slug** (para URL, kebab-case): <!-- ej. "bocadillo-prensado" -->
- **¿Es variante de un producto existente?**: <!-- vacío si es nuevo, o "teja-plana" si es variante -->
- **Categoría**: <!-- Una de: Fachadas | Divisorios | Pisos | Enchapes | Techos -->
- **¿Destacado en home?**: <!-- sí / no -->

## Textos

**Descripción corta** (1-2 líneas, sale en la tarjeta del catálogo):

<!-- Escribe aquí -->

**Descripción larga** (1-2 párrafos, sale en la ficha). Puedes separar párrafos con una línea en blanco:

<!-- Escribe aquí -->


## Aplicaciones recomendadas (4-5 viñetas)

- 
- 
- 
- 

## ¿Para qué NO sirve? (2-3 viñetas, opcional pero útil)

- 
- 

## Atributos

- **Color(es) disponible(s)**: <!-- ej. "Rojo, Matizado, Oscuro" -->
- **Textura**: <!-- ej. "Texturizado" o "Liso" -->
- **Norma**: <!-- ej. "NTC 4205-2 / 4205-3" -->

## Dimensiones

- **Alto**: <!-- ej. "5 cm" -->
- **Ancho**: <!-- ej. "14 cm" -->
- **Largo**: <!-- ej. "29 cm" -->
- **Espesor** (si aplica): 
- **Peso aproximado**: <!-- ej. "1,8 kg" -->
- **Rendimiento**: <!-- ej. "68 und/m²" -->

## Precio (opcional)

- **Precio por unidad**: <!-- ej. "$ 2.450", o "Consultar" -->
- **Unidad de venta**: <!-- ej. "unidad", "m²", "lineal" -->

## Variantes de color / formato

Lista cada variante. Si solo hay una presentación, deja una sola entrada.

| Nombre comercial | Slug carpeta | Precio (opcional) |
|---|---|---|
| <!-- Rojo --> | <!-- rojo --> | <!-- $ 2.450 --> |
| <!-- Matizado --> | <!-- matizado --> | |
| <!-- Oscuro --> | <!-- oscuro --> | |

## SEO (opcional, lo redacto yo si lo dejas vacío)

- **Título SEO** (max 60 chars): 
- **Descripción SEO** (max 160 chars): 

## Especificaciones extra (opcional)

Cualquier dato técnico adicional que no encaje arriba. Lista en formato "campo: valor":

- 
- 

---

## Estructura de archivos a entregar

Coloca todo dentro de la carpeta del producto, así:

```
_inbox/productos/{slug}/
├── info.md                  ← este archivo, lleno
├── ficha.pdf                ← (opcional) ficha técnica en PDF
└── fotos/
    ├── {variante-1}/        ← una carpeta por variante (rojo, matizado, etc.)
    │   ├── unitario.jpg     ← producto solo, fondo neutro
    │   ├── apilado.jpg      ← varias piezas apiladas
    │   └── obra.jpg         ← (opcional) ejemplos en obra
    ├── {variante-2}/
    │   └── ...
    ├── dimensiones.png      ← dibujo o render de medidas (compartido)
    └── ficha.png            ← ficha técnica visual (compartido)
```

**Si solo tienes una variante**: pon las fotos dentro de `fotos/principal/`.

**Mínimo viable** (si tienes pocas fotos): basta con `fotos/{variante}/unitario.jpg`. El resto enriquece la ficha pero no es obligatorio.
