import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

function generatePassword() { return `EF-${randomBytes(9).toString('base64url')}-A7`; }

export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ code: 'UNAUTHENTICATED', message: 'No autenticado.' }, { status: 401 });
  const admin = createAdminClient();
  const [{ data: actor }, { data: target }] = await Promise.all([
    admin.from('profiles').select('id,experience_type,platform_role').eq('id', user.id).maybeSingle(),
    admin.from('profiles').select('id,first_name,last_name,zilis_id,username,experience_type,sponsor_id,advisor_id').eq('id', params.id).maybeSingle(),
  ]);
  if (!actor || !target) return NextResponse.json({ code: 'NOT_FOUND', message: 'No encontramos esa persona.' }, { status: 404 });
  const isOwner = actor.platform_role === 'OWNER' && actor.experience_type === 'AMBASSADOR';
  const isDirect = actor.experience_type === 'AMBASSADOR' && (target.sponsor_id === user.id || target.advisor_id === user.id);
  if (!isOwner && !isDirect) return NextResponse.json({ code: 'FORBIDDEN', message: 'No tienes permiso para restablecer este acceso.' }, { status: 403 });
  const password = generatePassword();
  const { error: authError } = await admin.auth.admin.updateUserById(params.id, { password });
  if (authError) return NextResponse.json({ code: 'RESET_ACCESS_FAILED', message: 'No pudimos restablecer el acceso. Intenta nuevamente.' }, { status: 400 });
  const { error: profileError } = await admin.from('profiles').update({ must_change_password: true }).eq('id', params.id);
  if (profileError) return NextResponse.json({ code: 'RESET_ACCESS_FAILED', message: 'No pudimos completar el restablecimiento. Intenta nuevamente.' }, { status: 400 });
  await admin.from('audit_logs').insert({ actor_id: user.id, action: 'ACCESS_RESET', entity_type: 'profile', entity_id: params.id, changes: { target_user_id: params.id } });
  return NextResponse.json({ ok: true, person: { id: target.id, firstName: target.first_name, lastName: target.last_name, username: target.username ?? target.zilis_id, temporaryPassword: password, experienceType: target.experience_type } });
}
