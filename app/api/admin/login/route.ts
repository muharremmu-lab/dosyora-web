export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  isAdminAuthConfigured,
  validateAdminCredentials,
} from '@/lib/admin-auth'
import {
  checkAdminLoginRateLimit,
  clearAdminLoginRateLimit,
} from '@/lib/admin-login-rate-limit'
import { logApiError, logApiWarning } from '@/lib/api-logger'
import { jsonError, jsonOk } from '@/lib/api-response'
import { getRequestMeta } from '@/lib/request-meta'

function retryAfterSeconds(resetAt: number): string {
  return String(Math.max(1, Math.ceil((resetAt - Date.now()) / 1000)))
}

export async function POST(request: NextRequest) {
  try {
    if (!isAdminAuthConfigured()) {
      logApiError('admin_login_config_invalid', {})
      return jsonError('Sunucu yapılandırması eksik.', 503)
    }

    const body = (await request.json()) as { username?: string; password?: string }
    const username = String(body.username ?? '')
    const password = String(body.password ?? '')
    const meta = getRequestMeta(request)
    const rateLimit = checkAdminLoginRateLimit(meta.ip_address, username)

    if (!rateLimit.allowed) {
      const response = jsonError('Çok fazla giriş denemesi. Lütfen daha sonra tekrar deneyin.', 429)
      response.headers.set('Retry-After', retryAfterSeconds(rateLimit.resetAt))
      return response
    }

    if (!validateAdminCredentials(username, password)) {
      logApiWarning('admin_login_failed', { ip: meta.ip_address })
      return jsonError('Geçersiz kullanıcı adı veya şifre.', 401)
    }

    const token = createAdminSessionToken()
    if (!token) {
      logApiError('admin_login_config_invalid', {})
      return jsonError('Sunucu yapılandırması eksik.', 503)
    }

    clearAdminLoginRateLimit(meta.ip_address, username)

    const response = jsonOk({ success: true })
    response.cookies.set(ADMIN_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    })

    return response
  } catch (error) {
    logApiError('admin_login_failed', {}, error)
    return jsonError('Sunucu hatası.', 500)
  }
}
