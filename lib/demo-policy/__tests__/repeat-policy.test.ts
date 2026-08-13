import { describe, expect, it } from 'vitest'

import {
  getDocumentLimitForAttemptCount,
  isDemoRepeatQuotaExceeded,
  resolveEffectiveDemoAttemptCount,
} from '@/lib/demo-policy/repeat-policy'
import { normalizeEmail } from '@/lib/db/types'

describe('demo repeat policy', () => {
  it('uses max(emailCount, ipCount) without double counting same email+ip history', () => {
    expect(resolveEffectiveDemoAttemptCount(1, 1)).toBe(1)
    expect(getDocumentLimitForAttemptCount(1)).toBe(10)
  })

  it('assigns first demo to 20 belge', () => {
    expect(getDocumentLimitForAttemptCount(resolveEffectiveDemoAttemptCount(0, 0))).toBe(20)
  })

  it('assigns second demo via same email and different IP to 10 belge', () => {
    expect(getDocumentLimitForAttemptCount(resolveEffectiveDemoAttemptCount(1, 0))).toBe(10)
  })

  it('assigns second demo via different email and same IP to 10 belge', () => {
    expect(getDocumentLimitForAttemptCount(resolveEffectiveDemoAttemptCount(0, 1))).toBe(10)
  })

  it('assigns third demo to 5 belge', () => {
    expect(getDocumentLimitForAttemptCount(resolveEffectiveDemoAttemptCount(2, 0))).toBe(5)
    expect(getDocumentLimitForAttemptCount(resolveEffectiveDemoAttemptCount(0, 2))).toBe(5)
    expect(getDocumentLimitForAttemptCount(resolveEffectiveDemoAttemptCount(2, 2))).toBe(5)
  })

  it('blocks fourth demo and beyond', () => {
    expect(isDemoRepeatQuotaExceeded(3, 0)).toBe(true)
    expect(isDemoRepeatQuotaExceeded(0, 3)).toBe(true)
    expect(isDemoRepeatQuotaExceeded(4, 1)).toBe(true)
    expect(getDocumentLimitForAttemptCount(3)).toBeNull()
  })

  it('normalizes email with trim and lowercase', () => {
    expect(normalizeEmail('  Ayse@Example.COM ')).toBe('ayse@example.com')
  })
})
