import { logApiError, logApiInfo, logApiWarning } from '@/lib/api-logger'
import type { ContactMessage, DemoLead, LicenseNotification, SiteFeedback } from '@/lib/db/types'

import {
  getNotificationEnvConfig,
  isResendSendConfigured,
  maskEmailAddress,
  type NotificationEnvConfig,
} from './env'
import {
  CORPORATE_NOTIFICATION_FROM,
  FEEDBACK_NOTIFICATION_RECIPIENTS,
  isSmtpConfigured,
  sendCorporateEmail,
} from './smtp'
import {
  buildContactAdminEmail,
  buildDemoAdminEmail,
  buildDemoApplicantEmail,
  buildLicenseApplicantEmail,
  buildLicenseNotificationAdminEmail,
  buildSiteFeedbackEmail,
} from './templates'
import type { NotificationChannel, NotificationPayload, NotificationProvider } from './types'

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
  readonly channel: NotificationChannel
  private readonly config: NotificationEnvConfig
  private client: ResendClientLike | null

  constructor(config: NotificationEnvConfig = getNotificationEnvConfig(), client?: ResendClientLike) {
    this.config = config
    this.client = client ?? null
    this.channel = client ? 'resend' : 'smtp'
  }

  private async deliver(payload: ResendSendPayload): Promise<void> {
    if (this.client) {
      await sendResendEmail(this.client, CORPORATE_NOTIFICATION_FROM, payload)
      return
    }

    await sendCorporateEmail(payload)
  }

  async send(payload: NotificationPayload): Promise<void> {
    if (this.client) {
      if (!isResendSendConfigured(this.config)) {
        logApiWarning('notification_resend_skipped', {
          reason: 'missing_resend_config',
          hasApiKey: Boolean(this.config.resendApiKey),
          hasFrom: Boolean(this.config.emailFrom),
        })
        return
      }
    } else if (!isSmtpConfigured()) {
      logApiWarning('notification_smtp_skipped', { reason: 'missing_smtp_password' })
      return
    }

    if (payload.type === 'demo_lead_created') {
      await this.sendDemoLeadCreated(payload.lead, payload.activationToken)
      return
    }

    if (payload.type === 'demo_inquiry_created') {
      await this.sendAdminDemoEmail(payload.lead)
      return
    }

    if (payload.type === 'license_notification_created') {
      await this.sendLicenseNotificationCreated(payload.notification, payload.source)
      return
    }

    if (payload.type === 'license_applicant_received') {
      await this.sendLicenseApplicant(payload.mail)
      return
    }

    if (payload.type === 'site_feedback_created') {
      await this.sendSiteFeedback(payload.feedback)
      return
    }

    await this.sendContactMessageCreated(payload.message)
  }

  private async sendDemoLeadCreated(lead: DemoLead, activationToken?: string): Promise<void> {
    await this.sendApplicantDemoEmail(lead, activationToken)
    await this.sendAdminDemoEmail(lead)
  }

  private async sendApplicantDemoEmail(lead: DemoLead, activationToken?: string): Promise<void> {
    const template = buildDemoApplicantEmail(lead, activationToken)

    try {
      await this.deliver({
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
      await this.deliver({
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

  private async sendLicenseApplicant(mail: Parameters<typeof buildLicenseApplicantEmail>[0]): Promise<void> {
    const template = buildLicenseApplicantEmail(mail)
    try {
      await this.deliver({
        to: mail.email,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })
      logApiInfo('notification_license_applicant_sent', {
        recipient: maskEmailAddress(mail.email),
      })
    } catch (error) {
      logApiError(
        'notification_license_applicant_failed',
        { recipient: maskEmailAddress(mail.email) },
        error,
      )
    }
  }

  private async sendLicenseNotificationCreated(
    notification: LicenseNotification,
    source?: string | null,
  ): Promise<void> {
    if (!this.config.adminNotificationEmail) {
      logApiWarning('notification_license_admin_skipped', {
        notificationId: notification.id,
        reason: 'missing_admin_notification_email',
      })
      return
    }

    const template = buildLicenseNotificationAdminEmail(notification, source)

    try {
      await this.deliver({
        to: this.config.adminNotificationEmail,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      logApiInfo('notification_license_admin_sent', {
        notificationId: notification.id,
        recipient: maskEmailAddress(this.config.adminNotificationEmail),
      })
    } catch (error) {
      logApiError(
        'notification_license_admin_failed',
        {
          notificationId: notification.id,
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
      await this.deliver({
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

  private async sendSiteFeedback(feedback: SiteFeedback): Promise<void> {
    const template = buildSiteFeedbackEmail(feedback)
    const recipients = FEEDBACK_NOTIFICATION_RECIPIENTS.join(', ')

    try {
      await this.deliver({
        to: recipients,
        subject: template.subject,
        html: template.html,
        text: template.text,
      })

      logApiInfo('notification_site_feedback_sent', {
        feedbackId: feedback.id,
        kind: feedback.kind,
      })
    } catch (error) {
      logApiError('notification_site_feedback_failed', { feedbackId: feedback.id }, error)
    }
  }
}

export function createResendNotificationProvider(
  config: NotificationEnvConfig = getNotificationEnvConfig(),
  client?: ResendClientLike,
): NotificationProvider {
  if (!client && config.resendApiKey) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { Resend } = require('resend')
      client = new Resend(config.resendApiKey) as unknown as ResendClientLike
    } catch {
      // fallback
    }
  }
  return new ResendNotificationProvider(config, client)
}
