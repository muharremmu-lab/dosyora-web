import { jsonError, jsonOk } from '@/lib/api-response'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { requireAdminApiAuth } from '@/lib/admin-api-auth'
import { listPendingDesktopLicenses } from '@/lib/licensing/desktop-requests'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const authError = await requireAdminApiAuth()
  if (authError) return authError

  try {
    const requests = await listPendingDesktopLicenses()
    return jsonOk({ requests })
  } catch (error) {
    logDbRouteError('admin_desktop_licenses_pending_failed', error, { operation: 'listPendingDesktopLicenses' })
    return jsonError('Bekleyen lisans talepleri okunamadı.', 500)
  }
}
