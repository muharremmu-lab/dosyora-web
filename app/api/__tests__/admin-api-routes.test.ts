import { NextRequest } from 'next/server'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { isAdminAuthenticated } from '@/lib/admin-auth'
import { listDemoLeads, updateDemoLead, countAllDemoAccounts } from '@/lib/db/demo-leads'

vi.mock('@/lib/admin-auth', () => ({
  isAdminAuthenticated: vi.fn(),
}))

vi.mock('@/lib/db/demo-leads', () => ({
  listDemoLeads: vi.fn(),
  updateDemoLead: vi.fn(),
  getDemoLeadById: vi.fn(),
  countAllDemoAccounts: vi.fn(),
  countDemoAccountsByStatus: vi.fn(async () => 0),
  countDemoAccountsToday: vi.fn(async () => 0),
}))

vi.mock('@/lib/db/contact-messages', () => ({
  countAllContactMessages: vi.fn(async () => 0),
  countContactMessagesByStatus: vi.fn(async () => 0),
  createContactMessage: vi.fn(),
}))

vi.mock('@/lib/demo-policy/service', () => ({
  processDemoRequest: vi.fn(),
  processDemoInquiry: vi.fn(),
}))

vi.mock('@/lib/rate-limit', () => ({
  FORM_RATE_LIMIT: {},
  checkRateLimit: vi.fn(() => ({ allowed: true })),
}))

vi.mock('@/lib/request-meta', () => ({
  getRequestMeta: vi.fn(() => ({ ip_address: '127.0.0.1', user_agent: 'vitest' })),
}))

function sameOriginHeaders(): Record<string, string> {
  return {
    host: 'localhost:3000',
    origin: 'http://localhost:3000',
    'Content-Type': 'application/json',
  }
}

describe('admin api route auth', () => {
  beforeEach(() => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(false)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('GET /api/demo-leads returns 401 without admin session', async () => {
    const { GET } = await import('@/app/api/demo-leads/route')
    const response = await GET(new NextRequest('http://localhost:3000/api/demo-leads'))

    expect(response.status).toBe(401)
    expect(listDemoLeads).not.toHaveBeenCalled()
  })

  it('GET /api/demo-leads succeeds with admin session', async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(true)
    vi.mocked(listDemoLeads).mockResolvedValue({
      items: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    })

    const { GET } = await import('@/app/api/demo-leads/route')
    const response = await GET(new NextRequest('http://localhost:3000/api/demo-leads'))

    expect(response.status).toBe(200)
    expect(listDemoLeads).toHaveBeenCalledOnce()
  })

  it('PATCH /api/demo-leads/[id] returns 401 without admin session and does not mutate', async () => {
    const { PATCH } = await import('@/app/api/demo-leads/[id]/route')
    const response = await PATCH(
      new NextRequest('http://localhost:3000/api/demo-leads/1', {
        method: 'PATCH',
        headers: sameOriginHeaders(),
        body: JSON.stringify({ account_status: 'ACTIVE' }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(401)
    expect(updateDemoLead).not.toHaveBeenCalled()
  })

  it('PATCH /api/demo-leads/[id] succeeds with admin session', async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(true)
    vi.mocked(updateDemoLead).mockResolvedValue({
      id: 1,
      account_status: 'ACTIVE',
    } as Awaited<ReturnType<typeof updateDemoLead>>)

    const { PATCH } = await import('@/app/api/demo-leads/[id]/route')
    const response = await PATCH(
      new NextRequest('http://localhost:3000/api/demo-leads/1', {
        method: 'PATCH',
        headers: sameOriginHeaders(),
        body: JSON.stringify({ account_status: 'ACTIVE', document_limit: 100 }),
      }),
      { params: Promise.resolve({ id: '1' }) },
    )

    expect(response.status).toBe(200)
    expect(updateDemoLead).toHaveBeenCalledOnce()
  })

  it('GET /api/admin/stats returns 401 without admin session', async () => {
    const { GET } = await import('@/app/api/admin/stats/route')
    const response = await GET()

    expect(response.status).toBe(401)
    expect(countAllDemoAccounts).not.toHaveBeenCalled()
  })

  it('GET /api/admin/stats succeeds with admin session', async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(true)
    vi.mocked(countAllDemoAccounts).mockResolvedValue(2)

    const { GET } = await import('@/app/api/admin/stats/route')
    const response = await GET()

    expect(response.status).toBe(200)
    expect(countAllDemoAccounts).toHaveBeenCalledOnce()
  })

  it('POST /api/demo-leads remains public without admin session', async () => {
    const { POST } = await import('@/app/api/demo-leads/route')
    const response = await POST(
      new NextRequest('http://localhost:3000/api/demo-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    )

    expect(response.status).not.toBe(401)
  })

  it('POST /api/contact-messages remains public without admin session', async () => {
    const { POST } = await import('@/app/api/contact-messages/route')
    const response = await POST(
      new NextRequest('http://localhost:3000/api/contact-messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      }),
    )

    expect(response.status).not.toBe(401)
  })

  it('returns 401 for tampered admin session on protected route', async () => {
    vi.mocked(isAdminAuthenticated).mockResolvedValue(false)

    const { GET } = await import('@/app/api/admin/stats/route')
    const response = await GET()

    expect(response.status).toBe(401)
  })
})
