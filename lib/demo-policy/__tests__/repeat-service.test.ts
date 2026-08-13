import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DEMO_DOCUMENT_LIMIT } from '@/lib/entitlements/constants'
import { processDemoRequest } from '@/lib/demo-policy/service'

import { createDemoQuotaReservationMock } from './demo-quota-reservation.mock'

const quotaReservationMock = createDemoQuotaReservationMock()

vi.mock('@/lib/db/demo-quota-reservation', () => ({
  reserveDemoAttemptQuota: (...args: Parameters<typeof quotaReservationMock.reserveDemoAttemptQuota>) =>
    quotaReservationMock.reserveDemoAttemptQuota(...args),
  releaseDemoAttemptQuota: (...args: Parameters<typeof quotaReservationMock.releaseDemoAttemptQuota>) =>
    quotaReservationMock.releaseDemoAttemptQuota(...args),
}))

vi.mock('@/lib/db/demo-leads', () => ({
  createDemoAccount: vi.fn(async (input) => ({
    id: 1,
    ...input,
    created_at: '2026-08-08T08:00:00.000Z',
    updated_at: '2026-08-08T08:00:00.000Z',
    status: 'NEW',
    assigned_to: null,
    notes: null,
    account_status: 'ACTIVE',
    used_documents: 0,
    activation_status: 'PENDING',
    lifecycle_status: 'ACTIVE',
    customer_user_id: 'local-test@example.com',
    customer_company_id: 'local-company-test@example.com',
    activation_token_hash: 'hash',
    activation_expires_at: '2099-01-01T00:00:00.000Z',
    activation_used_at: null,
    provisioned_at: '2026-08-08T08:00:00.000Z',
    provision_status: 'LOCAL_ONLY',
  })),
  findDemoAccountByEmail: vi.fn(async () => null),
  updateDemoLeadProvision: vi.fn(async () => null),
}))

vi.mock('@/lib/provisioning/client', () => ({
  provisionDemoAccountSafely: vi.fn(async () => ({
    result: { userId: 'user-1', companyId: 'company-1' },
    provisionStatus: 'LOCAL_ONLY',
  })),
}))

vi.mock('@/lib/notifications/service', () => ({
  notificationService: {
    notifyDemoLeadCreated: vi.fn(async () => undefined),
  },
}))

describe('processDemoRequest repeat policy integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    quotaReservationMock.reset()
  })

  it('creates first demo with 20 belge and provisions account', async () => {
    const { provisionDemoAccountSafely } = await import('@/lib/provisioning/client')

    const result = await processDemoRequest(
      {
        company_name: 'Atlas',
        contact_name: 'Ayşe',
        email: 'ayse@example.com',
        phone: '+905551112233',
      },
      {
        email: 'ayse@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(result.outcome).toBe('created')
    if (result.outcome === 'created') {
      expect(result.documentLimit).toBe(DEMO_DOCUMENT_LIMIT)
    }
    expect(provisionDemoAccountSafely).toHaveBeenCalledOnce()
  })

  it('uses email history for second demo on different IP', async () => {
    quotaReservationMock.seed({ email: 'repeat@example.com', count: 1 })

    const result = await processDemoRequest(
      {
        company_name: 'Atlas',
        contact_name: 'Ayşe',
        email: 'repeat@example.com',
        phone: '+905551112233',
      },
      {
        email: 'repeat@example.com',
        ipAddress: '127.0.0.2',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(result.outcome).toBe('created')
    if (result.outcome === 'created') {
      expect(result.documentLimit).toBe(10)
    }
  })

  it('uses IP history for second demo on different email', async () => {
    quotaReservationMock.seed({ ip: '127.0.0.1', count: 1 })

    const result = await processDemoRequest(
      {
        company_name: 'Atlas',
        contact_name: 'Ayşe',
        email: 'other@example.com',
        phone: '+905551112233',
      },
      {
        email: 'other@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(result.outcome).toBe('created')
    if (result.outcome === 'created') {
      expect(result.documentLimit).toBe(10)
    }
  })

  it('assigns 5 belge on third repeat', async () => {
    quotaReservationMock.seed({ email: 'third@example.com', count: 2 })

    const result = await processDemoRequest(
      {
        company_name: 'Atlas',
        contact_name: 'Ayşe',
        email: 'third@example.com',
        phone: '+905551112233',
      },
      {
        email: 'third@example.com',
        ipAddress: '127.0.0.3',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(result.outcome).toBe('created')
    if (result.outcome === 'created') {
      expect(result.documentLimit).toBe(5)
    }
  })

  it('blocks fourth repeat with RED', async () => {
    quotaReservationMock.seed({ ip: '127.0.0.9', count: 3 })

    const result = await processDemoRequest(
      {
        company_name: 'Atlas',
        contact_name: 'Ayşe',
        email: 'blocked@example.com',
        phone: '+905551112233',
      },
      {
        email: 'blocked@example.com',
        ipAddress: '127.0.0.9',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(result.outcome).toBe('ip_quota_exceeded')
  })

  it('reserves email and IP counters once before successful provisioning', async () => {
    await processDemoRequest(
      {
        company_name: 'Atlas',
        contact_name: 'Ayşe',
        email: 'once@example.com',
        phone: '+905551112233',
      },
      {
        email: 'once@example.com',
        ipAddress: '127.0.0.5',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(quotaReservationMock.emailQuotaState.get('once@example.com')).toBe(1)
    expect(quotaReservationMock.ipQuotaState.get('127.0.0.5')).toBe(1)
  })
})
