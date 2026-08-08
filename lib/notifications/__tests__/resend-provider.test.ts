import { afterEach, describe, expect, it, vi } from 'vitest'

import type { DemoLead } from '@/lib/db/types'

import { maskEmailAddress } from '@/lib/notifications/env'
import {
  ResendNotificationProvider,
  sendResendEmail,
  type ResendClientLike,
} from '@/lib/notifications/resend-provider'
import { createNotificationProviders } from '@/lib/notifications/service'

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
  document_limit: 100,
  account_status: 'ACTIVE',
  used_documents: 0,
}

function createMockClient(behavior: {
  applicant?: () => Promise<{ error?: { message?: string } | null }>
  admin?: () => Promise<{ error?: { message?: string } | null }>
}): ResendClientLike {
  let callCount = 0

  return {
    emails: {
      send: vi.fn(async () => {
        callCount += 1
        if (callCount === 1 && behavior.applicant) {
          return behavior.applicant()
        }
        if (callCount >= 2 && behavior.admin) {
          return behavior.admin()
        }
        return { data: { id: `email-${callCount}` }, error: null }
      }),
    },
  }
}

describe('notification env helpers', () => {
  it('masks email addresses for logs', () => {
    expect(maskEmailAddress('ayse@example.com')).toBe('ay***@example.com')
  })
})

describe('ResendNotificationProvider', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('sends applicant and admin emails independently', async () => {
    const client = createMockClient({})
    const provider = new ResendNotificationProvider(
      {
        resendApiKey: 're_test_key',
        emailFrom: 'DOSYORA <noreply@dosyora.com>',
        adminNotificationEmail: 'admin@dosyora.com',
      },
      client,
    )

    await provider.send({ type: 'demo_lead_created', lead: sampleLead })

    expect(client.emails.send).toHaveBeenCalledTimes(2)
  })

  it('continues when applicant email fails but admin succeeds', async () => {
    const client = createMockClient({
      applicant: async () => ({ error: { message: 'applicant failed' } }),
    })
    const provider = new ResendNotificationProvider(
      {
        resendApiKey: 're_test_key',
        emailFrom: 'DOSYORA <noreply@dosyora.com>',
        adminNotificationEmail: 'admin@dosyora.com',
      },
      client,
    )

    await expect(provider.send({ type: 'demo_lead_created', lead: sampleLead })).resolves.toBeUndefined()
    expect(client.emails.send).toHaveBeenCalledTimes(2)
  })

  it('continues when admin email fails but applicant succeeds', async () => {
    const client = createMockClient({
      admin: async () => ({ error: { message: 'admin failed' } }),
    })
    const provider = new ResendNotificationProvider(
      {
        resendApiKey: 're_test_key',
        emailFrom: 'DOSYORA <noreply@dosyora.com>',
        adminNotificationEmail: 'admin@dosyora.com',
      },
      client,
    )

    await expect(provider.send({ type: 'demo_lead_created', lead: sampleLead })).resolves.toBeUndefined()
    expect(client.emails.send).toHaveBeenCalledTimes(2)
  })

  it('skips admin email when ADMIN_NOTIFICATION_EMAIL is missing', async () => {
    const client = createMockClient({})
    const provider = new ResendNotificationProvider(
      {
        resendApiKey: 're_test_key',
        emailFrom: 'DOSYORA <noreply@dosyora.com>',
        adminNotificationEmail: null,
      },
      client,
    )

    await provider.send({ type: 'demo_lead_created', lead: sampleLead })

    expect(client.emails.send).toHaveBeenCalledTimes(1)
  })

  it('skips all sends when resend config is missing', async () => {
    const client = createMockClient({})
    const provider = new ResendNotificationProvider(
      {
        resendApiKey: null,
        emailFrom: null,
        adminNotificationEmail: 'admin@dosyora.com',
      },
      client,
    )

    await provider.send({ type: 'demo_lead_created', lead: sampleLead })

    expect(client.emails.send).not.toHaveBeenCalled()
  })
})

describe('createNotificationProviders', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('uses noop provider when RESEND_API_KEY is missing', () => {
    vi.stubEnv('RESEND_API_KEY', '')
    vi.stubEnv('EMAIL_FROM', 'DOSYORA <noreply@dosyora.com>')

    const providers = createNotificationProviders()

    expect(providers).toHaveLength(1)
    expect(providers[0]?.channel).toBe('noop')
  })
})

describe('sendResendEmail', () => {
  it('throws when resend returns an error', async () => {
    const client: ResendClientLike = {
      emails: {
        send: vi.fn(async () => ({ error: { message: 'invalid api key' } })),
      },
    }

    await expect(
      sendResendEmail(client, 'DOSYORA <noreply@dosyora.com>', {
        to: 'user@example.com',
        subject: 'Test',
        html: '<p>Test</p>',
        text: 'Test',
      }),
    ).rejects.toThrow('invalid api key')
  })
  it('does not throw when both demo emails fail', async () => {
    const client = createMockClient({
      applicant: async () => ({ error: { message: 'applicant failed' } }),
      admin: async () => ({ error: { message: 'admin failed' } }),
    })
    const provider = new ResendNotificationProvider(
      {
        resendApiKey: 're_test_key',
        emailFrom: 'DOSYORA <noreply@dosyora.com>',
        adminNotificationEmail: 'admin@dosyora.com',
      },
      client,
    )

    await expect(provider.send({ type: 'demo_lead_created', lead: sampleLead })).resolves.toBeUndefined()
    expect(client.emails.send).toHaveBeenCalledTimes(2)
  })

  it('sends contact admin notification', async () => {
    const client = createMockClient({})
    const provider = new ResendNotificationProvider(
      {
        resendApiKey: 're_test_key',
        emailFrom: 'DOSYORA <noreply@dosyora.com>',
        adminNotificationEmail: 'admin@dosyora.com',
      },
      client,
    )

    await provider.send({
      type: 'contact_message_created',
      message: {
        id: 3,
        created_at: '2026-08-07T12:00:00.000Z',
        name: 'Ayşe Kaya',
        email: 'ayse@example.com',
        phone: '+905551112233',
        subject: 'Destek',
        message: 'Merhaba',
        status: 'NEW',
        notes: null,
        ip_address: '127.0.0.1',
        user_agent: 'vitest',
      },
    })

    expect(client.emails.send).toHaveBeenCalledTimes(1)
  })
})

describe('logging safety', () => {
  it('does not log raw api keys in provider logs', async () => {
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const client = createMockClient({})

    const provider = new ResendNotificationProvider(
      {
        resendApiKey: 're_super_secret_key',
        emailFrom: 'DOSYORA <noreply@dosyora.com>',
        adminNotificationEmail: 'admin@dosyora.com',
      },
      client,
    )

    await provider.send({ type: 'demo_lead_created', lead: sampleLead })

    const logged = [...infoSpy.mock.calls, ...warnSpy.mock.calls].flat().join(' ')
    expect(logged).not.toContain('re_super_secret_key')
    expect(logged).not.toContain('ayse@example.com')

    infoSpy.mockRestore()
    warnSpy.mockRestore()
  })
})
