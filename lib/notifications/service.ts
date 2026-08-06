import type { ContactMessage, DemoLead } from '@/lib/db/types'

export type NotificationChannel = 'smtp' | 'microsoft_graph' | 'webhook'

export type NotificationPayload =
  | { type: 'demo_lead_created'; lead: DemoLead }
  | { type: 'contact_message_created'; message: ContactMessage }

export interface NotificationProvider {
  readonly channel: NotificationChannel
  send(payload: NotificationPayload): Promise<void>
}

class NoopNotificationProvider implements NotificationProvider {
  readonly channel: NotificationChannel = 'webhook'

  async send(): Promise<void> {
    // Future integration point — no outbound mail in Sprint 11.
  }
}

export class NotificationService {
  private readonly providers: NotificationProvider[]

  constructor(providers: NotificationProvider[] = [new NoopNotificationProvider()]) {
    this.providers = providers
  }

  async notifyDemoLeadCreated(lead: DemoLead): Promise<void> {
    await this.dispatch({ type: 'demo_lead_created', lead })
  }

  async notifyContactMessageCreated(message: ContactMessage): Promise<void> {
    await this.dispatch({ type: 'contact_message_created', message })
  }

  private async dispatch(payload: NotificationPayload): Promise<void> {
    await Promise.all(this.providers.map((provider) => provider.send(payload)))
  }
}

export const notificationService = new NotificationService()
