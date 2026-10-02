import { describe, expect, it } from 'vitest';
import { peopleErrors } from './api-errors';

describe('people API errors', () => {
  it('exposes stable, human-readable duplicate and identity codes', () => {
    expect(peopleErrors.zilis.code).toBe('ZILIS_ID_ALREADY_EXISTS');
    expect(peopleErrors.email.code).toBe('EMAIL_ALREADY_EXISTS');
    expect(peopleErrors.identity.code).toBe('IDENTITY_CONFLICT');
    expect(peopleErrors.failed.message).not.toMatch(/sql|uuid|supabase/i);
  });
});
