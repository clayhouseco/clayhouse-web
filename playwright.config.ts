import { defineConfig, devices } from "@playwright/test";

/**
 * PRUEBAS DE NAVEGADOR (end-to-end).
 *
 * `webServer` corre `astro dev`, NO `npm run build`: el build hace red antes de
 * compilar (sync-erp, fetch-availability) y genera las imágenes responsive, así
 * que arrancar por ahí haría las pruebas lentas y dependientes del ERP.
 *
 * Se reutiliza el dev server si ya está levantado, para poder dejar
 * `npm run dev` abierto mientras se escriben pruebas.
 */
const PUERTO = 4321;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "github" : "html",
  use: {
    baseURL: `http://localhost:${PUERTO}`,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "movil", use: { ...devices["iPhone 13"] } },
  ],
  webServer: {
    command: "npm run dev",
    url: `http://localhost:${PUERTO}`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
