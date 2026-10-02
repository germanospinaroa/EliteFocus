import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAdminActor } from '@/lib/auth/admin';

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const { user, profile, admin } = await getAdminActor();
  if (!user || !profile || !admin) return NextResponse.json({ code: 'UNAUTHENTICATED', message: 'No autenticado.' }, { status: 401 });
  if (!['OWNER', 'ADMIN'].includes(profile.platform_role)) return NextResponse.json({ code: 'FORBIDDEN', message: 'No tienes permiso para eliminar usuarios.' }, { status: 403 });
  const { data: target } = await admin.from('profiles').select('id,first_name,last_name,zilis_id,experience_type,platform_role').eq('id', params.id).maybeSingle();
  if (!target) return NextResponse.json({ code: 'NOT_FOUND', message: 'No encontramos esa persona.' }, { status: 404 });
  if (target.id === user.id) return NextResponse.json({ code: 'SELF_DELETE_FORBIDDEN', message: 'No puedes eliminar tu propio usuario.' }, { status: 403 });
  if (target.platform_role === 'OWNER') return NextResponse.json({ code: 'OWNER_DELETE_FORBIDDEN', message: 'Un Owner debe ser degradado explícitamente antes de eliminarlo.' }, { status: 403 });
  if (profile.platform_role === 'ADMIN' && target.platform_role !== 'MEMBER') return NextResponse.json({ code: 'FORBIDDEN', message: 'Un Admin solo puede eliminar usuarios Member.' }, { status: 403 });
  const body = await request.json().catch(() => ({})); const reassignTo = typeof body.reassignTo === 'string' ? body.reassignTo : null;
  const [{ data: sponsored }, { data: advised }] = await Promise.all([
    admin.from('profiles').select('id').eq('sponsor_id', params.id),
    admin.from('profiles').select('id').eq('advisor_id', params.id),
  ]);
  const dependencyCount = (sponsored?.length ?? 0) + (advised?.length ?? 0);
  if (dependencyCount && !reassignTo) return NextResponse.json({ code: 'ACTIVE_DEPENDENCIES', message: 'Esta persona tiene relaciones activas que deben ser reasignadas por un Owner antes de eliminarla.', dependencies: dependencyCount }, { status: 409 });
  if (dependencyCount && profile.platform_role !== 'OWNER') return NextResponse.json({ code: 'ACTIVE_DEPENDENCIES', message: 'Esta persona tiene relaciones activas que deben ser reasignadas por un Owner antes de eliminarla.' }, { status: 409 });
  if (reassignTo) {
    const { data: replacement } = await admin.from('profiles').select('id,experience_type').eq('id', reassignTo).maybeSingle();
    if (!replacement || replacement.experience_type !== 'AMBASSADOR' || replacement.id === params.id) return NextResponse.json({ code: 'INVALID_REASSIGNMENT', message: 'Selecciona un Embajador válido para reasignar las relaciones.' }, { status: 400 });
    if ((sponsored ?? []).some((item) => item.id === replacement.id)) return NextResponse.json({ code: 'INVALID_REASSIGNMENT', message: 'La reasignación crearía un ciclo.' }, { status: 400 });
    if (sponsored?.length) await admin.from('profiles').update({ sponsor_id: replacement.id }).eq('sponsor_id', params.id);
    if (advised?.length) await admin.from('profiles').update({ advisor_id: replacement.id }).eq('advisor_id', params.id);
    await admin.from('audit_logs').insert({ actor_id: user.id, action: 'RELATION_REASSIGNED', entity_type: 'profile', entity_id: params.id, changes: { replacement_user_id: replacement.id, sponsored_count: sponsored?.length ?? 0, advised_count: advised?.length ?? 0 } });
  }
  const snapshot = { first_name: target.first_name, last_name: target.last_name, zilis_id: target.zilis_id, experience_type: target.experience_type, platform_role: target.platform_role };
  await admin.from('audit_logs').insert({ actor_id: user.id, action: 'USER_DELETED', entity_type: 'profile', entity_id: params.id, target_snapshot: snapshot, changes: { snapshot } });
  for (const table of ['events', 'user_milestones', 'consents', 'user_journey_state', 'actions', 'followups', 'contacts', 'catalog_links', 'user_roles']) await admin.from(table).delete().eq(table === 'user_journey_state' ? 'user_id' : table === 'user_roles' || table === 'user_milestones' || table === 'consents' || table === 'events' || table === 'actions' || table === 'catalog_links' ? 'user_id' : 'owner_id', params.id);
  const { error: authError } = await admin.auth.admin.deleteUser(params.id);
  if (authError) return NextResponse.json({ code: 'DELETE_FAILED', message: 'No pudimos eliminar el acceso en este momento.' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
