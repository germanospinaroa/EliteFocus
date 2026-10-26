'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { AmalakiContent, AmalakiMarket, AmalakiRole } from '@/content/products/amalaki';

function event(eventName: string, market: AmalakiMarket, section?: string) {
  void fetch('/api/product-events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ eventName, market, section }) });
}

export function AmalakiExperience({ content, firstName, role }: { content: AmalakiContent; firstName: string; role: AmalakiRole }) {
  const [usageDone, setUsageDone] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [eliOpen, setEliOpen] = useState(false);
  const [eliAnswer, setEliAnswer] = useState<string | null>(null);
  const [shareOpen, setShareOpen] = useState(role === 'AMBASSADOR');
  useEffect(() => { event('product_viewed', content.market, 'experience'); }, [content.market]);

  function openUsage() { event('product_usage_opened', content.market, 'usage'); document.getElementById('como-usarlo')?.scrollIntoView({ behavior: 'smooth' }); }
  function completeUsage() { setUsageDone(true); event('product_usage_completed', content.market, 'usage'); }
  function askEli(prompt: string) {
    setEliOpen(true); event('eli_product_started', content.market, 'eli');
    const answers: Record<string, string> = {
      '¿Cómo lo preparo?': 'Abre un sobre y mézclalo con aproximadamente 240 ml de agua una vez al día.',
      '¿Cuánto dura una caja?': 'Una caja tiene 30 sobres. Con un sobre al día, corresponde a 30 días de uso.',
      '¿Qué contiene?': content.description + ' Entre sus componentes se encuentran amla, tulsi, jengibre y otros ingredientes vegetales.',
      '¿Es vegano?': content.market === 'CO' ? 'La presentación para Colombia cuenta con sello Vegan Friendly.' : 'Esa información todavía está pendiente de confirmar para Estados Unidos.',
    };
    setEliAnswer(answers[prompt] ?? 'Prefiero no darte una respuesta que todavía no tenemos bien respaldada. Esa información está pendiente de confirmar.');
  }

  return <main className="amalaki-page">
    <Link className="back-link" href="/app/catalogo">← Volver al catálogo</Link>
    <section className="amalaki-hero">
      <div className="amalaki-hero__copy"><span className="eyebrow">Amalaki · {content.marketLabel}</span><h1>Amalaki<span style={{ color: 'var(--primary)' }}>.</span></h1><p className="amalaki-hero__headline">Bienestar desde adentro, fácil de incorporar a tu día.</p><p className="lead">{content.description}</p><div className="amalaki-actions"><button className="primary" onClick={openUsage}>Ver cómo usarlo</button><button className="secondary-button" onClick={() => { setEliOpen(true); event('eli_product_started', content.market, 'hero'); }}>Preguntarle a Eli</button></div></div>
      <div className="amalaki-hero__image"><Image src="/catalog/amalaki-product.png" alt="Producto Amalaki" width={520} height={520} priority /></div>
    </section>
    <div className="amalaki-facts">{content.heroFacts.map((fact) => <div key={fact.value}><strong>{fact.value}</strong><span>{fact.label}</span></div>)}</div>

    <section className="amalaki-section amalaki-usage" id="como-usarlo"><div className="section-intro"><span className="eyebrow">Tu primer paso</span><h2>{firstName}, empezar es muy sencillo.</h2><p>Veamos esto juntos.</p></div><div className="amalaki-steps">{content.usage.map((step, index) => <div className="amalaki-step" key={step}><span>{index + 1}</span><p>{step}</p></div>)}</div><p className="amalaki-note">Guarda tu Amalaki en un lugar fresco y seco.</p><button className={`primary ${usageDone ? 'button-done' : ''}`} onClick={completeUsage}>{usageDone ? `Perfecto, ${firstName}. Ya tienes lo esencial.` : 'Ya sé cómo usarlo'}</button></section>

    <section className="amalaki-section"><div className="section-intro"><span className="eyebrow">Para entenderlo</span><h2>¿Qué es Amalaki?</h2><h3>En pocas palabras</h3><p>{content.shortExplanation}</p></div><details className="amalaki-disclosure"><summary>En 20 segundos</summary><p>{content.shortExplanation} Se presenta en sobres individuales para preparar con agua una vez al día.</p></details><button className="text-link amalaki-more" onClick={() => setExpanded((value) => !value)}>{expanded ? 'Mostrar menos' : 'Quiero saber más'} <span>→</span></button>{expanded && <div className="amalaki-expanded"><p>Amalaki reúne ingredientes de origen vegetal en una forma sencilla de incorporar a la rutina. Esta experiencia prioriza lo que necesitas para empezar y deja la información más profunda disponible cuando tú la quieras.</p></div>}</section>

    <section className="amalaki-section"><div className="section-intro"><span className="eyebrow">Lo que puedes conocer</span><h2>¿Por qué podría interesarte?</h2></div><div className="amalaki-card-grid">{content.benefits.map((item) => <article className="amalaki-card" key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div>{content.nutrition.length > 0 && <div className="amalaki-nutrition">{content.nutrition.map((item) => <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>)}</div>}</section>

    <section className="amalaki-section"><div className="section-intro"><span className="eyebrow">La fórmula</span><h2>Conoce lo que contiene</h2><p>Abre solo lo que te dé curiosidad.</p></div><div className="amalaki-ingredients">{content.ingredients.map((item) => <details key={item.name}><summary>{item.name}</summary><div><h4>¿Qué es?</h4><p>{item.what}</p><h4>¿Por qué está presente?</h4><p>{item.why}</p>{item.context && <p className="muted">{item.context}</p>}</div></details>)}</div></section>

    <section className="amalaki-section amalaki-important"><div><span className="eyebrow">Para usarlo con claridad</span><h2>Información importante</h2><p>Queremos que tengas claridad también sobre lo que debes tener presente antes de utilizar cualquier producto.</p></div><details><summary>Ver información importante</summary><ul>{content.precautions.map((item) => <li key={item}>{item}</li>)}</ul></details></section>

    <section className="amalaki-section"><div className="section-intro"><span className="eyebrow">Preguntas frecuentes</span><h2>Cuando aparece una duda</h2></div><div className="amalaki-faqs">{content.faqs.map((faq) => <details key={faq.question} onToggle={(e) => { if ((e.target as HTMLDetailsElement).open) event('product_faq_opened', content.market, faq.question); }}><summary>{faq.question}</summary><p>{faq.answer}</p></details>)}</div></section>

    <section className="amalaki-eli"><div><span className="eyebrow">Eli · acompañamiento guiado</span><h2>¿Te quedó alguna duda, {firstName}?</h2><p>Puedes preguntarle a Eli sobre tu Amalaki.</p></div><div className="amalaki-quick-prompts">{['¿Cómo lo preparo?', '¿Cuánto dura una caja?', '¿Qué contiene?', '¿Es vegano?'].map((prompt) => <button key={prompt} onClick={() => askEli(prompt)}>{prompt}<span>→</span></button>)}</div>{eliOpen && <div className="amalaki-eli-answer" role="status"><strong>{eliAnswer ? 'Esto es lo que tenemos respaldado' : 'Eli está lista para acompañarte'}</strong><p>{eliAnswer ?? 'Elige una pregunta para empezar.'}</p><button className="text-link" onClick={() => setEliOpen(false)}>Cerrar</button></div>}</section>

    {role === 'AMBASSADOR' && <section className="amalaki-section amalaki-ambassador" onMouseEnter={() => { if (!shareOpen) event('ambassador_share_section_viewed', content.market, 'share'); }}><div className="section-intro"><span className="eyebrow">Tu siguiente capa</span><h2>Cómo compartir Amalaki</h2><p>Entender → practicar → compartir → seguir.</p></div><details open={shareOpen} onToggle={(e) => { const open = (e.target as HTMLDetailsElement).open; setShareOpen(open); if (open) event('ambassador_share_section_viewed', content.market, 'share'); }}><summary>Explicarlo en una frase</summary><div className="amalaki-share-copy"><p>{content.ambassador.oneLine}</p><p className="muted">No necesitas aprenderte un discurso, {firstName}. Lo importante es que entiendas la idea y puedas explicarla con tus propias palabras.</p><Link className="secondary-button" href="/app/eli/practicar/amalaki">Practicar con Eli</Link></div></details><details><summary>Explicación de 20–30 segundos</summary><div className="amalaki-share-copy"><p>{content.ambassador.shortExplanation}</p><p className="muted">Úsala como referencia, no como libreto.</p><Link className="secondary-button" href="/app/eli/practicar/amalaki">Practicar esta explicación</Link></div></details><div className="amalaki-listen"><h3>Antes de hablar de Amalaki, escucha.</h3>{content.ambassador.listeningQuestions.map((question) => <p key={question}>“{question}”</p>)}</div><div className="amalaki-card-grid">{content.ambassador.connections.map((item) => <article className="amalaki-card" key={item.title}><h3>{item.title}</h3><p>{item.body}</p></article>)}</div><div className="amalaki-avoid"><h3>Comunicar bien también es cuidar.</h3><p>{firstName}, no necesitas exagerar para hablar bien de un producto. La información correcta genera mucha más confianza.</p><ul>{content.ambassador.avoid.map((item) => <li key={item}>{item}</li>)}</ul></div><div className="amalaki-next"><h3>¿Lo llevamos a una conversación real?</h3><p>Elige una persona y lleva contigo el contexto de Amalaki.</p><Link className="primary" href="/app/personas" onClick={() => event('product_person_selected', content.market, 'people')}>Elegir una persona</Link></div></section>}

    <section className="amalaki-finish"><span className="eyebrow">Un paso a la vez</span><h2>Ya conoces lo esencial de tu Amalaki, {firstName}.</h2><p>Sabes qué es, cómo usarlo y dónde encontrar ayuda cuando la necesites.</p><Link className="secondary-button" href="/app/aprender">Explorar mis beneficios VIP</Link></section>
  </main>;
}
