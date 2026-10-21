/**
 * LO QUE EL COMPROBADOR DE TIPOS NO VE.
 *
 * `astro check` ya atrapa los tipos, los imports sin usar y las variables muertas, y lo hace
 * mejor que cualquier regla de ESLint. Repetirlo acá solo produciría el mismo aviso dos
 * veces, así que esas reglas quedan apagadas a propósito.
 *
 * Lo que queda son los errores que un comprobador de tipos deja pasar sin decir nada: una
 * condición que siempre da lo mismo, una promesa sin `await`, un `==` entre tipos distintos,
 * una llave repetida en un objeto literal, un `catch` que se come el error. En un sitio
 * donde el código del cotizador decide precios, esos son los que cuestan.
 */
import js from "@eslint/js";
import ts from "typescript-eslint";
import astro from "eslint-plugin-astro";

export default [
  { ignores: ["dist/**", ".astro/**", "node_modules/**", "public/**", "src/data/*.json"] },
  js.configs.recommended,
  ...ts.configs.recommended,
  ...astro.configs.recommended,
  {
    rules: {
      /* Cubiertas por `astro check`, que además entiende `define:vars` y los componentes. */
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": "off",
      "no-undef": "off",

      /* Un `catch {}` vacío es a veces la decisión correcta —la medición no debe tumbar el
         formulario— y cada uno de los que hay acá está comentado. */
      "no-empty": ["error", { allowEmptyCatch: true }],

      /* Esto sí: comparaciones flojas, reasignaciones de parámetros y promesas sueltas. */
      eqeqeq: ["error", "smart"],
      "no-var": "error",
      "prefer-const": "error",
      "no-param-reassign": "error",
      "no-constant-condition": ["error", { checkLoops: false }],
      "require-atomic-updates": "error",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-non-null-assertion": "warn",
    },
  },
  {
    /* El fragmento de consentimiento es el de Google, copiado tal cual. `arguments` y `var`
       son suyos: reescribirlos es arriesgar que deje de funcionar con una versión futura de
       su librería, y lo que se gana es estilo. */
    /* El segundo patrón es el `<script>` del componente: el plugin lo linta como un archivo
       virtual dentro del .astro. */
    files: ["src/components/Analytics.astro", "src/components/Analytics.astro/*"],
    rules: { "prefer-rest-params": "off", "no-var": "off" },
  },
  {
    /* Los scripts de mantenimiento corren en Node y hablan por consola. */
    files: ["scripts/**/*.mjs", "*.config.{ts,mjs}", "tests/**/*.ts"],
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },
];
