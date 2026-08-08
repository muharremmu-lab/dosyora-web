import { describe, expect, it } from 'vitest'

import {
  createSignedSessionToken,
  DEFAULT_SESSION_TTL_MS,
  verifySignedSessionToken,
} from '@/lib/security/signed-session'

const TEST_SECRET = 'test-session-secret-with-32-characters!!'

describe('signed session tokens', () => {
  it('accepts a valid signed token', () => {
    const now = 1_700_000_000_000
    const token = createSignedSessionToken(TEST_SECRET, now)

    expect(verifySignedSessionToken(token, TEST_SECRET, now + 1000)).toBe(true)
  })

  it('rejects tampered tokens', () => {
    const token = createSignedSessionToken(TEST_SECRET)
    const tampered = `${token}x`

    expect(verifySignedSessionToken(tampered, TEST_SECRET)).toBe(false)
  })

  it('rejects expired tokens', () => {
    const now = 1_700_000_000_000
    const token = createSignedSessionToken(TEST_SECRET, now)

    expect(
      verifySignedSessionToken(token, TEST_SECRET, now + DEFAULT_SESSION_TTL_MS + 1),
    ).toBe(false)
  })

  it('generates different tokens for separate logins', () => {
    const first = createSignedSessionToken(TEST_SECRET)
    const second = createSignedSessionToken(TEST_SECRET)

    expect(first).not.toBe(second)
  })

  it('does not embed the raw signing secret in the token', () => {
    const token = createSignedSessionToken(TEST_SECRET)

    expect(token.includes(TEST_SECRET)).toBe(false)
  })
})
