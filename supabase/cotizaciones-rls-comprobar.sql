-- ============================================================================
-- ¿Quedó bien la restricción, y acepta el trabajo real?
--
-- DE SOLO LECTURA. No cambia nada; se puede correr las veces que haga falta.
--
-- Es UNA SOLA consulta a propósito. El editor de Supabase ejecuta todo lo que
-- se le pega pero solo muestra el último resultado con filas, así que un
-- archivo con varias consultas esconde las anteriores. Acá todo cabe en una
-- fila: lo que se vea en pantalla es la respuesta completa.
--
--   Supabase → SQL Editor → New query → pegar → Run
--
-- CÓMO LEER LA FILA QUE DEVUELVE:
--
--   politicas              debe decir  «web inserta cotizaciones [INSERT → anon]»
--                          y nada más. Si aparece un SELECT, UPDATE o DELETE
--                          para anon, con la clave pública se puede leer o
--                          modificar lo que mandan los clientes.
--   rls_activo             debe ser    true
--   restricciones          debe ser    2
--
--   rechazaria_la_politica  ES EL NÚMERO QUE IMPORTA. Cuenta, entre las
--                          solicitudes que YA están en la tabla, cuántas no
--                          pasarían la política nueva. Debe ser 0: si no lo es,
--                          la política está rechazando trabajo legítimo y hay
--                          que subir el tope que corresponda.
--
--   filas_totales          si es 0, la tabla está vacía y los números de abajo
--                          no prueban nada: hay que mandar una cotización de
--                          prueba desde la web y borrarla luego desde el ERP.
--   de_otro_origen         si es > 0, el ERP también escribe en esta tabla, y
--                          entonces las dos restricciones lo gobiernan a él
--                          también: los topes hay que medirlos contra SU
--                          operación, no contra la web.
--
--   Los `*_mas_largo` son el valor más grande que ha entrado de verdad. Cuanto
--   más lejos estén de su tope, más holgura hay. El tope de cada uno va al lado.
-- ============================================================================

select
  (select string_agg(policyname || ' [' || cmd || ' → ' || array_to_string(roles, ',') || ']', '  |  ')
     from pg_policies
    where schemaname = 'public' and tablename = 'cotizaciones')                      as politicas,
  (select relrowsecurity from pg_class where oid = 'public.cotizaciones'::regclass)  as rls_activo,
  (select count(*) from pg_constraint
    where conrelid = 'public.cotizaciones'::regclass
      and conname in ('cotz_web_atencion_largo', 'cotz_web_items_tope'))             as restricciones,
  d.rechazaria_la_politica,
  d.filas_totales,
  d.de_la_web,
  d.de_otro_origen,
  d.nombre_mas_largo,      -- tope 120
  d.telefono_mas_largo,    -- tope 30
  d.email_mas_largo,       -- tope 160
  d.proyecto_mas_largo,    -- tope 160
  d.direccion_mas_larga,   -- tope 300
  d.mas_lineas,            -- tope 40
  d.cantidad_mayor         -- tope 100.000
from (
  select
    count(*)                                        as filas_totales,
    count(*) filter (where numero like 'WEB-%')     as de_la_web,
    count(*) filter (where numero not like 'WEB-%') as de_otro_origen,
    max(length(atencion))                           as nombre_mas_largo,
    max(length(telefono))                           as telefono_mas_largo,
    max(length(email))                              as email_mas_largo,
    max(length(proyecto))                           as proyecto_mas_largo,
    max(length(direccion))                          as direccion_mas_larga,
    max(jsonb_array_length(items))                  as mas_lineas,
    max(cantidad)                                   as cantidad_mayor,
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
    ))                                              as rechazaria_la_politica
  from public.cotizaciones
) d;
