import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  getAdminCredentials,
  getAdminSessionSecret,
  isAdminProductionConfigValid,
  MIN_ADMIN_SESSION_SECRET_LENGTH,
} from '@/lib/security/production-env'

describe('production env validation', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('allows development fallbacks when ADMIN_* env is missing', () => {
    vi.stubEnv('NODE_ENV', 'development')

    expect(isAdminProductionConfigValid()).toBe(true)
    expect(getAdminCredentials()).toEqual({
      username: 'admin',
      password: 'dosyora-admin',
    })
    expect(getAdminSessionSecret()).toContain('dosyora-dev-session-secret')
  })

  it('fails closed in production when ADMIN_* env is missing', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ADMIN_USERNAME', '')
    vi.stubEnv('ADMIN_PASSWORD', '')
    vi.stubEnv('ADMIN_SESSION_SECRET', '')

    expect(isAdminProductionConfigValid()).toBe(false)
    expect(getAdminCredentials()).toBeNull()
    expect(getAdminSessionSecret()).toBeNull()
  })

  it('fails closed in production when session secret is too short', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ADMIN_USERNAME', 'prod-admin')
    vi.stubEnv('ADMIN_PASSWORD', 'prod-password')
    vi.stubEnv('ADMIN_SESSION_SECRET', 'short-secret')

    expect(isAdminProductionConfigValid()).toBe(false)
    expect(getAdminSessionSecret()).toBeNull()
  })

  it('accepts valid production admin env', () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ADMIN_USERNAME', 'prod-admin')
    vi.stubEnv('ADMIN_PASSWORD', 'prod-password')
    vi.stubEnv('ADMIN_SESSION_SECRET', 'x'.repeat(MIN_ADMIN_SESSION_SECRET_LENGTH))

    expect(isAdminProductionConfigValid()).toBe(true)
    expect(getAdminCredentials()).toEqual({
      username: 'prod-admin',
      password: 'prod-password',
    })
    expect(getAdminSessionSecret()).toHaveLength(MIN_ADMIN_SESSION_SECRET_LENGTH)
  })
})
