import { redirect } from 'next/navigation';
import { AdminNav } from '@/components/admin/admin-nav';
import { canAccessAdministration, getAdminActor } from '@/lib/auth/admin';

export default async function AdministrationLayout({ children }: { children: React.ReactNode }) {
  const { profile }=await getAdminActor();
  if(!canAccessAdministration(profile) || !profile) redirect('/app');
  return <div className="admin-workspace"><AdminNav role={profile.platform_role as 'OWNER' | 'ADMIN'} />{children}</div>;
}
