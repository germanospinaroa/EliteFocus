import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export type AdminProfile = { id: string; first_name: string | null; last_name: string | null; email: string | null; experience_type: 'CLIENT_VIP' | 'AMBASSADOR'; platform_role: 'OWNER' | 'ADMIN' | 'MEMBER'; };

export async function getAdminActor() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null, admin: null };
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('id,first_name,last_name,email,experience_type,platform_role').eq('id', user.id).maybeSingle();
  return { user, profile: profile as AdminProfile | null, admin };
}

export function canAccessAdministration(profile: AdminProfile | null) {
  return profile?.experience_type === 'AMBASSADOR' && (profile.platform_role === 'OWNER' || profile.platform_role === 'ADMIN');
}
