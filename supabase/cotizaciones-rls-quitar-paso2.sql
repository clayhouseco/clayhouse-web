-- ============================================================================
-- QUITAR LAS DOS RESTRICCIONES DE TABLA DEL PASO 2.
--
-- Córralo. Son tres líneas y devuelve una fila diciendo cómo quedó.
--
-- POR QUÉ SE QUITAN
--
-- `public.cotizaciones` no es una tabla de la web: es del ERP, y la web le
-- escribe dentro. 28 de sus 34 filas las puso el ERP.
--
-- Una POLÍTICA de RLS ataña a un rol —acá, `anon`, que es el navegador— y el
-- ERP entra con credenciales de servicio, que se saltan RLS. Por eso la
-- política del Paso 1 no lo toca, y por eso se queda: es la que cierra el
-- agujero de que cualquiera escriba lo que quiera con la clave publicable.
--
-- Una RESTRICCIÓN DE TABLA, en cambio, aplica a todos. Y una de las dos se
-- justificó con un argumento que no tiene nada que ver con el ERP: el tope de
-- 40 líneas salió de que el catálogo cotizable de la web tiene 23 opciones. Una
-- cotización interna de un proyecto grande puede pasar de 40 renglones sin que
-- eso sea un abuso, y a partir de ahora el ERP fallaría al guardarla, con el
-- error en la cara de quien esté cotizando.
--
-- No aportan nada que la política no cubra ya para la web, y sí le añaden al
-- ERP una forma nueva de fallar. Fue un error meterlas en una tabla compartida.
-- ============================================================================

alter table public.cotizaciones drop constraint if exists cotz_web_atencion_largo;
alter table public.cotizaciones drop constraint if exists cotz_web_items_tope;

-- Cómo quedó: `restricciones_que_quedan` debe ser 0 y la política debe seguir ahí.
select
  (select count(*) from pg_constraint
    where conrelid = 'public.cotizaciones'::regclass
      and conname in ('cotz_web_atencion_largo', 'cotz_web_items_tope'))             as restricciones_que_quedan,
  (select string_agg(policyname || ' [' || cmd || ' → ' || array_to_string(roles, ',') || ']', '  |  ')
     from pg_policies
    where schemaname = 'public' and tablename = 'cotizaciones')                      as politicas,
  (select relrowsecurity from pg_class where oid = 'public.cotizaciones'::regclass)  as rls_activo;
