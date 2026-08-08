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
  document_limit: 50,
  account_status: 'ACTIVE',
  used_documents: 0,
  account_type: 'DEMO',
  activation_status: 'PENDING',
  provision_status: 'LOCAL_ONLY',
  lifecycle_status: 'ACTIVE',
  customer_user_id: 'user-1',
  customer_company_id: 'company-1',
  activation_token_hash: 'hash',
  activation_expires_at: '2099-01-01T00:00:00.000Z',
  activation_used_at: null,
  provisioned_at: '2026-08-07T12:00:00.000Z',
}

const notifyDemoLeadCreated = vi.fn()
const findDemoAccountByEmail = vi.fn()
const createDemoAccount = vi.fn()
const updateDemoLeadProvision = vi.fn()
const provisionDemoAccountSafely = vi.fn()

vi.mock('@/lib/notifications/service', () => ({
  notificationService: {
    notifyDemoLeadCreated,
  },
}))

vi.mock('@/lib/db/demo-leads', () => ({
  createDemoAccount,
  findDemoAccountByEmail,
  updateDemoLeadProvision,
}))

vi.mock('@/lib/provisioning/client', () => ({
  provisionDemoAccountSafely,
}))

describe('processDemoRequest notification isolation', () => {
  beforeEach(() => {
    findDemoAccountByEmail.mockResolvedValue(null)
    createDemoAccount.mockResolvedValue(sampleLead)
    updateDemoLeadProvision.mockResolvedValue(sampleLead)
    provisionDemoAccountSafely.mockResolvedValue({
      result: { userId: 'user-1', companyId: 'company-1' },
      provisionStatus: 'LOCAL_ONLY',
    })
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
