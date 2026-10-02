import Link from 'next/link';

export function FinalCTA() { return <section className="public-final-cta" aria-labelledby="final-cta-title"><p className="public-kicker">Tu espacio empieza aquí</p><h2 id="final-cta-title">¿Listo para comenzar?</h2><p>Entra y descubre cuál es tu siguiente paso.</p><div className="public-actions"><Link href="/login" className="public-button public-button--primary">Entrar a Elite Focus <span aria-hidden="true">→</span></Link></div></section>; }
