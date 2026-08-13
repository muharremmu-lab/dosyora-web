import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DEMO_DOCUMENT_LIMIT } from '@/lib/entitlements/constants'

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
    dbQueryOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ used_documents: 1 })

    const { consumeDocumentQuota } = await import('@/lib/db/document-consumption')
    const result = await consumeDocumentQuota({
      account: {
        id: 1,
        account_type: 'DEMO',
        document_limit: DEMO_DOCUMENT_LIMIT,
        used_documents: 0,
      },
      documentRef: 'doc-123',
    })

    expect(result).toEqual({ consumed: true, duplicate: false, blocked: false })
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
    const result = await consumeDocumentQuota({
      account: {
        id: 1,
        account_type: 'DEMO',
        document_limit: DEMO_DOCUMENT_LIMIT,
        used_documents: 1,
      },
      documentRef: 'doc-123',
    })

    expect(result).toEqual({ consumed: false, duplicate: true, blocked: false })
    expect(dbInsertReturningId).not.toHaveBeenCalled()
  })
})
