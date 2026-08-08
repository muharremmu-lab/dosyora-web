import { Resend } from 'resend'

import { logApiError, logApiInfo, logApiWarning } from '@/lib/api-logger'
import type { ContactMessage, DemoLead } from '@/lib/db/types'

import {
  getNotificationEnvConfig,
  isResendSendConfigured,
  maskEmailAddress,
  type NotificationEnvConfig,
} from './env'
import {
  buildContactAdminEmail,
  buildDemoAdminEmail,
  buildDemoApplicantEmail,
} from './templates'
import type { NotificationPayload, NotificationProvider } from './types'

export type ResendSendPayload = {
  to: string
  subject: string
  html: string
  text: string
}

export type ResendClientLike = {
  emails: {
    send: (payload: {
      from: string
      to: string
      subject: string
      html: string
      text: string
    }) => Promise<{ data?: { id?: string } | null; error?: { message?: string } | null }>
  }
}

function createResendClient(apiKey: string): ResendClientLike {
  return new Resend(apiKey)
}

export async function sendResendEmail(
  client: ResendClientLike,
  from: string,
  payload: ResendSendPayload,
): Promise<void> {
  const result = await client.emails.send({
    from,
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    text: payload.text,
  })

  if (result.error) {
    throw new Error(result.error.message || 'Resend email send failed.')
  }
}

export class ResendNotificationProvider implements NotificationProvider {
  readonly channel = 'resend' as const
  private readonly config: NotificationEnvConfig
  private client: ResendClientLike | null

  constructor(config: NotificationEnvConfig = getNotificationEnvConfig(), client?: ResendClientLike) {
    this.config = config
    this.client = client ?? (config.resendApiKey ? createResendClient(config.resendApiKey) : null)
  }

  async send(payload: NotificationPayload): Promise<void> {
    if (!isResendSendConfigured(this.config)) {
      logApiWarning('notification_resend_skipped', {
        reason: 'missing_resend_config',
        hasApiKey: Boolean(this.config.resendApiKey),
        hasFrom: Boolean(this.config.emailFrom),
      })
      return
    }

    if (!this.client) {
      logApiWarning('notification_resend_skipped', { reason: 'missing_resend_client' })
      return
    }

    if (payload.type === 'demo_lead_created') {
      await this.sendDemoLeadCreated(payload.lead)
      return
    }

    await this.sendContactMessageCreated(payload.message)
  }

  private async sendDemoLeadCreated(lead: DemoLead): Promise<void> {
    await this.sendApplicantDemoEmail(lead)
    await this.sendAdminDemoEmail(lead)
  }

  private async sendApplicantDemoEmail(lead: DemoLead): Promise<void> {
    const template = buildDemoApplicantEmail(lead)

    try {
      await sendResendEmail(this.client!, this.config.emailFrom!, {
        to: lead.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      logApiInfo('notification_demo_applicant_sent', {
        leadId: lead.id,
        recipient: maskEmailAddress(lead.email),
      })
    } catch (error) {
      logApiError(
        'notification_demo_applicant_failed',
        {
          leadId: lead.id,
          recipient: maskEmailAddress(lead.email),
        },
        error,
      )
    }
  }

  private async sendAdminDemoEmail(lead: DemoLead): Promise<void> {
    if (!this.config.adminNotificationEmail) {
      logApiWarning('notification_demo_admin_skipped', {
        leadId: lead.id,
        reason: 'missing_admin_notification_email',
      })
      return
    }

    const template = buildDemoAdminEmail(lead)

    try {
      await sendResendEmail(this.client!, this.config.emailFrom!, {
        to: this.config.adminNotificationEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      logApiInfo('notification_demo_admin_sent', {
        leadId: lead.id,
        recipient: maskEmailAddress(this.config.adminNotificationEmail),
      })
    } catch (error) {
      logApiError(
        'notification_demo_admin_failed',
        {
          leadId: lead.id,
          recipient: maskEmailAddress(this.config.adminNotificationEmail),
        },
        error,
      )
    }
  }

  private async sendContactMessageCreated(message: ContactMessage): Promise<void> {
    if (!this.config.adminNotificationEmail) {
      logApiWarning('notification_contact_admin_skipped', {
        messageId: message.id,
        reason: 'missing_admin_notification_email',
      })
      return
    }

    const template = buildContactAdminEmail(message)

    try {
      await sendResendEmail(this.client!, this.config.emailFrom!, {
        to: this.config.adminNotificationEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      logApiInfo('notification_contact_admin_sent', {
        messageId: message.id,
        recipient: maskEmailAddress(this.config.adminNotificationEmail),
      })
    } catch (error) {
      logApiError(
        'notification_contact_admin_failed',
        {
          messageId: message.id,
          recipient: maskEmailAddress(this.config.adminNotificationEmail),
        },
        error,
      )
    }
  }
}

export function createResendNotificationProvider(
  config: NotificationEnvConfig = getNotificationEnvConfig(),
  client?: ResendClientLike,
): NotificationProvider {
  return new ResendNotificationProvider(config, client)
}
