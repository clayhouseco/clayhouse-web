-- ============================================================================
-- 9 de 34 filas no pasan la política. ¿Cuáles, de quién, y por qué?
--
-- DE SOLO LECTURA. Una sola consulta, una sola fila.
--
-- Dos preguntas distintas, y conviene no mezclarlas:
--
--   1. LA POLÍTICA solo ataña al rol `anon`, es decir a la web. Si entre las
--      rechazadas hay filas `WEB-…`, el cotizador está rechazando solicitudes
--      REALES ahora mismo y hay que aflojar el tope ya. Si todas las rechazadas
--      son del ERP, no pasa nada: el ERP entra con credenciales de servicio y
--      se salta RLS.
--
--   2. LAS DOS RESTRICCIONES DE TABLA sí aplican a todos, ERP incluido, y son
--      solo dos: nombre ≤ 120 y líneas ≤ 40. Si algo las viola, el ERP empezará
--      a fallar en sus propias inserciones.
--
-- Las columnas `falla_*` dicen qué condición concreta incumple cada fila, para
-- saber qué tope subir en vez de aflojar todo.
--
-- (La primera versión de esta consulta no corría: la subconsulta no exponía
--  `telefono` y la de afuera lo usaba. Corregido, y verificado con un chequeo
--  que confronta cada columna referenciada contra lo que la subconsulta expone,
--  en vez de leerlo a ojo.)
-- ============================================================================

select
  -- 1. ¿La web está rechazando trabajo real?
  count(*) filter (where not pasa and es_web)                    as WEB_rechazadas,
  count(*) filter (where not pasa and not es_web)                as erp_rechazadas,

  -- 2. ¿Las restricciones de tabla amenazan al ERP?
  count(*) filter (where length(atencion) > 120)                 as viola_restriccion_nombre,
  count(*) filter (where jsonb_array_length(items) > 40)         as viola_restriccion_lineas,

  -- 3. Qué condición incumple cada una (una fila puede incumplir varias).
  count(*) filter (where not c_atencion)                         as falla_nombre,
  count(*) filter (where not c_telefono)                         as falla_telefono,
  count(*) filter (where not c_email)                            as falla_email,
  count(*) filter (where not c_proyecto)                         as falla_proyecto,
  count(*) filter (where not c_direccion)                        as falla_direccion,
  count(*) filter (where not c_municipio)                        as falla_municipio,
  count(*) filter (where not c_departamento)                     as falla_departamento,
  count(*) filter (where not c_cantidad)                         as falla_cantidad,
  count(*) filter (where not c_items)                            as falla_lineas,
  count(*) filter (where not c_coords)                           as falla_coordenadas,

  -- 4. Cuántas de las rechazadas lo son por venir sin nombre o sin teléfono,
  --    que es lo típico de una cotización interna del ERP.
  count(*) filter (where not pasa and coalesce(trim(atencion), '') = '')  as rechazadas_sin_nombre,
  count(*) filter (where not pasa and coalesce(trim(telefono), '') = '')  as rechazadas_sin_telefono
from (
  select
    numero,
    atencion,
    telefono,
    items,
    numero like 'WEB-%'                                              as es_web,
    coalesce(length(trim(atencion)), 0) between 2 and 120            as c_atencion,
    coalesce(length(trim(telefono)), 0) between 7 and 30             as c_telefono,
    coalesce(length(email), 0) <= 160                                as c_email,
    coalesce(length(proyecto), 0) <= 160                             as c_proyecto,
    coalesce(length(direccion), 0) <= 300                            as c_direccion,
    coalesce(length(municipio), 0) <= 120                            as c_municipio,
    coalesce(length(departamento), 0) <= 120                         as c_departamento,
    coalesce(cantidad, 0) between 0 and 100000                       as c_cantidad,
    coalesce(jsonb_array_length(items), 0) <= 40                     as c_items,
    (lat_entrega is null or lat_entrega between -90 and 90)
      and (lng_entrega is null or lng_entrega between -180 and 180)  as c_coords,
    (
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
    )                                                                as pasa
  from public.cotizaciones
) x;
