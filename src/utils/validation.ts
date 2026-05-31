const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isValidEmail(value: string): boolean {
  return EMAIL_PATTERN.test(value.trim());
}

export function validatePassword(value: string): string | undefined {
  if (!value) return 'Password is required';
  if (value.length < 8) return 'Password must be at least 8 characters';
  if (value.length > 100) return 'Password must be at most 100 characters';
  return undefined;
}

export function validateRequired(value: string, label: string): string | undefined {
  if (!value.trim()) return `${label} is required`;
  return undefined;
}

export function validateMaxLength(
  value: string,
  max: number,
  label: string,
): string | undefined {
  if (value.length > max) return `${label} must be at most ${max} characters`;
  return undefined;
}

export function validatePhoneNumber(value: string): string | undefined {
  if (!value) return undefined;
  if (!/^[0-9+]+$/.test(value)) {
    return 'Phone number may only contain digits and +';
  }
  if (value.length > 20) return 'Phone number must be at most 20 characters';
  return undefined;
}
