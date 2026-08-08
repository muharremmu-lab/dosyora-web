import { beforeEach, describe, expect, it, vi } from 'vitest'

const dbQueryOne = vi.fn()
const dbInsertReturningId = vi.fn()
const dbRun = vi.fn()

vi.mock('@/lib/db/query', () => ({
  dbQueryOne,
  dbInsertReturningId,
  dbRun,
}))

describe('document consumption idempotency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbQueryOne.mockResolvedValue(null)
    dbInsertReturningId.mockResolvedValue(1)
    dbRun.mockResolvedValue(undefined)
  })

  it('consumes quota once for a new document ref', async () => {
    const { consumeDocumentQuota } = await import('@/lib/db/document-consumption')
    const result = await consumeDocumentQuota({ demoLeadId: 1, documentRef: 'doc-123' })

    expect(result).toEqual({ consumed: true, duplicate: false })
    expect(dbRun).toHaveBeenCalledOnce()
  })

  it('does not double-consume the same document ref', async () => {
    dbQueryOne.mockResolvedValueOnce({
      id: 9,
      demo_lead_id: 1,
      document_ref: 'doc-123',
      consumed_at: '2026-08-08T08:00:00.000Z',
      status: 'CONSUMED',
    })

    const { consumeDocumentQuota } = await import('@/lib/db/document-consumption')
    const result = await consumeDocumentQuota({ demoLeadId: 1, documentRef: 'doc-123' })

    expect(result).toEqual({ consumed: false, duplicate: true })
    expect(dbInsertReturningId).not.toHaveBeenCalled()
    expect(dbRun).not.toHaveBeenCalled()
  })
})
