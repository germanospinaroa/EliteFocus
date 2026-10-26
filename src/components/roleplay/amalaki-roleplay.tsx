'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const scenarios = [
  { title: 'Curioso', prompt: 'La persona pregunta: “¿Pero qué es Amalaki?”', answer: 'Explicar la idea en una frase y preguntar qué le llamó la atención.', feedback: 'Muy bien. Una explicación breve deja espacio para escuchar.' },
  { title: 'Práctico', prompt: 'La persona pregunta: “¿Cómo se toma y cuánto dura?”', answer: 'Un sobre al día, con aproximadamente 240 ml de agua; una caja tiene 30 sobres.', feedback: 'Claro y útil. Compartiste solo la información necesaria.' },
  { title: 'Límite responsable', prompt: 'La persona pregunta si puede usarlo con una condición médica o medicamentos.', answer: 'No diagnosticar. Compartir la información disponible y recomendar consultar con un profesional de salud.', feedback: 'Excelente límite. Saber cuándo no responder también es cuidar.' },
];

export function AmalakiRoleplay({ firstName, market = 'UNKNOWN' }: { firstName: string; market?: string }) {
  const router = useRouter(); const [index, setIndex] = useState(0); const [feedback, setFeedback] = useState(''); const [busy, setBusy] = useState(false);
  useEffect(() => { void fetch('/api/product-events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ eventName: 'product_roleplay_started', market, section: 'roleplay' }) }); }, [market]);
  async function finish() { setBusy(true); void fetch('/api/product-events', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ eventName: 'product_roleplay_completed', market, section: 'roleplay' }) }); const response = await fetch('/api/roleplay/complete', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ startedAt: new Date().toISOString(), scenario: 'amalaki' }) }); if (response.ok) router.push('/app/catalogo/amalaki'); else setBusy(false); }
  if (index >= scenarios.length) return <main className="roleplay-page"><section className="roleplay-card"><div className="eyebrow">Eli · Amalaki</div><h1>Ya tienes una forma clara de acompañar.</h1><p className="subhead">Entender, escuchar y responder con responsabilidad. {firstName}, eso es lo que hace confiable una conversación.</p><button className="primary" onClick={finish} disabled={busy}>{busy ? 'GUARDANDO…' : 'Volver a Amalaki →'}</button></section></main>;
  const scenario = scenarios[index];
  return <main className="roleplay-page"><section className="roleplay-card"><div className="roleplay-head"><span className="eyebrow">Eli · práctica Amalaki</span><span className="roleplay-count">{index + 1} / {scenarios.length}</span></div><h1>Practiquemos una situación juntos.</h1><p className="roleplay-prompt">{scenario.prompt}</p><div className="roleplay-choices"><button onClick={() => setFeedback(scenario.feedback)} disabled={Boolean(feedback)}>{scenario.answer}<span>→</span></button></div>{feedback && <div className="roleplay-feedback" role="status"><p>{feedback}</p><div className="roleplay-feedback-actions"><button type="button" className="secondary" onClick={() => setFeedback('')}>Intentar otra vez</button><button type="button" className="primary" onClick={() => { setFeedback(''); setIndex((value) => value + 1); }}>{index === scenarios.length - 1 ? 'Terminar práctica' : 'Siguiente situación →'}</button></div></div>}<div className="roleplay-progress"><i style={{ width: `${(index / scenarios.length) * 100}%` }} /></div></section></main>;
}
