import { validationConfig } from '../config/validation.config';

export function validatePhone(phone: string, countryCode: string): boolean {
  const rule = validationConfig.phone[countryCode.toUpperCase()];
  if (!rule) return true; // unknown country — pass through
  return new RegExp(rule.regex).test(phone);
}
