import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { trackEvent, awardMilestone } from '@/lib/events';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error:'No autenticado' }, { status:401 });
  const body = await request.json();
  const { data: existingProfile } = await supabase.from('profiles').select('experience_type').eq('id', user.id).single();
  const role = existingProfile?.experience_type === 'CLIENT_VIP' ? 'customer' : 'ambassador';
  const stage = role === 'ambassador' && (body.startingPreference === 'Quiero empezar haciendo' || body.primaryGoal === 'Conseguir mi primer cliente' || body.primaryGoal === 'Empezar a mover mi negocio' || body.experienceLevel === 'Sí, tengo experiencia') ? 'FIRST_ACTION' : role === 'ambassador' ? 'PRACTICE' : 'ORIENTATION';
  const { error: profileError } = await supabase.from('profiles').update({ first_name:body.firstName, last_name:body.lastName, full_name:`${body.firstName} ${body.lastName}`.trim(), experience_level:body.experienceLevel ?? null, starting_preference:body.startingPreference ?? null, primary_goal:body.primaryGoal ?? null, onboarding_data:{ role, primaryGoal: body.primaryGoal ?? null, experienceLevel: body.experienceLevel ?? null, startingPreference: body.startingPreference ?? null }, onboarding_completed:true, onboarding_complete:true, current_stage:stage }).eq('id', user.id);
  if (profileError) return NextResponse.json({ error:'No pudimos guardar tu onboarding.' }, { status:400 });
  await supabase.from('user_roles').delete().eq('user_id', user.id).in('role', ['customer','ambassador']);
  const { error: roleError } = await supabase.from('user_roles').insert({ user_id:user.id, role });
  if (roleError) return NextResponse.json({ error:'No pudimos guardar tu tipo de acceso.' }, { status:400 });
  await supabase.rpc('set_journey_state', { p_stage_slug:stage, p_evidence:{ source:'onboarding' } });
  await supabase.from('consents').insert({ user_id:user.id, consent_type:'platform_rules', version:'1.0' });
  await trackEvent(user.id, 'onboarding_completed', { role, stage });
  await awardMilestone(user.id, 'ONBOARDING_COMPLETED', { source:'onboarding' });
  return NextResponse.json({ ok:true, redirect:'/app' });
}
