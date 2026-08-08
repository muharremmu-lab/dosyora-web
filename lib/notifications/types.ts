import type { ContactMessage, DemoLead } from '@/lib/db/types'

export type NotificationChannel = 'noop' | 'resend' | 'smtp' | 'microsoft_graph' | 'webhook'

export type NotificationPayload =
  | { type: 'demo_lead_created'; lead: DemoLead; activationToken?: string }
  | { type: 'contact_message_created'; message: ContactMessage }

export interface NotificationProvider {
  readonly channel: NotificationChannel
  send(payload: NotificationPayload): Promise<void>
}
