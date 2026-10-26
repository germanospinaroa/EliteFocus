import { describe, expect, it } from 'vitest';
import { hasAmalakiAmbassadorLayer } from './amalaki-visibility';

describe('Amalaki role visibility', () => {
  it('keeps the ambassador layer away from VIP clients', () => {
    expect(hasAmalakiAmbassadorLayer('CLIENT_VIP')).toBe(false);
  });
  it('shows the ambassador layer to ambassadors', () => {
    expect(hasAmalakiAmbassadorLayer('AMBASSADOR')).toBe(true);
  });
});
