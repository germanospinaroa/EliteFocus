-- QA corrections. Additive only; do not modify previously applied migrations.
alter table public.audit_logs add column if not exists target_snapshot jsonb;
alter table public.audit_logs enable row level security;
revoke insert, update, delete on public.audit_logs from anon, authenticated;
drop policy if exists "audit logs owner read" on public.audit_logs;
create policy "audit logs owner read" on public.audit_logs for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.experience_type = 'AMBASSADOR' and p.platform_role in ('OWNER','ADMIN'))
);

create index if not exists audit_logs_entity_idx on public.audit_logs(entity_type, entity_id, created_at desc);
