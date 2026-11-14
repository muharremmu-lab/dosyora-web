export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

import { requireAdminApiAuth } from '@/lib/admin-api-auth'
import { jsonError, jsonOk } from '@/lib/api-response'
import { listRecentHeartbeats } from '@/lib/db/device-heartbeats'
import { downloadCounts } from '@/lib/db/download-logs'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { listRecentTelemetry } from '@/lib/db/telemetry-logs'
import { activeTrialSummary } from '@/lib/db/trial-claims-report'
import { isTelemetryAdminRequest } from '@/lib/telemetry/admin-key'

export async function GET(request: NextRequest) {
  const sessionError = await requireAdminApiAuth()
  if (sessionError && !isTelemetryAdminRequest(request)) {
    return sessionError
  }

  try {
    const [downloads, demos, telemetry, heartbeats] = await Promise.all([
      downloadCounts(),
      activeTrialSummary(),
      listRecentTelemetry(50),
      listRecentHeartbeats(50),
    ])
    return jsonOk({ downloads, demos, telemetry, heartbeats })
  } catch (error) {
    logDbRouteError('gibtebligat_admin_report_failed', error, { operation: 'adminReport' })
    return jsonError('Rapor okunamadı.', 500)
  }
}
