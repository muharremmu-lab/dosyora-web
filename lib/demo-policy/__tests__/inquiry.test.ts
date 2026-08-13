import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { DemoLead } from '@/lib/db/types'

const sampleLead: DemoLead = {
  id: 42,
  created_at: '2026-08-07T12:00:00.000Z',
  updated_at: '2026-08-07T12:00:00.000Z',
  company_name: 'Atlas A.Ş.',
  contact_name: 'Ayşe Kaya',
  email: 'ayse@example.com',
  phone: '+905551112233',
  city: null,
  employee_count: '25',
  monthly_document_count: '500',
  message: 'Muhasebe Programı: Luca',
  status: 'NEW',
  assigned_to: null,
  notes: null,
  source: 'website',
  ip_address: '127.0.0.1',
  user_agent: 'vitest',
  document_limit: null,
  account_status: null,
  used_documents: 0,
  account_type: null,
  activation_status: null,
  provision_status: 'INQUIRY',
  lifecycle_status: 'ACTIVE',
  customer_user_id: null,
  customer_company_id: null,
  activation_token_hash: null,
  activation_expires_at: null,
  activation_used_at: null,
  provisioned_at: null,
}

const createDemoInquiry = vi.fn()
const notifyDemoInquiryCreated = vi.fn()

vi.mock('@/lib/db/demo-leads', () => ({
  createDemoInquiry,
}))

vi.mock('@/lib/db/email-demo-quota', () => ({
  getEmailDemoQuota: vi.fn(),
  incrementEmailDemoQuota: vi.fn(),
}))

vi.mock('@/lib/db/ip-demo-quota', () => ({
  getIpDemoQuota: vi.fn(),
  incrementIpDemoQuota: vi.fn(),
}))

vi.mock('@/lib/notifications/service', () => ({
  notificationService: {
    notifyDemoInquiryCreated,
  },
}))

vi.mock('@/lib/db/demo-quota-reservation', () => ({
  reserveDemoAttemptQuota: vi.fn(),
  releaseDemoAttemptQuota: vi.fn(),
}))

describe('processDemoInquiry', () => {
  beforeEach(() => {
    createDemoInquiry.mockResolvedValue(sampleLead)
    notifyDemoInquiryCreated.mockResolvedValue(undefined)
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('persists inquiry and returns success without provisioning', async () => {
    const { processDemoInquiry } = await import('@/lib/demo-policy/service')

    const result = await processDemoInquiry(
      {
        company_name: 'Atlas A.Ş.',
        contact_name: 'Ayşe Kaya',
        email: 'ayse@example.com',
        phone: '+905551112233',
        employee_count: '25',
        monthly_document_count: '500',
        message: 'Muhasebe Programı: Luca',
        source: 'website',
      },
      {
        email: 'ayse@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
      },
    )

    expect(result.outcome).toBe('inquiry_created')
    expect(createDemoInquiry).toHaveBeenCalledOnce()
    expect(notifyDemoInquiryCreated).toHaveBeenCalledWith(sampleLead)
  })

  it('keeps inquiry when notification fails', async () => {
    notifyDemoInquiryCreated.mockRejectedValue(new Error('email down'))
    const { processDemoInquiry } = await import('@/lib/demo-policy/service')

    const result = await processDemoInquiry(
      {
        company_name: 'Atlas A.Ş.',
        contact_name: 'Ayşe Kaya',
        email: 'ayse@example.com',
        phone: '+905551112233',
      },
      {
        email: 'ayse@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
      },
    )

    expect(result.outcome).toBe('inquiry_created')
    if (result.outcome === 'inquiry_created') {
      expect(result.lead.id).toBe(42)
    }
  })
})
