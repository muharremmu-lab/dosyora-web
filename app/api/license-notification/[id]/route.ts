export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { requireAdminMutationAuth } from '@/lib/admin-api-auth'
import { logApiError, logApiWarning } from '@/lib/api-logger'
import { jsonError, jsonOk } from '@/lib/api-response'
import { updateLicenseNotificationStatus } from '@/lib/db/license-notifications'
import { LICENSE_NOTIFICATION_STATUSES, type LicenseNotificationStatus } from '@/lib/db/types'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const authError = await requireAdminMutationAuth(request)
  if (authError) return authError

  try {
    const { id: rawId } = await context.params
    const id = Number.parseInt(rawId, 10)
    if (!Number.isFinite(id) || id <= 0) {
      return jsonError('Geçersiz kayıt.', 400)
    }

    const body = (await request.json()) as { status?: string }
    const status = body.status
    if (!status || !LICENSE_NOTIFICATION_STATUSES.includes(status as LicenseNotificationStatus)) {
      logApiWarning('license_notification_invalid_status', { id, status })
      return jsonError('Geçersiz durum.', 400)
    }

    const notification = await updateLicenseNotificationStatus(id, status as LicenseNotificationStatus)
    if (!notification) {
      return jsonError('Kayıt bulunamadı.', 404)
    }

    return jsonOk({ notification })
  } catch (error) {
    logApiError('license_notification_update_failed', {}, error)
    return jsonError('Durum güncellenemedi.', 500)
  }
}
