-- ============================================================================
-- Cotizaciones de la web — restricciones de escritura.
--
-- Hoy la política de inserción es `with check (true)`: con la clave publicable
-- —que viaja en el HTML, como corresponde a una clave publicable— cualquiera
-- puede escribir lo que quiera en esta tabla, del tamaño que quiera y tantas
-- veces como quiera. Es el riesgo de producción más real que tiene el sitio.
--
-- CÓMO CORRERLO:  Supabase → SQL Editor → New query → pegar → Run.
--
-- Va en tres pasos y en este orden. El paso 0 no cambia nada: solo mira. No
-- corra el paso 2 sin haber leído lo que devuelve el paso 0.
--
-- LA TABLA ES `public.cotizaciones`, que es donde escribe la web
-- (`src/scripts/cotizacion/envio.ts` → `/rest/v1/cotizaciones`) y de donde lee
-- el ERP. La decisión pendiente de `docs/pendientes-cotizador.md` —si lo que
-- entra por la web debería vivir en `cotizaciones_web`— NO bloquea el paso 1:
-- esa política solo ataña al rol `anon`, y el ERP entra con credenciales de
-- servicio, que se saltan RLS. Si algún día la web pasa a escribir en otra
-- tabla, se vuelve a correr esto cambiando el nombre.
-- ============================================================================


-- ===========================================================================
-- PASO 0 — MIRAR ANTES DE TOCAR.  No cambia nada; devuelve tres cosas.
-- ===========================================================================

-- 0.a ¿Está RLS activo, y qué políticas hay hoy? Los `drop policy` del paso 1
--     borran por nombre: si en producción las políticas se llaman distinto,
--     las suyas seguirían vivas y abiertas. Compare esta lista con los nombres
--     del paso 1 y añada los que falten.
select policyname, cmd, roles, qual, with_check
from pg_policies
where schemaname = 'public' and tablename = 'cotizaciones'
order by cmd, policyname;

select relrowsecurity as rls_activo, relforcerowsecurity as rls_forzado
from pg_class
where oid = 'public.cotizaciones'::regclass;

-- 0.b ¿Alguna fila que ya existe incumpliría los topes del paso 2?
--     Si esto devuelve algo, NO corra el paso 2 con esos valores: significa
--     que la operación real los supera y el tope rechazaría trabajo legítimo.
select
  count(*) filter (where length(atencion) > 120)            as nombres_largos,
  count(*) filter (where jsonb_array_length(items) > 40)    as muchas_lineas,
  max(length(atencion))                                     as nombre_mas_largo,
  max(jsonb_array_length(items))                            as mas_lineas,
  max(cantidad)                                             as cantidad_mayor,
  count(*)                                                  as filas_totales
from public.cotizaciones;


-- ===========================================================================
-- PASO 1 — LA POLÍTICA DE INSERCIÓN.  Esto es lo que cierra el agujero.
--
-- Solo ataña al rol `anon` (la clave publicable, es decir el navegador). El
-- ERP, que entra con credenciales de servicio, no se ve afectado: puede seguir
-- insertando y leyendo como hoy.
-- ===========================================================================

alter table public.cotizaciones enable row level security;

drop policy if exists "web inserta cotizaciones" on public.cotizaciones;

create policy "web inserta cotizaciones"
  on public.cotizaciones for insert to anon
  with check (
    -- Nombre y teléfono son obligatorios: sin ellos nadie puede devolver la
    -- llamada. El cotizador ya los exige; esto lo hace cumplir del lado del
    -- servidor, que es el único que cuenta.
    coalesce(length(trim(atencion)), 0) between 2 and 120
    and coalesce(length(trim(telefono)), 0) between 7 and 30
    -- El resto puede venir vacío, pero no desbordado.
    and coalesce(length(email), 0) <= 160
    and coalesce(length(proyecto), 0) <= 160
    and coalesce(length(direccion), 0) <= 300
    and coalesce(length(municipio), 0) <= 120
    and coalesce(length(departamento), 0) <= 120
    -- Cantidades dentro de lo que la planta puede despachar.
    and coalesce(cantidad, 0) between 0 and 100000
    -- El catálogo cotizable tiene 23 opciones, así que un pedido legítimo no
    -- llega a 40 líneas ni pidiendo cada una dos veces. Más que eso es un
    -- script, no una obra.
    and coalesce(jsonb_array_length(items), 0) <= 40
    -- Coordenadas válidas si vienen.
    and (lat_entrega is null or lat_entrega between -90 and 90)
    and (lng_entrega is null or lng_entrega between -180 and 180)
  );

-- La web solo inserta: nunca lee, actualiza ni borra. Sin políticas de
-- select/update/delete para `anon`, PostgREST no devuelve ni modifica nada.
-- Revise los nombres contra lo que devolvió el paso 0.a.
drop policy if exists "web lee cotizaciones" on public.cotizaciones;
drop policy if exists "web actualiza cotizaciones" on public.cotizaciones;
drop policy if exists "web borra cotizaciones" on public.cotizaciones;

-- Comprobación: debería quedar UNA política, de insert, para anon.
select policyname, cmd, roles from pg_policies
where schemaname = 'public' and tablename = 'cotizaciones';


-- ===========================================================================
-- PASO 2 — LÍMITES EN EL ESQUEMA.  OJO: esto sí afecta al ERP.
--
-- La política del paso 1 protege de lo que entra por PostgREST con la clave
-- pública. Estas restricciones protegen la tabla venga de donde venga —y por
-- eso también se aplican a lo que inserte el ERP con sus credenciales de
-- servicio—. Si el ERP guarda acá sus cotizaciones internas y alguna trae un
-- nombre de más de 120 caracteres o más de 40 líneas, a partir de este momento
-- se le rechazaría.
--
-- CORRA EL PASO 0.b PRIMERO. Si devolvió ceros en `nombres_largos` y
-- `muchas_lineas`, estos topes no rechazan nada de lo que ya pasa. Si no,
-- súbalos a lo que la operación real necesite antes de aplicarlos.
-- ===========================================================================

alter table public.cotizaciones
  drop constraint if exists cotz_web_atencion_largo,
  add constraint cotz_web_atencion_largo
    check (atencion is null or length(atencion) <= 120) not valid;

alter table public.cotizaciones
  drop constraint if exists cotz_web_items_tope,
  add constraint cotz_web_items_tope
    check (items is null or jsonb_array_length(items) <= 40) not valid;

-- `not valid` no revisa las filas que ya existen, solo las nuevas. Cuando el
-- paso 0.b confirme que ninguna las incumple, se pueden validar:
--
--   alter table public.cotizaciones validate constraint cotz_web_atencion_largo;
--   alter table public.cotizaciones validate constraint cotz_web_items_tope;


-- ===========================================================================
-- LO QUE ESTO NO RESUELVE
--
-- No hay límite de peticiones por IP. PostgREST no lo hace solo: requiere una
-- Edge Function delante, o el rate limiting del propio Supabase. Sin eso, nada
-- impide insertar miles de filas válidas con la clave pública. Lo de arriba
-- acota QUÉ se puede escribir; no CUÁNTAS veces.
-- ===========================================================================
