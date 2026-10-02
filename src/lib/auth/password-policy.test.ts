import { describe, expect, it } from 'vitest';
import { PASSWORD_POLICY, isValidPassword, passwordError } from './password-policy';

describe('password policy', () => {
  it('uses the same minimum for validation and UI', () => {
    expect(PASSWORD_POLICY.minLength).toBe(8);
    expect(isValidPassword('1234567')).toBe(false);
    expect(isValidPassword('12345678')).toBe(true);
  });
  it('explains weak and mismatched passwords in Spanish', () => {
    expect(passwordError('123')).toContain('8 caracteres');
    expect(passwordError('12345678', '87654321')).toBe('Las contraseñas no coinciden.');
    expect(passwordError('12345678', '12345678')).toBeNull();
  });
});
