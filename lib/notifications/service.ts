import type { ContactMessage, DemoLead, LicenseNotification, SiteFeedback } from '@/lib/db/types'
import type { LicenseApplicantMail } from './templates'

import { getNotificationEnvConfig } from './env'
import { isSmtpConfigured } from './smtp'
import { createResendNotificationProvider } from './resend-provider'
import type { NotificationPayload, NotificationProvider } from './types'

class NoopNotificationProvider implements NotificationProvider {
  readonly channel = 'noop' as const

  async send(): Promise<void> {
    // Used when Google Workspace SMTP is not configured.
  }
}

export function createNotificationProviders(): NotificationProvider[] {
  const config = getNotificationEnvConfig()

  if (isSmtpConfigured()) {
    return [createResendNotificationProvider(config)]
  }

  return [new NoopNotificationProvider()]
}

export class NotificationService {
  private readonly providers: NotificationProvider[]

  constructor(providers: NotificationProvider[] = createNotificationProviders()) {
    this.providers = providers
  }

  async notifyDemoLeadCreated(lead: DemoLead, activationToken?: string): Promise<void> {
    await this.dispatch({ type: 'demo_lead_created', lead, activationToken })
  }

  async notifyDemoInquiryCreated(lead: DemoLead): Promise<void> {
    await this.dispatch({ type: 'demo_inquiry_created', lead })
  }

  async notifyContactMessageCreated(message: ContactMessage): Promise<void> {
    await this.dispatch({ type: 'contact_message_created', message })
  }

  async notifyLicenseNotificationCreated(notification: LicenseNotification, source?: string | null): Promise<void> {
    await this.dispatch({ type: 'license_notification_created', notification, source })
  }

  async notifyLicenseApplicant(mail: LicenseApplicantMail): Promise<void> {
    await this.dispatch({ type: 'license_applicant_received', mail })
  }

  async notifySiteFeedbackCreated(feedback: SiteFeedback): Promise<void> {
    await this.dispatch({ type: 'site_feedback_created', feedback })
  }

  private async dispatch(payload: NotificationPayload): Promise<void> {
    await Promise.all(this.providers.map((provider) => provider.send(payload)))
  }
}

export const notificationService = new NotificationService()

export function createNotificationService(providers?: NotificationProvider[]): NotificationService {
  return new NotificationService(providers)
}

export type { NotificationChannel, NotificationPayload, NotificationProvider } from './types'
