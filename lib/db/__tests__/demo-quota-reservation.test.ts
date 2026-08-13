import { beforeEach, describe, expect, it, vi } from 'vitest'

const executeWithClient = vi.fn()
const transaction = vi.fn()

vi.mock('@/lib/db/client', () => ({
  ensureDbReady: vi.fn(async () => undefined),
  getDbClient: vi.fn(() => ({
    transaction,
  })),
}))

vi.mock('@/lib/db/execute', () => ({
  executeWithClient,
}))

describe('reserveDemoAttemptQuota transaction flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    transaction.mockResolvedValue({
      commit: vi.fn(async () => undefined),
      rollback: vi.fn(async () => undefined),
    })
  })

  it('reads counts and increments both counters inside one write transaction', async () => {
    executeWithClient
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ window_expires_at: '2099-01-01T00:00:00.000Z' }] })
      .mockResolvedValueOnce({ rows: [{ window_expires_at: '2099-01-01T00:00:00.000Z' }] })
      .mockResolvedValueOnce({
        rows: [{ demo_count: 0, window_expires_at: '2099-01-01T00:00:00.000Z' }],
      })
      .mockResolvedValueOnce({
        rows: [{ demo_count: 0, window_expires_at: '2099-01-01T00:00:00.000Z' }],
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })

    const { reserveDemoAttemptQuota } = await import('@/lib/db/demo-quota-reservation')
    const result = await reserveDemoAttemptQuota(' Demo@Example.COM ', '203.0.113.55')

    expect(result).toEqual({ reserved: true, documentLimit: 20 })
    expect(transaction).toHaveBeenCalledWith('write')
    expect(executeWithClient).toHaveBeenCalledWith(
      expect.anything(),
      'reserveDemoQuota.incrementEmail',
      expect.stringContaining('demo_count = demo_count + 1'),
      ['demo@example.com'],
    )
    expect(executeWithClient).toHaveBeenCalledWith(
      expect.anything(),
      'reserveDemoQuota.incrementIp',
      expect.stringContaining('demo_count = demo_count + 1'),
      ['203.0.113.55'],
    )
  })

  it('returns exceeded without incrementing when attempt history is already at RED', async () => {
    executeWithClient
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ window_expires_at: '2099-01-01T00:00:00.000Z' }] })
      .mockResolvedValueOnce({ rows: [{ window_expires_at: '2099-01-01T00:00:00.000Z' }] })
      .mockResolvedValueOnce({
        rows: [{ demo_count: 3, window_expires_at: '2099-01-01T00:00:00.000Z' }],
      })
      .mockResolvedValueOnce({
        rows: [{ demo_count: 0, window_expires_at: '2099-01-01T00:00:00.000Z' }],
      })

    const txn = {
      commit: vi.fn(async () => undefined),
      rollback: vi.fn(async () => undefined),
    }
    transaction.mockResolvedValueOnce(txn)

    const { reserveDemoAttemptQuota } = await import('@/lib/db/demo-quota-reservation')
    const result = await reserveDemoAttemptQuota('blocked@example.com', '203.0.113.56')

    expect(result).toEqual({ reserved: false, reason: 'exceeded' })
    expect(txn.rollback).toHaveBeenCalledOnce()
    expect(txn.commit).not.toHaveBeenCalled()
  })
})
