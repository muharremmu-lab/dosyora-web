import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto'
import { promisify } from 'node:util'

const scryptAsync = promisify(scrypt)
const KEY_LENGTH = 32

export const MIN_ADMIN_PASSWORD_LENGTH = 10
export const ADMIN_RESET_TTL_MS = 30 * 60 * 1000

export function adminPasswordError(password: string): string | null {
  if (password.length < MIN_ADMIN_PASSWORD_LENGTH) {
    return 'Şifre en az 10 karakter olmalıdır.'
  }

  return null
}

export async function hashAdminPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex')
  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
  return `scrypt:${salt}:${derived.toString('hex')}`
}

export async function verifyAdminPasswordHash(password: string, stored: string): Promise<boolean> {
  const [scheme, salt, hash] = stored.split(':')
  if (scheme !== 'scrypt' || !salt || !hash) {
    return false
  }

  const derived = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer
  const expected = Buffer.from(hash, 'hex')
  if (derived.length !== expected.length) {
    return false
  }

  return timingSafeEqual(derived, expected)
}
