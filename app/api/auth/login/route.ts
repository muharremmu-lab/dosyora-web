export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  isAdminAuthConfigured,
} from '@/lib/admin-auth'
import { resolveAdminLogin } from '@/lib/admin-password-reset'
import {
  checkAdminLoginRateLimit,
  clearAdminLoginRateLimit,
} from '@/lib/admin-login-rate-limit'
import { jsonError, jsonOk } from '@/lib/api-response'
import { getUserActivePackageCodes } from '@/lib/db/packages'
import { verifyUserCredentials } from '@/lib/db/users'
import { getUserDefaultPortalRoute } from '@/lib/packages-config'
import { getRequestMeta } from '@/lib/request-meta'
import {
  createUserSessionToken,
  USER_SESSION_COOKIE,
  USER_SESSION_MAX_AGE_SECONDS,
} from '@/lib/user-auth'

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string
      username?: string
      password?: string
      redirectUrl?: string
    }

    const emailOrUser = String(body.email || body.username || '').trim()
    const password = String(body.password || '')

    if (!emailOrUser || !password) {
      return jsonError('E-posta ve şifre zorunludur.', 400)
    }

    const meta = getRequestMeta(request)
    const rateLimit = checkAdminLoginRateLimit(meta.ip_address, emailOrUser)
    if (!rateLimit.allowed) {
      return jsonError('Çok fazla başarısız deneme. Lütfen daha sonra tekrar deneyin.', 429)
    }

    // 1. Önce Admin kontrolü yap
    if (isAdminAuthConfigured()) {
      const adminActor = await resolveAdminLogin(emailOrUser, password)
      if (adminActor) {
        clearAdminLoginRateLimit(meta.ip_address, emailOrUser)

        const adminSessionToken = createAdminSessionToken(
          adminActor.email ? { email: adminActor.email, role: adminActor.role } : undefined,
        )

        const userSessionToken = createUserSessionToken(
          {
            id: 'admin_root',
            email: adminActor.email || emailOrUser,
            full_name: 'Sistem Yöneticisi',
            role: 'admin',
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          ['tebligat', 'belge_okuma', 'ithalat', 'akilli_ofis'],
        )

        const targetUrl = body.redirectUrl || '/portal'
        const response = jsonOk({
          success: true,
          role: 'admin',
          redirectUrl: targetUrl,
        })

        if (adminSessionToken) {
          response.cookies.set(ADMIN_SESSION_COOKIE, adminSessionToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
            maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
          })
        }

        response.cookies.set(USER_SESSION_COOKIE, userSessionToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: USER_SESSION_MAX_AGE_SECONDS,
        })

        return response
      }
    }

    // 2. Kullanıcılar tablosunda doğrula
    const user = await verifyUserCredentials(emailOrUser, password)
    if (!user) {
      return jsonError('E-posta veya şifre hatalı.', 401)
    }

    clearAdminLoginRateLimit(meta.ip_address, emailOrUser)

    // Kullanıcının paketlerini al
    const activePackages =
      user.role === 'admin'
        ? ['tebligat', 'belge_okuma', 'ithalat', 'akilli_ofis']
        : await getUserActivePackageCodes(user.id)

    // Pakete göre yönlendirme mantığı:
    // Sadece tebligat -> /portal/tebligat
    // Sadece ithalat -> /portal/ithalat
    // Sadece belge okuma -> /portal/belge-okuma/yukle
    // Sadece akilli ofis -> /portal/akilli-ofis
    // Tümü veya çoklu -> /portal
    // Hiçbiri yok -> /portal (boş ekran ve Paket Satın Al butonu)
    const defaultRedirect = getUserDefaultPortalRoute({
      role: user.role,
      packages: activePackages,
    })

    const sessionToken = createUserSessionToken(user, activePackages)
    const redirectUrl = body.redirectUrl || defaultRedirect

    const response = jsonOk({
      success: true,
      role: user.role,
      packages: activePackages,
      redirectUrl,
    })

    response.cookies.set(USER_SESSION_COOKIE, sessionToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: USER_SESSION_MAX_AGE_SECONDS,
    })

    if (user.role === 'admin') {
      const adminToken = createAdminSessionToken({
        email: user.email,
        role: 'super_admin',
      })
      if (adminToken) {
        response.cookies.set(ADMIN_SESSION_COOKIE, adminToken, {
          httpOnly: true,
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
          path: '/',
          maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
        })
      }
    }

    return response
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : 'Giriş yapılırken bir hata oluştu.',
      500,
    )
  }
}
