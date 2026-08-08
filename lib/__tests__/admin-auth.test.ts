import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  createAdminSessionToken,
  validateAdminCredentials,
  verifyAdminSessionToken,
} from '@/lib/admin-auth'

describe('admin auth hardening', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('rejects authentication in production when ADMIN_* env is missing', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ADMIN_USERNAME', '')
    vi.stubEnv('ADMIN_PASSWORD', '')
    vi.stubEnv('ADMIN_SESSION_SECRET', '')

    expect(validateAdminCredentials('admin', 'dosyora-admin')).toBe(false)
    expect(createAdminSessionToken()).toBeNull()
    expect(verifyAdminSessionToken('anything')).toBe(false)
  })

  it('creates and verifies signed session tokens in production', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ADMIN_USERNAME', 'prod-admin')
    vi.stubEnv('ADMIN_PASSWORD', 'prod-password')
    vi.stubEnv('ADMIN_SESSION_SECRET', 'y'.repeat(32))

    const token = createAdminSessionToken()
    expect(token).toBeTruthy()
    expect(verifyAdminSessionToken(token)).toBe(true)
    expect(verifyAdminSessionToken('y'.repeat(32))).toBe(false)
  })

  it('accepts valid credentials only when production env is configured', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ADMIN_USERNAME', 'prod-admin')
    vi.stubEnv('ADMIN_PASSWORD', 'prod-password')
    vi.stubEnv('ADMIN_SESSION_SECRET', 'z'.repeat(32))

    expect(validateAdminCredentials('prod-admin', 'prod-password')).toBe(true)
    expect(validateAdminCredentials('prod-admin', 'wrong-password')).toBe(false)
  })
})
