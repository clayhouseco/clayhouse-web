/// <reference types="astro/client" />

/* Astro declara los módulos de imagen con la extensión en minúscula. `Mina.JPG` existe tal
   cual en el disco y el build la resuelve, pero el comprobador de tipos no la reconocía. */
declare module "*.JPG" {
  const metadata: import("astro").ImageMetadata;
  export default metadata;
}
