import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { cookies: { getAll: () => request.cookies.getAll(), setAll: (cookies) => cookies.forEach(({ name, value, options }) => { request.cookies.set(name, value); response = NextResponse.next({ request }); response.cookies.set(name, value, options); }) } });
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  if ((path.startsWith('/app') || path === '/cambiar-clave') && !user) return NextResponse.redirect(new URL('/login', request.url));
  if (path.startsWith('/onboarding') && !user) return NextResponse.redirect(new URL('/login', request.url));
  if (user) { const { data: profile } = await supabase.from('profiles').select('must_change_password').eq('id', user.id).maybeSingle(); if (profile?.must_change_password && path !== '/cambiar-clave') return NextResponse.redirect(new URL('/cambiar-clave', request.url)); }
  if (path.startsWith('/app/administracion') && user) { const { data: profile } = await supabase.from('profiles').select('experience_type,platform_role').eq('id', user.id).maybeSingle(); const allowed = profile?.experience_type === 'AMBASSADOR' && (profile.platform_role === 'OWNER' || profile.platform_role === 'ADMIN'); if (!allowed) return NextResponse.redirect(new URL('/app', request.url)); }
  if (path.startsWith('/admin') && user) { const { data: profile } = await supabase.from('profiles').select('experience_type,platform_role').eq('id', user.id).maybeSingle(); const allowed = profile?.experience_type === 'AMBASSADOR' && (profile.platform_role === 'OWNER' || profile.platform_role === 'ADMIN'); if (!allowed) return NextResponse.redirect(new URL('/app', request.url)); }
  if (path === '/registro') return NextResponse.redirect(new URL('/login', request.url));
  if ((path === '/' || path === '/login') && user && path === '/') return NextResponse.redirect(new URL('/app', request.url));
  return response;
}

export const config = { matcher: ['/', '/login', '/registro', '/cambiar-clave', '/onboarding', '/onboarding/:path*', '/app/:path*', '/admin/:path*'] };
