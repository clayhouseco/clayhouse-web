-- ============================================================================
-- Clay House — tabla de cotizaciones preliminares generadas desde la web.
-- La web inserta aquí (vía función serverless con service_role key); el ERP
-- la lee para que la vendedora la trabaje y contacte al cliente.
--
-- Cómo aplicarlo: Supabase → SQL Editor → pega esto → Run.
-- ============================================================================

create table if not exists public.cotizaciones (
  id              uuid primary key default gen_random_uuid(),
  created_at      timestamptz not null default now(),
  estado          text not null default 'nueva',   -- nueva | en_proceso | enviada | cerrada
  origen          text not null default 'web',

  -- Cliente
  cliente_nombre     text not null,
  cliente_telefono   text not null,
  cliente_email      text,
  cliente_empresa    text,
  proyecto           text,

  -- Entrega y ubicación de obra
  entrega                 text not null default 'obra',  -- obra | planta
  ubicacion_direccion     text,
  ubicacion_municipio     text,
  ubicacion_departamento  text,
  ubicacion_lat           numeric,
  ubicacion_lng           numeric,
  ubicacion_maps          text,

  -- Productos (formato ERP) y notas
  -- lineas: [{ erpCodigo, producto, color, calidad, cantidad, unidad }]
  lineas            jsonb not null default '[]'::jsonb,
  nota              text,
  total_referencia  numeric
);

-- Para listar en el ERP las nuevas primero
create index if not exists cotizaciones_estado_created_idx
  on public.cotizaciones (estado, created_at desc);

-- Seguridad: se activa RLS y NO se crean políticas para el rol anónimo,
-- así el anon key (público) no puede leer ni escribir. La web escribe a través
-- de una función serverless con el service_role key (que omite RLS), y el ERP
-- lee/actualiza igualmente con credenciales de servicio o usuarios autenticados.
alter table public.cotizaciones enable row level security;
