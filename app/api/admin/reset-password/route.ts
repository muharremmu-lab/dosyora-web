export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { completeAdminPasswordReset } from '@/lib/admin-password-reset'
import { logApiError } from '@/lib/api-logger'
import { jsonError, jsonOk } from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'
import { getRequestMeta } from '@/lib/request-meta'

export async function POST(request: NextRequest) {
  try {
    const meta = getRequestMeta(request)
    const rateLimit = checkRateLimit(`admin-reset:${meta.ip_address || 'unknown'}`, {
      limit: 8,
      windowMs: 15 * 60 * 1000,
    })
    if (!rateLimit.allowed) {
      return jsonError('Çok fazla deneme. Lütfen daha sonra tekrar deneyin.', 429)
    }

    const body = (await request.json()) as { token?: string; code?: string; password?: string }
    const tokenOrCode = String(body.token ?? body.code ?? '').trim()
    const password = String(body.password ?? '')
    if (!tokenOrCode) {
      return jsonError('Sıfırlama kodu veya bağlantısı gereklidir.', 400)
    }

    const result = await completeAdminPasswordReset(tokenOrCode, password)
    if (result === 'weak') {
      return jsonError('Şifre en az 10 karakter olmalıdır.', 400)
    }

    if (result !== 'updated') {
      return jsonError('Sıfırlama kodu veya bağlantısı geçersiz ya da süresi dolmuş.', 400)
    }

    return jsonOk({ success: true })
  } catch (error) {
    logApiError('admin_password_reset_complete_failed', {}, error)
    return jsonError('Şifre sıfırlanamadı.', 500)
  }
}
