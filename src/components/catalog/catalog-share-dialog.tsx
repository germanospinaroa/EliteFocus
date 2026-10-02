'use client';
import { useState } from 'react';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function CatalogShareDialog({ targetType, productSlug, productName, compact = false }: { targetType: 'CATALOG' | 'PRODUCT'; productSlug?: string; productName?: string; compact?: boolean }) {
  const router = useRouter(); const [open, setOpen] = useState(false); const [recipientLabel, setRecipientLabel] = useState(''); const [notes, setNotes] = useState(''); const [busy, setBusy] = useState(false); const [created, setCreated] = useState<{ shareUrl: string; recipientLabel: string; content: string } | null>(null); const [error, setError] = useState('');
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const body = document.body;
    const previous = { overflow: body.style.overflow, position: body.style.position, top: body.style.top, width: body.style.width };
    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';
    return () => {
      body.style.overflow = previous.overflow;
      body.style.position = previous.position;
      body.style.top = previous.top;
      body.style.width = previous.width;
      window.scrollTo(0, scrollY);
    };
  }, [open]);
  function close() { if (!busy) { setOpen(false); setCreated(null); setError(''); setRecipientLabel(''); setNotes(''); } }
  async function createLink() { if (!recipientLabel.trim() || busy) return; setBusy(true); setError(''); const response = await fetch('/api/catalog/links', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ recipientLabel: recipientLabel.trim(), label: notes.trim() || null, targetType, productSlug: productSlug ?? null }) }); const result = await response.json().catch(() => ({})); if (!response.ok) { setError(result.message ?? 'No pudimos crear el enlace.'); setBusy(false); return; } setCreated({ shareUrl: result.shareUrl, recipientLabel: recipientLabel.trim(), content: targetType === 'PRODUCT' ? productName ?? 'Producto' : 'Catálogo completo' }); setBusy(false); router.refresh(); }
  async function copy(value: string) { await navigator.clipboard?.writeText(value); }
  return <><button className={compact ? 'text-link catalog-share-compact' : 'primary'} onClick={() => setOpen(true)}>{compact ? 'Compartir' : 'Compartir catálogo'}</button>{open && <div className="modal-backdrop" role="presentation"><div className="modal-card" role="dialog" aria-modal="true" aria-labelledby="share-title"><button className="modal-close" onClick={close} aria-label="Cerrar">×</button>{created ? <><span className="eyebrow">Enlace listo</span><h2>Comparte cuando tenga sentido.</h2><p><strong>{created.recipientLabel}</strong> · {created.content}</p><code className="share-url">{created.shareUrl}</code><div className="modal-actions"><button className="primary" onClick={() => copy(created.shareUrl)}>Copiar enlace</button><button className="secondary-button" onClick={() => router.push('/app/catalogo/compartidos')}>Ver actividad</button><button className="text-button" onClick={close}>Listo</button></div></> : <><span className="eyebrow">Compartir</span><h2 id="share-title">¿A quién se lo vas a compartir?</h2><label>Nombre o referencia<input value={recipientLabel} onChange={(e) => setRecipientLabel(e.target.value)} placeholder="Ej. Pepito" /></label><label>Notas (opcional)<input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ej. Lead de Instagram" /></label>{error && <p className="form-error">{error}</p>}<div className="modal-actions"><button className="primary" disabled={!recipientLabel.trim() || busy} onClick={createLink}>{busy ? 'CREANDO ENLACE…' : 'Crear enlace'}</button><button className="text-button" onClick={close}>Cancelar</button></div></>}</div></div>}</>;
}
