import { afterEach, describe, expect, it, vi } from 'vitest'

import type { SiteFeedback } from '@/lib/db/types'
import { buildSiteFeedbackEmail } from '@/lib/notifications/templates'
import {
  CORPORATE_NOTIFICATION_FROM,
  FEEDBACK_NOTIFICATION_RECIPIENTS,
  getSmtpConfig,
  isSmtpConfigured,
} from '@/lib/notifications/smtp'
import {
  ResendNotificationProvider,
  type ResendClientLike,
} from '@/lib/notifications/resend-provider'

const feedback: SiteFeedback = {
  id: 7,
  created_at: '2026-11-15T12:00:00.000Z',
  updated_at: '2026-11-15T12:00:00.000Z',
  kind: 'sikayet',
  contact_name: 'Ada Yılmaz',
  contact_email: 'ada@firma.com',
  contact_phone: '05321234567',
  message: 'Kurulum dosyası açılmıyor.',
  status: 'NEW',
}

describe('site feedback email', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('includes kind, contact details and the message', () => {
    const template = buildSiteFeedbackEmail(feedback)

    expect(template.subject).toContain('Şikayet')
    expect(template.subject).toContain('Ada Yılmaz')
    expect(template.text).toContain('Tür: Şikayet')
    expect(template.text).toContain('E-posta: ada@firma.com')
    expect(template.text).toContain('Telefon: 05321234567')
    expect(template.text).toContain('Kurulum dosyası açılmıyor.')
    expect(template.html).toContain('Şikayet')
    expect(template.html).toContain('ada@firma.com')
  })

  it('sends from bilgi@dosyora.com to the mailbox and the super admins', async () => {
    const send = vi.fn(async () => ({ data: { id: 'email-1' }, error: null }))
    const client: ResendClientLike = { emails: { send } }
    const provider = new ResendNotificationProvider(
      {
        resendApiKey: 're_test_key',
        emailFrom: 'DOSYORA <noreply@dosyora.com>',
        adminNotificationEmail: 'admin@dosyora.com',
      },
      client,
    )

    await provider.send({ type: 'site_feedback_created', feedback })

    expect(send).toHaveBeenCalledWith({
      from: CORPORATE_NOTIFICATION_FROM,
      to: FEEDBACK_NOTIFICATION_RECIPIENTS.join(', '),
      subject: expect.stringContaining('Şikayet'),
      html: expect.stringContaining('Ada Yılmaz'),
      text: expect.stringContaining('Kurulum dosyası açılmıyor.'),
    })
  })

  it('uses Google Workspace defaults when only the SMTP password is set', () => {
    vi.stubEnv('SMTP_PASSWORD', '')
    expect(isSmtpConfigured()).toBe(false)

    vi.stubEnv('SMTP_PASSWORD', 'app-password')
    vi.stubEnv('SMTP_HOST', '')
    vi.stubEnv('SMTP_USER', '')
    vi.stubEnv('SMTP_PORT', '')

    expect(getSmtpConfig()).toMatchObject({
      host: 'smtp.gmail.com',
      port: 465,
      user: 'bilgi@dosyora.com',
    })
  })
})
