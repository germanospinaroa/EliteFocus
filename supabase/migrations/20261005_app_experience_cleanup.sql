-- Keep the legacy column for compatibility with already-applied migrations.
-- New navigation and authorization derive team visibility from sponsor_id/advisor_id.
comment on column public.profiles.leadership_enabled is 'DEPRECATED legacy field. Do not use for navigation or authorization.';
create index if not exists profiles_sponsor_id_idx on public.profiles(sponsor_id) where sponsor_id is not null;
create index if not exists profiles_advisor_id_idx on public.profiles(advisor_id) where advisor_id is not null;
