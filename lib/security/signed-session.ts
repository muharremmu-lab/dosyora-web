import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

export type SessionRole = 'super_admin' | 'admin'

export type SignedSessionPayload = {
  sid: string
  iat: number
  exp: number
  email?: string
  role?: SessionRole
}

export const DEFAULT_SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000

function encodePayload(payload: SignedSessionPayload): string {
  return Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url')
}

function decodePayload(encoded: string): SignedSessionPayload | null {
  try {
    const parsed = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SignedSessionPayload
    if (
      typeof parsed.sid !== 'string' ||
      typeof parsed.iat !== 'number' ||
      typeof parsed.exp !== 'number'
    ) {
      return null
    }
    if (parsed.email !== undefined && typeof parsed.email !== 'string') {
      return null
    }
    if (parsed.role !== undefined && parsed.role !== 'super_admin' && parsed.role !== 'admin') {
      return null
    }
    return parsed
  } catch {
    return null
  }
}

function signPayload(secret: string, encodedPayload: string): string {
  return createHmac('sha256', secret).update(encodedPayload).digest('base64url')
}

function verifySignature(secret: string, encodedPayload: string, signature: string): boolean {
  const expected = signPayload(secret, encodedPayload)
  const provided = Buffer.from(signature, 'base64url')
  const expectedBuffer = Buffer.from(expected, 'base64url')

  if (provided.length !== expectedBuffer.length) {
    return false
  }

  return timingSafeEqual(provided, expectedBuffer)
}

export function createSignedSessionToken(
  secret: string,
  nowMs: number = Date.now(),
  ttlMs: number = DEFAULT_SESSION_TTL_MS,
  identity?: { email: string; role: SessionRole },
): string {
  const payload: SignedSessionPayload = {
    sid: randomBytes(32).toString('hex'),
    iat: nowMs,
    exp: nowMs + ttlMs,
  }
  if (identity) {
    payload.email = identity.email
    payload.role = identity.role
  }

  const encodedPayload = encodePayload(payload)
  const signature = signPayload(secret, encodedPayload)
  return `${encodedPayload}.${signature}`
}

export function readSignedSessionToken(
  token: string,
  secret: string,
  nowMs: number = Date.now(),
): SignedSessionPayload | null {
  const separatorIndex = token.lastIndexOf('.')
  if (separatorIndex <= 0) {
    return null
  }

  const encodedPayload = token.slice(0, separatorIndex)
  const signature = token.slice(separatorIndex + 1)

  if (!encodedPayload || !signature) {
    return null
  }

  if (!verifySignature(secret, encodedPayload, signature)) {
    return null
  }

  const payload = decodePayload(encodedPayload)
  if (!payload || payload.sid.length < 16 || nowMs > payload.exp) {
    return null
  }

  return payload
}

export function verifySignedSessionToken(
  token: string,
  secret: string,
  nowMs: number = Date.now(),
): boolean {
  return readSignedSessionToken(token, secret, nowMs) !== null
}
