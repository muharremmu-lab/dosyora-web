import { timingSafeEqual } from 'node:crypto'

import { cookies } from 'next/headers'

import { isSuperAdminEmail, normalizeAdminEmail, type AdminRole } from '@/lib/admin/super-admins'
import {
  createSignedSessionToken,
  readSignedSessionToken,
  verifySignedSessionToken,
  type SessionRole,
} from '@/lib/security/signed-session'
import {
  getAdminCredentials,
  getAdminSessionSecret,
  isAdminProductionConfigValid,
} from '@/lib/security/production-env'

export const ADMIN_SESSION_COOKIE = 'dosyora_admin_session'
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

export function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

export type AdminSessionActor = {
  email: string | null
  role: AdminRole
}

export function createAdminSessionToken(identity?: { email: string; role: SessionRole }): string | null {
  const secret = getAdminSessionSecret()
  if (!secret) {
    return null
  }

  return createSignedSessionToken(secret, Date.now(), undefined, identity)
}

export function verifyAdminSessionToken(token: string | undefined | null): boolean {
  if (!token) {
    return false
  }

  const secret = getAdminSessionSecret()
  if (!secret) {
    return false
  }

  if (token === secret) {
    return false
  }

  return verifySignedSessionToken(token, secret)
}

export async function getAdminSessionActor(): Promise<AdminSessionActor | null> {
  if (!isAdminProductionConfigValid()) {
    return null
  }

  const secret = getAdminSessionSecret()
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  if (!session || !secret || session === secret) {
    return null
  }

  const payload = readSignedSessionToken(session, secret)
  if (!payload) {
    return null
  }

  if (payload.email) {
    if (!isSuperAdminEmail(payload.email)) {
      return null
    }
    return { email: normalizeAdminEmail(payload.email), role: 'super_admin' }
  }

  return { email: null, role: 'admin' }
}

export async function isAdminAuthenticated(): Promise<boolean> {
  return (await getAdminSessionActor()) !== null
}

export function validateAdminCredentials(username: string, password: string): boolean {
  if (!isAdminProductionConfigValid()) {
    return false
  }

  const credentials = getAdminCredentials()
  if (!credentials) {
    return false
  }

  return safeEqual(username, credentials.username) && safeEqual(password, credentials.password)
}

export function isAdminAuthConfigured(): boolean {
  return isAdminProductionConfigValid() && Boolean(getAdminSessionSecret())
}
