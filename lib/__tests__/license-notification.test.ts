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

  it('requires tax office, package and hardware id for a desktop application', () => {
    const result = validateLicenseNotificationPayload({
      full_name: 'Atlas Ltd.',
      tax_number: '12345678901',
      email: 'Masaustu@Firma.com',
      source: 'desktop_app',
    })
    expect(result.success).toBe(false)
  })

  it('stores a desktop hardware id when it is 64 hex characters', () => {
    const hardwareId = 'A'.repeat(64)
    const result = validateLicenseNotificationPayload({
      full_name: 'Atlas Ltd.',
      tax_number: '12345678901',
      tax_office: 'Çankaya',
      email: 'masa@firma.com',
      source: 'desktop_app',
      hardware_id: hardwareId.toLowerCase(),
      license_plan: 'F1',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.hardware_id).toBe(hardwareId)
      expect(result.data.tax_office).toBe('Çankaya')
      expect(result.data.address).toBe('Belirtilmedi')
      expect(result.data.license_plan).toBe('F1')
    }
  })

  it('stores a selected desktop license plan', () => {
    const result = validateLicenseNotificationPayload({
      full_name: 'Atlas Ltd.',
      tax_number: '12345678901',
      tax_office: 'Çankaya',
      email: 'masa@firma.com',
      source: 'desktop_app',
      hardware_id: 'B'.repeat(64),
      license_plan: 'mm100',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.license_plan).toBe('MM100')
    }
  })

  it('rejects a tax number that is not 10 or 11 digits', () => {
    const result = validateLicenseNotificationPayload({ ...valid, taxNumber: '123' })
    expect(result.success).toBe(false)
  })
})
