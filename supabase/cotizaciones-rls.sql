-- ============================================================================
-- Cotizaciones de la web — restricciones de escritura.
--
-- NO EJECUTAR SIN AUTORIZACIÓN, y no antes de decidir sobre qué tabla corre:
-- el frontend escribe en `cotizaciones` y el repositorio documenta
-- `cotizaciones_web`. Ver docs/pendientes-cotizador.md.
--
-- Cambia TABLA por la que se decida y revisa cada límite contra la operación
-- real antes de aplicarlo: un tope demasiado bajo rechaza pedidos legítimos.
--
--   Supabase → SQL Editor → New query → pegar → Run
-- ============================================================================

\set TABLA public.cotizaciones

-- ---------------------------------------------------------------------------
-- 1. La web solo inserta. Nunca lee, actualiza ni borra.
--
-- Hoy la política es `with check (true)`: con la clave pública —que viaja en el
-- HTML, como corresponde a una clave publicable— cualquiera puede insertar lo
-- que quiera. Las comprobaciones de abajo son lo único que separa una
-- solicitud real de basura automatizada.
-- ---------------------------------------------------------------------------
alter table :TABLA enable row level security;

drop policy if exists "web inserta cotizaciones" on :TABLA;

create policy "web inserta cotizaciones"
  on :TABLA for insert to anon
  with check (
    -- Nombre y teléfono son obligatorios: sin ellos nadie puede devolver la llamada.
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
    -- Una solicitud con más de 40 líneas no es una obra, es un script.
    and coalesce(jsonb_array_length(items), 0) <= 40
    -- Coordenadas válidas si vienen.
    and (lat_entrega is null or lat_entrega between -90 and 90)
    and (lng_entrega is null or lng_entrega between -180 and 180)
  );

-- Sin políticas de select/update/delete para `anon`, PostgREST no devuelve ni
-- modifica nada. El ERP entra con credenciales de servicio, que las omiten.
drop policy if exists "web lee cotizaciones" on :TABLA;
drop policy if exists "web actualiza cotizaciones" on :TABLA;
drop policy if exists "web borra cotizaciones" on :TABLA;

-- ---------------------------------------------------------------------------
-- 2. Límites en el esquema, no solo en la política.
--
-- La política protege de lo que entra por PostgREST; estas restricciones
-- protegen la tabla venga de donde venga.
-- ---------------------------------------------------------------------------
alter table :TABLA
  drop constraint if exists cotz_web_atencion_largo,
  add constraint cotz_web_atencion_largo
    check (atencion is null or length(atencion) <= 120) not valid;

alter table :TABLA
  drop constraint if exists cotz_web_items_tope,
  add constraint cotz_web_items_tope
    check (items is null or jsonb_array_length(items) <= 40) not valid;

-- `not valid` para no fallar con las filas que ya existen. Cuando se confirme
-- que ninguna las incumple:
--   alter table :TABLA validate constraint cotz_web_atencion_largo;
--   alter table :TABLA validate constraint cotz_web_items_tope;

-- ---------------------------------------------------------------------------
-- 3. Lo que esto NO resuelve
--
-- No hay límite de peticiones por IP. PostgREST no lo hace solo: requiere una
-- Edge Function delante, o el rate limiting del propio Supabase. Sin eso, nada
-- impide insertar miles de filas válidas con la clave pública.
-- ---------------------------------------------------------------------------
