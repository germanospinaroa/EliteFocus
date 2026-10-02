-- Elite Focus 2.0: real auth + activation vertical slice.
-- Requires 20261000_core_schema.sql (or supabase/schema.sql) first.
-- No destructive changes.

alter table public.profiles add column if not exists email text;
alter table public.profiles add column if not exists first_name text;
alter table public.profiles add column if not exists last_name text;
alter table public.profiles add column if not exists country text;
alter table public.profiles add column if not exists market text;
alter table public.profiles add column if not exists preferred_channel text;
alter table public.profiles add column if not exists experience_level text;
alter table public.profiles add column if not exists weekly_time text;
alter table public.profiles add column if not exists starting_preference text;
alter table public.profiles add column if not exists primary_goal text;
alter table public.profiles add column if not exists onboarding_completed boolean not null default false;
alter table public.profiles add column if not exists onboarding_data jsonb not null default '{}'::jsonb;
alter table public.profiles alter column full_name drop not null;
alter table public.actions add column if not exists user_id uuid references public.profiles(id);
alter table public.actions add column if not exists status text not null default 'PENDING';
alter table public.actions add column if not exists entity_type text;
alter table public.actions add column if not exists entity_id uuid;
alter table public.actions add column if not exists started_at timestamptz;
alter table public.actions add column if not exists completed_at timestamptz;
alter table public.actions add column if not exists metadata jsonb not null default '{}'::jsonb;
alter table public.followups add column if not exists user_id uuid references public.profiles(id);
alter table public.followups add column if not exists scheduled_for timestamptz;
alter table public.followups add column if not exists completed_at timestamptz;

create index if not exists events_user_event_idx on public.events(user_id,event_name,created_at desc);
create index if not exists actions_user_status_idx on public.actions(user_id,status);
create index if not exists followups_user_date_idx on public.followups(user_id,scheduled_for,status);

insert into public.journey_stages(slug,name,position,phase) values
('ORIENTATION','Orientation',1,'ACTIVATION'),('PRACTICE','Practice',2,'ACTIVATION'),('FIRST_ACTION','First action',3,'ACTIVATION'),('CONVERSATION','Conversation',4,'ACTIVATION'),('RECOMMENDATION','Recommendation',5,'ACTIVATION'),('FIRST_CUSTOMER','First customer',6,'REPETITION'),('REPEAT','Repeat',7,'REPETITION'),('SOCIAL_SELLING','Social selling',8,'SOCIAL_SELLING'),('BUSINESS','Business',9,'BUSINESS'),('DUPLICATION','Duplication',10,'DUPLICATION'),('LEADERSHIP','Leadership',11,'LEADERSHIP') on conflict(slug) do nothing;
insert into public.milestones(slug,name,description,event_key) values
('ONBOARDING_COMPLETED','Empezaste','Completaste tu espacio inicial.','onboarding_completed'),('FIRST_PRACTICE','Primera práctica','Practicaste tu primera conversación.','roleplay_completed'),('FIRST_ACTION','Primera acción','Completaste tu primera acción real.','first_action_completed'),('FIRST_CONVERSATION','Primera conversación','Registraste tu primera conversación.','contact_created'),('FIRST_FOLLOWUP','Primer seguimiento','Creaste tu primer seguimiento.','followup_created'),('FIRST_CUSTOMER','Primer cliente','Registraste tu primer cliente.','customer_created') on conflict(slug) do nothing;
insert into public.roleplay_scenarios(title,objective,stage_slug) select 'Tu primera conversación','Practicar cómo escuchar antes de recomendar.','PRACTICE' where not exists(select 1 from public.roleplay_scenarios where title='Tu primera conversación');

alter table public.actions enable row level security;
alter table public.user_milestones enable row level security;
alter table public.consents enable row level security;
alter table public.user_journey_state enable row level security;
drop policy if exists "profiles insert own" on public.profiles;
drop policy if exists "profiles read own" on public.profiles;
drop policy if exists "profiles update safe own" on public.profiles;
drop policy if exists "actions read own" on public.actions;
drop policy if exists "actions insert own" on public.actions;
drop policy if exists "actions update own" on public.actions;
drop policy if exists "milestones read own" on public.user_milestones;
drop policy if exists "consents manage own" on public.consents;
drop policy if exists "journey read own" on public.user_journey_state;
drop policy if exists "roles read own" on public.user_roles;
drop policy if exists "events read own" on public.events;
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.user_roles where user_id=auth.uid() and role='admin'); $$;
create policy "profiles insert own" on public.profiles for insert with check(auth.uid()=id);
create policy "profiles read own" on public.profiles for select using(auth.uid()=id);
create policy "profiles update safe own" on public.profiles for update using(auth.uid()=id) with check(auth.uid()=id);
create policy "actions read own" on public.actions for select using(auth.uid()=user_id);
create policy "actions insert own" on public.actions for insert with check(auth.uid()=user_id);
create policy "actions update own" on public.actions for update using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "milestones read own" on public.user_milestones for select using(auth.uid()=user_id);
create policy "consents manage own" on public.consents for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
create policy "journey read own" on public.user_journey_state for select using(auth.uid()=user_id);
create policy "roles read own" on public.user_roles for select using(auth.uid()=user_id);
create policy "events read own" on public.events for select using(auth.uid()=user_id);
create policy "admin read profiles" on public.profiles for select using(public.is_admin());
create policy "admin read roles" on public.user_roles for select using(public.is_admin());
create policy "admin read events" on public.events for select using(public.is_admin());
create policy "admin read milestones" on public.user_milestones for select using(public.is_admin());
create policy "user role choice" on public.user_roles for delete using(auth.uid()=user_id);
create policy "user role choice insert" on public.user_roles for insert with check(auth.uid()=user_id and role in('customer','ambassador'));

create or replace function public.award_milestone(p_user_id uuid,p_slug text,p_evidence jsonb default '{}'::jsonb) returns boolean language plpgsql security definer set search_path=public as $$
declare v_milestone uuid; v_inserted int;
begin
  if auth.uid() is null or auth.uid()<>p_user_id then raise exception 'not allowed'; end if;
  select id into v_milestone from public.milestones where slug=p_slug;
  if v_milestone is null then return false; end if;
  insert into public.user_milestones(user_id,milestone_id,evidence) values(p_user_id,v_milestone,p_evidence) on conflict(user_id,milestone_id) do nothing;
  get diagnostics v_inserted=row_count;
  return v_inserted=1;
end; $$;
revoke all on function public.award_milestone(uuid,text,jsonb) from public;
grant execute on function public.award_milestone(uuid,text,jsonb) to authenticated;

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public as $$
begin
  insert into public.profiles(id,email,full_name,first_name,last_name) values(new.id,new.email,coalesce(new.raw_user_meta_data->>'full_name',''),new.raw_user_meta_data->>'first_name',new.raw_user_meta_data->>'last_name') on conflict(id) do update set email=excluded.email;
  insert into public.user_roles(user_id,role) values(new.id,case when coalesce(new.raw_user_meta_data->>'role','ambassador')='customer' then 'customer'::public.user_role else 'ambassador'::public.user_role end) on conflict do nothing;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
