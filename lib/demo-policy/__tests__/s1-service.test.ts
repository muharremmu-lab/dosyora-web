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

describe('processDemoRequest S1 policy', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    quotaReservationMock.reset()
  })

  it('creates new demo accounts with first-attempt 20 document limit', async () => {
    const { createDemoAccount } = await import('@/lib/db/demo-leads')

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

    expect(createDemoAccount).toHaveBeenCalledWith(
      expect.objectContaining({
        document_limit: 20,
        account_type: 'DEMO',
      }),
    )
  })

  it('passes external account id to provisioning client', async () => {
    const { provisionDemoAccountSafely } = await import('@/lib/provisioning/client')

    await processDemoRequest(
      {
        company_name: 'Atlas',
        contact_name: 'Ayşe',
        email: 'external@example.com',
        phone: '+905551112233',
      },
      {
        email: 'external@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(provisionDemoAccountSafely).toHaveBeenCalledWith(
      expect.objectContaining({
        externalAccountId: '1',
        documentLimit: 20,
      }),
    )
  })

  it('does not send ready email when provisioning fails', async () => {
    const { provisionDemoAccountSafely } = await import('@/lib/provisioning/client')
    const { notificationService } = await import('@/lib/notifications/service')

    vi.mocked(provisionDemoAccountSafely).mockResolvedValueOnce({
      result: null,
      provisionStatus: 'FAILED',
    })

    const result = await processDemoRequest(
      {
        company_name: 'Atlas',
        contact_name: 'Ayşe',
        email: 'new@example.com',
        phone: '+905551112233',
      },
      {
        email: 'new@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(result.outcome).toBe('provision_failed')
    expect(notificationService.notifyDemoLeadCreated).not.toHaveBeenCalled()
  })

  it('returns duplicate_email for repeated normalized email', async () => {
    const { findDemoAccountByEmail } = await import('@/lib/db/demo-leads')
    vi.mocked(findDemoAccountByEmail).mockResolvedValueOnce({
      id: 99,
      email: 'repeat@example.com',
    } as Awaited<ReturnType<typeof findDemoAccountByEmail>>)

    const result = await processDemoRequest(
      {
        company_name: 'Atlas',
        contact_name: 'Ayşe',
        email: 'repeat@example.com',
        phone: '+905551112233',
      },
      {
        email: 'repeat@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(result.outcome).toBe('duplicate_email')
  })

  it('returns repeat quota exceeded when email history reaches fourth attempt', async () => {
    quotaReservationMock.seed({ email: 'quota@example.com', count: 3 })

    const result = await processDemoRequest(
      {
        company_name: 'Atlas',
        contact_name: 'Ayşe',
        email: 'quota@example.com',
        phone: '+905551112233',
      },
      {
        email: 'quota@example.com',
        ipAddress: '10.0.0.2',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(result.outcome).toBe('ip_quota_exceeded')
  })

  it('assigns 10 belge when same email was used before on another IP', async () => {
    quotaReservationMock.seed({ email: 'repeat@example.com', count: 1 })

    const { createDemoAccount } = await import('@/lib/db/demo-leads')

    const result = await processDemoRequest(
      {
        company_name: 'Atlas',
        contact_name: 'Ayşe',
        email: 'repeat@example.com',
        phone: '+905551112233',
      },
      {
        email: 'repeat@example.com',
        ipAddress: '10.0.0.9',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(result.outcome).toBe('created')
    if (result.outcome === 'created') {
      expect(result.documentLimit).toBe(10)
    }
    expect(createDemoAccount).toHaveBeenCalledWith(
      expect.objectContaining({ document_limit: 10 }),
    )
  })

  it('reserves attempt quota before provisioning', async () => {
    await processDemoRequest(
      {
        company_name: 'Atlas',
        contact_name: 'Ayşe',
        email: 'counter@example.com',
        phone: '+905551112233',
      },
      {
        email: 'counter@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(quotaReservationMock.emailQuotaState.get('counter@example.com')).toBe(1)
    expect(quotaReservationMock.ipQuotaState.get('127.0.0.1')).toBe(1)
  })

  it('returns ip_quota_exceeded after third demo on same IP', async () => {
    quotaReservationMock.seed({ ip: '127.0.0.1', count: 3 })

    const result = await processDemoRequest(
      {
        company_name: 'Atlas',
        contact_name: 'Ayşe',
        email: 'quota@example.com',
        phone: '+905551112233',
      },
      {
        email: 'quota@example.com',
        ipAddress: '127.0.0.1',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(result.outcome).toBe('ip_quota_exceeded')
  })
})
