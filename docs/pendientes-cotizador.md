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

`supabase/cotizaciones-rls.sql` deja preparadas las restricciones. **Requiere
autorización antes de correrlo**, y antes de eso hay que resolver el punto 1:
la migración apunta a la tabla que se decida.

Lo que endurece:

- Longitud máxima de nombre, teléfono, correo, proyecto y dirección.
- Cantidad entre 1 y 100.000 por línea.
- Como máximo 40 líneas por solicitud.
- Sin lectura, actualización ni borrado anónimos.

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
