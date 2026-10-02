'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

export type Person = { id: string; first_name: string | null; last_name: string | null; username: string | null; zilis_id: string | null; email: string | null; experience_type: 'CLIENT_VIP' | 'AMBASSADOR'; must_change_password: boolean; created_at: string | null; sponsor_id: string | null; advisor_id: string | null; status: string };
export type CreatedAccess = { id: string; firstName: string; lastName: string; username: string; experienceType: 'CLIENT_VIP' | 'AMBASSADOR'; temporaryPassword: string };

export function AccessCard({ created, onDone }: { created: CreatedAccess; onDone: () => void }) {
  const accessText = `*¡Hola, ${created.firstName}!*

Qué bueno tenerte en nuestro equipo *Elite Focus*. Esta plataforma exclusiva es tu espacio para aprender, avanzar y contar con acompañamiento y recursos que te ayuden en el camino.

Aquí tienes tus datos de acceso:

*Usuario / ID Zilis:* ${created.username}
*Contraseña temporal:* ${created.temporaryPassword}

*Ingresa aquí:*
https://elite-focus-platform.vercel.app

La primera vez te pediremos crear tu propia contraseña.

*Cualquier duda, me cuentas. Estoy pendiente.*`;
  async function copy(text: string) { await navigator.clipboard?.writeText(text); }
  return <section className="panel access-created"><div className="eyebrow">Acceso creado</div><h2>{created.firstName} {created.lastName}</h2><p>Tipo: <strong>{created.experienceType === 'CLIENT_VIP' ? 'Cliente VIP' : 'Embajador'}</strong></p><p><strong>Usuario / ID Zilis:</strong> {created.username}</p><p><strong>Contraseña temporal:</strong> <code>{created.temporaryPassword}</code></p><div className="public-actions access-actions"><button type="button" className="public-button public-button--secondary" onClick={() => copy(created.username)}>Copiar usuario</button><button type="button" className="public-button public-button--secondary" onClick={() => copy(created.temporaryPassword)}>Copiar contraseña</button><button type="button" className="public-button public-button--primary" onClick={() => copy(accessText)}>Copiar acceso completo</button><button type="button" className="public-button public-button--secondary" onClick={onDone}>Listo</button></div></section>;
}

export function AddPersonDialog({ onCreated, onClose }: { onCreated: (access: CreatedAccess) => void; onClose?: () => void }) {
  const [busy, setBusy] = useState(false); const [error, setError] = useState<{ message: string; detail?: string; field?: string } | null>(null);
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); if (busy) return; setBusy(true); setError(null); const data = Object.fromEntries(new FormData(event.currentTarget)); const response = await fetch('/api/people', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }); const result = await response.json().catch(() => ({})); if (!response.ok) { setError({ message: result.message ?? 'No pudimos crear el acceso en este momento. Intenta nuevamente.', detail: result.detail, field: result.field }); setBusy(false); return; } onCreated(result.person as CreatedAccess); setBusy(false); }
  return <form className="real-form panel" onSubmit={submit}><label>¿A quién quieres agregar?<select name="experienceType" required defaultValue=""><option value="" disabled>Selecciona una opción</option><option value="CLIENT_VIP">Cliente VIP</option><option value="AMBASSADOR">Embajador</option></select></label><div className="auth-row"><label>Nombre<input name="firstName" required /></label><label>Apellido<input name="lastName" required /></label></div><label>ID Zilis<input name="zilisId" required aria-invalid={error?.field === 'zilisId'} />{error?.field === 'zilisId' && <small className="form-error">{error.message}</small>}</label><label>Teléfono opcional<input name="phone" type="tel" /></label><label>Correo opcional<input name="email" type="email" aria-invalid={error?.field === 'email'} />{error?.field === 'email' && <small className="form-error">{error.message}</small>}</label>{error && !error.field && <div className="form-error" role="alert"><strong>{error.message}</strong>{error.detail && <small>{error.detail}</small>}</div>}<div className="confirm-actions"><button type="button" className="secondary" onClick={onClose}>Cancelar</button><button className="primary" disabled={busy}>{busy ? 'CREANDO ACCESO…' : 'CREAR ACCESO'}</button></div></form>;
}

export function PeoplePanel({ initial }: { initial: Person[] }) {
  const router = useRouter(); const [items, setItems] = useState<Person[]>(initial); const [open, setOpen] = useState(false); const [created, setCreated] = useState<CreatedAccess | null>(null); const [search, setSearch] = useState(''); const [filter, setFilter] = useState<'ALL' | 'CLIENT_VIP' | 'AMBASSADOR'>('ALL');
  const filtered = useMemo(() => items.filter((item) => { const text = `${item.first_name ?? ''} ${item.last_name ?? ''} ${item.zilis_id ?? ''}`.toLowerCase(); return (!search || text.includes(search.toLowerCase())) && (filter === 'ALL' || item.experience_type === filter); }), [items, search, filter]);
  function createdPerson(access: CreatedAccess) { setCreated(access); setOpen(false); setItems((current) => [{ id: access.id, first_name: access.firstName, last_name: access.lastName, username: access.username, zilis_id: access.username, email: null, experience_type: access.experienceType, must_change_password: true, created_at: new Date().toISOString(), sponsor_id: access.experienceType === 'AMBASSADOR' ? 'current' : null, advisor_id: access.experienceType === 'CLIENT_VIP' ? 'current' : null, status: 'PENDIENTE' }, ...current]); router.refresh(); }
  return <main className="real-page people-page"><div className="real-page__head"><div><div className="eyebrow">Accesos por invitación</div><h1>Personas<span style={{ color: 'var(--primary)' }}>.</span></h1><p className="subhead">Crea accesos y acompaña a las personas que has invitado a Elite Focus.</p></div><button className="primary" onClick={() => { setOpen(!open); setCreated(null); }}>+ AGREGAR PERSONA</button></div>{open && <AddPersonDialog onCreated={createdPerson} onClose={() => setOpen(false)} />}{created && <AccessCard created={created} onDone={() => setCreated(null)} />}<section className="people-list-section"><div className="people-list-head"><div><div className="eyebrow">Tu acompañamiento</div><h2>Personas vinculadas</h2></div><span className="admin-count">{filtered.length}</span></div><div className="people-filters"><input aria-label="Buscar personas" placeholder="Buscar por nombre o ID Zilis" value={search} onChange={(event) => setSearch(event.target.value)} /><select aria-label="Filtrar por experiencia" value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="ALL">Todos</option><option value="CLIENT_VIP">Clientes VIP</option><option value="AMBASSADOR">Embajadores</option></select></div><div className="real-list">{filtered.length === 0 ? <div className="panel empty-state"><strong>Todavía no has agregado personas.</strong><br/>Cuando agregues un Cliente VIP o un Embajador, aparecerá aquí.<br/><button type="button" className="primary empty-action" onClick={() => setOpen(true)}>Agregar persona</button></div> : filtered.map((item) => <div className="panel real-row person-row" key={item.id}><div><strong>{item.first_name} {item.last_name}</strong><small>{item.experience_type === 'CLIENT_VIP' ? 'Cliente VIP' : 'Embajador'} · ID Zilis {item.zilis_id ?? item.username ?? '—'}</small></div><div className="person-row__right"><span className="status-pill">{item.status}</span><Link className="panel-link" href={`/app/personas/${item.id}`}>Ver persona →</Link></div></div>)}</div></section></main>;
}
