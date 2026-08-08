import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@libsql/client/web', () => ({
  createClient: vi.fn(() => ({
    execute: vi.fn(async () => ({ rows: [], columns: [] })),
  })),
}))

describe('test-db route', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('returns 404 in production', async () => {
    vi.stubEnv('NODE_ENV', 'production')

    const { GET } = await import('@/app/api/test-db/route')
    const response = await GET()

    expect(response.status).toBe(404)
    await expect(response.text()).resolves.toBe('')
  })

  it('does not expose environment metadata in development success response', async () => {
    vi.stubEnv('NODE_ENV', 'development')
    vi.stubEnv('TURSO_DATABASE_URL', 'libsql://example.turso.io')
    vi.stubEnv('TURSO_AUTH_TOKEN', 'test-token')

    const { GET } = await import('@/app/api/test-db/route')
    const response = await GET()
    const body = (await response.json()) as Record<string, unknown>

    expect(response.status).toBe(200)
    expect(body).toEqual({ ok: true })
    expect(body).not.toHaveProperty('tokenLength')
    expect(body).not.toHaveProperty('url')
  })
})
