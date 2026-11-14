import { describe, expect, it } from 'vitest'

import { hashAdminPassword, verifyAdminPasswordHash } from '@/lib/admin-password'

describe('admin password hash', () => {
  it('verifies the password that was hashed and rejects a different one', async () => {
    const stored = await hashAdminPassword('yeni-guvenli-sifre')

    expect(stored.startsWith('scrypt:')).toBe(true)
    expect(await verifyAdminPasswordHash('yeni-guvenli-sifre', stored)).toBe(true)
    expect(await verifyAdminPasswordHash('baska-sifre', stored)).toBe(false)
    expect(await verifyAdminPasswordHash('yeni-guvenli-sifre', 'plain-text')).toBe(false)
  })
})
