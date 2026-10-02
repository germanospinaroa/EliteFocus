import Link from 'next/link';
import { EliteFocusLogo } from './elite-focus-logo';

export function PublicFooter() { return <footer className="public-footer"><Link href="/" aria-label="Elite Focus, inicio"><EliteFocusLogo variant="compact" /></Link><span>Elite Focus · Zilis Team</span><nav aria-label="Enlaces legales"><Link href="/privacidad">Privacidad</Link><Link href="/terminos">Términos</Link></nav></footer>; }
