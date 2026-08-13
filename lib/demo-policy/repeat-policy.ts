import {
  DEMO_MAX_FREE_ATTEMPTS,
  DEMO_RUNTIME_LIMITS,
} from '@/lib/entitlements/constants'

export function resolveEffectiveDemoAttemptCount(emailCount: number, ipCount: number): number {
  return Math.max(emailCount, ipCount)
}

export function getDocumentLimitForAttemptCount(attemptCount: number): number | null {
  if (attemptCount >= DEMO_MAX_FREE_ATTEMPTS) {
    return null
  }

  return DEMO_RUNTIME_LIMITS[attemptCount] ?? null
}

export function isDemoRepeatQuotaExceeded(emailCount: number, ipCount: number): boolean {
  return resolveEffectiveDemoAttemptCount(emailCount, ipCount) >= DEMO_MAX_FREE_ATTEMPTS
}
