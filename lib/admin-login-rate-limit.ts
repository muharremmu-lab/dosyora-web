import { checkRateLimit, clearRateLimit, type RateLimitConfig } from '@/lib/rate-limit'

export const ADMIN_LOGIN_RATE_LIMIT: RateLimitConfig = {
  limit: 5,
  windowMs: 15 * 60 * 1000,
}

export function getAdminLoginRateLimitKey(ipAddress: string, username: string): string {
  const normalizedUsername = username.trim().toLowerCase() || 'unknown'
  const normalizedIp = ipAddress.trim() || 'unknown'
  return `admin-login:${normalizedIp}:${normalizedUsername}`
}

export function checkAdminLoginRateLimit(ipAddress: string, username: string) {
  return checkRateLimit(getAdminLoginRateLimitKey(ipAddress, username), ADMIN_LOGIN_RATE_LIMIT)
}

export function clearAdminLoginRateLimit(ipAddress: string, username: string): void {
  clearRateLimit(getAdminLoginRateLimitKey(ipAddress, username))
}
