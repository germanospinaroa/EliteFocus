import { describe, expect, it } from 'vitest';
import { hasDirectPeople, isTeamVisible } from './relationships';

describe('team visibility', () => {
  it('hides an ambassador without direct relationships', () => {
    expect(hasDirectPeople('a', [])).toBe(false);
    expect(isTeamVisible('AMBASSADOR', 'a', [])).toBe(false);
  });

  it('shows an ambassador with a sponsor or advisor relationship', () => {
    expect(isTeamVisible('AMBASSADOR', 'a', [{ sponsor_id: 'a', advisor_id: null }])).toBe(true);
    expect(isTeamVisible('AMBASSADOR', 'a', [{ sponsor_id: null, advisor_id: 'a' }])).toBe(true);
    expect(isTeamVisible('CLIENT_VIP', 'a', [{ sponsor_id: 'a', advisor_id: null }])).toBe(false);
  });
});
