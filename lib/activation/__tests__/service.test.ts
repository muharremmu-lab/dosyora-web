import { beforeEach, describe, expect, it, vi } from 'vitest'

import type { DemoLead } from '@/lib/db/types'

const sampleLead: DemoLead = {
  id: 1,
  created_at: '2026-08-08T08:00:00.000Z',
  updated_at: '2026-08-08T08:00:00.000Z',
  company_name: 'Atlas',
  contact_name: 'Ayşe',
  email: 'ayse@example.com',
  phone: '+905551112233',
  city: null,
  employee_count: null,
  monthly_document_count: null,
  message: null,
  status: 'NEW',
  assigned_to: null,
  notes: null,
  source: 'website',
  ip_address: '127.0.0.1',
  user_agent: 'vitest',
  document_limit: 20,
  account_status: 'ACTIVE',
  used_documents: 0,
  account_type: 'DEMO',
  activation_status: 'PENDING',
  provision_status: 'LOCAL_ONLY',
  lifecycle_status: 'ACTIVE',
  customer_user_id: 'user-1',
  customer_company_id: 'company-1',
  activation_token_hash: '',
  activation_expires_at: '2099-01-01T00:00:00.000Z',
  activation_used_at: null,
  provisioned_at: '2026-08-08T08:00:00.000Z',
}

vi.mock('@/lib/db/demo-leads', () => ({
  getDemoLeadByActivationTokenHash: vi.fn(),
  markDemoLeadActivated: vi.fn(),
}))

vi.mock('@/lib/provisioning/client', () => ({
  activateDemoAccountSafely: vi.fn(async () => ({
    result: { userId: 'user-1', companyId: 'company-1' },
    provisionStatus: 'LOCAL_ONLY',
  })),
}))

describe('activation service', () => {
  beforeEach(async () => {
    vi.clearAllMocks()
    const { generateActivationToken, hashActivationToken } = await import('@/lib/activation/tokens')
    const token = generateActivationToken()
    sampleLead.activation_token_hash = hashActivationToken(token)
    ;(globalThis as { __activationTestToken?: string }).__activationTestToken = token
  })

  it('accepts valid activation tokens', async () => {
    const { getDemoLeadByActivationTokenHash } = await import('@/lib/db/demo-leads')
    vi.mocked(getDemoLeadByActivationTokenHash).mockResolvedValue(sampleLead)

    const { verifyActivationTokenAsync } = await import('@/lib/activation/service')
    const token = (globalThis as { __activationTestToken?: string }).__activationTestToken ?? ''
    const result = await verifyActivationTokenAsync(token)

    expect(result.valid).toBe(true)
  })

  it('rejects expired activation tokens', async () => {
    const { getDemoLeadByActivationTokenHash } = await import('@/lib/db/demo-leads')
    vi.mocked(getDemoLeadByActivationTokenHash).mockResolvedValue({
      ...sampleLead,
      activation_expires_at: '2020-01-01T00:00:00.000Z',
    })

    const { verifyActivationTokenAsync } = await import('@/lib/activation/service')
    const token = (globalThis as { __activationTestToken?: string }).__activationTestToken ?? ''
    const result = await verifyActivationTokenAsync(token)

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.reason).toBe('expired')
    }
  })

  it('rejects already used activation tokens', async () => {
    const { getDemoLeadByActivationTokenHash } = await import('@/lib/db/demo-leads')
    vi.mocked(getDemoLeadByActivationTokenHash).mockResolvedValue({
      ...sampleLead,
      activation_status: 'ACTIVATED',
      activation_used_at: '2026-08-08T09:00:00.000Z',
    })

    const { verifyActivationTokenAsync } = await import('@/lib/activation/service')
    const token = (globalThis as { __activationTestToken?: string }).__activationTestToken ?? ''
    const result = await verifyActivationTokenAsync(token)

    expect(result.valid).toBe(false)
    if (!result.valid) {
      expect(result.reason).toBe('used')
    }
  })

  it('completes activation and stores only hashed token in lookup path', async () => {
    const { getDemoLeadByActivationTokenHash, markDemoLeadActivated } = await import('@/lib/db/demo-leads')
    vi.mocked(getDemoLeadByActivationTokenHash).mockResolvedValue(sampleLead)
    vi.mocked(markDemoLeadActivated).mockResolvedValue({
      ...sampleLead,
      activation_status: 'ACTIVATED',
    })

    const { completeDemoActivation } = await import('@/lib/activation/service')
    const token = (globalThis as { __activationTestToken?: string }).__activationTestToken ?? ''
    const result = await completeDemoActivation({
      token,
      password: 'secure-password-1',
    })

    expect(result.success).toBe(true)
    expect(getDemoLeadByActivationTokenHash).toHaveBeenCalledWith(
      expect.not.stringMatching(token),
    )
  })
})
