export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import { NextResponse, type NextRequest } from 'next/server'

import { jsonError } from '@/lib/api-response'
import { recordDownload, type DownloadSource } from '@/lib/db/download-logs'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { checkRateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/request-meta'

const DOWNLOAD_TRACK_LIMIT = { limit: 60, windowMs: 10 * 60 * 1000 }

function readSource(body: unknown): DownloadSource | null {
  if (!body || typeof body !== 'object') return null
  const source = (body as { source?: unknown }).source
  return source === 'home' || source === 'indir' ? source : null
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(`download-track:${getClientIp(request)}`, DOWNLOAD_TRACK_LIMIT)
  if (!rateLimit.allowed) {
    return jsonError('Çok fazla istek gönderildi.', 429)
  }

  let body: unknown
  try {
    body = JSON.parse(await request.text())
  } catch {
    return jsonError('Geçersiz istek gövdesi.', 400)
  }

  const source = readSource(body)
  if (!source) {
    return jsonError('Kaynak sayfa home veya indir olmalıdır.', 400)
  }

  try {
    await recordDownload(source)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    logDbRouteError('gibtebligat_download_track_failed', error, { operation: 'recordDownload' })
    return jsonError('İndirme kaydı tamamlanamadı.', 500)
  }
}
