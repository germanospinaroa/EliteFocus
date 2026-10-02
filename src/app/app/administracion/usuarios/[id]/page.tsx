import { notFound, redirect } from 'next/navigation';
import { AdminUserEditor } from '@/components/admin/admin-user-editor';
import { canAccessAdministration, getAdminActor } from '@/lib/auth/admin';
import { canManageAdministration } from '@/lib/auth/admin-rules';

export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const { user, profile, admin } = await getAdminActor();
  if (!canAccessAdministration(profile) || !admin || !user) redirect('/app');
  if (!profile) redirect('/app');
  const { data: person } = await admin.from('profiles').select('id,first_name,last_name,email,phone,zilis_id,experience_type,platform_role,sponsor_id,advisor_id,onboarding_completed,current_stage,created_at').eq('id', params.id).maybeSingle();
  if (!person) notFound();
  const { data: options } = await admin.from('profiles').select('id,first_name,last_name,experience_type,platform_role').order('first_name');
  const { data: logs } = await admin.from('audit_logs').select('id,action,actor_id,created_at,changes').eq('entity_type','profile').eq('entity_id',params.id).order('created_at',{ascending:false}).limit(30);
  const actorIds = Array.from(new Set((logs??[]).map((log)=>log.actor_id).filter(Boolean))) as string[];
  const { data: actors } = actorIds.length ? await admin.from('profiles').select('id,first_name,last_name').in('id',actorIds) : { data: [] as { id: string; first_name: string|null; last_name: string|null }[] };
  const actorNames = new Map((actors??[]).map((actor)=>[actor.id,`${actor.first_name??''} ${actor.last_name??''}`.trim()||'Usuario']));
  return <AdminUserEditor person={person} options={options??[]} actorId={user.id} canEdit={canManageAdministration(profile)} canDelete={(profile.platform_role === 'OWNER' && person.platform_role !== 'OWNER' && person.id !== user.id) || (profile.platform_role === 'ADMIN' && person.platform_role === 'MEMBER')} audit={(logs??[]).map((log)=>({ id:log.id, action:log.action, actor_name:actorNames.get(log.actor_id??'')??'Usuario', created_at:log.created_at, changes:log.changes as Record<string,{previous?:unknown;new?:unknown}>|null }))}/>;
}
