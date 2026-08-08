import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { ADMIN_LOGIN_RATE_LIMIT } from '@/lib/admin-login-rate-limit'
import { clearRateLimit } from '@/lib/rate-limit'

vi.mock('@/lib/api-logger', () => ({
  logApiError: vi.fn(),
  logApiWarning: vi.fn(),
}))

vi.mock('@/lib/request-meta', () => ({
  getRequestMeta: vi.fn(() => ({ ip_address: '203.0.113.10', user_agent: 'vitest' })),
}))

function loginRequest(username: string, password: string): NextRequest {
  return new NextRequest('http://localhost:3000/api/admin/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
}

describe('admin login route hardening', () => {
  beforeEach(() => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('ADMIN_USERNAME', 'admin')
    vi.stubEnv('ADMIN_PASSWORD', 'dosyora-admin')
    vi.stubEnv('ADMIN_SESSION_SECRET', 'local-dev-session-secret-32-chars!!')
    clearRateLimit('admin-login:203.0.113.10:admin')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
    clearRateLimit('admin-login:203.0.113.10:admin')
  })

  it('returns 503 in production when ADMIN_* env is missing', async () => {
    vi.stubEnv('NODE_ENV', 'production')
    vi.stubEnv('ADMIN_USERNAME', '')
    vi.stubEnv('ADMIN_PASSWORD', '')
    vi.stubEnv('ADMIN_SESSION_SECRET', '')

    const { POST } = await import('@/app/api/admin/login/route')
    const response = await POST(loginRequest('admin', 'dosyora-admin'))

    expect(response.status).toBe(503)
  })

  it('returns 401 for invalid credentials below the rate limit', async () => {
    const { POST } = await import('@/app/api/admin/login/route')
    const response = await POST(loginRequest('admin', 'wrong-password'))

    expect(response.status).toBe(401)
  })

  it('returns 429 after repeated failed login attempts', async () => {
    const { POST } = await import('@/app/api/admin/login/route')

    for (let attempt = 0; attempt < ADMIN_LOGIN_RATE_LIMIT.limit; attempt += 1) {
      const response = await POST(loginRequest('admin', 'wrong-password'))
      expect(response.status).toBe(401)
    }

    const blocked = await POST(loginRequest('admin', 'wrong-password'))
    expect(blocked.status).toBe(429)
    expect(blocked.headers.get('Retry-After')).toBeTruthy()
  })

  it('creates a signed session cookie on successful login', async () => {
    const { POST } = await import('@/app/api/admin/login/route')
    const response = await POST(loginRequest('admin', 'dosyora-admin'))

    expect(response.status).toBe(200)

    const cookie = response.cookies.get('dosyora_admin_session')?.value
    expect(cookie).toBeTruthy()
    expect(cookie).not.toBe('local-dev-session-secret-32-chars!!')
    expect(cookie).toContain('.')
  })

  it('does not log submitted passwords', async () => {
    const { logApiWarning } = await import('@/lib/api-logger')
    const { POST } = await import('@/app/api/admin/login/route')

    await POST(loginRequest('admin', 'super-secret-password'))

    expect(logApiWarning).toHaveBeenCalled()
    const loggedPayload = JSON.stringify(vi.mocked(logApiWarning).mock.calls)
    expect(loggedPayload).not.toContain('super-secret-password')
  })
})
