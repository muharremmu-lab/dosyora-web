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

  it('accepts a desktop payload without a tax office', () => {
    const result = validateLicenseNotificationPayload({
      full_name: 'Atlas Ltd.',
      tax_number: '12345678901',
      email: 'Masaustu@Firma.com',
      address: 'Ankara',
      source: 'desktop_app',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.tax_office).toBe('Belirtilmedi')
      expect(result.data.email).toBe('masaustu@firma.com')
      expect(result.data.source).toBe('desktop_app')
      expect(result.data.hardware_id).toBeNull()
    }
  })

  it('stores a desktop hardware id when it is 64 hex characters', () => {
    const hardwareId = 'A'.repeat(64)
    const result = validateLicenseNotificationPayload({
      full_name: 'Atlas Ltd.',
      tax_number: '12345678901',
      email: 'masa@firma.com',
      address: 'Ankara',
      source: 'desktop_app',
      hardware_id: hardwareId.toLowerCase(),
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.hardware_id).toBe(hardwareId)
    }
  })

  it('rejects a tax number that is not 10 or 11 digits', () => {
    const result = validateLicenseNotificationPayload({ ...valid, taxNumber: '123' })
    expect(result.success).toBe(false)
  })
})
