'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogoutButton } from '@/components/auth/logout-button';

type NavItem = readonly [string, string, string];
const baseNav: readonly NavItem[] = [['⌂', 'Hoy', '/app'], ['✦', 'Eli', '/app/eli'], ['◫', 'Catálogo', '/app/catalogo'], ['▤', 'Aprender', '/app/aprender'], ['♧', 'Personas', '/app/personas'], ['◌', 'Progreso', '/app/progreso']];

export function AppNav({ experienceType, platformRole, hasTeam }: { experienceType: 'CLIENT_VIP' | 'AMBASSADOR'; platformRole: 'OWNER' | 'ADMIN' | 'MEMBER'; hasTeam: boolean }) {
  const pathname = usePathname();
  const nav: NavItem[] = experienceType === 'AMBASSADOR' ? baseNav.flatMap((item) => item[1] === 'Progreso' && hasTeam ? [['♧', 'Mi equipo', '/app/mi-equipo'], item] : [item]) : baseNav.filter((item) => item[1] !== 'Personas');
  const active = (href: string) => href === '/app' ? pathname === href : pathname.startsWith(href);
  return <><nav className="nav" aria-label="Navegación principal">{nav.map(([icon, label, href]) => <Link className={active(href) ? 'active' : ''} href={href} key={label}><span className="nav-icon">{icon}</span>{label}</Link>)}</nav>{platformRole !== 'MEMBER' && <div className="sidebar-section"><span className="sidebar-section__label">Gestión</span><Link className={`nav-admin-link ${pathname.startsWith('/app/administracion') ? 'active' : ''}`} href="/app/administracion"><span className="nav-icon">⌘</span>Administración</Link></div>}<div className="sidebar-foot"><b>Tu espacio de práctica</b><br/>Cada acción pequeña construye confianza.</div><LogoutButton className="logout-button" /></>;
}

export function MobileAppNav({ experienceType, platformRole, hasTeam }: { experienceType: 'CLIENT_VIP' | 'AMBASSADOR'; platformRole: 'OWNER' | 'ADMIN' | 'MEMBER'; hasTeam: boolean }) {
  const pathname = usePathname(); const base: NavItem[] = experienceType === 'AMBASSADOR' ? baseNav.flatMap((item) => item[1] === 'Progreso' && hasTeam ? [['♧', 'Mi equipo', '/app/mi-equipo'], item] : [item]) : baseNav.filter((item) => item[1] !== 'Personas'); const mobileItems = experienceType === 'AMBASSADOR' && hasTeam ? [...base.slice(0, 4), base.find((item) => item[1] === 'Mi equipo')!] : base.slice(0, 5); const active = (href: string) => href === '/app' ? pathname === href : pathname.startsWith(href);
  return <nav className="mobile-nav">{mobileItems.map(([icon, label, href]) => <Link className={active(href) ? 'active' : ''} href={href} key={label}><span>{icon}</span><small>{label}</small></Link>)}{platformRole !== 'MEMBER' && <Link className={pathname.startsWith('/app/administracion') ? 'active' : ''} href="/app/administracion"><span>⌘</span><small>Gestión</small></Link>}<LogoutButton className="mobile-logout" label="Salir" /></nav>;
}
