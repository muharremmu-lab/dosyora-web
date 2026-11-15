import { FEEDBACK_KINDS, type CreateSiteFeedbackInput, type FeedbackKind } from '@/lib/db/types'
import { normalizeEmail } from '@/lib/db/types'

import { collectErrors, validateEmail, validatePhone, validateRequired, type ValidationResult } from './common'

export function validateFeedbackPayload(body: unknown): ValidationResult<CreateSiteFeedbackInput> {
  if (!body || typeof body !== 'object') {
    return { success: false, errors: [{ field: 'body', message: 'Geçersiz istek gövdesi.' }] }
  }

  const payload = body as Record<string, unknown>
  const kind = String(payload.kind ?? 'oneri')
  const name = String(payload.name ?? payload.contact_name ?? '')
  const email = String(payload.email ?? payload.contact_email ?? '')
  const phone = payload.phone ?? payload.contact_phone
  const message = String(payload.message ?? '')

  const errors = collectErrors([
    FEEDBACK_KINDS.includes(kind as FeedbackKind) ? null : 'Bildirim türü geçersiz.',
    validateRequired(name, 'Ad soyad', 200),
    validateEmail(email),
    validatePhone(phone ? String(phone) : '', false),
    validateRequired(message, 'Mesaj', 5000),
  ])

  if (errors.length > 0) {
    return { success: false, errors }
  }

  return {
    success: true,
    data: {
      kind: kind as FeedbackKind,
      contact_name: name.trim(),
      contact_email: normalizeEmail(email),
      contact_phone: phone ? String(phone).trim() : null,
      message: message.trim(),
    },
  }
}
