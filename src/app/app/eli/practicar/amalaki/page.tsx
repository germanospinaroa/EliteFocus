import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AmalakiRoleplay } from '@/components/roleplay/amalaki-roleplay';
import { getAmalakiMarket } from '@/content/products/amalaki';

export default async function AmalakiPracticePage({ searchParams }: { searchParams: { market?: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const { data: profile } = await supabase.from('profiles').select('first_name,experience_type,market,country').eq('id', user.id).single();
  if (profile?.experience_type !== 'AMBASSADOR') redirect('/app/catalogo/amalaki');
  const market = searchParams.market ? getAmalakiMarket(searchParams.market, null) : getAmalakiMarket(profile.market, profile.country);
  return <AmalakiRoleplay firstName={String(profile.first_name ?? 'allí')} market={market} />;
}
