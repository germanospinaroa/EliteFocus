import { describe, expect, it } from 'vitest';
import { canAccessAdmin, canSeeTeam } from './roles';

describe('admin authorization', () => {
  it('allows OWNER and ADMIN only inside the ambassador experience', () => {
    expect(canAccessAdmin('AMBASSADOR', 'OWNER')).toBe(true);
    expect(canAccessAdmin('AMBASSADOR', 'ADMIN')).toBe(true);
    expect(canAccessAdmin('AMBASSADOR', 'MEMBER')).toBe(false);
    expect(canAccessAdmin('CLIENT_VIP', 'OWNER')).toBe(false);
    expect(canAccessAdmin('CLIENT_VIP', 'ADMIN')).toBe(false);
  });
});

describe('team capability', () => {
  it('derives visibility from direct relationships, never leadership flags', () => {
    expect(canSeeTeam('AMBASSADOR', false)).toBe(false);
    expect(canSeeTeam('AMBASSADOR', true)).toBe(true);
    expect(canSeeTeam('CLIENT_VIP', true)).toBe(false);
  });
});
