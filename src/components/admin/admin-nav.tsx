'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function AdminNav({ role }: { role: 'OWNER' | 'ADMIN' }) { const path=usePathname(); return <nav className="admin-nav" aria-label="Administración"><Link className={path==='/app/administracion'?'active':''} href="/app/administracion">Resumen</Link><Link className={path.startsWith('/app/administracion/usuarios')?'active':''} href="/app/administracion/usuarios">Usuarios</Link><Link className={path.startsWith('/app/administracion/activacion')?'active':''} href="/app/administracion/activacion">Activación</Link><span className="admin-nav__role">{role === 'OWNER' ? 'Acceso Owner' : 'Acceso Admin'}</span></nav>; }
