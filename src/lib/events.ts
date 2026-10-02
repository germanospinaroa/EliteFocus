import { createClient } from '@/lib/supabase/server';

export type EventName = 'user_registered' | 'user_logged_in' | 'onboarding_started' | 'onboarding_step_completed' | 'onboarding_completed' | 'next_action_viewed' | 'next_action_started' | 'next_action_completed' | 'roleplay_started' | 'roleplay_completed' | 'first_action_completed' | 'contact_created' | 'followup_created' | 'followup_completed' | 'milestone_achieved';

export async function trackEvent(userId: string, eventName: EventName, properties: Record<string, unknown> = {}) {
  const supabase = createClient();
  return supabase.from('events').insert({ user_id: userId, event_name: eventName, properties });
}

export async function awardMilestone(userId: string, slug: string, evidence: Record<string, unknown> = {}) {
  const supabase = createClient();
  const { data } = await supabase.rpc('award_milestone', { p_user_id: userId, p_slug: slug, p_evidence: evidence });
  if (data) await trackEvent(userId, 'milestone_achieved', { milestone: slug });
  return Boolean(data);
}
