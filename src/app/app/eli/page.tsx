import { redirect } from 'next/navigation';
import { EliWorkspace } from '@/components/eli/eli-workspace';
import { createClient } from '@/lib/supabase/server';

export default async function EliPage({ searchParams }: { searchParams: { intent?: string; contact?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('experience_type').eq('id', user.id).single();
  return <EliWorkspace experienceType={profile?.experience_type === 'CLIENT_VIP' ? 'CLIENT_VIP' : 'AMBASSADOR'} intent={searchParams.intent} />;
}
