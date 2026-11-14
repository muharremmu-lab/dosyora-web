import { timingSafeEqual } from 'node:crypto'

import type { NextRequest } from 'next/server'

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  if (leftBuffer.length !== rightBuffer.length) return false
  return timingSafeEqual(leftBuffer, rightBuffer)
}

function configuredAdminKeys(): string[] {
  return [process.env.TELEMETRY_ADMIN_KEY, process.env.ADMIN_KEY]
    .map((value) => value?.trim() || '')
    .filter((value) => value.length > 0)
}

export function isTelemetryAdminRequest(request: NextRequest): boolean {
  const header = request.headers.get('x-telemetry-admin-key')?.trim()
  const authorization = request.headers.get('authorization')?.trim()
  const provided = header
    || (authorization?.toLowerCase().startsWith('bearer ') ? authorization.slice(7).trim() : '')

  const keys = configuredAdminKeys()
  if (!provided || keys.length === 0) return false
  return keys.some((key) => safeEqual(provided, key))
}
