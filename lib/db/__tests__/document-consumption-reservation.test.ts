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

const demoAccount = {
  id: 1,
  account_type: 'DEMO' as const,
  document_limit: DEMO_DOCUMENT_LIMIT,
  used_documents: 0,
}

describe('document consumption reservations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    dbQueryOne.mockResolvedValue(null)
    dbInsertReturningId.mockResolvedValue(1)
    dbRun.mockResolvedValue(undefined)
  })

  it('reserves quota atomically for demo accounts', async () => {
    dbQueryOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ used_documents: 1 })

    const { reserveDocumentQuota } = await import('@/lib/db/document-consumption')
    const result = await reserveDocumentQuota({
      account: demoAccount,
      documentRef: 'proc-1',
    })

    expect(result).toEqual({ reserved: true, duplicate: false, blocked: false })
    expect(dbInsertReturningId).toHaveBeenCalledOnce()
  })

  it('blocks reservation when quota is exhausted', async () => {
    const { reserveDocumentQuota } = await import('@/lib/db/document-consumption')
    const result = await reserveDocumentQuota({
      account: { ...demoAccount, used_documents: 50 },
      documentRef: 'proc-2',
    })

    expect(result).toEqual({ reserved: false, duplicate: false, blocked: true })
    expect(dbInsertReturningId).not.toHaveBeenCalled()
  })

  it('rolls back reservation when atomic increment fails', async () => {
    dbQueryOne
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null)

    const { reserveDocumentQuota } = await import('@/lib/db/document-consumption')
    const result = await reserveDocumentQuota({
      account: demoAccount,
      documentRef: 'proc-race',
    })

    expect(result).toEqual({ reserved: false, duplicate: false, blocked: true })
    expect(dbRun).toHaveBeenCalledWith(
      'documentConsumption.releaseReserved',
      expect.stringContaining('DELETE FROM document_consumption_events'),
      ['proc-race'],
    )
  })

  it('releases reserved quota on failure', async () => {
    dbQueryOne.mockResolvedValueOnce({
      id: 9,
      demo_lead_id: 1,
      document_ref: 'proc-3',
      consumed_at: '2026-08-08T08:00:00.000Z',
      status: 'RESERVED',
    })

    const { releaseDocumentQuota } = await import('@/lib/db/document-consumption')
    const result = await releaseDocumentQuota({
      account: demoAccount,
      documentRef: 'proc-3',
    })

    expect(result).toEqual({ released: true })
    expect(dbRun).toHaveBeenCalled()
  })

  it('treats owner accounts as unlimited without reservation writes', async () => {
    const { reserveDocumentQuota } = await import('@/lib/db/document-consumption')
    const result = await reserveDocumentQuota({
      account: {
        id: 2,
        account_type: 'OWNER',
        document_limit: null,
        used_documents: 999,
      },
      documentRef: 'proc-owner',
    })

    expect(result).toEqual({ reserved: true, duplicate: false, blocked: false })
    expect(dbInsertReturningId).not.toHaveBeenCalled()
  })
})
