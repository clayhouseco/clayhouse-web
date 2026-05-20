# Reseñas de clientes

## Cómo funciona

1. El comprador envía el formulario en **[/reseñas/](/reseñas/)** (o el enlace «Dejar mi reseña» en la home).
2. Si tiene `PUBLIC_FORMSPREE_ID` en `.env`, el envío llega al correo de Formspree (asunto: «Nueva reseña de cliente — Clay House»).
3. Usted revisa el contenido y, si aprueba, **añade la reseña** en `src/data/reviews.ts`.
4. Vuelve a desplegar el sitio (`npm run build` y subida a Vercel o hosting).

Las reseñas **no se publican solas** en el sitio: evita spam y permite editar redacción antes de mostrarlas.

## Añadir una reseña aprobada

Edite `src/data/reviews.ts` y agregue un objeto:

```ts
{
  id: "r5",
  author: "Nombre Apellido",
  role: "Arquitecto · Ciudad",
  rating: 5,
  text: "Texto de la reseña entre comillas en el componente.",
  date: "2026-05-20",
  product: "Ladrillo Romano", // opcional
  featured: true, // true = aparece en la home (máx. 3)
},
```

- `featured: true` — muestra la tarjeta en la sección «Experiencias de compra» de la página de inicio.
- Ordene por fecha; en la página de reseñas se listan de más reciente a más antigua.

## Formspree

Use el mismo ID que contacto (`PUBLIC_FORMSPREE_ID`) o cree un formulario solo para reseñas y use una variable aparte si lo prefiere.

Filtre en el buzón por el campo oculto `tipo_formulario=reseña`.

## Sin Formspree

Si no hay ID configurado, el formulario abre **WhatsApp** con el texto de la reseña y redirige a `/reseñas/gracias/`.
