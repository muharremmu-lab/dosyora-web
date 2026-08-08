import { describe, expect, it } from 'vitest'

import {
  generateActivationToken,
  hashActivationToken,
  verifyActivationTokenHash,
} from '@/lib/activation/tokens'

describe('activation tokens', () => {
  it('hashes tokens without storing raw secret in hash output', () => {
    const token = generateActivationToken()
    const hash = hashActivationToken(token)

    expect(hash).not.toBe(token)
    expect(hash.length).toBe(64)
  })

  it('verifies valid token hashes', () => {
    const token = generateActivationToken()
    const hash = hashActivationToken(token)

    expect(verifyActivationTokenHash(token, hash)).toBe(true)
  })

  it('rejects tampered tokens', () => {
    const token = generateActivationToken()
    const hash = hashActivationToken(token)

    expect(verifyActivationTokenHash(`${token}x`, hash)).toBe(false)
  })
})
