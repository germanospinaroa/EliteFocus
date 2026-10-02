-- Invite-only identity model. Apply after 20261001_activation_slice.sql.
-- This migration is also safe on databases where the legacy user_roles table
-- was not created yet.
do $$ begin
  create type public.user_role as enum ('customer','ambassador','leader','admin');
exception when duplicate_object then null;
end $$;

create table if not exists public.user_roles (
  user_id uuid references public.profiles(id) on delete cascade,
  role public.user_role not null,
  primary key(user_id, role)
);

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists full_name text;
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists onboarding_completed boolean not null default false;
alter table public.profiles add column if not exists onboarding_complete boolean not null default false;
alter table public.profiles add column if not exists onboarding_data jsonb not null default '{}'::jsonb;
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists market text;
alter table public.profiles add column if not exists preferred_channel text;
alter table public.profiles add column if not exists experience_level text;
alter table public.profiles add column if not exists weekly_time text;
alter table public.profiles add column if not exists starting_preference text;
alter table public.profiles add column if not exists primary_goal text;
alter table public.profiles add column if not exists current_stage text default 'ORIENTATION';
alter table public.profiles add column if not exists created_at timestamptz default now();
alter table public.profiles add column if not exists updated_at timestamptz default now();
alter table public.profiles add column if not exists username text;
alter table public.profiles add column if not exists zilis_id text;
alter table public.profiles add column if not exists experience_type text not null default 'AMBASSADOR';
alter table public.profiles add column if not exists platform_role text not null default 'MEMBER';
alter table public.profiles add column if not exists leadership_enabled boolean not null default false;
alter table public.profiles add column if not exists must_change_password boolean not null default false;
alter table public.profiles add column if not exists created_by_user_id uuid references public.profiles(id);
alter table public.profiles add column if not exists sponsor_id uuid references public.profiles(id);
alter table public.profiles add column if not exists advisor_id uuid references public.profiles(id);
alter table public.profiles add column if not exists phone text;

create unique index if not exists profiles_username_uidx on public.profiles(username) where username is not null;
create unique index if not exists profiles_zilis_id_uidx on public.profiles(zilis_id) where zilis_id is not null;
alter table public.profiles drop constraint if exists profiles_experience_type_check;
alter table public.profiles add constraint profiles_experience_type_check check (experience_type in ('CLIENT_VIP','AMBASSADOR'));
alter table public.profiles drop constraint if exists profiles_platform_role_check;
alter table public.profiles add constraint profiles_platform_role_check check (platform_role in ('OWNER','ADMIN','MEMBER'));

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$
  select exists(
    select 1 from public.profiles
    where id = auth.uid()
      and experience_type = 'AMBASSADOR'
      and platform_role in ('OWNER','ADMIN')
  );
$$;

-- Existing records are normalized to the two public experiences. Legacy leader/admin
-- records remain internal permissions on the ambassador experience.
update public.profiles p set experience_type = case when exists (
  select 1 from public.user_roles r where r.user_id = p.id and r.role = 'customer'
) then 'CLIENT_VIP' else 'AMBASSADOR' end;
update public.profiles p set platform_role = case when exists (
  select 1 from public.user_roles r where r.user_id = p.id and r.role = 'admin'
) then 'ADMIN' else 'MEMBER' end;
update public.profiles p set leadership_enabled = true where exists (
  select 1 from public.user_roles r where r.user_id = p.id and r.role = 'leader'
);

drop policy if exists "users read created profiles" on public.profiles;
create policy "users read created profiles" on public.profiles for select using (auth.uid() = created_by_user_id);

-- The trigger creates a minimal profile for an Auth user; the invite endpoint fills
-- the identity and relationship fields immediately afterward using the service role.
create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,email,full_name,first_name,last_name,experience_type,platform_role)
  values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',''),new.raw_user_meta_data->>'first_name',new.raw_user_meta_data->>'last_name','AMBASSADOR','MEMBER')
  on conflict(id) do update set email=excluded.email;
  insert into public.user_roles(user_id,role) values(new.id,'ambassador'::public.user_role) on conflict do nothing;
  return new;
end; $$;

comment on table public.profiles is 'Invite-only identities. experience_type is CLIENT_VIP or AMBASSADOR; platform_role and leadership_enabled are internal permissions.';
