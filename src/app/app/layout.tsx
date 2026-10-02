import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { AppShell } from '@/components/app/app-shell';
import { isTeamVisible } from '@/lib/people/relationships';

export const metadata: Metadata = { title: 'Mi espacio', robots: { index: false, follow: false } };

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('first_name,last_name,preferred_name,experience_type,platform_role').eq('id', user.id).maybeSingle();
  if (!profile) redirect('/login');
  const { data: linked } = await admin.from('profiles').select('sponsor_id,advisor_id').or(`sponsor_id.eq.${user.id},advisor_id.eq.${user.id}`).limit(1);
  const experienceType = profile.experience_type === 'CLIENT_VIP' ? 'CLIENT_VIP' : 'AMBASSADOR';
  const platformRole = profile.platform_role === 'OWNER' || profile.platform_role === 'ADMIN' ? profile.platform_role : 'MEMBER';
  return <AppShell firstName={String(profile.first_name ?? profile.preferred_name ?? 'allí')} lastName={String(profile.last_name ?? '')} experienceType={experienceType} platformRole={platformRole} hasTeam={isTeamVisible(experienceType, user.id, linked ?? [])}>{children}</AppShell>;
}
