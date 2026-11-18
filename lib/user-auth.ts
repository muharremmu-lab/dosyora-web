import { createHmac, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

import { getAdminSessionActor } from '@/lib/admin-auth'
import { hasPackageAccess } from '@/lib/packages-config'
import { getAdminSessionSecret } from '@/lib/security/production-env'
import { getUserActivePackageCodes } from './db/packages'
import type { SafeUser } from './db/users'

export const USER_SESSION_COOKIE = 'dosyora_user_session'
export const USER_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

export type UserSession = {
  userId: string
  email: string
  fullName: string
  role: 'admin' | 'user'
  packages: string[]
  iat: number
  exp: number
}

function getSessionSecret(): string {
  const secret = getAdminSessionSecret()
  if (secret) return secret
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_SESSION_SECRET is required in production.')
  }
  return 'dosyora-dev-session-secret-at-least-32-chars!'
}

function signPayload(secret: string, payloadStr: string): string {
  return createHmac('sha256', secret).update(payloadStr).digest('base64url')
}

export function createUserSessionToken(
  user: SafeUser,
  packages: string[],
  ttlMs: number = USER_SESSION_MAX_AGE_SECONDS * 1000,
): string {
  const secret = getSessionSecret()
  const now = Date.now()
  const payload: UserSession = {
    userId: user.id,
    email: user.email,
    fullName: user.full_name,
    role: user.role,
    packages,
    iat: now,
    exp: now + ttlMs,
  }

  const encoded = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
  const signature = signPayload(secret, encoded)
  return `${encoded}.${signature}`
}

export function verifyUserSessionToken(token: string): UserSession | null {
  if (!token) return null
  const secret = getSessionSecret()
  const sep = token.lastIndexOf('.')
  if (sep <= 0) return null

  const encoded = token.slice(0, sep)
  const sig = token.slice(sep + 1)

  const expected = signPayload(secret, encoded)
  const expectedBuf = Buffer.from(expected, 'base64url')
  const providedBuf = Buffer.from(sig, 'base64url')

  if (expectedBuf.length !== providedBuf.length || !timingSafeEqual(expectedBuf, providedBuf)) {
    return null
  }

  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as UserSession
    if (!payload.userId || !payload.email || Date.now() > payload.exp) {
      return null
    }
    return payload
  } catch {
    return null
  }
}

export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies()
  const userToken = cookieStore.get(USER_SESSION_COOKIE)?.value

  if (userToken) {
    const session = verifyUserSessionToken(userToken)
    if (session) {
      // Dinamik paket kontrolü için veritabanındaki güncel paketleri çek
      try {
        const activePackages = await getUserActivePackageCodes(session.userId)
        return {
          ...session,
          packages: activePackages,
        }
      } catch {
        return session
      }
    }
  }

  // Admin session uyumluluğu: Mevcut admin oturumu varsa admin kullanıcısı olarak kabul et
  const adminActor = await getAdminSessionActor()
  if (adminActor) {
    return {
      userId: 'admin_root',
      email: adminActor.email || 'admin@dosyora.com',
      fullName: 'Sistem Yöneticisi',
      role: 'admin',
      packages: ['tebligat', 'belge_okuma', 'ithalat', 'akilli_ofis'],
      iat: Date.now(),
      exp: Date.now() + USER_SESSION_MAX_AGE_SECONDS * 1000,
    }
  }

  return null
}

export async function requireUserSession(redirectUrl = '/login'): Promise<UserSession> {
  const session = await getUserSession()
  if (!session) {
    redirect(redirectUrl)
  }
  return session
}

export async function requirePackage(
  packageCode: string,
  redirectUrl = '/portal?unauthorized=' + packageCode,
): Promise<UserSession> {
  const session = await requireUserSession()

  // Admin veya paket yetkisine sahip kullanıcılar erişebilir
  if (!hasPackageAccess(session, packageCode)) {
    redirect(redirectUrl)
  }

  return session
}

export async function requireAdminSession(redirectUrl = '/admin/login'): Promise<UserSession> {
  const session = await requireUserSession(redirectUrl)
  if (session.role !== 'admin') {
    redirect('/portal?error=forbidden')
  }
  return session
}
