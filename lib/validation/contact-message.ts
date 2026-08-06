import type { CreateContactMessageInput } from '@/lib/db/types'

import {
  collectErrors,
  validateEmail,
  validatePhone,
  validateRequired,
  type ValidationResult,
} from './common'

export function validateContactMessagePayload(
  body: unknown,
): ValidationResult<CreateContactMessageInput> {
  if (!body || typeof body !== 'object') {
    return { success: false, errors: [{ field: 'body', message: 'Geçersiz istek gövdesi.' }] }
  }

  const payload = body as Record<string, unknown>

  const name = String(payload.name ?? payload.fullName ?? payload.full_name ?? '')
  const email = String(payload.email ?? '')
  const phone = payload.phone ? String(payload.phone) : ''
  const subject = String(payload.subject ?? '')
  const message = String(payload.message ?? '')

  const errors = collectErrors([
    validateRequired(name, 'Ad soyad', 200),
    validateEmail(email),
    validatePhone(phone, false),
    validateRequired(subject, 'Konu', 200),
    validateRequired(message, 'Mesaj', 5000),
  ])

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return {
    success: true,
    data: {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim() || null,
      subject: subject.trim(),
      message: message.trim(),
    },
  }
}
