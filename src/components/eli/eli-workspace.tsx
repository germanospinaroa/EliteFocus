'use client';

import { useState } from 'react';

type ExperienceType = 'CLIENT_VIP' | 'AMBASSADOR';
type EliOption = { key: string; label: string; next: string[] };

const ambassadorOptions: EliOption[] = [
  { key: 'message', label: 'Alguien me escribió', next: ['Entender qué necesita', 'Preparar una respuesta aprobada', 'Acordar el siguiente paso'] },
  { key: 'followup', label: 'Quiero hacer seguimiento', next: ['Elegir una persona', 'Definir el siguiente paso', 'Preparar un mensaje'] },
  { key: 'product', label: 'Tengo una duda de producto', next: ['Buscar información aprobada', 'Revisar uso y precauciones', 'Comparar productos'] },
  { key: 'conversation', label: 'Quiero iniciar una conversación', next: ['Elegir una persona', 'Encontrar una razón natural', 'Practicar cómo empezar'] },
  { key: 'practice', label: 'Quiero practicar', next: ['Primera conversación', 'Recomendación sin presión', 'Seguimiento'] },
  { key: 'training', label: 'Busco un entrenamiento', next: ['Conversaciones sencillas', 'Productos antes de conversar', 'Servicio y seguimiento'] },
  { key: 'now', label: '¿Qué hago ahora?', next: ['Ver mi siguiente acción', 'Revisar seguimientos', 'Abrir Personas'] }
];

const clientOptions: EliOption[] = [
  { key: 'understand', label: 'Quiero entender mi producto', next: ['Ver información aprobada', 'Revisar preguntas frecuentes', 'Hablar con mi asesor'] },
  { key: 'use', label: 'Cómo utilizarlo', next: ['Revisar instrucciones de uso', 'Consultar precauciones', 'Hablar con mi asesor'] },
  { key: 'question', label: 'Tengo una pregunta', next: ['Buscar en preguntas frecuentes', 'Consultar información aprobada', 'Hablar con mi asesor'] },
  { key: 'ingredients', label: 'Ingredientes', next: ['Ver ingredientes del producto', 'Revisar información aprobada', 'Hablar con mi asesor'] },
  { key: 'precautions', label: 'Precauciones', next: ['Revisar precauciones', 'Consultar preguntas frecuentes', 'Hablar con mi asesor'] },
  { key: 'faqs', label: 'Preguntas frecuentes', next: ['Abrir preguntas frecuentes', 'Buscar por producto', 'Hablar con mi asesor'] },
  { key: 'content', label: 'Ver contenido', next: ['Contenido recomendado', 'Aprender sobre mi producto', 'Hablar con mi asesor'] },
  { key: 'advisor', label: 'Hablar con mi asesor', next: ['Preparar mi pregunta', 'Ver mis datos de contacto', 'Solicitar acompañamiento'] }
];

export function EliWorkspace({ experienceType, intent }: { experienceType: ExperienceType; intent?: string }) {
  const options = experienceType === 'AMBASSADOR' ? ambassadorOptions : clientOptions;
  const initial = options.find((option) => option.key === intent);
  const [selected, setSelected] = useState<EliOption | null>(initial ?? null);
  const [context, setContext] = useState('');

  function choose(option: EliOption) { setSelected(option); setContext(''); }

  return <main className="eli-workspace"><div className="eli-workspace__intro"><div className="eyebrow">Eli · herramienta guiada</div><h1>{experienceType === 'AMBASSADOR' ? '¿Qué necesitas resolver?' : '¿Cómo puedo ayudarte?'}<span style={{ color: 'var(--primary)' }}>.</span></h1><p className="subhead">Elige una opción para abrir un flujo con información aprobada, reglas y próximos pasos.</p></div><section className="eli-workspace__layout"><div className="eli-options" aria-label="Opciones de Eli">{options.map((option) => <button type="button" className={`eli-option ${selected?.key === option.key ? 'eli-option--selected' : ''}`} key={option.key} onClick={() => choose(option)}><span>{option.label}</span><i aria-hidden="true">→</i></button>)}</div><section className="panel eli-flow" aria-live="polite"><div className="eyebrow">Flujo guiado</div>{selected ? <><h2>{selected.label}</h2><p className="subhead">¿Qué quieres hacer con esto?</p><div className="eli-next-options">{selected.next.map((next) => <button type="button" key={next} className={context === next ? 'eli-next-option eli-next-option--selected' : 'eli-next-option'} onClick={() => setContext(next)}>{next}<span aria-hidden="true">↗</span></button>)}</div>{context && <div className="eli-guidance"><strong>Siguiente paso</strong><p>{context} está listo para continuar con el contenido y las reglas de Elite Focus.</p></div>}</> : <div className="eli-empty"><h2>Empieza por elegir una necesidad.</h2><p>Las opciones de Eli abren recorridos concretos; no necesitas escribir una pregunta libre.</p></div>}</section></section></main>;
}
