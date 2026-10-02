import { NextResponse } from 'next/server';
import { canManageAdministration, canDemoteOwner, isRoleExperienceConsistent, isValidEmailAddress, isValidExperience, isValidPlatformRole } from '@/lib/auth/admin-rules';
import { getAdminActor } from '@/lib/auth/admin';

type ProfileRow = {
  id: string; first_name: string | null; last_name: string | null; email: string | null; phone: string | null;
  zilis_id: string | null; experience_type: 'CLIENT_VIP' | 'AMBASSADOR'; platform_role: 'OWNER' | 'ADMIN' | 'MEMBER'; sponsor_id: string | null; advisor_id: string | null;
};

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { user, profile, admin } = await getAdminActor();
  if (!user || !admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (!canManageAdministration(profile)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const { data: target } = await admin.from('profiles').select('id,first_name,last_name,email,phone,zilis_id,experience_type,platform_role,sponsor_id,advisor_id').eq('id', params.id).maybeSingle();
  if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const current = target as ProfileRow;
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  const nextExperience = body.experience_type === undefined ? current.experience_type : body.experience_type;
  const nextRole = body.platform_role === undefined ? current.platform_role : body.platform_role;
  if (!isValidExperience(nextExperience) || !isValidPlatformRole(nextRole)) return NextResponse.json({ error: 'Invalid experience or role' }, { status: 400 });
  if (!isRoleExperienceConsistent(nextExperience, nextRole)) return NextResponse.json({ error: 'OWNER y ADMIN requieren experiencia AMBASSADOR. Convierte primero la experiencia.' }, { status: 400 });

  if (current.platform_role === 'OWNER' && nextRole !== 'OWNER') {
    const { count } = await admin.from('profiles').select('id', { count: 'exact', head: true }).eq('platform_role', 'OWNER');
    if (!canDemoteOwner(count ?? 0)) return NextResponse.json({ error: 'Elite Focus debe conservar al menos un Owner.' }, { status: 409 });
  }

  const zilisId = body.zilis_id === undefined ? current.zilis_id : (typeof body.zilis_id === 'string' ? body.zilis_id.trim() || null : null);
  if (zilisId) {
    const { data: conflict } = await admin.from('profiles').select('id').eq('zilis_id', zilisId).neq('id', params.id).maybeSingle();
    if (conflict) return NextResponse.json({ error: 'Ese ID Zilis ya pertenece a otra persona.' }, { status: 409 });
  }

  const sponsorId = body.sponsor_id === undefined ? current.sponsor_id : (typeof body.sponsor_id === 'string' && body.sponsor_id ? body.sponsor_id : null);
  const advisorId = body.advisor_id === undefined ? current.advisor_id : (typeof body.advisor_id === 'string' && body.advisor_id ? body.advisor_id : null);
  if (nextExperience === 'AMBASSADOR' && advisorId) return NextResponse.json({ error: 'Un Embajador no puede tener advisor.' }, { status: 400 });
  if (nextExperience === 'CLIENT_VIP' && sponsorId) return NextResponse.json({ error: 'Un Cliente VIP no puede tener sponsor.' }, { status: 400 });
  if (sponsorId) {
    if (sponsorId === params.id) return NextResponse.json({ error: 'Una persona no puede patrocinarse a sí misma.' }, { status: 400 });
    const { data: sponsor } = await admin.from('profiles').select('id,experience_type').eq('id', sponsorId).maybeSingle();
    if (!sponsor || sponsor.experience_type !== 'AMBASSADOR') return NextResponse.json({ error: 'El sponsor debe ser un Embajador existente.' }, { status: 400 });
    let cursor: string | null = sponsorId;
    for (let i = 0; i < 100 && cursor; i += 1) {
      if (cursor === params.id) return NextResponse.json({ error: 'La relación de sponsor crearía un ciclo.' }, { status: 400 });
      const { data: parent }: { data: { sponsor_id: string | null } | null } = await admin.from('profiles').select('sponsor_id').eq('id', cursor).maybeSingle();
      cursor = (parent?.sponsor_id as string | null | undefined) ?? null;
    }
  }
  if (advisorId) {
    const { data: advisor } = await admin.from('profiles').select('id,experience_type').eq('id', advisorId).maybeSingle();
    if (!advisor || advisor.experience_type !== 'AMBASSADOR') return NextResponse.json({ error: 'El advisor debe ser un Embajador existente.' }, { status: 400 });
  }

  const { data: authResult, error: authLookupError } = await admin.auth.admin.getUserById(params.id);
  if (authLookupError || !authResult.user) return NextResponse.json({ error: 'No se pudo verificar la identidad Auth.' }, { status: 400 });
  const authEmail = authResult.user?.email ?? null;
  const nextEmail = body.email === undefined ? (current.email ?? authEmail) : (typeof body.email === 'string' ? body.email.trim() || null : null);
  if (body.email !== undefined && !nextEmail && authEmail) return NextResponse.json({ error: 'No se puede borrar el email de Auth desde este formulario.' }, { status: 400 });
  if (nextEmail && !isValidEmailAddress(nextEmail)) return NextResponse.json({ error: 'Introduce un email válido.' }, { status: 400 });
  const emailChanged = nextEmail !== authEmail;
  if (emailChanged && nextEmail) {
    const { error } = await admin.auth.admin.updateUserById(params.id, { email: nextEmail, email_confirm: true });
    if (error) return NextResponse.json({ error: error.message.includes('already') || error.status === 422 ? 'Ese email ya pertenece a otro usuario.' : error.message }, { status: error.status === 422 ? 409 : 400 });
  }
  const updates = {
    first_name: typeof body.first_name === 'string' ? body.first_name.trim() : current.first_name,
    last_name: typeof body.last_name === 'string' ? body.last_name.trim() : current.last_name,
    phone: typeof body.phone === 'string' ? body.phone.trim() || null : current.phone,
    email: nextEmail, zilis_id: zilisId, experience_type: nextExperience, platform_role: nextRole,
    sponsor_id: sponsorId, advisor_id: advisorId,
  };
  const { error: profileError } = await admin.from('profiles').update(updates).eq('id', params.id);
  if (profileError) {
    if (emailChanged && authEmail) await admin.auth.admin.updateUserById(params.id, { email: authEmail, email_confirm: true });
    return NextResponse.json({ error: profileError.message }, { status: 400 });
  }
  const { error: roleCleanupError } = await admin.from('user_roles').delete().eq('user_id', params.id);
  const { error: roleError } = await admin.from('user_roles').insert({ user_id: params.id, role: nextExperience === 'CLIENT_VIP' ? 'customer' : 'ambassador' });
  if (roleCleanupError || roleError) return NextResponse.json({ error: 'El perfil se actualizó, pero no se pudo sincronizar el rol legado.' }, { status: 500 });

  const changes: Record<string, { previous: unknown; new: unknown }> = {};
  for (const key of Object.keys(updates)) {
    const previous = (current as Record<string, unknown>)[key];
    const next = (updates as Record<string, unknown>)[key];
    if (previous !== next) changes[key] = { previous, new: next };
  }
  if (Object.keys(changes).length) {
    const { error: auditError } = await admin.from('audit_logs').insert({ actor_id: user.id, action: 'admin_user_updated', entity_type: 'profile', entity_id: params.id, changes });
    if (auditError) {
      const rollbackProfile = { first_name: current.first_name, last_name: current.last_name, phone: current.phone, email: current.email, zilis_id: current.zilis_id, experience_type: current.experience_type, platform_role: current.platform_role, sponsor_id: current.sponsor_id, advisor_id: current.advisor_id };
      await admin.from('profiles').update(rollbackProfile).eq('id', params.id);
      await admin.from('user_roles').delete().eq('user_id', params.id);
      await admin.from('user_roles').insert({ user_id: params.id, role: current.experience_type === 'CLIENT_VIP' ? 'customer' : 'ambassador' });
      if (emailChanged && authEmail) await admin.auth.admin.updateUserById(params.id, { email: authEmail, email_confirm: true });
      return NextResponse.json({ error: 'No se pudo registrar la auditoría; el cambio fue revertido.' }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: true, changes });
}
