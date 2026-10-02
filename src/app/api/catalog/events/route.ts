import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { catalogProducts } from '@/lib/catalog/products';
import { TRACKING_EVENTS, sessionId as newSessionId } from '@/lib/catalog/tracking';

const allowedOrigins = new Set(['https://catalogo-zilis.vercel.app', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3001', 'http://127.0.0.1:3001']);
const recent = new Map<string, number>();
function corsHeaders(origin: string | null) { const headers = new Headers({ 'Content-Type': 'application/json' }); if (origin && allowedOrigins.has(origin)) { headers.set('Access-Control-Allow-Origin', origin); headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS'); headers.set('Access-Control-Allow-Headers', 'Content-Type'); headers.set('Vary', 'Origin'); } return headers; }
function response(body: Record<string, unknown>, status: number, origin: string | null) { return new NextResponse(JSON.stringify(body), { status, headers: corsHeaders(origin) }); }
async function refreshAggregates(admin: ReturnType<typeof createAdminClient>, linkId: string, seenAt: string) {
  const [{ count: opens }, { count: sessions }, { count: productViews }] = await Promise.all([
    admin.from('catalog_events').select('id', { count: 'exact', head: true }).eq('catalog_link_id', linkId).eq('event_type', 'LINK_OPENED'),
    admin.from('catalog_sessions').select('id', { count: 'exact', head: true }).eq('catalog_link_id', linkId),
    admin.from('catalog_events').select('id', { count: 'exact', head: true }).eq('catalog_link_id', linkId).eq('event_type', 'PRODUCT_VIEWED'),
  ]);
  await admin.from('catalog_links').update({ total_opens: opens ?? 0, total_sessions: sessions ?? 0, total_product_views: productViews ?? 0, last_seen_at: seenAt }).eq('id', linkId);
}
export async function OPTIONS(request: Request) { const origin = request.headers.get('origin'); if (!origin || !allowedOrigins.has(origin)) return new NextResponse(null, { status: 403 }); const headers = corsHeaders(origin); headers.set('Access-Control-Max-Age', '600'); return new NextResponse(null, { status: 204, headers }); }
export async function POST(request: Request) {
  const origin = request.headers.get('origin'); if (origin && !allowedOrigins.has(origin)) return response({ ok: false, code: 'ORIGIN_NOT_ALLOWED' }, 403, null);
  try {
    const raw = await request.text(); if (raw.length > 3000) return response({ ok: false }, 400, origin); const body = JSON.parse(raw); const eventType = body.eventType; const ref = typeof body.token === 'string' ? body.token : ''; const session = typeof body.sessionId === 'string' && /^[A-Za-z0-9_-]{16,80}$/.test(body.sessionId) ? body.sessionId : newSessionId(); const productSlug = body.productSlug == null ? null : String(body.productSlug);
    if (!TRACKING_EVENTS.includes(eventType) || !/^[A-Za-z0-9_-]{16,80}$/.test(ref) || (productSlug && !catalogProducts.some((product) => product.slug === productSlug))) return response({ ok: false }, 400, origin);
    const rateKey = `${ref}:${session}:${eventType}:${productSlug ?? ''}`; const last = recent.get(rateKey) ?? 0; if (Date.now() - last < 1000) return response({ ok: true }, 200, origin); recent.set(rateKey, Date.now());
    const admin = createAdminClient(); const { data: link } = await admin.from('catalog_links').select('id,status').eq('token', ref).maybeSingle(); if (!link || link.status !== 'ACTIVE') return response({ ok: false }, 410, origin); const now = new Date().toISOString();
    const { data: existing } = await admin.from('catalog_sessions').select('id,event_count,products_viewed').eq('catalog_link_id', link.id).eq('session_id', session).maybeSingle(); const products = { ...((existing?.products_viewed ?? {}) as Record<string, number>) }; if (productSlug && eventType === 'PRODUCT_VIEWED') products[productSlug] = (products[productSlug] ?? 0) + 1;
    if (existing) await admin.from('catalog_sessions').update({ last_seen_at: now, event_count: (existing.event_count ?? 0) + 1, products_viewed: products }).eq('id', existing.id);
    else { const inserted = await admin.from('catalog_sessions').insert({ catalog_link_id: link.id, session_id: session, first_seen_at: now, last_seen_at: now, event_count: 1, products_viewed: products }); if (inserted.error && inserted.error.code !== '23505') return response({ ok: true }, 200, origin); }
    const eventInsert = await admin.from('catalog_events').insert({ catalog_link_id: link.id, session_id: session, event_type: eventType, product_slug: eventType === 'SESSION_STARTED' ? null : productSlug, occurred_at: now, referrer: typeof body.referrer === 'string' ? body.referrer.slice(0, 200) : null });
    if (eventInsert.error && eventInsert.error.code !== '23505') return response({ ok: true }, 200, origin);
    await refreshAggregates(admin, link.id, now);
    return response({ ok: true, sessionId: session }, 200, origin);
  } catch { return response({ ok: true }, 200, origin); }
}
