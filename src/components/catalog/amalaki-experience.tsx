'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { amalakiContent, type AmalakiContent, type AmalakiMarket, type AmalakiRole } from '@/content/products/amalaki';
import { hasAmalakiAmbassadorLayer } from '@/lib/catalog/amalaki-visibility';

function event(eventName: string, market: AmalakiMarket, section?: string) { void fetch('/api/product-events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ eventName, market, section }) }); }

export function AmalakiExperience({ content, firstName, role }: { content: AmalakiContent; firstName: string; role: AmalakiRole }) {
  const [market, setMarket] = useState<AmalakiMarket>(content.market);
  const [usageDone, setUsageDone] = useState(false);
  const [eliOpen, setEliOpen] = useState(false);
  const [eliAnswer, setEliAnswer] = useState<string | null>(null);
  const ambassadorRef = useRef<HTMLElement | null>(null);
  const [shareViewed, setShareViewed] = useState(false);
  const selected = amalakiContent[market];
  const ready = market !== 'UNKNOWN';

  useEffect(() => { setMarket(content.market); setEliAnswer(null); setEliOpen(false); setUsageDone(false); setShareViewed(false); }, [content.market]);
  useEffect(() => { event('product_viewed', market, 'experience'); }, [market]);
  useEffect(() => {
    if (role !== 'AMBASSADOR' || !ambassadorRef.current || shareViewed) return;
    const observer = new IntersectionObserver(([entry]) => { if (entry.isIntersecting) { event('ambassador_share_section_viewed', market, 'share'); setShareViewed(true); observer.disconnect(); } }, { threshold: 0.25 });
    observer.observe(ambassadorRef.current); return () => observer.disconnect();
  }, [market, role, shareViewed]);

  function changeMarket(next: AmalakiMarket) {
    setMarket(next); setEliAnswer(null); setEliOpen(false); setUsageDone(false); event('product_market_changed', next, 'selector');
    const url = new URL(window.location.href); url.searchParams.set('market', next); window.history.replaceState({}, '', url);
  }
  function openUsage() { if (!ready) return; event('product_usage_opened', market, 'usage'); document.getElementById('como-usarlo')?.scrollIntoView({ behavior: 'smooth' }); }
  function completeUsage() { if (!ready) return; setUsageDone(true); event('product_usage_completed', market, 'usage'); }
  function openEli(source: string) { if (!ready) return; setEliOpen(true); event('eli_product_started', market, source); requestAnimationFrame(() => document.getElementById('eli')?.scrollIntoView({ behavior: 'smooth', block: 'start' })); }
  function askEli(prompt: string) {
    if (!ready) return;
    setEliOpen(true); event('eli_product_started', market, 'eli');
    const answers: Record<string, string> = { '¿Cómo lo preparo?': selected.marketContent.faqs.find((faq) => faq.question === '¿Cómo se prepara?')?.answer ?? '', '¿Cuánto dura una caja?': selected.marketContent.faqs.find((faq) => faq.question === '¿Cuánto dura un envase?')?.answer ?? '', '¿Qué contiene?': `${selected.common.identity} La fórmula documentada incluye ${selected.common.ingredients.map((item) => item.name).join(', ')}. La etiqueta puede incluir otros componentes.`, '¿Cuántas calorías tiene?': market === 'CO' ? 'La presentación de Colombia declara 18 kcal por porción.' : 'La presentación de Estados Unidos declara 25 calorías por porción.' };
    setEliAnswer(answers[prompt] ?? 'Eli no tiene una respuesta específica aprobada para esa pregunta en este mercado.');
  }

  return <main className="amalaki-page">
    <Link className="back-link" href="/app/catalogo">← Volver al catálogo</Link>
    <section className="amalaki-hero">
      <div className="amalaki-hero__copy">
        <div className="amalaki-market-selector"><label htmlFor="amalaki-market">Versión del producto</label><select id="amalaki-market" value={market} onChange={(event) => changeMarket(event.target.value as AmalakiMarket)}><option value="CO">🇨🇴 Colombia</option><option value="US">🇺🇸 Estados Unidos</option></select></div>
        <span className="eyebrow">Amalaki · {selected.marketLabel}</span>
        {!ready && <p className="amalaki-market-note">Elige Colombia o Estados Unidos para ver presentación, nutrición, advertencias y respuestas específicas.</p>}
        <h1>Amalaki<span style={{ color: 'var(--primary)' }}>.</span></h1><p className="amalaki-hero__headline">Amla, frutas y extractos vegetales.</p><p className="lead">Con ingredientes como tulsi, jengibre y haritaki, en sobres individuales para preparar con agua.</p>
        <div className="amalaki-actions"><button className="primary" onClick={openUsage} disabled={!ready}>Ver cómo usarlo</button><button className="secondary-button" onClick={() => openEli('hero')} disabled={!ready}>Preguntarle a Eli</button></div>
      </div><div className="amalaki-hero__image"><Image src={selected.common.images[0].src} alt={selected.common.images[0].alt} width={520} height={520} priority /></div>
    </section>
    {ready && <div className="amalaki-facts">{selected.heroFacts.map((fact) => <div key={fact.label}><strong>{fact.value}</strong><span>{fact.label}</span></div>)}</div>}

    {ready && <>
      <section className="amalaki-section amalaki-usage" id="como-usarlo"><div className="section-intro"><span className="eyebrow">Preparación</span><h2>{firstName}, así se prepara.</h2><p>Solo necesitas agua y un sobre. Sigue estas indicaciones.</p></div><div className="amalaki-steps">{selected.usage.map((step, index) => <div className="amalaki-step" key={step}><span>{index + 1}</span><p>{step}</p></div>)}</div><p className="amalaki-note">{market === 'CO' ? 'Conservación en Colombia: lugar fresco y seco, preferiblemente por debajo de 22 °C.' : 'Conservación: lugar fresco y seco.'}</p><button className={`primary ${usageDone ? 'button-done' : ''}`} onClick={completeUsage}>{usageDone ? 'Listo, ya lo tengo' : 'Ya sé cómo usarlo'}</button>{usageDone && <p className="amalaki-usage-feedback" role="status" aria-live="polite"><strong>Perfecto, {firstName}.</strong> Ya sabes cómo preparar tu Amalaki.</p>}</section>

      <section className="amalaki-section"><div className="section-intro"><span className="eyebrow">Conoce tu producto</span><h2>¿Qué es Amalaki?</h2><p>{selected.common.shortExplanation}</p></div><details className="amalaki-disclosure"><summary>En 20–30 segundos</summary><p>{selected.common.quickExplanation}</p></details><details className="amalaki-disclosure"><summary>Explicación completa</summary><p>{selected.common.fullExplanation}</p></details></section>

      <section className="amalaki-section"><div className="section-intro"><span className="eyebrow">Tu Amalaki en {selected.marketLabel}</span><h2>Qué aporta esta presentación</h2></div><div className="amalaki-card-grid">{selected.benefits.filter((item) => item.reviewStatus === 'APPROVED_FOR_MARKET').map((item) => <article className="amalaki-card" key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div><div className="amalaki-nutrition">{selected.nutrition.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div></section>

      <details className="amalaki-more-section"><summary><span><strong>¿Quieres conocerlo mejor?</strong><small>Ingredientes, información importante y preguntas frecuentes.</small></span></summary><div className="amalaki-more-grid"><section><h3>Ingredientes documentados</h3><div className="amalaki-ingredients">{selected.ingredients.map((item) => <details key={item.name}><summary>{item.name}</summary><div><h4>¿Qué es?</h4><p>{item.what}</p><h4>¿Por qué está en Amalaki?</h4><p>{item.why}</p></div></details>)}</div></section><section className="amalaki-important"><div><h3>Precauciones y documentación</h3><p>Información aplicable a {selected.marketLabel}.</p></div><details><summary>Ver precauciones</summary><ul>{selected.precautions.map((item) => <li key={item}>{item}</li>)}</ul><h4>Registro y documentación</h4><ul>{selected.marketContent.regulatory.map((item) => <li key={item}>{item}</li>)}</ul></details></section><section><h3>Preguntas frecuentes</h3><div className="amalaki-faqs">{selected.faqs.filter((faq) => faq.reviewStatus === 'APPROVED_FOR_MARKET').map((faq) => <details key={faq.question} onToggle={(event) => { if ((event.target as HTMLDetailsElement).open) eventFn('product_faq_opened', market, faq.question); }}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></section></div></details>

      <section className="amalaki-eli" id="eli"><div><span className="eyebrow">Eli · {selected.marketLabel}</span><h2>¿Qué quieres saber sobre tu Amalaki, {firstName}?</h2><p>Elige una pregunta y te ayudo con la información de esta presentación.</p></div><div className="amalaki-quick-prompts">{['¿Cómo lo preparo?', '¿Cuánto dura una caja?', '¿Qué contiene?', '¿Cuántas calorías tiene?'].map((prompt) => <button key={prompt} onClick={() => askEli(prompt)}>{prompt}<span>→</span></button>)}</div>{eliOpen && <div className="amalaki-eli-answer" role="status"><strong>Eli te acompaña</strong><p>{eliAnswer ?? 'Elige una de las preguntas para comenzar.'}</p><button className="text-link" onClick={() => setEliOpen(false)}>Cerrar</button></div>}</section>

      {hasAmalakiAmbassadorLayer(role) && <section ref={ambassadorRef} className="amalaki-section amalaki-ambassador"><div className="section-intro"><span className="eyebrow">Para compartir con otros</span><h2>Habla de Amalaki con confianza.</h2><p>{firstName}, entiende lo esencial, escucha a la persona y practica antes de compartir.</p></div><div className="amalaki-ambassador-actions"><details><summary>Explícalo</summary><div className="amalaki-share-copy"><p>{selected.ambassador.shortPitch}</p><p>{selected.ambassador.explanation}</p></div></details><details><summary>Escucha</summary><div className="amalaki-share-copy">{selected.ambassador.listeningQuestions.map((question) => <p key={question}>“{question}”</p>)}<div className="amalaki-card-grid">{selected.ambassador.interestConnections.map((item) => <article className="amalaki-card" key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div></div></details><details><summary>Evita</summary><div className="amalaki-avoid"><h3>Límites para compartir</h3><ul>{selected.ambassador.avoid.map((item) => <li key={item}>{item}</li>)}</ul></div></details><details><summary>Practica</summary><div className="amalaki-share-copy"><p>Intenta explicar Amalaki con tus propias palabras. Eli te mostrará un ejemplo para comparar.</p><Link className="secondary-button" href={`/app/eli/practicar/amalaki?market=${market}`}>Practicar con Eli</Link></div></details></div><div className="amalaki-next"><h3>¿Con quién te gustaría compartir Amalaki?</h3><p>Elige una persona, conversa con naturalidad y después registra cómo te fue.</p><Link className="primary" href="/app/personas?product_interest=AMALAKI" onClick={() => eventFn('product_person_selected', market, 'people')}>Elegir una persona</Link></div></section>}
    </>}
    <section className="amalaki-finish"><span className="eyebrow">Siguiente paso</span><h2>{ready ? `Ya conoces mejor tu Amalaki, ${firstName}.` : 'Elige la presentación que quieres consultar.'}</h2><p>{ready ? role === 'AMBASSADOR' ? 'Lo importante ahora es llevarlo a una conversación real, sin memorizar un discurso.' : 'Ya sabes cómo prepararlo, qué contiene y dónde resolver tus dudas.' : 'Selecciona un país para consultar sus datos y recomendaciones específicas.'}</p>{ready && (role === 'AMBASSADOR' ? <Link className="secondary-button" href={`/app/eli/practicar/amalaki?market=${market}`}>Practicar con Eli</Link> : <Link className="secondary-button" href="/app/catalogo">Explorar el catálogo</Link>)}</section>
  </main>;
}

function eventFn(eventName: string, market: AmalakiMarket, section?: string) { event(eventName, market, section); }
