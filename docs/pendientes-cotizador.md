# Cotizador — decisiones y migración pendientes

Lo que la Fase 1 dejó resuelto en el código, y lo que necesita una decisión
humana o un cambio en Supabase que **no se ejecutó** a propósito.

---

## 1. Qué tabla es la oficial — DECISIÓN PENDIENTE

El frontend escribe en **`cotizaciones`**; `supabase/cotizaciones.sql` define
**`cotizaciones_web`**. Las dos existen en producción: se comprobó con una
petición de solo lectura a PostgREST, y ambas responden 200.

El payload que envía la web coincide con la forma de la tabla del ERP
(`numero`, `atencion`, `producto_codigo`, `items`, `notas_comerciales`…), no con
la del SQL de este repositorio (`cliente_nombre`, `lineas`, `total_referencia`…).

| | `cotizaciones` | `cotizaciones_web` |
|---|---|---|
| Quién escribe | la web, hoy | nadie |
| Quién lee | el ERP | — |
| Coincide con el payload | sí | no |

**No se cambió nada.** Decidirlo exige saber si el ERP trabaja sus solicitudes
desde `cotizaciones` o si esa tabla también recibe las cotizaciones internas,
en cuyo caso mezclar las de la web puede ensuciar su bandeja.

Las dos salidas razonables:

- **Dejar `cotizaciones`** y borrar `supabase/cotizaciones.sql` del repositorio,
  que hoy documenta algo que no se usa y confunde.
- **Pasar a `cotizaciones_web`** y adaptar el payload. Separa lo que entra por
  la web de lo interno, pero exige que el ERP lea también esa tabla.

---

## 2. RLS — MIGRACIÓN PREPARADA, NO EJECUTADA

La política del repositorio es `with check (true)`: cualquiera con la clave
pública —que viaja en el HTML, como debe ser— puede insertar lo que quiera, con
el tamaño que quiera y tantas veces como quiera.

`supabase/cotizaciones-rls.sql` deja preparadas las restricciones, ya listas
para pegar en el editor SQL de Supabase. **Requiere autorización antes de
correrlo.**

**Corrección (21 oct 2026): el punto 1 NO lo bloquea.** Se decía que había que
resolver antes qué tabla es la oficial. No es así para lo que importa: la
política de inserción ataña solo al rol `anon` —la clave publicable, es decir el
navegador— y el ERP entra con credenciales de servicio, que se saltan RLS. Se
puede aplicar hoy sobre `public.cotizaciones`, que es donde escribe la web, sin
tocar nada de lo que hace el ERP. Si algún día la web pasa a `cotizaciones_web`,
se vuelve a correr cambiando el nombre.

El archivo va en tres pasos por una razón:

- **Paso 0 — mirar.** Dos consultas de solo lectura: qué políticas hay hoy y con
  qué nombres (los `drop policy` borran por nombre, así que si en producción se
  llaman distinto las suyas seguirían abiertas), y si alguna fila existente
  incumpliría los topes del paso 2.
- **Paso 1 — la política de inserción.** Es lo que cierra el agujero. Solo
  afecta a `anon`. Longitud máxima de nombre, teléfono, correo, proyecto y
  dirección; cantidad hasta 100.000; hasta 40 líneas por solicitud —el catálogo
  cotizable tiene 23 opciones, así que un pedido legítimo no llega ahí ni
  pidiendo cada una dos veces—; coordenadas válidas; y sin lectura,
  actualización ni borrado anónimos.
- **Paso 2 — límites en el esquema.** **Este sí afecta al ERP**, porque una
  restricción de tabla se aplica venga de donde venga. Si el ERP guarda acá sus
  cotizaciones internas y alguna trae un nombre largo o más de 40 líneas, a
  partir de ese momento se le rechazaría. De ahí que el paso 0.b exista.

También había un defecto en el archivo: usaba `\set TABLA` y `:TABLA`, que son
comandos de `psql`. El editor SQL de Supabase no los entiende, así que pegarlo
habría fallado en la primera línea. Ahora lleva el nombre de la tabla escrito.

Comprobado el 21 de octubre con la clave publicable, sin escribir nada: una
lectura de `public.cotizaciones` devuelve 200 y **cero filas**. O la tabla está
vacía, o RLS ya filtra la lectura; el paso 0 lo dice sin ambigüedad desde
dentro. Lo que sigue sin acotar es la escritura.

Lo que **no** resuelve y necesita decisión aparte: límite de peticiones por IP.
PostgREST no lo hace solo; exige una Edge Function delante o el rate limiting
del propio Supabase. Mientras tanto, nada impide que alguien inserte miles de
filas con la clave pública.

---

## 3. El cotizador no mide conversiones

`/cotizacion` no dispara ningún evento: no hay `generate_lead` ni `data-track`
en toda la página. El `generate_lead` que sí existe está en el formulario de
`/contacto`, que es otro.

O sea que **la herramienta principal de captación no reporta a Google Ads**.
Es trabajo de la Fase 5, pero conviene saberlo ya: cualquier campaña que se
juzgue por conversiones está midiendo solo el formulario de contacto.

Con el arreglo de la Fase 1 esto queda bien encaminado: `saveToErp()` ahora
devuelve `true` solo cuando el servidor confirma, que es exactamente el momento
en que debe dispararse `generate_lead` y no antes.
