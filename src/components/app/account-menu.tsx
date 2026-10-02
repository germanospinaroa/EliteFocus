'use client';

import Link from 'next/link';
import { useState } from 'react';
import { LogoutButton } from '@/components/auth/logout-button';

export function AccountMenu({ firstName, lastName, platformRole, experienceType }: { firstName: string; lastName: string; platformRole: 'OWNER' | 'ADMIN' | 'MEMBER'; experienceType: 'CLIENT_VIP' | 'AMBASSADOR' }) {
  const [open, setOpen] = useState(false);
  const fullName = `${firstName} ${lastName}`.trim() || 'Tu cuenta';
  const title = platformRole === 'OWNER' ? 'Owner' : platformRole === 'ADMIN' ? 'Administrador' : '';
  return <div className="account-menu"><button className="avatar" aria-expanded={open} aria-haspopup="menu" onClick={() => setOpen(!open)}>{firstName.slice(0,2).toUpperCase() || 'EF'}</button>{open&&<div className="account-popover" role="menu"><div className="account-popover__identity"><strong>{fullName}</strong><small>{title ? `${title} · ` : ''}{experienceType === 'AMBASSADOR' ? 'Embajador' : 'Cliente VIP'}</small></div><Link href="/app" onClick={()=>setOpen(false)}>Mi espacio</Link>{platformRole !== 'MEMBER'&&<Link href="/app/administracion" onClick={()=>setOpen(false)}>Administración</Link>}<Link href="/app" onClick={()=>setOpen(false)}>Configuración personal</Link><LogoutButton className="account-logout" /></div>}</div>;
}
