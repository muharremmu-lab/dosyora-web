export type ValidationError = {
  field: string
  message: string
}

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; errors: ValidationError[] }

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function validateEmail(value: string): string | null {
  const trimmed = value.trim()
  if (!trimmed) return 'E-posta adresi zorunludur.'
  if (trimmed.length > 254) return 'E-posta adresi çok uzun.'
  if (!EMAIL_PATTERN.test(trimmed)) return 'Geçerli bir e-posta adresi girin.'
  return null
}

export function validatePhone(value: string, required = true): string | null {
  const trimmed = value.trim()
  if (!trimmed) {
    return required ? 'Telefon numarası zorunludur.' : null
  }

  const digits = trimmed.replace(/\D/g, '')
  if (digits.length < 10) return 'Telefon numarası en az 10 haneli olmalıdır.'
  if (digits.length > 15) return 'Telefon numarası çok uzun.'
  return null
}

export function validateRequired(value: string, fieldLabel: string, maxLength = 500): string | null {
  const trimmed = value.trim()
  if (!trimmed) return `${fieldLabel} zorunludur.`
  if (trimmed.length > maxLength) return `${fieldLabel} çok uzun.`
  return null
}

export function validateOptional(value: string | undefined | null, maxLength = 5000): string | null {
  if (!value) return null
  if (value.trim().length > maxLength) return 'Metin çok uzun.'
  return null
}

export function collectErrors(errors: Array<string | null>): ValidationError[] {
  return errors
    .map((message, index) => (message ? { field: `field_${index}`, message } : null))
    .filter((error): error is ValidationError => error !== null)
}
