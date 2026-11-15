import { describe, expect, it } from 'vitest'

import { validateFeedbackPayload } from '@/lib/validation/feedback'

describe('validateFeedbackPayload', () => {
  it('accepts a suggestion with contact details', () => {
    const result = validateFeedbackPayload({
      kind: 'oneri',
      name: 'Ada Yılmaz',
      email: 'Ada@Firma.com',
      phone: '05321234567',
      message: 'İndirme bağlantısı ana sayfada görünsün.',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.contact_email).toBe('ada@firma.com')
      expect(result.data.kind).toBe('oneri')
    }
  })

  it('rejects an unknown kind', () => {
    const result = validateFeedbackPayload({
      kind: 'diger',
      name: 'Ada',
      email: 'ada@firma.com',
      message: 'Merhaba',
    })
    expect(result.success).toBe(false)
  })
})
