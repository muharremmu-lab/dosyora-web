import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { isAdminAuthenticated } from '@/lib/admin-auth'

vi.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: vi.fn(),
}))

vi.mock('@/lib/db/demo-leads', () => ({
  archiveDemoLead: vi.fn(),
  getDemoLeadById: vi.fn(async () => ({
    id: 1,
    account_type: 'DEMO',
  })),
}))

function sameOriginHeaders(): Record<string, string> {
  return {
    host: 'localhost:3000',
    origin: 'http://localhost:3000',
    'Content-Type': 'application/json',
  }
}

describe('S1 admin cleanup route security', () => {
  beforeEach(() => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('PATCH archive returns 401 without admin session', async () => {
    const { PATCH } = await import('@/app/api/admin/demo-leads/[id]/archive/route')
    const response = await PATCH(
      new NextRequest('http://localhost:3000/api/admin/demo-leads/1/archive', {
        method: 'PATCH',
        headers: sameOriginHeaders(),
        body: JSON.stringify({ confirm: true }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(401)
  })

  it('PATCH archive returns 403 for cross-origin mutation', async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(true)

    const { PATCH } = await import('@/app/api/admin/demo-leads/[id]/archive/route')
    const response = await PATCH(
      new NextRequest('http://localhost:3000/api/admin/demo-leads/1/archive', {
        method: 'PATCH',
        headers: {
          host: 'localhost:3000',
          origin: 'https://evil.example',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ confirm: true }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(403)
  })
})
