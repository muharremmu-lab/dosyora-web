import type { ContactMessage, DemoLead, LicenseNotification } from '@/lib/db/types'
import type { LicenseApplicantMail } from './templates'

export type NotificationChannel = 'noop' | 'resend' | 'smtp' | 'microsoft_graph' | 'webhook'

export type NotificationPayload =
  | { type: 'demo_lead_created'; lead: DemoLead; activationToken?: string }
  | { type: 'demo_inquiry_created'; lead: DemoLead }
  | { type: 'contact_message_created'; message: ContactMessage }
  | { type: 'license_notification_created'; notification: LicenseNotification; source?: string | null }
  | { type: 'license_applicant_received'; mail: LicenseApplicantMail }

export interface NotificationProvider {
  readonly channel: NotificationChannel
  send(payload: NotificationPayload): Promise<void>
}
