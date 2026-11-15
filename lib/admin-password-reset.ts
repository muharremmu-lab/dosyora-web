import { logApiError, logApiWarning } from '@/lib/api-logger'
import { isSuperAdminEmail, normalizeAdminEmail, type AdminRole } from '@/lib/admin/super-admins'
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
import { getNotificationEnvConfig } from '@/lib/notifications/env'
import { CORPORATE_NOTIFICATION_ADDRESS, isSmtpConfigured, sendCorporateEmail } from '@/lib/notifications/smtp'
import { siteConfig } from '@/lib/site'

export type AdminLoginActor = {
  email: string | null
  role: AdminRole
}

async function adminPasswordMatches(password: string): Promise<boolean> {
  const credentials = getAdminCredentials()
  if (!credentials) {
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

export async function resolveAdminLogin(username: string, password: string): Promise<AdminLoginActor | null> {
  if (!isAdminProductionConfigValid()) {
    return null
  }

  const credentials = getAdminCredentials()
  if (!credentials) {
    return null
  }

  const normalized = normalizeAdminEmail(username)
  const superAdmin = isSuperAdminEmail(normalized)
  const legacyAdmin = safeEqual(username, credentials.username)
  if (!superAdmin && !legacyAdmin) {
    return null
  }

  if (!(await adminPasswordMatches(password))) {
    return null
  }

  if (superAdmin) {
    return { email: normalized, role: 'super_admin' }
  }

  return { email: null, role: 'admin' }
}

export async function authenticateAdmin(username: string, password: string): Promise<boolean> {
  return (await resolveAdminLogin(username, password)) !== null
}

export async function requestAdminPasswordReset(): Promise<'sent' | 'unavailable'> {
  const config = getNotificationEnvConfig()
  if (!databaseConfigured() || !isSmtpConfigured()) {
    logApiWarning('admin_password_reset_unavailable', {
      hasDatabase: databaseConfigured(),
      hasEmail: isSmtpConfigured(),
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
    await sendCorporateEmail({
      to: config.adminNotificationEmail || CORPORATE_NOTIFICATION_ADDRESS,
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
