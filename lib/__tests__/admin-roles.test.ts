import { describe, expect, it } from 'vitest'

import { ADMIN_MODULES, canAccessAdminModule, isSuperAdminEmail } from '@/lib/admin/super-admins'
import { createSignedSessionToken, readSignedSessionToken } from '@/lib/security/signed-session'

describe('super admin access', () => {
  it('grants ege and muharrem every admin module', () => {
    for (const email of ['ege@dosyora.com', 'Muharrem@Dosyora.com']) {
      expect(isSuperAdminEmail(email)).toBe(true)
      for (const moduleName of ADMIN_MODULES) {
        expect(canAccessAdminModule(email, moduleName)).toBe(true)
      }
    }

    expect(isSuperAdminEmail('baska@dosyora.com')).toBe(false)
    expect(canAccessAdminModule('baska@dosyora.com', 'license_approvals')).toBe(false)
  })

  it('keeps a legacy session valid and tags a super admin session', () => {
    const secret = 's'.repeat(32)
    const now = 1_700_000_000_000
    const legacy = createSignedSessionToken(secret, now, 60_000)
    expect(readSignedSessionToken(legacy, secret, now)?.email).toBeUndefined()

    const tagged = createSignedSessionToken(secret, now, 60_000, {
      email: 'ege@dosyora.com',
      role: 'super_admin',
    })
    const payload = readSignedSessionToken(tagged, secret, now)
    expect(payload?.email).toBe('ege@dosyora.com')
    expect(payload?.role).toBe('super_admin')
  })
})
