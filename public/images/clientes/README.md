# Logos de clientes — `public/images/clientes/`

Aquí van los logos que aparecen en la franja **"Clientes y proyectos"** del home.

## Cómo subir un logo nuevo

1. Suelta el archivo aquí con un nombre **kebab-case** que coincida con el `id` del cliente en [`src/data/clients.ts`](../../../src/data/clients.ts).
   - Ejemplos: `gutierrez-group.svg`, `homecenter.png`, `titan.svg`, `starbucks.svg`.
2. Después de subirlo, abre `src/data/clients.ts` y agrega/edita la entrada:

   ```ts
   { id: "gutierrez-group", name: "Gutiérrez Group", logo: "/images/clientes/gutierrez-group.svg" },
   ```

   - Sin la propiedad `logo` se muestra el nombre como wordmark (texto).
   - Con `logo` se muestra la imagen.

## Especificaciones recomendadas

| Formato | Cuándo |
|---|---|
| **SVG** | Lo ideal — escala perfecto y pesa muy poco. |
| **PNG con fondo transparente** | Si no tienes SVG. Mínimo 200×80 px. |
| **JPG** | Solo si no hay opción mejor. Asegúrate de que el fondo coincida con la franja. |

- **Alto recomendado**: ~80 px (la franja escala a alturas similares).
- **Color**: idealmente monocromo oscuro o el color corporativo del cliente.
- **Peso**: <50 KB por logo. Comprime PNGs en [TinyPNG](https://tinypng.com).

## Clientes pendientes de subir logo

Por ahora aparecen como wordmark (texto). Cuando subas el archivo, automáticamente reemplaza el texto por la imagen:

- Gutierrez Group
- Oblicuo
- Homecenter
- Titán
- 5 Sólidos
- Torrealta
- Pergamino
- Mundo Verde
- Vélez
- Leños y Carbón
- Starbucks
