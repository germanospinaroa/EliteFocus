-- Native catalog links and privacy-conscious tracking. Do not modify prior migrations.
create table if not exists public.catalog_links (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  link_type text,
  product_id text,
  resource_id uuid,
  cta text,
  created_at timestamptz not null default now()
);
alter table public.catalog_links add column if not exists owner_user_id uuid references public.profiles(id);
alter table public.catalog_links add column if not exists contact_id uuid references public.profiles(id);
alter table public.catalog_links add column if not exists token text;
alter table public.catalog_links add column if not exists recipient_label text;
alter table public.catalog_links add column if not exists label text;
alter table public.catalog_links add column if not exists target_type text not null default 'CATALOG';
alter table public.catalog_links add column if not exists product_slug text;
alter table public.catalog_links add column if not exists destination_url text;
alter table public.catalog_links add column if not exists status text not null default 'ACTIVE';
alter table public.catalog_links add column if not exists updated_at timestamptz default now();
alter table public.catalog_links add column if not exists total_sessions integer not null default 0;
alter table public.catalog_links add column if not exists total_opens integer not null default 0;
alter table public.catalog_links add column if not exists total_product_views integer not null default 0;
alter table public.catalog_links add column if not exists first_seen_at timestamptz;
alter table public.catalog_links add column if not exists last_seen_at timestamptz;
create unique index if not exists catalog_links_token_uidx on public.catalog_links(token) where token is not null;
create index if not exists catalog_links_owner_idx on public.catalog_links(owner_user_id);
create index if not exists catalog_links_contact_idx on public.catalog_links(contact_id);

create table if not exists public.catalog_sessions (
  id uuid primary key default gen_random_uuid(),
  catalog_link_id uuid not null references public.catalog_links(id) on delete cascade,
  session_id text not null,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  event_count integer not null default 0,
  products_viewed jsonb not null default '{}'::jsonb,
  unique(catalog_link_id, session_id)
);
create index if not exists catalog_sessions_link_idx on public.catalog_sessions(catalog_link_id);
create index if not exists catalog_sessions_last_seen_idx on public.catalog_sessions(last_seen_at);

create table if not exists public.catalog_events (
  id uuid primary key default gen_random_uuid(),
  catalog_link_id uuid not null references public.catalog_links(id) on delete cascade,
  session_id text not null,
  event_type text not null check (event_type in ('LINK_OPENED','SESSION_STARTED','CATALOG_VIEWED','PRODUCT_VIEWED')),
  product_slug text,
  referrer text,
  occurred_at timestamptz not null default now()
);
create index if not exists catalog_events_link_idx on public.catalog_events(catalog_link_id);
create index if not exists catalog_events_session_idx on public.catalog_events(session_id);
create index if not exists catalog_events_occurred_idx on public.catalog_events(occurred_at);
create index if not exists catalog_events_product_idx on public.catalog_events(product_slug);
create unique index if not exists catalog_events_session_started_uidx on public.catalog_events(catalog_link_id, session_id) where event_type = 'SESSION_STARTED';

alter table public.catalog_links enable row level security;
alter table public.catalog_sessions enable row level security;
alter table public.catalog_events enable row level security;
drop policy if exists "catalog links owner read" on public.catalog_links;
create policy "catalog links owner read" on public.catalog_links for select using (auth.uid() = owner_user_id);
drop policy if exists "catalog sessions owner read" on public.catalog_sessions;
create policy "catalog sessions owner read" on public.catalog_sessions for select using (exists (select 1 from public.catalog_links l where l.id = catalog_link_id and l.owner_user_id = auth.uid()));
drop policy if exists "catalog events owner read" on public.catalog_events;
create policy "catalog events owner read" on public.catalog_events for select using (exists (select 1 from public.catalog_links l where l.id = catalog_link_id and l.owner_user_id = auth.uid()));
revoke insert, update, delete on public.catalog_links, public.catalog_sessions, public.catalog_events from anon, authenticated;

create or replace function public.cleanup_catalog_tracking() returns void language sql security definer set search_path=public as $$
  delete from public.catalog_events where occurred_at < now() - interval '60 days';
  delete from public.catalog_sessions where last_seen_at < now() - interval '12 months';
$$;
revoke all on function public.cleanup_catalog_tracking() from public;
grant execute on function public.cleanup_catalog_tracking() to service_role;

-- Supabase hosted projects expose pg_cron through the extensions schema.
-- Keep one daily job; this is server-side only and never runs from the browser.
create extension if not exists pg_cron with schema extensions;
select cron.unschedule(jobid) from cron.job where jobname = 'cleanup-catalog-tracking';
select cron.schedule('cleanup-catalog-tracking', '0 3 * * *', $$select public.cleanup_catalog_tracking();$$);
