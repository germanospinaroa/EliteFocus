import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { peopleErrors } from '@/lib/people/api-errors';

type Experience = 'CLIENT_VIP' | 'AMBASSADOR';
function temporaryPassword() { return `EF-${randomBytes(9).toString('base64url')}-A7`; }
function fail(error: typeof peopleErrors[keyof typeof peopleErrors], status = 400) { return NextResponse.json(error, { status }); }

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  const admin = createAdminClient();
  const { data: actor } = await admin.from('profiles').select('experience_type,platform_role').eq('id', user.id).maybeSingle();
  if (!actor || actor.experience_type !== 'AMBASSADOR') return NextResponse.json({ code: 'FORBIDDEN', message: 'No tienes permiso para crear accesos.' }, { status: 403 });
  const body = await request.json().catch(() => ({}));
  const firstName = String(body.firstName ?? '').trim();
  const lastName = String(body.lastName ?? '').trim();
  const zilisId = String(body.zilisId ?? '').trim();
  const experienceType = String(body.experienceType ?? '') as Experience;
  const phone = String(body.phone ?? '').trim() || null;
  const email = String(body.email ?? '').trim().toLowerCase() || null;
  if (!firstName || !lastName || !zilisId || !['CLIENT_VIP','AMBASSADOR'].includes(experienceType)) return NextResponse.json({ code: 'INVALID_INPUT', message: 'Completa nombre, apellido, ID Zilis y tipo de acceso.' }, { status: 400 });
  if (!/^\d{4,20}$/.test(zilisId)) return fail(peopleErrors.invalidZilis);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(peopleErrors.invalidEmail);
  const { data: zilisMatch } = await admin.from('profiles').select('id').eq('zilis_id', zilisId).maybeSingle();
  const { data: emailMatch } = email ? await admin.from('profiles').select('id').eq('email', email).maybeSingle() : { data: null };
  if (zilisMatch && emailMatch && zilisMatch.id !== emailMatch.id) return fail(peopleErrors.identity, 409);
  if (zilisMatch) return fail(peopleErrors.zilis, 409);
  if (emailMatch) return fail(peopleErrors.email, 409);
  const username = zilisId;
  const syntheticEmail = email ?? `${zilisId.toLowerCase().replace(/[^a-z0-9]/g, '')}@access.elitefocus.internal`;
  const password = temporaryPassword();
  const { data: created, error: authError } = await admin.auth.admin.createUser({ email: syntheticEmail, password, email_confirm: true, user_metadata: { first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}` } });
  if (authError || !created.user) {
    const duplicate = String(authError?.message ?? '').toLowerCase().includes('already') || authError?.status === 422;
    return duplicate ? fail(email ? peopleErrors.email : peopleErrors.user, 409) : fail(peopleErrors.failed);
  }
  const profile = { id: created.user.id, email: syntheticEmail, username, zilis_id: zilisId, first_name: firstName, last_name: lastName, full_name: `${firstName} ${lastName}`, experience_type: experienceType, platform_role: 'MEMBER', must_change_password: true, onboarding_completed: false, created_by_user_id: user.id, sponsor_id: experienceType === 'AMBASSADOR' ? user.id : null, advisor_id: experienceType === 'CLIENT_VIP' ? user.id : null, phone };
  const { error: profileError } = await admin.from('profiles').update(profile).eq('id', created.user.id);
  if (profileError) { await admin.auth.admin.deleteUser(created.user.id); return fail(peopleErrors.failed); }
  const { error: roleCleanupError } = await admin.from('user_roles').delete().eq('user_id', created.user.id);
  const { error: roleError } = await admin.from('user_roles').insert({ user_id: created.user.id, role: experienceType === 'CLIENT_VIP' ? 'customer' : 'ambassador' });
  if (roleCleanupError || roleError) { await admin.from('profiles').delete().eq('id', created.user.id); await admin.auth.admin.deleteUser(created.user.id); return fail(peopleErrors.failed); }
  return NextResponse.json({ ok: true, person: { id: created.user.id, firstName, lastName, username, experienceType, temporaryPassword: password } }, { status: 201 });
}
