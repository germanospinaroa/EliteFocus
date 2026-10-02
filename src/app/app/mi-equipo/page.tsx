import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { TeamClient } from '@/components/people/team-client';

export default async function TeamPage() {
  const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/login');
  const admin = createAdminClient(); const { data: actor } = await admin.from('profiles').select('experience_type').eq('id', user.id).maybeSingle(); if (actor?.experience_type !== 'AMBASSADOR') redirect('/app');
  const { data: people } = await admin.from('profiles').select('id,first_name,last_name,zilis_id,username,experience_type,onboarding_completed,current_stage,created_at,sponsor_id,advisor_id').or(`sponsor_id.eq.${user.id},advisor_id.eq.${user.id}`).order('created_at', { ascending: false });
  const list = people ?? []; const ids = list.map((person) => person.id);
  const { data: events } = ids.length ? await admin.from('events').select('user_id,event_name,created_at').in('user_id', ids).order('created_at', { ascending: false }) : { data: [] as { user_id: string; event_name: string; created_at: string }[] };
  const latest = new Map<string, { event_name: string; created_at: string }>(); for (const event of events ?? []) if (!latest.has(event.user_id)) latest.set(event.user_id, event);
  return <TeamClient initialList={list.map((person) => ({ ...person, status: person.onboarding_completed ? 'ACTIVO' : 'PENDIENTE' }))} initialLatest={Array.from(latest.entries())} ambassadors={list.filter((person) => person.experience_type === 'AMBASSADOR').length} clients={list.filter((person) => person.experience_type === 'CLIENT_VIP').length} />;
}
