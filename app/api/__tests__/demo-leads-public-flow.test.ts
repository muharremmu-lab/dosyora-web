import { NextRequest } from 'next/server'
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/rate-limit', () => ({
  FORM_RATE_LIMIT: {},
  checkRateLimit: vi.fn(() => ({ allowed: true })),
}))

vi.mock('@/lib/request-meta', () => ({
  getRequestMeta: vi.fn(() => ({ ip_address: '127.0.0.1', user_agent: 'vitest' })),
}))

vi.mock('@/lib/demo-policy/service', () => ({
  processDemoRequest: vi.fn(),
  processDemoInquiry: vi.fn(),
}))

vi.mock('@/lib/db/demo-leads', () => ({
  listDemoLeads: vi.fn(),
}))

describe('public demo lead route behavior', () => {
  afterEach(() => {
    vi.clearAllMocks()
  })

  it('uses auto provisioning for default demo submissions', async () => {
    const { processDemoRequest, processDemoInquiry } = await import('@/lib/demo-policy/service')
    vi.mocked(processDemoRequest).mockResolvedValue({
      outcome: 'created',
      lead: { id: 1, email: 'demo@example.com' } as never,
      documentLimit: 20,
    })

    const { POST } = await import('@/app/api/demo-leads/route')
    const response = await POST(
      new NextRequest('http://localhost:3000/api/demo-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: 'Atlas',
          contact_name: 'Ayşe',
          email: 'demo@example.com',
          phone: '+905551112233',
          employee_count: '10',
          monthly_document_count: '100',
          accounting_program: 'Luca',
        }),
      }),
    )

    expect(response.status).toBe(201)
    expect(processDemoRequest).toHaveBeenCalledOnce()
    expect(processDemoInquiry).not.toHaveBeenCalled()
  })

  it('keeps inquiry-only path behind explicit inquiry_only flag', async () => {
    const { processDemoRequest, processDemoInquiry } = await import('@/lib/demo-policy/service')
    vi.mocked(processDemoInquiry).mockResolvedValue({
      outcome: 'inquiry_created',
      lead: { id: 2, email: 'info@example.com' } as never,
    })

    const { POST } = await import('@/app/api/demo-leads/route')
    const response = await POST(
      new NextRequest('http://localhost:3000/api/demo-leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_name: 'Atlas',
          contact_name: 'Ayşe',
          email: 'info@example.com',
          phone: '+905551112233',
          employee_count: '10',
          monthly_document_count: '100',
          accounting_program: 'Luca',
          inquiry_only: true,
        }),
      }),
    )

    expect(response.status).toBe(201)
    expect(processDemoInquiry).toHaveBeenCalledOnce()
    expect(processDemoRequest).not.toHaveBeenCalled()
  })
})
