-- RESERVLY — Schema completo
-- Ejecutar en Supabase SQL Editor

-- 1. NEGOCIOS
create table negocios (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  nombre text not null,
  slug text unique not null,
  telefono text,
  email text,
  direccion text,
  descripcion text,
  tipo text default 'profesional',
  plan text default 'solo',
  activo boolean default true,
  onboarding_completado boolean default false,
  created_at timestamptz default now()
);

-- 2. EMPLEADOS
create table empleados (
  id uuid default gen_random_uuid() primary key,
  negocio_id uuid references negocios(id) on delete cascade,
  nombre text not null,
  email text,
  telefono text,
  color text default '#0A9E6E',
  activo boolean default true,
  tipo_comision text default 'ninguna',
  comision_valor numeric default 0,
  created_at timestamptz default now()
);

-- 3. SERVICIOS
create table servicios (
  id uuid default gen_random_uuid() primary key,
  negocio_id uuid references negocios(id) on delete cascade,
  nombre text not null,
  descripcion text,
  duracion integer not null,
  precio numeric,
  precio_a_consultar boolean default false,
  categoria text,
  activo boolean default true,
  created_at timestamptz default now()
);

-- 4. CLIENTES
create table clientes (
  id uuid default gen_random_uuid() primary key,
  negocio_id uuid references negocios(id) on delete cascade,
  nombre text not null,
  email text,
  telefono text,
  notas text,
  tag text default 'regular',
  created_at timestamptz default now()
);

-- 5. RESERVAS
create table reservas (
  id uuid default gen_random_uuid() primary key,
  negocio_id uuid references negocios(id) on delete cascade,
  cliente_id uuid references clientes(id) on delete set null,
  empleado_id uuid references empleados(id) on delete set null,
  servicio_id uuid references servicios(id) on delete set null,
  fecha date not null,
  hora_inicio time not null,
  hora_fin time not null,
  estado text default 'confirmada',
  precio_final numeric,
  notas text,
  created_at timestamptz default now()
);

-- 6. TPV
create table tpv (
  id uuid default gen_random_uuid() primary key,
  reserva_id uuid references reservas(id) on delete cascade,
  negocio_id uuid references negocios(id) on delete cascade,
  metodo_pago text,
  importe numeric not null,
  propina numeric default 0,
  factura_enviada boolean default false,
  created_at timestamptz default now()
);

-- 7. PRODUCTOS TPV
create table tpv_productos (
  id uuid default gen_random_uuid() primary key,
  tpv_id uuid references tpv(id) on delete cascade,
  nombre text not null,
  precio numeric not null
);

-- 8. BONOS
create table bonos (
  id uuid default gen_random_uuid() primary key,
  negocio_id uuid references negocios(id) on delete cascade,
  nombre text not null,
  tipo text not null,
  sesiones integer,
  importe numeric,
  precio numeric not null,
  servicio_id uuid references servicios(id) on delete set null,
  activo boolean default true,
  created_at timestamptz default now()
);

-- 9. BONOS DE CLIENTES
create table cliente_bonos (
  id uuid default gen_random_uuid() primary key,
  bono_id uuid references bonos(id) on delete cascade,
  cliente_id uuid references clientes(id) on delete cascade,
  sesiones_restantes integer,
  saldo_restante numeric,
  activo boolean default true,
  created_at timestamptz default now()
);

-- 10. DESCUENTOS
create table descuentos (
  id uuid default gen_random_uuid() primary key,
  negocio_id uuid references negocios(id) on delete cascade,
  tipo text not null,
  nombre text not null,
  codigo text,
  porcentaje numeric,
  importe_fijo numeric,
  usos_maximos integer,
  usos_actuales integer default 0,
  fecha_limite date,
  activo boolean default true,
  created_at timestamptz default now()
);

-- 11. VALORACIONES
create table valoraciones (
  id uuid default gen_random_uuid() primary key,
  reserva_id uuid references reservas(id) on delete cascade,
  negocio_id uuid references negocios(id) on delete cascade,
  cliente_id uuid references clientes(id) on delete set null,
  estrellas integer check (estrellas between 1 and 5),
  resultado integer check (resultado between 1 and 5),
  trato integer check (trato between 1 and 5),
  limpieza integer check (limpieza between 1 and 5),
  puntualidad integer check (puntualidad between 1 and 5),
  comentario text,
  created_at timestamptz default now()
);

-- 12. CIERRES
create table cierres (
  id uuid default gen_random_uuid() primary key,
  negocio_id uuid references negocios(id) on delete cascade,
  empleado_id uuid references empleados(id) on delete cascade,
  tipo text not null,
  fecha_inicio date not null,
  fecha_fin date not null,
  motivo text,
  created_at timestamptz default now()
);

-- 13. CONFIGURACION
create table configuracion (
  id uuid default gen_random_uuid() primary key,
  negocio_id uuid references negocios(id) on delete cascade unique,
  notif_email boolean default true,
  notif_whatsapp boolean default true,
  recordatorio boolean default true,
  recordatorio_horas integer default 2,
  valoraciones boolean default true,
  cancelacion boolean default true,
  cancelacion_horas integer default 2,
  senal boolean default false,
  senal_importe numeric default 10,
  lista_espera boolean default true,
  retencion boolean default true,
  retencion_semanas integer default 4,
  created_at timestamptz default now()
);

-- RLS
alter table negocios      enable row level security;
alter table empleados     enable row level security;
alter table servicios     enable row level security;
alter table clientes      enable row level security;
alter table reservas      enable row level security;
alter table tpv           enable row level security;
alter table tpv_productos enable row level security;
alter table bonos         enable row level security;
alter table cliente_bonos enable row level security;
alter table descuentos    enable row level security;
alter table valoraciones  enable row level security;
alter table cierres       enable row level security;
alter table configuracion enable row level security;

-- Políticas
create policy "negocio propio" on negocios
  for all using (auth.uid() = user_id);

create policy "empleados de mi negocio" on empleados
  for all using (negocio_id in (select id from negocios where user_id = auth.uid()));

create policy "servicios de mi negocio" on servicios
  for all using (negocio_id in (select id from negocios where user_id = auth.uid()));

create policy "clientes de mi negocio" on clientes
  for all using (negocio_id in (select id from negocios where user_id = auth.uid()));

create policy "reservas de mi negocio" on reservas
  for all using (negocio_id in (select id from negocios where user_id = auth.uid()));

create policy "tpv de mi negocio" on tpv
  for all using (negocio_id in (select id from negocios where user_id = auth.uid()));

create policy "bonos de mi negocio" on bonos
  for all using (negocio_id in (select id from negocios where user_id = auth.uid()));

create policy "descuentos de mi negocio" on descuentos
  for all using (negocio_id in (select id from negocios where user_id = auth.uid()));

create policy "valoraciones de mi negocio" on valoraciones
  for all using (negocio_id in (select id from negocios where user_id = auth.uid()));

create policy "cierres de mi negocio" on cierres
  for all using (negocio_id in (select id from negocios where user_id = auth.uid()));

create policy "configuracion de mi negocio" on configuracion
  for all using (negocio_id in (select id from negocios where user_id = auth.uid()));

-- Trigger para crear negocio al registrarse
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.negocios (user_id, nombre, slug)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre_negocio', 'Mi negocio'),
    coalesce(new.raw_user_meta_data->>'slug', 'negocio-' || substr(new.id::text, 1, 8))
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Política pública para reservas (página pública sin login)
create policy "pagina publica lee negocios" on negocios
  for select using (true);

create policy "pagina publica lee servicios" on servicios
  for select using (true);

create policy "pagina publica lee empleados" on empleados
  for select using (true);

create policy "pagina publica lee cierres" on cierres
  for select using (true);

create policy "pagina publica inserta clientes" on clientes
  for insert with check (true);

create policy "pagina publica inserta reservas" on reservas
  for insert with check (true);

create policy "pagina publica lee reservas" on reservas
  for select using (true);

create policy "pagina publica lee clientes" on clientes
  for select using (true);