import 'server-only';
import { randomBytes } from 'crypto';
import { createAdminClient } from '@/lib/supabase/admin';

export const TRACKING_EVENTS = ['LINK_OPENED', 'SESSION_STARTED', 'CATALOG_VIEWED', 'PRODUCT_VIEWED'] as const;
export type TrackingEvent = typeof TRACKING_EVENTS[number];
export function token() { return randomBytes(18).toString('base64url'); }
export function sessionId() { return randomBytes(18).toString('base64url'); }

export async function recordCatalogEvent(input: { token: string; eventType: TrackingEvent; sessionId: string; productSlug?: string | null; referrer?: string | null }) {
  const admin = createAdminClient();
  const { data: link } = await admin.from('catalog_links').select('id,status,owner_user_id,total_opens,total_product_views').eq('token', input.token).maybeSingle();
  if (!link || link.status !== 'ACTIVE') return { ok: false as const, reason: 'inactive' };
  const now = new Date().toISOString();
  await admin.from('catalog_events').insert({ catalog_link_id: link.id, session_id: input.sessionId, event_type: input.eventType, product_slug: input.productSlug ?? null, occurred_at: now, referrer: input.referrer ?? null });
  const [{ count: opens }, { count: productViews }] = await Promise.all([
    admin.from('catalog_events').select('id', { count: 'exact', head: true }).eq('catalog_link_id', link.id).eq('event_type', 'LINK_OPENED'),
    admin.from('catalog_events').select('id', { count: 'exact', head: true }).eq('catalog_link_id', link.id).eq('event_type', 'PRODUCT_VIEWED'),
  ]);
  await admin.from('catalog_links').update({ total_opens: opens ?? 0, total_product_views: productViews ?? 0, last_seen_at: now }).eq('id', link.id);
  return { ok: true as const, linkId: link.id };
}
