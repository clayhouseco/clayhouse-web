-- ============================================================================
-- MIRAR EL RITMO DEL COTIZADOR, SIN DEJAR NADA PUESTO.
--
-- DE SOLO LECTURA Y SIN EFECTOS. No crea funciones, ni vistas, ni índices: se pega, se
-- corre, y la base queda exactamente como estaba. Ese es el punto.
--
-- POR QUÉ ES UNA CONSULTA Y NO UNA VIGILANCIA AUTOMÁTICA
--
-- Para avisar solo, algo tendría que poder contar las filas sin intervención — y para eso
-- hace falta o una credencial privilegiada del ERP, o un objeto nuevo dentro de su base.
-- Las dos cosas son de la web metiéndose en el ERP, y el ERP tiene su propio código y su
-- propio programa: la web se arma con lo que se monte allá, no al revés.
--
-- Así que la vigilancia es manual y a propósito. Córrala si alguna vez sospecha —la bandeja
-- comercial llena de cotizaciones raras, un pico sin explicación— o de vez en cuando.
--
--   Supabase → SQL Editor → New query → pegar → Run
--
-- QUÉ ESPERAR. En cuatro meses la web había dejado seis cotizaciones. Veinte en una hora o
-- cien en un día sería el mejor día de la historia; si no hubo campaña que lo explique,
-- mire las filas una por una antes de creérselo.
-- ============================================================================

select
  count(*) filter (where numero like 'WEB-%')                                    as de_la_web_total,
  count(*) filter (where numero not like 'WEB-%')                                as del_erp_total,
  count(*) filter (
    where numero like to_char(now() at time zone 'America/Bogota', '"WEB-"YYYYMMDD') || '%'
  )                                                                              as de_la_web_hoy,
  count(*) filter (
    where numero >= to_char(
      (now() at time zone 'America/Bogota') - interval '1 hour', '"WEB-"YYYYMMDD-HH24MISS')
      and numero like 'WEB-%'
  )                                                                              as de_la_web_ultima_hora,
  max(numero) filter (where numero like 'WEB-%')                                 as ultima_de_la_web
from public.cotizaciones;

-- La hora sale del NÚMERO de solicitud, que la web arma como WEB-AAAAMMDD-HHMMSS y que
-- ordena igual como texto que como fecha. Lo estampa el reloj del visitante, así que la
-- ventana es la de Colombia: para detectar un pico sirve, para auditar una hora exacta no.


-- ---------------------------------------------------------------------------
-- SI LAS FILAS SON BASURA: cortar la escritura anónima mientras se limpia.
--
--   alter policy "web inserta cotizaciones" on public.cotizaciones
--     with check (false);
--
-- Eso deja el cotizador sin registrar, pero NO deja el negocio parado: el cliente ve el
-- aviso de error y los botones de WhatsApp y de correo siguen funcionando igual.
--
-- Para volver a abrir, correr de nuevo el Paso 1 de `cotizaciones-rls.sql`.
-- ---------------------------------------------------------------------------
