'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { AmalakiContent, AmalakiMarket, AmalakiRole } from '@/content/products/amalaki';
import { hasAmalakiAmbassadorLayer } from '@/lib/catalog/amalaki-visibility';

function event(eventName: string, market: AmalakiMarket, section?: string) {
  void fetch('/api/product-events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ eventName, market, section }) });
}

export function AmalakiExperience({ content, firstName, role }: { content: AmalakiContent; firstName: string; role: AmalakiRole }) {
  const [usageDone, setUsageDone] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [eliOpen, setEliOpen] = useState(false);
  const [eliAnswer, setEliAnswer] = useState<string | null>(null);
  const ambassadorRef = useRef<HTMLElement | null>(null);
  const [shareViewed, setShareViewed] = useState(false);
  useEffect(() => { event('product_viewed', content.market, 'experience'); }, [content.market]);
  useEffect(() => {
    if (role !== 'AMBASSADOR' || !ambassadorRef.current || shareViewed) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { event('ambassador_share_section_viewed', content.market, 'share'); setShareViewed(true); observer.disconnect(); } }, { threshold: 0.25 });
    observer.observe(ambassadorRef.current);
    return () => observer.disconnect();
  }, [content.market, role, shareViewed]);

  function openUsage() { event('product_usage_opened', content.market, 'usage'); document.getElementById('como-usarlo')?.scrollIntoView({ behavior: 'smooth' }); }
  function completeUsage() { setUsageDone(true); event('product_usage_completed', content.market, 'usage'); }
  function openEli(source: string) {
    setEliOpen(true);
    event('eli_product_started', content.market, source);
    requestAnimationFrame(() => document.getElementById('eli')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  }
  function askEli(prompt: string) {
    setEliOpen(true); event('eli_product_started', content.market, 'eli');
    const answers: Record<string, string> = {
      '¿Cómo lo preparo?': 'Abre un sobre y mézclalo con aproximadamente 240 ml de agua una vez al día.',
      '¿Cuánto dura una caja?': 'Una caja tiene 30 sobres. Con un sobre al día, corresponde a 30 días de uso.',
      '¿Qué contiene?': content.description + ' Entre sus componentes se encuentran amla, tulsi, jengibre y otros ingredientes vegetales.',
      '¿Es vegano?': content.market === 'CO' ? 'La presentación para Colombia cuenta con sello Vegan Friendly.' : content.market === 'US' ? 'Esa información todavía está pendiente de confirmar para Estados Unidos.' : 'Prefiero no darte una respuesta que todavía no tenemos bien respaldada. Esa información está pendiente de confirmar para tu mercado.',
    };
    setEliAnswer(answers[prompt] ?? 'Prefiero no darte una respuesta que todavía no tenemos bien respaldada. Esa información está pendiente de confirmar.');
  }

  return <main className="amalaki-page">
    <Link className="back-link" href="/app/catalogo">← Volver al catálogo</Link>
    <section className="amalaki-hero">
      <div className="amalaki-hero__copy"><span className="eyebrow">Amalaki · {content.marketLabel}</span>{content.market === 'UNKNOWN' && <p className="amalaki-market-note">Antes de mostrarte algunos detalles, necesitamos confirmar tu mercado.</p>}<h1>Amalaki<span style={{ color: 'var(--primary)' }}>.</span></h1><p className="amalaki-hero__headline">Bienestar desde adentro, fácil de incorporar a tu día.</p><p className="lead">{content.description}</p><div className="amalaki-actions"><button className="primary" onClick={openUsage}>Ver cómo usarlo</button><button className="secondary-button" onClick={() => openEli('hero')}>Preguntarle a Eli</button></div></div>
      <div className="amalaki-hero__image"><Image src="/catalog/amalaki-product.png" alt="Producto Amalaki" width={520} height={520} priority /></div>
    </section>
    <div className="amalaki-facts">{content.heroFacts.map((fact) => <div key={fact.value}><strong>{fact.value}</strong><span>{fact.label}</span></div>)}</div>

    <section className="amalaki-section amalaki-usage" id="como-usarlo"><div className="section-intro"><span className="eyebrow">Tu primer paso</span><h2>{firstName}, empezar es muy sencillo.</h2><p>Veamos esto juntos.</p></div><div className="amalaki-steps">{content.usage.map((step, index) => <div className="amalaki-step" key={step}><span>{index + 1}</span><p>{step}</p></div>)}</div><p className="amalaki-note">Guarda tu Amalaki en un lugar fresco y seco.</p><button className={`primary ${usageDone ? 'button-done' : ''}`} onClick={completeUsage}>{usageDone ? 'Listo, ya lo tengo' : 'Ya sé cómo usarlo'}</button>{usageDone && <p className="amalaki-usage-feedback" role="status" aria-live="polite"><strong>Perfecto, {firstName}.</strong> Ya tienes lo esencial para empezar con tranquilidad.</p>}</section>

    <section className="amalaki-section"><div className="section-intro"><span className="eyebrow">Para entenderlo</span><h2>¿Qué es Amalaki?</h2><h3>En pocas palabras</h3><p>{content.shortExplanation}</p></div><details className="amalaki-disclosure"><summary>En 20 segundos</summary><p>{content.shortExplanation} Se presenta en sobres individuales para preparar con agua una vez al día.</p></details><button className="text-link amalaki-more" aria-expanded={moreOpen} aria-controls="amalaki-deep-explanation" onClick={() => setMoreOpen((value) => !value)}>{moreOpen ? 'Mostrar menos' : 'Quiero saber más'} <span aria-hidden="true">→</span></button>{moreOpen && <div className="amalaki-expanded" id="amalaki-deep-explanation"><p>Amalaki reúne ingredientes de origen vegetal en una forma sencilla de incorporar a la rutina. Esta experiencia prioriza lo que necesitas para empezar y deja la información más profunda disponible cuando tú la quieras.</p></div>}</section>

    <section className="amalaki-section"><div className="section-intro"><span className="eyebrow">Lo esencial</span><h2>Lo más importante de tu Amalaki</h2></div><div className="amalaki-card-grid">{content.benefits.slice(0, 3).map((item) => <article className="amalaki-card" key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>{content.nutrition.length > 0 && <div className="amalaki-nutrition">{content.nutrition.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>}</section>

    <details className="amalaki-more-section"><summary><span><strong>¿Quieres conocerlo mejor?</strong><small>Aquí tienes los detalles por si quieres profundizar.</small></span></summary><div className="amalaki-more-grid"><section><h3>Qué contiene tu Amalaki</h3><div className="amalaki-ingredients">{content.ingredients.map((item) => <details key={item.name}><summary>{item.name}</summary><div><h4>¿Qué es?</h4><p>{item.what}</p><h4>¿Por qué está presente?</h4><p>{item.why}</p>{item.context && <p className="muted">{item.context}</p>}</div></details>)}</div></section><section className="amalaki-important"><div><h3>Información importante</h3><p>Lo que conviene tener presente antes de usarlo.</p></div><details><summary>Ver información importante</summary><ul>{content.precautions.map((item) => <li key={item}>{item}</li>)}</ul></details></section><section><h3>Preguntas frecuentes</h3><div className="amalaki-faqs">{content.faqs.map((faq) => <details key={faq.question} onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) event('product_faq_opened', content.market, faq.question); }}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></section></div></details>

    <section className="amalaki-eli" id="eli"><div><span className="eyebrow">Eli · acompañamiento</span><h2>¿Te quedó alguna duda, {firstName}?</h2><p>Pregúntame lo que quieras sobre tu Amalaki.</p></div><div className="amalaki-quick-prompts">{['¿Cómo lo preparo?', '¿Cuánto dura una caja?', '¿Qué contiene?', '¿Es vegano?'].map((prompt) => <button key={prompt} onClick={() => askEli(prompt)}>{prompt}<span>→</span></button>)}</div>{eliOpen && <div className="amalaki-eli-answer" role="status"><strong>{eliAnswer ? 'Esto es lo que tenemos respaldado' : 'Eli está lista para acompañarte'}</strong><p>{eliAnswer ?? 'Elige una pregunta para empezar.'}</p><button className="text-link" onClick={() => setEliOpen(false)}>Cerrar</button></div>}</section>

    {hasAmalakiAmbassadorLayer(role) && <section ref={ambassadorRef} className="amalaki-section amalaki-ambassador"><div className="section-intro"><span className="eyebrow">Ahora hagámoslo fácil de compartir</span><h2>Comparte Amalaki con naturalidad.</h2><p><strong>{firstName}, no necesitas memorizar nada.</strong> Solo sentirte cómodo hablando de Amalaki con alguien.</p></div><div className="amalaki-ambassador-actions"><details><summary>Explícalo</summary><div className="amalaki-share-copy"><p>{content.ambassador.oneLine}</p><p>{content.ambassador.shortExplanation}</p><p className="muted">Úsalo como referencia y explícalo con tus propias palabras.</p></div></details><details><summary>Escucha</summary><div className="amalaki-share-copy"><h3>Antes de hablar de Amalaki, escucha.</h3>{content.ambassador.listeningQuestions.map((question) => <p key={question}>“{question}”</p>)}<div className="amalaki-card-grid">{content.ambassador.connections.map((item) => <article className="amalaki-card" key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></div></details><details><summary>Evita</summary><div className="amalaki-avoid"><h3>Comunicar bien también es cuidar.</h3><p>{firstName}, no necesitas exagerar para hablar bien de un producto. La información correcta genera mucha más confianza.</p><ul>{content.ambassador.avoid.map((item) => <li key={item}>{item}</li>)}</ul></div></details><details><summary>Practica</summary><div className="amalaki-share-copy"><p>Probemos una situación juntos antes de llevarla a una conversación real.</p><Link className="secondary-button" href="/app/eli/practicar/amalaki">Practicar con Eli</Link></div></details></div><div className="amalaki-next"><h3>¿Lo llevamos a una conversación real?</h3><p>Elige una persona y lleva contigo el contexto de Amalaki.</p><Link className="primary" href="/app/personas?product_interest=AMALAKI" onClick={() => event('product_person_selected', content.market, 'people')}>Elegir una persona</Link></div></section>}

    <section className={`amalaki-finish ${role === 'AMBASSADOR' ? 'amalaki-finish--ambassador' : ''}`}><span className="eyebrow">Un paso a la vez</span><h2>{role === 'AMBASSADOR' ? `Ya tienes lo esencial, ${firstName}.` : `Ya tienes lo esencial de tu Amalaki, ${firstName}.`}</h2><p>{role === 'AMBASSADOR' ? 'Ahora lo importante no es aprender más. Es sentirte cómodo poniéndolo en práctica.' : 'Sabes qué es, cómo usarlo y dónde encontrar ayuda cuando la necesites.'}</p>{role === 'CLIENT_VIP' && <Link className="secondary-button" href="/app/aprender">Explorar mis beneficios VIP</Link>}</section>
  </main>;
}
