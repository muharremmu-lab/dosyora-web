export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  validateAdminCredentials,
} from '@/lib/admin-auth'
import { logApiWarning } from '@/lib/api-logger'
import { jsonError, jsonOk } from '@/lib/api-response'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { username?: string; password?: string }
    const username = String(body.username ?? '')
    const password = String(body.password ?? '')

    if (!validateAdminCredentials(username, password)) {
      logApiWarning('admin_login_failed', { username })
      return jsonError('Geçersiz kullanıcı adı veya şifre.', 401)
    }

    const response = jsonOk({ success: true })
    response.cookies.set(ADMIN_SESSION_COOKIE, createAdminSessionToken(), {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })

    return response
  } catch {
    return jsonError('Sunucu hatası.', 500)
  }
}
