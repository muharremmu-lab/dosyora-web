import { createHash, randomBytes, timingSafeEqual } from 'node:crypto'

export function generateActivationToken(): string {
  return randomBytes(32).toString('base64url')
}

export function hashActivationToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function verifyActivationTokenHash(token: string, expectedHash: string | null): boolean {
  if (!expectedHash) {
    return false
  }

  const actualHash = hashActivationToken(token)
  const actualBuffer = Buffer.from(actualHash, 'hex')
  const expectedBuffer = Buffer.from(expectedHash, 'hex')

  if (actualBuffer.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(actualBuffer, expectedBuffer)
}

export function buildActivationUrl(token: string, siteUrl: string): string {
  const base = siteUrl.replace(/\/$/, '')
  return `${base}/activate?token=${encodeURIComponent(token)}`
}
