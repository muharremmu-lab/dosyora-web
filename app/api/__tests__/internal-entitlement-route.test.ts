import { NextRequest } from 'next/server'
import { describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/provisioning/types', () => ({
  getBelgeOkumaInternalSecret: vi.fn(() => 'test-internal-secret-32-characters-min'),
}))

vi.mock('@/lib/db/demo-leads', () => ({
  getDemoLeadByEmail: vi.fn(async () => ({
    id: 1,
    email: 'demo@example.com',
    account_type: 'DEMO',
    document_limit: 50,
    used_documents: 13,
    lifecycle_status: 'ACTIVE',
  })),
}))

describe('internal document entitlement route', () => {
  it('rejects missing bearer token', async () => {
    const { GET } = await import('@/app/api/internal/document-entitlement/route')
    const response = await GET(
      new NextRequest('http://localhost:3000/api/internal/document-entitlement?email=demo@example.com'),
    )
    expect(response.status).toBe(401)
  })

  it('returns entitlement for authorized internal caller', async () => {
    const { GET } = await import('@/app/api/internal/document-entitlement/route')
    const response = await GET(
      new NextRequest('http://localhost:3000/api/internal/document-entitlement?email=demo@example.com', {
        headers: {
          Authorization: 'Bearer test-internal-secret-32-characters-min',
        },
      }),
    )
    expect(response.status).toBe(200)
    const payload = await response.json()
    expect(payload.entitlement.remaining).toBe(37)
  })
})
