export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { requestAdminPasswordReset } from '@/lib/admin-password-reset'
import { logApiError } from '@/lib/api-logger'
import { jsonError, jsonOk } from '@/lib/api-response'
import { checkRateLimit } from '@/lib/rate-limit'
import { getRequestMeta } from '@/lib/request-meta'

export async function POST(request: NextRequest) {
  const meta = getRequestMeta(request)
  console.log(`[ADMIN FORGOT PASSWORD API] POST hit from IP: ${meta.ip_address}`)
  try {
    const rateLimit = checkRateLimit(`admin-forgot:${meta.ip_address || 'unknown'}`, {
      limit: 10,
      windowMs: 15 * 60 * 1000,
    })
    if (!rateLimit.allowed) {
      console.warn(`[ADMIN FORGOT PASSWORD API] Rate limit reached for IP: ${meta.ip_address}`)
      const response = jsonError('Çok fazla deneme. Lütfen daha sonra tekrar deneyin.', 429)
      response.headers.set(
        'Retry-After',
        String(Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))),
      )
      return response
    }

    let email: string | undefined
    try {
      const body = (await request.json()) as { email?: string }
      if (body?.email) {
        email = String(body.email).trim()
      }
    } catch {
      // Body is optional
    }

    const result = await requestAdminPasswordReset(email)
    if (!result.success) {
      return jsonError(result.message || 'Şifre sıfırlama şu anda gerçekleştirilemiyor.', 503)
    }

    return jsonOk({
      success: true,
      status: result.status,
      recipient: result.recipient,
      message: result.message,
      ...(result.code ? { code: result.code } : {}),
    })
  } catch (error) {
    logApiError('admin_password_reset_failed', {}, error)
    return jsonError('Şifre sıfırlama şu anda gerçekleştirilemiyor.', 503)
  }
}
