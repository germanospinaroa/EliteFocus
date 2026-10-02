'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EliteFocusLogo } from '@/components/public/elite-focus-logo';

export function AuthForm({ mode = 'login' }: { mode?:'login'|'register' }) {
  const router = useRouter(); const [busy,setBusy] = useState(false); const [error,setError] = useState(''); const [message,setMessage] = useState('');
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setBusy(true); setError(''); setMessage(''); const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({identifier:data.identifier,password:data.password})});
    if (!response.ok) { setError('No pudimos completar el acceso. Revisa tu usuario y contraseña.'); setBusy(false); return; }
    const result = await response.json(); router.push(result.nextPath); router.refresh(); setBusy(false);
  }
  return <main className="auth-page"><section className="auth-card"><div className="auth-brand"><EliteFocusLogo variant="compact" /><strong>Elite Focus</strong></div><div className="eyebrow">Bienvenido de vuelta</div><h1>Entra a tu espacio<span style={{color:'var(--primary)'}}>.</span></h1><p className="subhead">Usa tu usuario o ID Zilis y tu contraseña.</p><form onSubmit={submit} className="auth-form"><label>Usuario o ID Zilis<input name="identifier" required autoComplete="username" /></label><label>Contraseña<input name="password" type="password" required autoComplete="current-password" /></label>{error && <p className="form-error" role="alert">{error}</p>}{message && <p className="form-success" role="status">{message}</p>}<button className="primary auth-submit" disabled={busy}>{busy ? 'INGRESANDO…' : 'ENTRAR →'}</button></form><p className="auth-switch">¿No tienes tus credenciales de acceso? Habla con la persona que te invitó o patrocinó en Elite Focus para solicitarlas.</p></section></main>;
}
