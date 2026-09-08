-- Esquema de base de datos para el sistema de disponibilidad de RFM.
-- Cómo usarlo: Supabase Dashboard → tu proyecto → SQL Editor → New query →
-- pegá todo este archivo → Run. Se puede ejecutar una sola vez.

create extension if not exists pgcrypto;
create extension if not exists btree_gist;

-- Casas que se alquilan por día (las 4 unidades de Las Termas)
create table if not exists houses (
  id text primary key,
  name text not null
);

insert into houses (id, name) values
  ('guaviyu-1', 'Guaviyú — Unidad 1'),
  ('guaviyu-2', 'Guaviyú — Unidad 2'),
  ('anacahuita-1', 'Anacahuita — Unidad 1'),
  ('anacahuita-2', 'Anacahuita — Unidad 2')
on conflict (id) do nothing;

-- Reservas / bloqueos de fechas
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  house_id text not null references houses(id),
  check_in date not null,
  check_out date not null,
  status text not null default 'reservado' check (status in ('reservado', 'bloqueado')),
  guest_note text,
  created_at timestamptz not null default now(),
  -- rango de estadía: entrada incluida, salida excluida (el día de salida
  -- queda libre para que otra reserva pueda empezar ese mismo día)
  stay daterange generated always as (daterange(check_in, check_out, '[)')) stored,
  constraint check_out_after_check_in check (check_out > check_in)
);

-- Evita reservas superpuestas para la misma casa a nivel de base de datos
alter table bookings drop constraint if exists no_overlapping_bookings;
alter table bookings
  add constraint no_overlapping_bookings
  exclude using gist (house_id with =, stay with &&);

-- Seguridad: lectura pública, escritura solo para usuarios logueados
alter table houses enable row level security;
alter table bookings enable row level security;

drop policy if exists "Cualquiera puede ver las casas" on houses;
create policy "Cualquiera puede ver las casas" on houses
  for select using (true);

drop policy if exists "Cualquiera puede ver las reservas" on bookings;
create policy "Cualquiera puede ver las reservas" on bookings
  for select using (true);

drop policy if exists "Solo logueados crean reservas" on bookings;
create policy "Solo logueados crean reservas" on bookings
  for insert to authenticated with check (true);

drop policy if exists "Solo logueados editan reservas" on bookings;
create policy "Solo logueados editan reservas" on bookings
  for update to authenticated using (true);

drop policy if exists "Solo logueados borran reservas" on bookings;
create policy "Solo logueados borran reservas" on bookings
  for delete to authenticated using (true);

-- Habilita que los cambios se transmitan en vivo a la página pública
alter publication supabase_realtime add table bookings;
