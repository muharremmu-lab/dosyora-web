import { beforeEach, describe, expect, it, vi } from 'vitest'

const dbQueryOne = vi.fn()
const dbRun = vi.fn()
const sendEmail = vi.hoisted(() => vi.fn())
const sendCorporateEmail = vi.hoisted(() => vi.fn())

vi.mock('@/lib/db/query', () => ({
  dbQueryOne,
  dbRun,
}))

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: sendEmail }
  },
}))

vi.mock('@/lib/notifications/smtp', async () => {
  const actual = await vi.importActual<typeof import('@/lib/notifications/smtp')>('@/lib/notifications/smtp')
  return {
    ...actual,
    sendCorporateEmail,
  }
})

describe('Admin Password Reset and Recovery Code Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('TURSO_DATABASE_URL', 'libsql://test.turso.io')
    vi.stubEnv('TURSO_AUTH_TOKEN', 'test-token')
    vi.stubEnv('ADMIN_USERNAME', 'admin')
    vi.stubEnv('ADMIN_PASSWORD', 'super-secret-password-123')
    vi.stubEnv('ADMIN_SESSION_SECRET', 'test-secret-at-least-32-characters-long!')
    vi.stubEnv('SMTP_PASSWORD', 'test-smtp-password')
    vi.stubEnv('RESEND_API_KEY', '')
    sendCorporateEmail.mockResolvedValue(undefined)
    sendEmail.mockResolvedValue({ data: { id: 'email_1' }, error: null })
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
    expect(result.recipient).toBe('muharrem@dosyora.com')
    expect(result.recipient).not.toBe('muharrem.mu@gmail.com')
    expect(result.message).not.toMatch(/\d{6}/)
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
      admin_email: 'muharrem@dosyora.com',
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
      'ege@dosyora.com',
    )
    expect(res).toBe('updated')
  })

  it('attempts Resend send when RESEND_API_KEY is configured', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_dummy_key')
    const { requestAdminPasswordReset } = await import('@/lib/admin-password-reset')
    dbRun.mockResolvedValue({ rowsAffected: 1 })

    const result = await requestAdminPasswordReset('muharrem@dosyora.com')
    expect(result.success).toBe(true)
    expect(result.recipient).toBe('muharrem@dosyora.com')
  })

  it('attempts SMTP send when SMTP_PASSWORD is configured and Resend is missing', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    vi.stubEnv('SMTP_PASSWORD', 'test-smtp-password')
    const { requestAdminPasswordReset } = await import('@/lib/admin-password-reset')
    dbRun.mockResolvedValue({ rowsAffected: 1 })

    const result = await requestAdminPasswordReset('ege@dosyora.com')
    expect(result.success).toBe(true)
    expect(result.recipient).toBe('ege@dosyora.com')
  })

  it('returns failure and hides the code when no email provider succeeds', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_dummy_key')
    vi.stubEnv('SMTP_PASSWORD', 'test-smtp-password')
    sendEmail.mockResolvedValue({ data: null, error: { message: 'domain is not verified' } })
    sendCorporateEmail.mockRejectedValue(new Error('smtp down'))
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const { requestAdminPasswordReset } = await import('@/lib/admin-password-reset')
    dbRun.mockResolvedValue({ rowsAffected: 1 })

    const result = await requestAdminPasswordReset('muharrem@dosyora.com')
    expect(result.success).toBe(false)
    expect(result.status).toBe('unavailable')
    expect(result.code).toBeUndefined()
    expect(result.message).not.toMatch(/\d{6}/)
    const logged = [...errorSpy.mock.calls, ...logSpy.mock.calls].flat().join(' ')
    expect(logged).toContain('[ADMIN RESET RESEND]')
    expect(logged).toContain('[ADMIN RESET SMTP]')
    expect(logged).not.toContain('Code:')
    errorSpy.mockRestore()
    logSpy.mockRestore()
  })

  it('rejects ADMIN_USERNAME when it is not a super admin email', async () => {
    const { resolveAdminLogin } = await import('@/lib/admin-password-reset')
    dbQueryOne.mockResolvedValue(null)

    const actor = await resolveAdminLogin('admin', 'super-secret-password-123')
    expect(actor).toBeNull()

    const allowed = await resolveAdminLogin('muharrem@dosyora.com', 'super-secret-password-123')
    expect(allowed?.email).toBe('muharrem@dosyora.com')
    expect(allowed?.role).toBe('super_admin')
  })
})
