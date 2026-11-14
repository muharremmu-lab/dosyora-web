import { Resend } from 'resend'

import { logApiError, logApiWarning } from '@/lib/api-logger'
import { adminPasswordError, hashAdminPassword, verifyAdminPasswordHash } from '@/lib/admin-password'
import { safeEqual } from '@/lib/admin-auth'
import { getAdminCredentials, isAdminProductionConfigValid } from '@/lib/security/production-env'
import {
  consumeAdminResetToken,
  createAdminResetToken,
  databaseConfigured,
  readAdminPasswordOverride,
  saveAdminPasswordOverride,
} from '@/lib/db/admin-password'
import { escapeHtml } from '@/lib/notifications/escape'
import { getNotificationEnvConfig, isResendSendConfigured } from '@/lib/notifications/env'
import { sendResendEmail } from '@/lib/notifications/resend-provider'
import { siteConfig } from '@/lib/site'

export async function authenticateAdmin(username: string, password: string): Promise<boolean> {
  if (!isAdminProductionConfigValid()) {
    return false
  }

  const credentials = getAdminCredentials()
  if (!credentials || !safeEqual(username, credentials.username)) {
    return false
  }

  try {
    const override = await readAdminPasswordOverride()
    if (override) {
      return verifyAdminPasswordHash(password, override)
    }
  } catch (error) {
    logApiError('admin_password_override_unavailable', {}, error)
  }

  return safeEqual(password, credentials.password)
}

export async function requestAdminPasswordReset(): Promise<'sent' | 'unavailable'> {
  const config = getNotificationEnvConfig()
  if (!databaseConfigured() || !isResendSendConfigured(config) || !config.adminNotificationEmail || !config.resendApiKey || !config.emailFrom) {
    logApiWarning('admin_password_reset_unavailable', {
      hasDatabase: databaseConfigured(),
      hasEmail: Boolean(config.adminNotificationEmail && isResendSendConfigured(config)),
    })
    return 'unavailable'
  }

  const token = await createAdminResetToken()
  const url = `${siteConfig.url.replace(/\/$/, '')}/admin/reset-password?token=${encodeURIComponent(token)}`
  const text = [
    'Dosyora admin şifrenizi sıfırlamak için aşağıdaki bağlantıyı kullanın.',
    'Bağlantı 30 dakika geçerlidir ve bir kez kullanılabilir.',
    '',
    url,
    '',
    'Bu isteği siz yapmadıysanız bu e-postayı yok sayın.',
  ].join('\n')

  try {
    await sendResendEmail(new Resend(config.resendApiKey), config.emailFrom, {
      to: config.adminNotificationEmail,
      subject: 'Dosyora admin şifre sıfırlama',
      text,
      html: `<p>Dosyora admin şifrenizi sıfırlamak için aşağıdaki bağlantıyı kullanın. Bağlantı 30 dakika geçerlidir ve bir kez kullanılabilir.</p><p><a href="${escapeHtml(url)}">Şifreyi sıfırla</a></p><p>Bu isteği siz yapmadıysanız bu e-postayı yok sayın.</p>`,
    })
  } catch (error) {
    logApiError('admin_password_reset_email_failed', {}, error)
    return 'unavailable'
  }

  return 'sent'
}

export async function completeAdminPasswordReset(token: string, password: string): Promise<'updated' | 'invalid' | 'weak'> {
  const weakness = adminPasswordError(password)
  if (weakness) {
    return 'weak'
  }

  if (!databaseConfigured()) {
    return 'invalid'
  }

  const consumed = await consumeAdminResetToken(token.trim())
  if (!consumed) {
    return 'invalid'
  }

  await saveAdminPasswordOverride(await hashAdminPassword(password))
  return 'updated'
}
