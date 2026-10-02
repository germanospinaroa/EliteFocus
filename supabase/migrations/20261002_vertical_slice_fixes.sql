-- Corrective migration after 20261001_activation_slice.sql.
-- Fixes journey persistence without allowing clients to choose arbitrary stages.

create or replace function public.set_journey_state(p_stage_slug text, p_evidence jsonb default '{}'::jsonb) returns boolean language plpgsql security definer set search_path=public as $$
declare v_stage uuid;
begin
  if auth.uid() is null then raise exception 'not allowed'; end if;
  select id into v_stage from public.journey_stages where slug=p_stage_slug;
  if v_stage is null then return false; end if;
  insert into public.user_journey_state(user_id,stage_id,evidence) values(auth.uid(),v_stage,p_evidence)
  on conflict(user_id) do update set stage_id=excluded.stage_id, evidence=excluded.evidence, entered_at=now();
  return true;
end; $$;
revoke all on function public.set_journey_state(text,jsonb) from public;
grant execute on function public.set_journey_state(text,jsonb) to authenticated;
