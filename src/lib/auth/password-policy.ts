export const PASSWORD_POLICY = {
  minLength: 8,
} as const;

export function isValidPassword(password: string) {
  return password.length >= PASSWORD_POLICY.minLength;
}

export function passwordError(password: string, confirmation?: string) {
  if (!isValidPassword(password)) return `La contraseña debe tener al menos ${PASSWORD_POLICY.minLength} caracteres.`;
  if (confirmation !== undefined && password !== confirmation) return 'Las contraseñas no coinciden.';
  return null;
}
