#!/usr/bin/env node
/**
 * Genera zips pequeños para cPanel (no sube carpetas completas bien).
 * Extraer TODOS en public_html, en orden 01 → 06.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dist = join(root, "dist");
const outDir = join(root, "deploy-zips");

const imageParts = [
  { file: "02-imagenes-editadas.zip", path: "images/Editadas" },
  { file: "03-imagenes-proyectos.zip", path: "images/Fotos de proyectos para pag" },
  { file: "04-imagenes-productos.zip", path: "images/products" },
  { file: "05-imagenes-fotos-productos.zip", path: "images/Fotos Productos" },
  { file: "06-imagenes-processed.zip", path: "images/products-processed" },
];

function zipDist(outputName, extraArgs = []) {
  const out = join(outDir, outputName);
  const args = [
    "zip",
    "-r",
    out,
    ".",
    "-x",
    "*.DS_Store",
    ...extraArgs,
  ];
  execSync(args.join(" "), { cwd: dist, stdio: "inherit" });
  return out;
}

console.log("→ npm run build…");
execSync("npm run build", { cwd: root, stdio: "inherit" });

if (!existsSync(dist)) {
  console.error("No existe dist/. Ejecuta npm run build.");
  process.exit(1);
}

if (existsSync(outDir)) rmSync(outDir, { recursive: true });
mkdirSync(outDir, { recursive: true });

console.log("\n→ 01-sitio.zip (HTML, CSS, páginas, logos — sin images/)…");
zipDist("01-sitio.zip", ["-x", "images/*"]);

for (const { file, path } of imageParts) {
  const full = join(dist, path);
  if (!existsSync(full)) {
    console.log(`   (omitido ${file}: no existe ${path})`);
    continue;
  }
  console.log(`\n→ ${file} (${path})…`);
  execSync(
    `zip -r "${join(outDir, file)}" "${path}" -x "*.DS_Store"`,
    { cwd: dist, stdio: "inherit" },
  );
}

console.log("\n── Tamaños ──");
execSync(`ls -lh "${outDir}"`, { stdio: "inherit" });

console.log(`
Listo. Carpeta: deploy-zips/

En cPanel → public_html:
  1. Vacía public_html (respaldar si hace falta).
  2. Sube 01-sitio.zip → Extract aquí.
  3. Sube 02…06 uno por uno → Extract aquí (misma carpeta).
  4. Borra los .zip del servidor.
  5. Comprueba: ch-assets/ tiene .css y productos/index.html existe.

Alternativa (recomendada): FileZilla FTP — sube toda la carpeta dist/ arrastrando;
sí sube carpetas completas sin zip.
`);
