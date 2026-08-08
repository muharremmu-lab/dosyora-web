import { timingSafeEqual } from 'node:crypto'

import { cookies } from 'next/headers'

import {
  createSignedSessionToken,
  verifySignedSessionToken,
} from '@/lib/security/signed-session'
import {
  getAdminCredentials,
  getAdminSessionSecret,
  isAdminProductionConfigValid,
} from '@/lib/security/production-env'

export const ADMIN_SESSION_COOKIE = 'dosyora_admin_session'
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)

  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }

  return timingSafeEqual(leftBuffer, rightBuffer)
}

export function createAdminSessionToken(): string | null {
  const secret = getAdminSessionSecret()
  if (!secret) {
    return null
  }

  return createSignedSessionToken(secret)
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

export async function isAdminAuthenticated(): Promise<boolean> {
  if (!isAdminProductionConfigValid()) {
    return false
  }

  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  return verifyAdminSessionToken(session)
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
