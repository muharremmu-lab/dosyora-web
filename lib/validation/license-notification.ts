import type { CreateLicenseNotificationInput } from '@/lib/db/types'

import { collectErrors, validateEmail, validateRequired, type ValidationResult } from './common'

function validateTaxNumber(value: string): string | null {
  const digits = value.replace(/\D/g, '')
  if (!digits) return 'TCKN veya VKN zorunludur.'
  if (digits.length !== 10 && digits.length !== 11) {
    return 'TCKN veya VKN 10 veya 11 haneli olmalıdır.'
  }
  return null
}

export function validateLicenseNotificationPayload(
  body: unknown,
): ValidationResult<CreateLicenseNotificationInput> {
  if (!body || typeof body !== 'object') {
    return { success: false, errors: [{ field: 'body', message: 'Geçersiz istek gövdesi.' }] }
  }

  const payload = body as Record<string, unknown>
  const fullName = String(payload.fullName ?? payload.full_name ?? '')
  const email = String(payload.email ?? '')
  const taxNumber = String(payload.taxNumber ?? payload.tax_number ?? '')
  const taxOffice = String(payload.taxOffice ?? payload.tax_office ?? '')
  const address = String(payload.address ?? '')

  const errors = collectErrors([
    validateRequired(fullName, 'Ad soyad / şirket unvanı', 200),
    validateEmail(email),
    validateTaxNumber(taxNumber),
    validateRequired(taxOffice, 'Vergi dairesi', 200),
    validateRequired(address, 'Fatura adresi', 1000),
  ])

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return {
    success: true,
    data: {
      full_name: fullName.trim(),
      email: email.trim().toLowerCase(),
      tax_number: taxNumber.replace(/\D/g, ''),
      tax_office: taxOffice.trim(),
      address: address.trim(),
    },
  }
}
