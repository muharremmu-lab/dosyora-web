import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { DemoLead } from '@/lib/db/types'

const sampleLead: DemoLead = {
  id: 99,
  created_at: '2026-08-07T12:00:00.000Z',
  updated_at: '2026-08-07T12:00:00.000Z',
  company_name: 'Atlas A.Ş.',
  contact_name: 'Ayşe Kaya',
  email: 'ayse@example.com',
  phone: '+905551112233',
  city: null,
  employee_count: '25',
  monthly_document_count: '500',
  message: null,
  status: 'NEW',
  assigned_to: null,
  notes: null,
  source: 'website',
  ip_address: '127.0.0.1',
  user_agent: 'vitest',
  document_limit: 100,
  account_status: 'ACTIVE',
  used_documents: 0,
}

const notifyDemoLeadCreated = vi.fn()
const findDemoAccountByEmail = vi.fn()
const createDemoAccount = vi.fn()
const incrementIpDemoQuota = vi.fn()
const getIpDemoQuota = vi.fn()
const isIpQuotaExceeded = vi.fn()
const getDocumentLimitForIpCount = vi.fn()

vi.mock('@/lib/notifications/service', () => ({
  notificationService: {
    notifyDemoLeadCreated,
  },
}))

vi.mock('@/lib/db/demo-leads', () => ({
  createDemoAccount,
  findDemoAccountByEmail,
}))

vi.mock('@/lib/db/ip-demo-quota', () => ({
  getIpDemoQuota,
  incrementIpDemoQuota,
  isIpQuotaExceeded,
  getDocumentLimitForIpCount,
}))

describe('processDemoRequest notification isolation', () => {
  beforeEach(() => {
    findDemoAccountByEmail.mockResolvedValue(null)
    getIpDemoQuota.mockResolvedValue({
      ip_address: '127.0.0.1',
      demo_count: 0,
      window_started_at: '2026-08-07T12:00:00.000Z',
      window_expires_at: '2026-08-08T12:00:00.000Z',
    })
    isIpQuotaExceeded.mockReturnValue(false)
    getDocumentLimitForIpCount.mockReturnValue(100)
    createDemoAccount.mockResolvedValue(sampleLead)
    incrementIpDemoQuota.mockResolvedValue(undefined)
    notifyDemoLeadCreated.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('returns created when DB succeeds and both notifications succeed', async () => {
    const { processDemoRequest } = await import('@/lib/demo-policy/service')

    const result = await processDemoRequest(
      {
        company_name: 'Atlas A.Ş.',
        contact_name: 'Ayşe Kaya',
        email: 'ayse@example.com',
        phone: '+905551112233',
        employee_count: '25',
        monthly_document_count: '500',
      },
      {
        email: 'ayse@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(result.outcome).toBe('created')
    expect(notifyDemoLeadCreated).toHaveBeenCalledOnce()
  })

  it('returns created when notification throws after DB insert', async () => {
    notifyDemoLeadCreated.mockRejectedValueOnce(new Error('notification down'))
    const { processDemoRequest } = await import('@/lib/demo-policy/service')

    const result = await processDemoRequest(
      {
        company_name: 'Atlas A.Ş.',
        contact_name: 'Ayşe Kaya',
        email: 'ayse@example.com',
        phone: '+905551112233',
        employee_count: '25',
        monthly_document_count: '500',
      },
      {
        email: 'ayse@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(result.outcome).toBe('created')
    expect(createDemoAccount).toHaveBeenCalledOnce()
  })

  it('returns creation_failed when DB insert fails', async () => {
    createDemoAccount.mockRejectedValueOnce(new Error('db down'))
    const { processDemoRequest } = await import('@/lib/demo-policy/service')

    const result = await processDemoRequest(
      {
        company_name: 'Atlas A.Ş.',
        contact_name: 'Ayşe Kaya',
        email: 'ayse@example.com',
        phone: '+905551112233',
        employee_count: '25',
        monthly_document_count: '500',
      },
      {
        email: 'ayse@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(result.outcome).toBe('creation_failed')
    expect(notifyDemoLeadCreated).not.toHaveBeenCalled()
  })

  it('returns duplicate_email when account already exists', async () => {
    findDemoAccountByEmail.mockResolvedValueOnce(sampleLead)
    const { processDemoRequest } = await import('@/lib/demo-policy/service')

    const result = await processDemoRequest(
      {
        company_name: 'Atlas A.Ş.',
        contact_name: 'Ayşe Kaya',
        email: 'ayse@example.com',
        phone: '+905551112233',
        employee_count: '25',
        monthly_document_count: '500',
      },
      {
        email: 'ayse@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(result.outcome).toBe('duplicate_email')
    expect(createDemoAccount).not.toHaveBeenCalled()
  })
})
