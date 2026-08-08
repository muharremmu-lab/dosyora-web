import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/provisioning/types', () => ({
  getBelgeOkumaInternalSecret: vi.fn(() => 'test-internal-secret-32-characters-min'),
}))

const reserveDocumentQuota = vi.fn(async () => ({
  reserved: true,
  duplicate: false,
  blocked: false,
}))

vi.mock('@/lib/db/document-consumption', () => ({
  reserveDocumentQuota,
  confirmDocumentQuota: vi.fn(),
  releaseDocumentQuota: vi.fn(),
  consumeDocumentQuota: vi.fn(),
}))

vi.mock('@/lib/db/demo-leads', () => ({
  getDemoLeadByEmail: vi.fn(async () => ({
    id: 1,
    email: 'demo@example.com',
    account_type: 'DEMO',
    document_limit: 50,
    used_documents: 0,
    lifecycle_status: 'ACTIVE',
  })),
}))

describe('internal document consumption reserve action', () => {
  it('supports reserve action for linked demo accounts', async () => {
    const { POST } = await import('@/app/api/internal/document-consumption/route')
    const response = await POST(
      new NextRequest('http://localhost:3000/api/internal/document-consumption', {
        method: 'POST',
        headers: {
          Authorization: 'Bearer test-internal-secret-32-characters-min',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'demo@example.com',
          document_ref: 'proc-1',
          action: 'reserve',
        }),
      }),
    )

    expect(response.status).toBe(200)
    expect(reserveDocumentQuota).toHaveBeenCalledOnce()
  })
})
