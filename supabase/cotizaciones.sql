-- ============================================================================
-- Clay House — cotizaciones preliminares generadas desde la WEB.
-- Se usa una tabla propia (cotizaciones_web) para NO chocar con la tabla
-- `cotizaciones` que ya existe en el proyecto (la del ERP). El ERP la lee como
-- "bandeja de solicitudes desde la web" y la vendedora la trabaja/contacta.
--
-- Cómo aplicarlo: Supabase → SQL Editor → New query → pega esto → Run.
-- ============================================================================

create table if not exists public.cotizaciones_web (
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
create index if not exists cotizaciones_web_estado_created_idx
  on public.cotizaciones_web (estado, created_at desc);

-- Seguridad (RLS): la web escribe con la anon/publishable key (pública), pero
-- SOLO puede INSERTAR — no leer, editar ni borrar. El ERP lee/actualiza con
-- credenciales de servicio o usuarios autenticados (que omiten estas políticas).
alter table public.cotizaciones_web enable row level security;

drop policy if exists "web inserta cotizaciones" on public.cotizaciones_web;
create policy "web inserta cotizaciones"
  on public.cotizaciones_web for insert
  to anon
  with check (
    length(cliente_nombre) between 2 and 120
    and length(cliente_telefono) between 5 and 40
    and jsonb_typeof(lineas) = 'array'
    and jsonb_array_length(lineas) between 1 and 100
  );
