export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

import { jsonError, jsonOk } from '@/lib/api-response'
import { readHeartbeatPayload, upsertHeartbeat } from '@/lib/db/device-heartbeats'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { checkRateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/request-meta'

const HEARTBEAT_RATE_LIMIT = { limit: 60, windowMs: 60 * 60 * 1000 }

export async function POST(request: NextRequest) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError('Geçersiz istek gövdesi.', 400)
  }

  const payload = readHeartbeatPayload(body)
  if (!payload) {
    return jsonError('Sinyal alanları geçersiz.', 400)
  }

  const rateLimit = checkRateLimit(`heartbeat:${payload.hwid}:${getClientIp(request)}`, HEARTBEAT_RATE_LIMIT)
  if (!rateLimit.allowed) {
    return jsonError('Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.', 429)
  }

  try {
    await upsertHeartbeat(payload)
    return jsonOk({ accepted: true }, { status: 201 })
  } catch (error) {
    logDbRouteError('gibtebligat_heartbeat_failed', error, { operation: 'upsertHeartbeat' })
    return jsonError('Sinyal kaydı tamamlanamadı.', 500)
  }
}
