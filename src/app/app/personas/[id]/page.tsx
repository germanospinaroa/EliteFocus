import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { PersonDetailClient } from '@/components/people/person-detail-client';

export default async function PersonDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) redirect('/login');
  const admin = createAdminClient(); const { data: actor } = await admin.from('profiles').select('experience_type,platform_role').eq('id', user.id).maybeSingle(); if (actor?.experience_type !== 'AMBASSADOR') redirect('/app');
  const query = admin.from('profiles').select('id,first_name,last_name,email,zilis_id,username,experience_type,must_change_password,onboarding_completed,current_stage,created_at,sponsor_id,advisor_id').eq('id', params.id);
  const { data: person } = actor.platform_role === 'OWNER' ? await query.maybeSingle() : await query.or(`sponsor_id.eq.${user.id},advisor_id.eq.${user.id}`).maybeSingle();
  if (!person) notFound();
  const relation = person.experience_type === 'AMBASSADOR' ? person.sponsor_id : person.advisor_id;
  const { data: relationProfile } = relation ? await admin.from('profiles').select('first_name,last_name').eq('id', relation).maybeSingle() : { data: null };
  const { data: latestEvent } = await admin.from('events').select('event_name,created_at').eq('user_id', person.id).order('created_at', { ascending: false }).limit(1).maybeSingle();
  return <main className="real-page person-detail"><div className="admin-back"><Link href="/app/personas">← Personas</Link></div><PersonDetailClient person={person} relationName={relationProfile ? `${relationProfile.first_name ?? ''} ${relationProfile.last_name ?? ''}`.trim() : null} latestEvent={latestEvent} canReset={actor.platform_role === 'OWNER' || person.sponsor_id === user.id || person.advisor_id === user.id} /></main>;
}
