export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

import { jsonError, jsonOk } from '@/lib/api-response'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { listRecentTelemetry, recordTelemetry, telemetryDistribution } from '@/lib/db/telemetry-logs'
import { checkRateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/request-meta'
import { isTelemetryAdminRequest } from '@/lib/telemetry/admin-key'
import { readTelemetryPayload } from '@/lib/telemetry/payload'

const TELEMETRY_RATE_LIMIT = { limit: 30, windowMs: 60 * 60 * 1000 }

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
  if (!isTelemetryAdminRequest(request)) {
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
