import nodemailer from 'nodemailer'

import { logApiError, logApiWarning } from '@/lib/api-logger'

export const CORPORATE_NOTIFICATION_FROM = 'DOSYORA <bilgi@dosyora.com>'
export const CORPORATE_NOTIFICATION_ADDRESS = 'bilgi@dosyora.com'

export const FEEDBACK_NOTIFICATION_RECIPIENTS = [
  CORPORATE_NOTIFICATION_ADDRESS,
  'ege@dosyora.com',
  'muharrem@dosyora.com',
] as const

const DEFAULT_SMTP_HOST = 'smtp.gmail.com'
const DEFAULT_SMTP_PORT = 465

export type CorporateEmailPayload = {
  to: string | readonly string[]
  subject: string
  html: string
  text: string
}

type SmtpConfig = {
  host: string
  port: number
  user: string
  password: string
}

export function getSmtpConfig(): SmtpConfig | null {
  const password = process.env.SMTP_PASSWORD?.trim()
  if (!password) return null

  const port = Number.parseInt(process.env.SMTP_PORT?.trim() || String(DEFAULT_SMTP_PORT), 10)
  return {
    host: process.env.SMTP_HOST?.trim() || DEFAULT_SMTP_HOST,
    port: Number.isFinite(port) ? port : DEFAULT_SMTP_PORT,
    user: process.env.SMTP_USER?.trim() || CORPORATE_NOTIFICATION_ADDRESS,
    password,
  }
}

export function isSmtpConfigured(): boolean {
  return getSmtpConfig() !== null
}

export async function sendCorporateEmail(payload: CorporateEmailPayload): Promise<void> {
  const config = getSmtpConfig()
  if (!config) {
    logApiWarning('notification_smtp_skipped', { reason: 'missing_smtp_password' })
    throw new Error('SMTP yapılandırması eksik.')
  }

  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: {
      user: config.user,
      pass: config.password,
    },
  })

  try {
    await transport.sendMail({
      from: CORPORATE_NOTIFICATION_FROM,
      to: typeof payload.to === 'string' ? payload.to : [...payload.to],
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    })
  } catch (error) {
    logApiError('notification_smtp_failed', { host: config.host }, error)
    throw error
  }
}
