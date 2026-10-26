import { trackEvent, type EventName } from '@/lib/events';

export const productEventNames = ['product_viewed', 'product_usage_opened', 'product_usage_completed', 'product_faq_opened', 'eli_product_started', 'ambassador_share_section_viewed', 'product_roleplay_started', 'product_roleplay_completed', 'product_person_selected'] as const;
export type ProductEventName = typeof productEventNames[number];

export async function trackProductEvent(userId: string, eventName: ProductEventName, properties: Record<string, unknown> = {}) {
  return trackEvent(userId, eventName as EventName, { product: 'AMALAKI', ...properties });
}
