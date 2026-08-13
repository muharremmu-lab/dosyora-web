import { beforeEach, describe, expect, it, vi } from 'vitest'

import { DEMO_RUNTIME_LIMITS } from '@/lib/entitlements/constants'
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

describe('demo quota concurrency', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    quotaReservationMock.reset()
  })

  it('shows legacy read-provision-increment flow could grant two first-attempt 20 limits', async () => {
    const emailState = new Map<string, number>()
    const ipState = new Map<string, number>()

    const readLegacyLimit = (email: string, ipAddress: string) => {
      const normalizedEmail = email.trim().toLowerCase()
      const emailCount = emailState.get(normalizedEmail) ?? 0
      const ipCount = ipState.get(ipAddress) ?? 0
      const effective = Math.max(emailCount, ipCount)
      return DEMO_RUNTIME_LIMITS[effective] ?? null
    }

    const first = readLegacyLimit('a@example.com', '127.0.0.1')
    const second = readLegacyLimit('b@example.com', '127.0.0.1')

    expect(first).toBe(20)
    expect(second).toBe(20)
  })

  it('reserves same IP concurrently so only one request gets 20 and the next gets 10', async () => {
    const [first, second] = await Promise.all([
      quotaReservationMock.reserveDemoAttemptQuota('alpha@example.com', '203.0.113.10'),
      quotaReservationMock.reserveDemoAttemptQuota('beta@example.com', '203.0.113.10'),
    ])

    expect(first).toEqual({ reserved: true, documentLimit: 20 })
    expect(second).toEqual({ reserved: true, documentLimit: 10 })
    expect(quotaReservationMock.ipQuotaState.get('203.0.113.10')).toBe(2)
  })

  it('reserves same email concurrently so only one request gets 20 and the next gets 10', async () => {
    const [first, second] = await Promise.all([
      quotaReservationMock.reserveDemoAttemptQuota('same@example.com', '203.0.113.20'),
      quotaReservationMock.reserveDemoAttemptQuota('same@example.com', '203.0.113.21'),
    ])

    expect(first).toEqual({ reserved: true, documentLimit: 20 })
    expect(second).toEqual({ reserved: true, documentLimit: 10 })
    expect(quotaReservationMock.emailQuotaState.get('same@example.com')).toBe(2)
  })

  it('processes concurrent same-IP demo requests with 20 then 10 document limits', async () => {
    const [first, second] = await Promise.all([
      processDemoRequest(
        {
          company_name: 'Atlas A',
          contact_name: 'Ayşe',
          email: 'one@example.com',
          phone: '+905551112233',
        },
        {
          email: 'one@example.com',
          ipAddress: '203.0.113.30',
          userAgent: 'vitest',
          phone: '+905551112233',
        },
      ),
      processDemoRequest(
        {
          company_name: 'Atlas B',
          contact_name: 'Mehmet',
          email: 'two@example.com',
          phone: '+905551112244',
        },
        {
          email: 'two@example.com',
          ipAddress: '203.0.113.30',
          userAgent: 'vitest',
          phone: '+905551112244',
        },
      ),
    ])

    expect(first.outcome).toBe('created')
    expect(second.outcome).toBe('created')
    if (first.outcome === 'created' && second.outcome === 'created') {
      const limits = [first.documentLimit, second.documentLimit].sort((a, b) => b - a)
      expect(limits).toEqual([20, 10])
    }
  })

  it('releases reserved quota when provisioning fails', async () => {
    const { provisionDemoAccountSafely } = await import('@/lib/provisioning/client')
    vi.mocked(provisionDemoAccountSafely).mockResolvedValueOnce({
      result: null,
      provisionStatus: 'FAILED',
    })

    const result = await processDemoRequest(
      {
        company_name: 'Atlas',
        contact_name: 'Ayşe',
        email: 'fail@example.com',
        phone: '+905551112233',
      },
      {
        email: 'fail@example.com',
        ipAddress: '203.0.113.40',
        userAgent: 'vitest',
        phone: '+905551112233',
      },
    )

    expect(result.outcome).toBe('provision_failed')
    expect(quotaReservationMock.emailQuotaState.get('fail@example.com')).toBe(0)
    expect(quotaReservationMock.ipQuotaState.get('203.0.113.40')).toBe(0)
  })
})
