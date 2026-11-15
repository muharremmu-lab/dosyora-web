import { logApiError, logApiInfo } from '@/lib/api-logger'
import { escapeHtml } from '@/lib/notifications/escape'
import { getNotificationEnvConfig } from '@/lib/notifications/env'
import { CORPORATE_NOTIFICATION_ADDRESS, isSmtpConfigured, sendCorporateEmail } from '@/lib/notifications/smtp'

export type PortalChangeSignal = {
  errorCode: string
  step: string
  appVersion: string
  osVersion: string | null
  detail: string
  machineCount: number
}

function envValue(name: string): string | null {
  const value = process.env[name]?.trim()
  return value || null
}

function isSafeHttpsUrl(value: string): boolean {
  try {
    const url = new URL(value)
    if (url.protocol !== 'https:') return false
    const host = url.hostname.toLowerCase()
    if (host === 'localhost' || host.endsWith('.local') || host === '0.0.0.0' || host === '::1') {
      return false
    }
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) {
      if (
        host.startsWith('10.') ||
        host.startsWith('127.') ||
        host.startsWith('192.168.') ||
        host.startsWith('169.254.') ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(host)
      ) {
        return false
      }
    }
    return true
  } catch {
    return false
  }
}

function webhookUrl(): string | null {
  const candidate =
    envValue('TELEMETRY_WEBHOOK_URL') || envValue('ALERT_WEBHOOK_URL') || envValue('WEBHOOK_URL')
  if (!candidate || !isSafeHttpsUrl(candidate)) return null
  return candidate
}

function telegramConfig(): { token: string; chatId: string } | null {
  const token = envValue('TELEGRAM_BOT_TOKEN')
  const chatId = envValue('TELEGRAM_CHAT_ID')
  if (!token || !chatId || !/^-?\d+$/.test(chatId)) return null
  return { token, chatId }
}

export function hasAlertChannel(): boolean {
  return Boolean(isSmtpConfigured() || telegramConfig() || webhookUrl())
}

function alertText(signal: PortalChangeSignal): string {
  return [
    'GibTebligat: aynı hata kodu son 60 dakikada en az 3 farklı bilgisayarda görüldü.',
    `Kod: ${signal.errorCode}`,
    `Adım: ${signal.step}`,
    `Sürüm: ${signal.appVersion}`,
    `İşletim sistemi: ${signal.osVersion ?? '-'}`,
    `Makine sayısı: ${signal.machineCount}`,
    `Ayrıntı: ${signal.detail}`,
  ].join('\n')
}

async function sendEmail(signal: PortalChangeSignal): Promise<void> {
  const config = getNotificationEnvConfig()
  if (!isSmtpConfigured()) {
    throw new Error('SMTP yapılandırması eksik.')
  }

  const text = alertText(signal)
  await sendCorporateEmail({
    to: config.adminNotificationEmail || CORPORATE_NOTIFICATION_ADDRESS,
    subject: `GibTebligat portal uyarısı: ${signal.errorCode}`,
    text,
    html: `<pre>${escapeHtml(text)}</pre>`,
  })
}

async function sendTelegram(signal: PortalChangeSignal): Promise<void> {
  const telegram = telegramConfig()
  if (!telegram) throw new Error('Telegram yapılandırması eksik.')

  const response = await fetch(`https://api.telegram.org/bot${telegram.token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: telegram.chatId,
      text: alertText(signal),
    }),
    signal: AbortSignal.timeout(8000),
  })

  if (!response.ok) {
    throw new Error(`Telegram uyarısı gönderilemedi (${response.status}).`)
  }
}

async function sendWebhook(signal: PortalChangeSignal): Promise<void> {
  const url = webhookUrl()
  if (!url) throw new Error('Webhook yapılandırması eksik.')

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      type: 'gib_portal_change_signal',
      windowMinutes: 60,
      ...signal,
    }),
    signal: AbortSignal.timeout(8000),
  })

  if (!response.ok) {
    throw new Error(`Webhook uyarısı gönderilemedi (${response.status}).`)
  }
}

export async function sendPortalChangeAlert(signal: PortalChangeSignal): Promise<boolean> {
  const tasks: Array<() => Promise<void>> = []
  if (isSmtpConfigured()) tasks.push(() => sendEmail(signal))
  if (telegramConfig()) tasks.push(() => sendTelegram(signal))
  if (webhookUrl()) tasks.push(() => sendWebhook(signal))

  if (tasks.length === 0) return false

  let sent = false
  for (const task of tasks) {
    try {
      await task()
      sent = true
    } catch (error) {
      logApiError(
        'gibtebligat_telemetry_alert_failed',
        { event: 'gibtebligat_telemetry_alert_failed', errorCode: signal.errorCode },
        error,
      )
    }
  }

  if (sent) {
    logApiInfo('gibtebligat_telemetry_alert_sent', {
      event: 'gibtebligat_telemetry_alert_sent',
      errorCode: signal.errorCode,
      machineCount: signal.machineCount,
    })
  }

  return sent
}
