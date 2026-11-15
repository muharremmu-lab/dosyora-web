export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { requireAdminApiAuth } from '@/lib/admin-api-auth'
import { logApiError, logApiInfo, logApiWarning } from '@/lib/api-logger'
import { jsonError, jsonOk } from '@/lib/api-response'
import { createLicenseNotification, listLicenseNotifications } from '@/lib/db/license-notifications'
import { notificationService } from '@/lib/notifications/service'
import { bankTransferInstructions } from '@/lib/license/bank-instructions'
import { FORM_RATE_LIMIT, checkRateLimit } from '@/lib/rate-limit'
import { getRequestMeta } from '@/lib/request-meta'
import { validateLicenseNotificationPayload } from '@/lib/validation/license-notification'

export async function POST(request: NextRequest) {
  try {
    const meta = getRequestMeta(request)
    const rateLimit = checkRateLimit(`license-notification:${meta.ip_address}`, FORM_RATE_LIMIT)

    if (!rateLimit.allowed) {
      logApiWarning('license_notification_rate_limited', { ip: meta.ip_address })
      return jsonError('Çok fazla istek gönderildi. Lütfen daha sonra tekrar deneyin.', 429)
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return jsonError('Geçersiz istek gövdesi.', 400)
    }

    const validation = validateLicenseNotificationPayload(body)
    if (!validation.success) {
      logApiWarning('license_notification_invalid', { ip: meta.ip_address })
      return jsonError(validation.errors[0]?.message ?? 'Doğrulama hatası.', 400, validation.errors)
    }

    const notification = await createLicenseNotification(validation.data)

    try {
      await notificationService.notifyLicenseNotificationCreated(notification, validation.data.source)
    } catch (error) {
      logApiError('license_notification_email_failed', { id: notification.id }, error)
    }

    logApiInfo('license_notification_created', { id: notification.id })
    return jsonOk(
      {
        id: notification.id,
        status: notification.status,
        createdAt: notification.created_at,
      },
      { status: 201 },
    )
  } catch (error) {
    logApiError('license_notification_create_failed', {}, error)
    return jsonError('Bildirim kaydedilemedi. Lütfen daha sonra tekrar deneyin.', 500)
  }
}

export async function GET() {
  const authError = await requireAdminApiAuth()
  if (authError) return authError

  try {
    const notifications = await listLicenseNotifications()
    return jsonOk({ notifications, bankTransfer: bankTransferInstructions })
  } catch (error) {
    logApiError('license_notification_list_failed', {}, error)
    return jsonError('Bildirimler okunamadı.', 500)
  }
}
