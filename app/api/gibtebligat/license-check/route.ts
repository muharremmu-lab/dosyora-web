export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

import { jsonError, jsonOk } from '@/lib/api-response'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { licenseCheck } from '@/lib/licensing/orders'
import { normalizeHardwareId } from '@/lib/licensing/offline-key'
import { checkRateLimit } from '@/lib/rate-limit'

const CHECK_LIMIT = { limit: 60, windowMs: 10 * 60 * 1000 }

export async function GET(request: NextRequest) {
  const hwid = normalizeHardwareId(request.nextUrl.searchParams.get('hwid'))
  if (!hwid) {
    return jsonError('Donanım kimliği gerekli.', 400)
  }

  const rateLimit = checkRateLimit(`license-check:${hwid}`, CHECK_LIMIT)
  if (!rateLimit.allowed) {
    return jsonError('Çok fazla sorgu gönderildi.', 429)
  }

  try {
    return jsonOk(await licenseCheck(hwid))
  } catch (error) {
    logDbRouteError('gibtebligat_license_check_failed', error, { operation: 'licenseCheck' })
    return jsonError('Lisans durumu okunamadı.', 500)
  }
}
