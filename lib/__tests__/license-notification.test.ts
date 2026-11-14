import { describe, expect, it } from 'vitest'

import { validateLicenseNotificationPayload } from '@/lib/validation/license-notification'

const valid = {
  fullName: 'Mutlu Teknoloji A.Ş.',
  email: 'ornek@sirket.com',
  taxNumber: '1234567890',
  taxOffice: 'Davutpaşa',
  address: 'İstanbul',
}

describe('validateLicenseNotificationPayload', () => {
  it('accepts a complete invoice notification', () => {
    const result = validateLicenseNotificationPayload(valid)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tax_number).toBe('1234567890')
      expect(result.data.email).toBe('ornek@sirket.com')
    }
  })

  it('rejects a tax number that is not 10 or 11 digits', () => {
    const result = validateLicenseNotificationPayload({ ...valid, taxNumber: '123' })
    expect(result.success).toBe(false)
  })
})
