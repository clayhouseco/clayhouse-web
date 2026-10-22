-- ============================================================================
-- CONTAR EL RITMO DEL COTIZADOR SIN ENTREGAR LAS LLAVES DEL ERP.
--
-- Córralo entero: es una sola cosa, y se deshace con una línea (abajo del todo).
--
-- POR QUÉ EXISTE
--
-- La vigilancia necesita saber cuántas cotizaciones entran por hora. La clave publicable no
-- puede leer la tabla —eso es justo lo que cierra la política de RLS, y está bien así— y la
-- alternativa era usar la `service_role`: una credencial que se salta RLS y permite leer y
-- modificar TODO el ERP. Pedirla para contar filas, y además guardarla en GitHub, es
-- desproporcionado.
--
-- Esta función devuelve tres enteros y nada más. Ni una fila, ni un nombre, ni un teléfono.
-- Con eso la vigilancia corre con la clave que ya viaja en el HTML y no hay ningún secreto
-- que guardar en ninguna parte.
--
-- NO TOCA LA TABLA. No la altera, no le pone restricciones, no le añade disparadores. Es un
-- objeto nuevo al lado. Después de aplicar restricciones a una tabla compartida con el ERP y
-- tener que retirarlas el mismo día, esa es la regla.
--
-- SOBRE `security definer`: la función corre con los permisos de quien la crea, que es lo
-- que le permite leer la tabla cuando quien llama no puede. Por eso está escrita sin SQL
-- dinámico, con el `search_path` fijado y devolviendo solo enteros: no hay por dónde
-- sacarle otra cosa.
-- ============================================================================

create or replace function public.ritmo_cotizaciones_web()
returns table (ultima_hora integer, hoy integer, total_web integer)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  -- La ventana se calcula sobre el NÚMERO de solicitud, que la web arma como
  -- WEB-AAAAMMDD-HHMMSS y que ordena igual como texto que como fecha.
  --
  -- OJO CON LA HORA: ese número lo estampa el RELOJ DEL VISITANTE, no el servidor. Para
  -- quien cotiza desde Colombia —la inmensa mayoría— es hora de Bogotá, así que es contra
  -- esa que se compara. Un visitante en otro huso caería en la ventana de al lado. Para
  -- detectar un pico eso da igual; para auditar una hora concreta, no serviría.
  select
    count(*) filter (
      where numero >= to_char(
        (now() at time zone 'America/Bogota') - interval '1 hour', '"WEB-"YYYYMMDD-HH24MISS')
    )::integer,
    count(*) filter (
      where numero like to_char(now() at time zone 'America/Bogota', '"WEB-"YYYYMMDD') || '%'
    )::integer,
    count(*) filter (where numero like 'WEB-%')::integer
  from public.cotizaciones;
$$;

-- Que solo pueda llamarla quien deba, y solo para esto.
revoke all on function public.ritmo_cotizaciones_web() from public;
grant execute on function public.ritmo_cotizaciones_web() to anon, authenticated;

-- Comprobación: debe devolver una fila con tres números.
select * from public.ritmo_cotizaciones_web();


-- ---------------------------------------------------------------------------
-- PARA DESHACERLO, si alguna vez sobra:
--
--   drop function if exists public.ritmo_cotizaciones_web();
--
-- No deja rastro: no se cambió nada de la tabla.
-- ---------------------------------------------------------------------------
