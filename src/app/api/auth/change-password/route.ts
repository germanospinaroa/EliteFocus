import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { passwordError } from '@/lib/auth/password-policy';

export async function POST(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const password = String(body.password ?? '');
  const validationError = passwordError(password, String(body.confirmPassword ?? ''));
  if (validationError) return NextResponse.json({ code: 'INVALID_PASSWORD', error: validationError }, { status: 400 });
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return NextResponse.json({ error: 'No pudimos actualizar la contraseña' }, { status: 400 });
  const { error: profileError } = await supabase.from('profiles').update({ must_change_password: false }).eq('id', user.id);
  if (profileError) return NextResponse.json({ error: 'No pudimos actualizar tu acceso' }, { status: 400 });
  const { data: profile } = await supabase.from('profiles').select('onboarding_completed').eq('id', user.id).single();
  return NextResponse.json({ ok: true, nextPath: profile?.onboarding_completed ? '/app' : '/onboarding' });
}
