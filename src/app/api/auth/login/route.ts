import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const identifier = String(body.identifier ?? '').trim();
  const password = String(body.password ?? '');
  if (!identifier || !password) return NextResponse.json({ error: 'Datos incompletos' }, { status: 400 });
  const admin = createAdminClient();
  const { data: profile } = await admin.from('profiles').select('email,username,zilis_id,must_change_password,onboarding_completed').or(`username.eq.${identifier},zilis_id.eq.${identifier}`).maybeSingle();
  if (!profile?.email) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: profile.email, password });
  if (error) return NextResponse.json({ error: 'Credenciales inválidas' }, { status: 401 });
  const nextPath = profile.must_change_password ? '/cambiar-clave' : profile.onboarding_completed ? '/app' : '/onboarding';
  return NextResponse.json({ ok: true, nextPath });
}
