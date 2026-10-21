-- ============================================================================
-- Después de aplicar las restricciones: ¿quedó bien, y acepta el trabajo real?
--
-- TODO ESTO ES DE SOLO LECTURA. No cambia nada; se puede correr las veces que
-- haga falta.
--
-- Responde las dos preguntas que el Paso 0 debía responder antes:
--   1. ¿Qué quedó aplicado exactamente?
--   2. ¿Los topes rechazarían algo que la operación real sí produce?
-- ============================================================================

-- 1. Qué políticas quedaron. Debe salir UNA: insert, para anon.
select policyname, cmd, roles
from pg_policies
where schemaname = 'public' and tablename = 'cotizaciones';

-- 2. RLS activo, y las dos restricciones de tabla del Paso 2.
select
  (select relrowsecurity from pg_class where oid = 'public.cotizaciones'::regclass) as rls_activo,
  (select count(*) from pg_constraint
    where conrelid = 'public.cotizaciones'::regclass
      and conname in ('cotz_web_atencion_largo','cotz_web_items_tope'))            as restricciones_puestas;

-- 3. LA PREGUNTA QUE IMPORTA: con los datos que ya hay en la tabla —los de la
--    web y los que haya metido el ERP—, ¿los topes nuevos rechazarían algo?
--
--    `filas_totales` dice cuánto hay. Si es 0, estos números no prueban nada
--    todavía y hay que repetirlo dentro de unas semanas.
--
--    `rechazaria_la_politica` cuenta las filas que NO pasarían la política de
--    inserción nueva. Son solicitudes reales que ya entraron: si alguna no
--    pasa, la política está rechazando trabajo legítimo y hay que ajustarla.
select
  count(*)                                                       as filas_totales,
  max(length(atencion))                                          as nombre_mas_largo,     -- tope 120
  max(length(telefono))                                          as telefono_mas_largo,   -- tope 30
  max(length(email))                                             as email_mas_largo,      -- tope 160
  max(length(direccion))                                         as direccion_mas_larga,  -- tope 300
  max(jsonb_array_length(items))                                 as mas_lineas,           -- tope 40
  max(cantidad)                                                  as cantidad_mayor,       -- tope 100.000
  count(*) filter (where not (
    coalesce(length(trim(atencion)), 0) between 2 and 120
    and coalesce(length(trim(telefono)), 0) between 7 and 30
    and coalesce(length(email), 0) <= 160
    and coalesce(length(proyecto), 0) <= 160
    and coalesce(length(direccion), 0) <= 300
    and coalesce(length(municipio), 0) <= 120
    and coalesce(length(departamento), 0) <= 120
    and coalesce(cantidad, 0) between 0 and 100000
    and coalesce(jsonb_array_length(items), 0) <= 40
    and (lat_entrega is null or lat_entrega between -90 and 90)
    and (lng_entrega is null or lng_entrega between -180 and 180)
  ))                                                             as rechazaria_la_politica
from public.cotizaciones;

-- 4. De dónde vienen las filas que hay. Las de la web empiezan por `WEB-`; si
--    hay otras, es el ERP escribiendo en esta misma tabla, y entonces las
--    restricciones del Paso 2 también lo gobiernan a él. Esto decide si los
--    topes hay que medirlos contra la operación del ERP o solo contra la web.
select
  count(*) filter (where numero like 'WEB-%')     as de_la_web,
  count(*) filter (where numero not like 'WEB-%') as de_otro_origen
from public.cotizaciones;

-- 5. Las columnas de la tabla, por si hace falta afinar algún tope.
select column_name, data_type, character_maximum_length
from information_schema.columns
where table_schema = 'public' and table_name = 'cotizaciones'
order by ordinal_position;
