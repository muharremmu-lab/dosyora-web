export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { requestAdminPasswordReset } from '@/lib/admin-password-reset'
import { logApiError } from '@/lib/api-logger'
import { jsonError, jsonOk } from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'
import { getRequestMeta } from '@/lib/request-meta'

export async function POST(request: NextRequest) {
  try {
    const meta = getRequestMeta(request)
    const rateLimit = checkRateLimit(`admin-forgot:${meta.ip_address || 'unknown'}`, {
      limit: 3,
      windowMs: 15 * 60 * 1000,
    })
    if (!rateLimit.allowed) {
      const response = jsonError('Çok fazla deneme. Lütfen daha sonra tekrar deneyin.', 429)
      response.headers.set('Retry-After', String(Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))))
      return response
    }

    const result = await requestAdminPasswordReset()
    if (result !== 'sent') {
      return jsonError('Şifre sıfırlama e-postası şu anda gönderilemiyor.', 503)
    }

    return jsonOk({
      success: true,
      message: 'Sıfırlama talimatı yönetici e-posta adresine gönderildi. Bağlantı 30 dakika geçerlidir.',
    })
  } catch (error) {
    logApiError('admin_password_reset_failed', {}, error)
    return jsonError('Şifre sıfırlama e-postası şu anda gönderilemiyor.', 503)
  }
}
