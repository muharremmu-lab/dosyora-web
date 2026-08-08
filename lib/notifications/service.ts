import type { ContactMessage, DemoLead } from '@/lib/db/types'

import { getNotificationEnvConfig, isResendSendConfigured } from './env'
import { createResendNotificationProvider } from './resend-provider'
import type { NotificationPayload, NotificationProvider } from './types'

class NoopNotificationProvider implements NotificationProvider {
  readonly channel = 'noop' as const

  async send(): Promise<void> {
    // Used when Resend is not configured.
  }
}

export function createNotificationProviders(): NotificationProvider[] {
  const config = getNotificationEnvConfig()

  if (isResendSendConfigured(config)) {
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

  async notifyContactMessageCreated(message: ContactMessage): Promise<void> {
    await this.dispatch({ type: 'contact_message_created', message })
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
