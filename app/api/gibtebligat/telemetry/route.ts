export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { timingSafeEqual } from 'node:crypto'

import type { NextRequest } from 'next/server'

import { jsonError, jsonOk } from '@/lib/api-response'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { listRecentTelemetry, recordTelemetry, telemetryDistribution } from '@/lib/db/telemetry-logs'
import { checkRateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/request-meta'
import { readTelemetryPayload } from '@/lib/telemetry/payload'

const TELEMETRY_RATE_LIMIT = { limit: 30, windowMs: 60 * 60 * 1000 }

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

function providedAdminKey(request: NextRequest): string | null {
  const header = request.headers.get('x-telemetry-admin-key')?.trim()
  if (header) return header

  const authorization = request.headers.get('authorization')?.trim()
  if (authorization?.toLowerCase().startsWith('bearer ')) {
    const token = authorization.slice(7).trim()
    return token || null
  }

  return null
}

function isAdminKeyValid(request: NextRequest): boolean {
  const provided = providedAdminKey(request)
  const keys = configuredAdminKeys()
  if (!provided || keys.length === 0) return false
  return keys.some((key) => safeEqual(provided, key))
}

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError('Geçersiz istek gövdesi.', 400)
  }

  const payload = readTelemetryPayload(body)
  if (!payload) {
    return jsonError('Yalnızca anonim teknik alanlar kabul edilir.', 400)
  }

  const rateLimit = checkRateLimit(`telemetry:${payload.hwidHash}:${getClientIp(request)}`, TELEMETRY_RATE_LIMIT)
  if (!rateLimit.allowed) {
    return jsonError('Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.', 429)
  }

  try {
    const result = await recordTelemetry(payload)
    return jsonOk({ accepted: true, criticalAlert: result.criticalAlert }, { status: 201 })
  } catch (error) {
    logDbRouteError('gibtebligat_telemetry_failed', error, { operation: 'recordTelemetry' })
    return jsonError('Hata kaydı tamamlanamadı.', 500)
  }
}

export async function GET(request: NextRequest) {
  if (!isAdminKeyValid(request)) {
    return jsonError('Yetkisiz erişim.', 401)
  }

  try {
    const [logs, distribution] = await Promise.all([listRecentTelemetry(50), telemetryDistribution()])
    return jsonOk({ logs, distribution })
  } catch (error) {
    logDbRouteError('gibtebligat_telemetry_admin_failed', error, { operation: 'listRecentTelemetry' })
    return jsonError('Hata kayıtları okunamadı.', 500)
  }
}
