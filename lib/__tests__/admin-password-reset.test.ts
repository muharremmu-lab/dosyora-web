import { beforeEach, describe, expect, it, vi } from 'vitest'

const dbQueryOne = vi.fn()
const dbRun = vi.fn()

vi.mock('@/lib/db/query', () => ({
  dbQueryOne,
  dbRun,
}))

describe('Admin Password Reset and Recovery Code Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('TURSO_DATABASE_URL', 'libsql://test.turso.io')
    vi.stubEnv('TURSO_AUTH_TOKEN', 'test-token')
    vi.stubEnv('ADMIN_USERNAME', 'admin')
    vi.stubEnv('ADMIN_PASSWORD', 'super-secret-password-123')
    vi.stubEnv('ADMIN_SESSION_SECRET', 'test-secret-at-least-32-characters-long!')
  })

  it('generates reset token and 6-digit numeric code for muharrem@dosyora.com', async () => {
    const { requestAdminPasswordReset } = await import('@/lib/admin-password-reset')

    dbRun.mockResolvedValue({ rowsAffected: 1 })

    const result = await requestAdminPasswordReset('muharrem@dosyora.com')
    expect(result.success).toBe(true)
    expect(result.recipient).toBe('muharrem@dosyora.com')
    // Veritabanına hem token hem kod eklenmiş olmalı
    expect(dbRun).toHaveBeenCalledWith(
      'adminPassword.insertResetToken',
      expect.any(String),
      expect.any(Array),
    )
    expect(dbRun).toHaveBeenCalledWith(
      'adminPassword.insertResetCode',
      expect.any(String),
      expect.any(Array),
    )
  })

  it('generates reset token and code for ege@dosyora.com preserving both admin accounts', async () => {
    const { requestAdminPasswordReset } = await import('@/lib/admin-password-reset')

    dbRun.mockResolvedValue({ rowsAffected: 1 })

    const result = await requestAdminPasswordReset('ege@dosyora.com')
    expect(result.success).toBe(true)
    expect(result.recipient).toBe('ege@dosyora.com')
  })

  it('does NOT treat muharrem.mu@gmail.com as admin and falls back to muharrem@dosyora.com', async () => {
    const { requestAdminPasswordReset } = await import('@/lib/admin-password-reset')

    dbRun.mockResolvedValue({ rowsAffected: 1 })

    // muharrem.mu@gmail.com admin hesabı değildir; iki hesap birleştirilemez
    const result = await requestAdminPasswordReset('muharrem.mu@gmail.com')
    expect(result.success).toBe(true)
    expect(result.recipient).toBe('muharrem@dosyora.com')
    expect(result.recipient).not.toBe('muharrem.mu@gmail.com')
  })

  it('rejects weak passwords (< 10 chars)', async () => {
    const { completeAdminPasswordReset } = await import('@/lib/admin-password-reset')

    const res = await completeAdminPasswordReset('some-code', 'kisa')
    expect(res).toBe('weak')
  })

  it('completes password reset successfully with valid 6-digit code or token', async () => {
    const { completeAdminPasswordReset } = await import('@/lib/admin-password-reset')

    // Mock active token in database
    dbQueryOne.mockResolvedValueOnce({
      token_hash: 'mock_hash',
      expires_at: new Date(Date.now() + 100000).toISOString(),
      used_at: null,
    })
    dbRun.mockResolvedValueOnce({ rowsAffected: 1 }) // consumeReset
    dbRun.mockResolvedValueOnce({ rowsAffected: 1 }) // saveOverride

    const res = await completeAdminPasswordReset('749201', 'yeni-guclu-admin-sifresi-2026')
    expect(res).toBe('updated')
  })

  it('supports emergency ADMIN_RECOVERY_CODE environment variable', async () => {
    vi.stubEnv('ADMIN_RECOVERY_CODE', 'EMERGENCY_RECOVERY_SECRET_KEY_999')
    const { completeAdminPasswordReset } = await import('@/lib/admin-password-reset')

    dbRun.mockResolvedValueOnce({ rowsAffected: 1 }) // saveOverride

    const res = await completeAdminPasswordReset(
      'EMERGENCY_RECOVERY_SECRET_KEY_999',
      'yeni-guclu-admin-sifresi-2026',
    )
    expect(res).toBe('updated')
  })
})
