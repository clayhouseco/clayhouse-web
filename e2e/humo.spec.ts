import { expect, test } from "@playwright/test";

/**
 * Prueba de humo: la home levanta y muestra el hero.
 * Corre en escritorio y en móvil (ver `projects` en playwright.config.ts).
 */
test("la home carga con su titular", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { level: 1, name: /Convertimos el barro en fachadas/i }),
  ).toBeVisible();
});
