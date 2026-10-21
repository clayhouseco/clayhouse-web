/**
 * Las pruebas corren con la misma configuración que el sitio.
 *
 * `getViteConfig` de Astro trae los alias (`@/…`), la resolución de TypeScript y los
 * módulos virtuales (`astro:content`, `astro:assets`), que es lo que permite importar
 * `@/data/unidades` o `@/utils/productSchema` tal como los importa una página.
 */
/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

export default getViteConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    reporters: ["default"],
  },
});
