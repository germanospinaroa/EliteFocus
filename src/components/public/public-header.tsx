import Link from 'next/link';
import { EliteFocusLogo } from './elite-focus-logo';

export function PublicHeader() { return <header className="public-header"><Link href="/" className="public-header__logo" aria-label="Elite Focus, inicio"><EliteFocusLogo variant="compact" /></Link><Link href="/login" className="public-header__login">Ingresar <span aria-hidden="true">↗</span></Link></header>; }
