import type { AmalakiRole } from '@/content/products/amalaki';

export function hasAmalakiAmbassadorLayer(role: AmalakiRole) {
  return role === 'AMBASSADOR';
}
