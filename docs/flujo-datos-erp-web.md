# Flujo de datos entre el ERP y la web

Cómo viaja el catálogo del ERP a la web, y cómo vuelven las cotizaciones.
Hasta ahora esto vivía repartido en comentarios de `scripts/sync-erp.mjs` y en
`erp-divergencias.md`; el diagrama lo muestra de una sola mirada.

**Abrir:** `docs/flujo-datos-erp-web.html` en cualquier navegador. Es un archivo
autocontenido —no pide servidor ni red— con tema claro/oscuro, zoom, búsqueda,
tres recorridos guiados y exportación a PNG/SVG.

## Lo que cuenta

- **Baja el catálogo.** Supabase (`productos`, `producto_variantes`, filtrados por
  `mostrar_web` y `activo_ventas`) → `/api/catalogo-web` → `sync-erp.mjs`, que
  congela `src/data/erpFeed.json` en git antes de cada build. Si el ERP no
  responde, sigue con la última copia bajada en vez de romper el build.
- **Lo que no coincide.** Donde el ERP y la web tienen dato y difieren, no se pisa
  nada: se reporta en `erp-divergencias.md`.
- **Vuelve la cotización.** El cotizador escribe directo en Supabase desde el
  navegador del visitante (`POST /rest/v1/cotizaciones`, clave anónima pública),
  y el CRM del ERP la atiende. Es la única escritura de la web hacia el ERP: el
  sitio es estático y no tiene endpoints propios.

## Regenerarlo

La fuente editable es `flujo-datos-erp-web.dataflow.json`. Requiere el skill
[Archify](https://github.com/tt-a1i/archify) instalado en `~/.claude/skills/archify`:

```bash
node ~/.claude/skills/archify/bin/archify.mjs deliver dataflow \
  docs/flujo-datos-erp-web.dataflow.json \
  docs/flujo-datos-erp-web.html --quality showcase
```

La interfaz del visor (botones, leyenda de recorridos) sale en inglés: Archify
solo traduce su UI a inglés y chino. El contenido del diagrama está en español.
