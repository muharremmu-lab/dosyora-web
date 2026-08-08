export type NotificationEnvConfig = {
  resendApiKey: string | null
  emailFrom: string | null
  adminNotificationEmail: string | null
}

export function getNotificationEnvConfig(): NotificationEnvConfig {
  return {
    resendApiKey: process.env.RESEND_API_KEY?.trim() || null,
    emailFrom: process.env.EMAIL_FROM?.trim() || null,
    adminNotificationEmail: process.env.ADMIN_NOTIFICATION_EMAIL?.trim() || null,
  }
}

export function isResendSendConfigured(config: NotificationEnvConfig = getNotificationEnvConfig()): boolean {
  return Boolean(config.resendApiKey && config.emailFrom)
}

export function maskEmailAddress(email: string): string {
  const trimmed = email.trim()
  const atIndex = trimmed.indexOf('@')
  if (atIndex <= 0) return '[invalid-email]'

  const local = trimmed.slice(0, atIndex)
  const domain = trimmed.slice(atIndex + 1)
  const visible = local.slice(0, Math.min(2, local.length))
  return `${visible}***@${domain}`
}
