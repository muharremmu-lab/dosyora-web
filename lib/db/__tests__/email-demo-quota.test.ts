import { beforeEach, describe, expect, it, vi } from 'vitest'

const dbQueryOne = vi.fn()
const dbRun = vi.fn()

vi.mock('@/lib/db/query', () => ({
  dbQueryOne,
  dbRun,
}))

describe('email demo quota increment concurrency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbQueryOne
      .mockResolvedValueOnce({
        email: 'demo@example.com',
        demo_count: 0,
        window_started_at: '2026-08-08T08:00:00.000Z',
        window_expires_at: '2099-01-01T00:00:00.000Z',
      })
      .mockResolvedValueOnce({
        email: 'demo@example.com',
        demo_count: 1,
        window_started_at: '2026-08-08T08:00:00.000Z',
        window_expires_at: '2099-01-01T00:00:00.000Z',
      })
    dbRun.mockResolvedValue(undefined)
  })

  it('uses atomic SQL increment instead of read-modify-write', async () => {
    const { incrementEmailDemoQuota } = await import('@/lib/db/email-demo-quota')
    const quota = await incrementEmailDemoQuota('  Demo@Example.COM ')

    expect(dbRun).toHaveBeenCalledWith(
      'incrementEmailDemoQuota',
      expect.stringContaining('demo_count = demo_count + 1'),
      ['demo@example.com'],
    )
    expect(quota.demo_count).toBe(1)
  })
})
