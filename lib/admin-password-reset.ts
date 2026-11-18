import { logApiError, logApiInfo, logApiWarning } from '@/lib/api-logger'
import { isSuperAdminEmail, normalizeAdminEmail, type AdminRole } from '@/lib/admin/super-admins'
import { adminPasswordError, hashAdminPassword, verifyAdminPasswordHash } from '@/lib/admin-password'
import { safeEqual } from '@/lib/admin-auth'
import { getAdminCredentials, isAdminProductionConfigValid } from '@/lib/security/production-env'
import {
  consumeAdminResetToken,
  createAdminResetToken,
  createAdminResetTokenAndCode,
  databaseConfigured,
  readAdminPasswordOverride,
  saveAdminPasswordOverride,
} from '@/lib/db/admin-password'
import { escapeHtml } from '@/lib/notifications/escape'
import { getNotificationEnvConfig } from '@/lib/notifications/env'
import {
  CORPORATE_NOTIFICATION_ADDRESS,
  CORPORATE_NOTIFICATION_FROM,
  isSmtpConfigured,
  sendCorporateEmail,
} from '@/lib/notifications/smtp'
import { siteConfig } from '@/lib/site'

export type AdminLoginActor = {
  email: string | null
  role: AdminRole
}

export type AdminResetRequestResult = {
  success: boolean
  status: 'sent' | 'code_ready' | 'unavailable'
  recipient: string
  code?: string
  message: string
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

/**
 * Admin şifre sıfırlama talebi başlatır.
 * - muharrem@dosyora.com birincil süper yöneticidir.
 * - muharrem.mu@gmail.com admin değildir, kesinlikle birleştirilmez.
 * - Resend ve SMTP kanalları denenir.
 * - E-posta gönderilemese dahi 6 haneli kod veritabanına ve loglara yazılır.
 */
export async function requestAdminPasswordReset(
  requestedEmail?: string,
): Promise<AdminResetRequestResult> {
  if (!databaseConfigured()) {
    logApiWarning('admin_password_reset_unavailable', { hasDatabase: false })
    return {
      success: false,
      status: 'unavailable',
      recipient: '',
      message: 'Veritabanı yapılandırılmadığı için şifre sıfırlanamıyor.',
    }
  }

  // Yalnızca geçerli super admin e-postası (muharrem@dosyora.com veya ege@dosyora.com) kabul edilir.
  // muharrem.mu@gmail.com admin değildir.
  let targetRecipient = 'muharrem@dosyora.com'
  if (requestedEmail) {
    const candidate = normalizeAdminEmail(requestedEmail)
    if (isSuperAdminEmail(candidate)) {
      targetRecipient = candidate
    }
  }

  const { token, code } = await createAdminResetTokenAndCode()
  const url = `${siteConfig.url.replace(/\/$/, '')}/admin/reset-password?token=${encodeURIComponent(token)}`

  // Vercel loglarında kolayca bulunabilmesi için loglara yaz
  logApiInfo('admin_password_reset_code_generated', {
    recipient: targetRecipient,
    code,
    url,
  })
  // eslint-disable-next-line no-console
  console.log(`[DOSYORA ADMIN RESET] Recipient: ${targetRecipient} | Code: ${code} | Link: ${url}`)

  const text = [
    'Dosyora admin şifrenizi sıfırlamak için aşağıdaki bağlantıyı veya 6 haneli kodu kullanın.',
    '',
    `Sıfırlama Kodu: ${code}`,
    '',
    `Bağlantı: ${url}`,
    '',
    'Bağlantı ve kod 30 dakika geçerlidir ve tek kullanımlıktır.',
    'Bu isteği siz yapmadıysanız bu e-postayı yok sayın.',
  ].join('\n')

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #111;">Dosyora Admin Şifre Sıfırlama</h2>
      <p>Dosyora admin panel şifrenizi sıfırlamak için aşağıdaki 6 haneli kodu veya bağlantıyı kullanabilirsiniz:</p>
      <div style="margin: 24px 0; padding: 16px; background: #f3f4f6; border-radius: 8px; text-align: center;">
        <span style="font-size: 28px; font-weight: bold; letter-spacing: 6px; color: #111;">${code}</span>
      </div>
      <p style="margin-top: 20px;">
        <a href="${escapeHtml(url)}" style="display: inline-block; background: #2563eb; color: #fff; padding: 10px 20px; border-radius: 6px; text-decoration: none; font-weight: 600;">Şifreyi Sıfırla</a>
      </p>
      <p style="color: #666; font-size: 13px; margin-top: 24px;">Bağlantı ve kod 30 dakika geçerlidir. Bu isteği siz yapmadıysanız güvenle yok sayabilirsiniz.</p>
    </div>
  `

  let emailSent = false
  const config = getNotificationEnvConfig()

  // 1. Resend API ile gönderim denemesi
  if (config.resendApiKey) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(config.resendApiKey)
      const from = config.emailFrom || CORPORATE_NOTIFICATION_FROM
      const res = await resend.emails.send({
        from,
        to: targetRecipient,
        subject: 'Dosyora admin şifre sıfırlama kodu',
        text,
        html,
      })
      if (!res.error) {
        emailSent = true
        logApiInfo('admin_password_reset_sent_resend', { to: targetRecipient })
      } else {
        logApiWarning('admin_password_reset_resend_error', { error: res.error.message })
      }
    } catch (err) {
      logApiWarning('admin_password_reset_resend_failed', {
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  // 2. SMTP ile gönderim denemesi
  if (!emailSent && isSmtpConfigured()) {
    try {
      await sendCorporateEmail({
        to: targetRecipient,
        subject: 'Dosyora admin şifre sıfırlama kodu',
        text,
        html,
      })
      emailSent = true
      logApiInfo('admin_password_reset_sent_smtp', { to: targetRecipient })
    } catch (err) {
      logApiWarning('admin_password_reset_smtp_failed', {
        error: err instanceof Error ? err.message : String(err),
      })
    }
  }

  if (emailSent) {
    return {
      success: true,
      status: 'sent',
      recipient: targetRecipient,
      message: `Sıfırlama talimatı ${targetRecipient} adresine gönderildi. E-postadaki bağlantı veya 6 haneli kod ile sıfırlayabilirsiniz.`,
    }
  }

  // E-posta gönderilemediyse bile kod veritabanına ve Vercel loglarına yazıldı
  return {
    success: true,
    status: 'code_ready',
    recipient: targetRecipient,
    code: process.env.NODE_ENV !== 'production' ? code : undefined,
    message: `Sıfırlama kodu oluşturuldu ve loglara yazıldı. E-posta gelmediyse "Kod ile Şifre Sıfırla" seçeneğini kullanabilirsiniz.`,
  }
}

export async function completeAdminPasswordReset(
  tokenOrCode: string,
  password: string,
): Promise<'updated' | 'invalid' | 'weak'> {
  const weakness = adminPasswordError(password)
  if (weakness) {
    return 'weak'
  }

  const trimmed = tokenOrCode.trim()
  if (!trimmed) {
    return 'invalid'
  }

  const consumed = await consumeAdminResetToken(trimmed)
  if (!consumed) {
    return 'invalid'
  }

  await saveAdminPasswordOverride(await hashAdminPassword(password))
  return 'updated'
}
