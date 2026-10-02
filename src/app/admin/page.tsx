import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { getAdminActor, canAccessAdministration } from '@/lib/auth/admin';
export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function AdminPage(){const {profile}=await getAdminActor();if(!profile)redirect('/login');redirect(canAccessAdministration(profile)?'/app/administracion':'/app');}
