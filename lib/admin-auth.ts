import { cookies } from 'next/headers'

export const ADMIN_SESSION_COOKIE = 'dosyora_admin_session'

function getSessionSecret(): string {
  return process.env.ADMIN_SESSION_SECRET || 'dosyora-dev-session-secret'
}

export function getAdminCredentials() {
  return {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'dosyora-admin',
  }
}

export function createAdminSessionToken(): string {
  return getSessionSecret()
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const session = cookieStore.get(ADMIN_SESSION_COOKIE)?.value
  return session === createAdminSessionToken()
}

export function validateAdminCredentials(username: string, password: string): boolean {
  const credentials = getAdminCredentials()
  return username === credentials.username && password === credentials.password
}
