'use client';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/browser';

export function LogoutButton({ className = '', label = 'Cerrar sesión' }: { className?: string; label?: string }) {
  const router = useRouter();
  async function logout() {
    await createClient().auth.signOut();
    router.replace('/');
    router.refresh();
  }
  return <button type="button" className={className} onClick={logout}>{label}</button>;
}
