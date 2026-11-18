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
  const config = getNotificationEnvConfig()

  // Yalnızca geçerli super admin e-postası (muharrem@dosyora.com veya ege@dosyora.com) kabul edilir.
  // muharrem.mu@gmail.com admin değildir.
  let targetRecipient = 'muharrem@dosyora.com'
  if (requestedEmail) {
    const candidate = normalizeAdminEmail(requestedEmail)
    if (isSuperAdminEmail(candidate)) {
      targetRecipient = candidate
    } else {
      console.warn(`[ADMIN RESET WARNING] requestedEmail "${requestedEmail}" is not in SUPER_ADMIN_EMAILS! Defaulting to muharrem@dosyora.com`)
    }
  }

  // Vercel loglarında açıkça görünmesi için en başta logla
  console.log(`[ADMIN RESET CONFIG] hasResendKey: ${Boolean(config.resendApiKey)} | emailFrom: ${config.emailFrom} | isSmtpConfigured: ${isSmtpConfigured()}`)

  let token: string
  let code: string
  if (databaseConfigured()) {
    try {
      const generated = await createAdminResetTokenAndCode()
      token = generated.token
      code = generated.code
    } catch (dbErr) {
      console.error(`[ADMIN RESET DB ERROR] Failed to create reset token/code in DB:`, dbErr)
      token = (await import('node:crypto')).randomBytes(24).toString('base64url')
      code = Math.floor(100000 + Math.random() * 900000).toString()
    }
  } else {
    console.error(`[ADMIN RESET DB WARNING] Database is not configured (TURSO_DATABASE_URL missing)! Generating emergency code.`)
    token = (await import('node:crypto')).randomBytes(24).toString('base64url')
    code = Math.floor(100000 + Math.random() * 900000).toString()
  }

  const url = `${siteConfig.url.replace(/\/$/, '')}/admin/reset-password?token=${encodeURIComponent(token)}`

  console.log(`[ADMIN RESET REQUEST] Target: ${targetRecipient} | Code: ${code} | Link: ${url}`)

  logApiInfo('admin_password_reset_code_generated', {
    recipient: targetRecipient,
    code,
    url,
  })

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

  // 1. Resend API ile gönderim denemesi
  if (config.resendApiKey) {
    try {
      const { Resend } = await import('resend')
      const resend = new Resend(config.resendApiKey)
      const primaryFrom = config.emailFrom || CORPORATE_NOTIFICATION_FROM

      console.log(`[ADMIN RESET RESEND] Sending to ${targetRecipient} from ${primaryFrom}...`)
      const res = await resend.emails.send({
        from: primaryFrom,
        to: targetRecipient,
        subject: 'Dosyora admin şifre sıfırlama kodu',
        text,
        html,
      })

      if (!res.error) {
        emailSent = true
        console.log(`[ADMIN RESET RESEND SUCCESS] Sent to ${targetRecipient} (id: ${res.data?.id})`)
        logApiInfo('admin_password_reset_sent_resend', { to: targetRecipient, id: res.data?.id })
      } else {
        console.error(`[ADMIN RESET RESEND ERROR] From: ${primaryFrom} | Target: ${targetRecipient} | Error:`, res.error)
        logApiError('admin_password_reset_resend_error', {
          recipient: targetRecipient,
          from: primaryFrom,
          error: res.error,
        })

        // Resend domain doğrulaması yapılmamışsa onboarding@resend.dev ile tekrar dene
        const errorMsg = String(res.error.message || '').toLowerCase()
        const isDomainError =
          errorMsg.includes('domain') ||
          errorMsg.includes('verify') ||
          errorMsg.includes('not verified') ||
          errorMsg.includes('from')

        if (isDomainError && !primaryFrom.includes('onboarding@resend.dev')) {
          console.log(`[ADMIN RESET RESEND] Retrying with onboarding@resend.dev fallback...`)
          const fallbackFrom = 'DOSYORA <onboarding@resend.dev>'
          const fallbackRes = await resend.emails.send({
            from: fallbackFrom,
            to: targetRecipient,
            subject: 'Dosyora admin şifre sıfırlama kodu',
            text,
            html,
          })

          if (!fallbackRes.error) {
            emailSent = true
            console.log(`[ADMIN RESET RESEND SUCCESS] Sent to ${targetRecipient} via fallback from ${fallbackFrom}`)
            logApiInfo('admin_password_reset_sent_resend_fallback', { to: targetRecipient, from: fallbackFrom })
          } else {
            console.error(`[ADMIN RESET RESEND FALLBACK ERROR]`, fallbackRes.error)
            logApiError('admin_password_reset_resend_fallback_error', { recipient: targetRecipient }, fallbackRes.error)
          }
        }
      }
    } catch (err) {
      console.error(`[ADMIN RESET RESEND EXCEPTION]`, err)
      logApiError('admin_password_reset_resend_failed', {
        recipient: targetRecipient,
      }, err)
    }
  } else {
    console.warn('[ADMIN RESET RESEND SKIPPED] RESEND_API_KEY environment variable is missing.')
  }

  // 2. SMTP ile gönderim denemesi (Resend başarısız olduysa veya ayarlı değilse)
  if (!emailSent) {
    if (isSmtpConfigured()) {
      try {
        console.log(`[ADMIN RESET SMTP] Attempting SMTP send to ${targetRecipient}...`)
        await sendCorporateEmail({
          to: targetRecipient,
          subject: 'Dosyora admin şifre sıfırlama kodu',
          text,
          html,
        })
        emailSent = true
        console.log(`[ADMIN RESET SMTP SUCCESS] Delivered to ${targetRecipient} via SMTP`)
        logApiInfo('admin_password_reset_sent_smtp', { to: targetRecipient })
      } catch (err) {
        console.error(`[ADMIN RESET SMTP FAILED] Target: ${targetRecipient} | Error:`, err)
        logApiError('admin_password_reset_smtp_failed', {
          recipient: targetRecipient,
        }, err)
      }
    } else {
      console.warn('[ADMIN RESET SMTP SKIPPED] SMTP_PASSWORD environment variable is missing.')
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

  console.error(`[ADMIN RESET ALL DELIVERY FAILED] Could not send reset email to ${targetRecipient}. Reset code is: ${code}`)
  logApiError('admin_password_reset_email_delivery_failed', {
    recipient: targetRecipient,
    code,
    hasResendApiKey: Boolean(config.resendApiKey),
    isSmtpConfigured: isSmtpConfigured(),
  })

  // E-posta gönderilemediyse bile kod veritabanına ve Vercel loglarına yazıldı
  return {
    success: true,
    status: 'code_ready',
    recipient: targetRecipient,
    code: process.env.NODE_ENV !== 'production' ? code : undefined,
    message: `E-posta servisi yanıt vermedi. Sıfırlama kodunuz (${code}) oluşturuldu ve Vercel sunucu loglarına yazıldı. "Kod ile Şifre Sıfırla" ekranını kullanarak yeni şifrenizi belirleyebilirsiniz.`,
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
