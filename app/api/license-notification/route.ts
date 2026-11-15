export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { requireAdminApiAuth } from '@/lib/admin-api-auth'
import { logApiError, logApiInfo, logApiWarning } from '@/lib/api-logger'
import { jsonError, jsonOk } from '@/lib/api-response'
import { createLicenseNotification, listLicenseNotifications } from '@/lib/db/license-notifications'
import { applyForLicense } from '@/lib/licensing/orders'
import { isLicensePackage } from '@/lib/licensing/offline-key'
import { notificationService } from '@/lib/notifications/service'
import { packagePresentation } from '@/lib/notifications/templates'
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
    const selected = packagePresentation(notification.license_plan)
    let provisional = false
    let reused = false
    let licenseKey: string | null = null
    let expiresAt: string | null = null
    let applicantOutcome: 'granted' | 'blocked' | 'recorded' = 'recorded'

    const packageCode = notification.license_plan ?? ''
    if (validation.data.hardware_id && isLicensePackage(packageCode)) {
      try {
        const applied = await applyForLicense({
          hwid: validation.data.hardware_id,
          packageCode,
          fullName: notification.full_name,
          vkn: notification.tax_number,
          email: notification.email,
          phone: '',
          clientIp: meta.ip_address,
        })
        reused = applied.reused
        provisional = applied.order.status === 'provisional' && !applied.reused
        licenseKey = applied.order.licenseKey
        expiresAt = applied.order.expiresAt
        applicantOutcome = provisional ? 'granted' : 'blocked'
      } catch (error) {
        logApiError('license_notification_provisional_failed', { id: notification.id }, error)
      }
    }

    try {
      await notificationService.notifyLicenseNotificationCreated(notification, validation.data.source)
      await notificationService.notifyLicenseApplicant({
        fullName: notification.full_name,
        email: notification.email,
        taxNumber: notification.tax_number,
        packageTitle: selected.title,
        priceTl: selected.priceTl,
        outcome: applicantOutcome,
      })
    } catch (error) {
      logApiError('license_notification_email_failed', { id: notification.id }, error)
    }

    logApiInfo('license_notification_created', { id: notification.id, provisional, reused })
    return jsonOk(
      {
        id: notification.id,
        status: provisional ? 'provisional' : notification.status,
        createdAt: notification.created_at,
        paymentCode: notification.payment_code,
        provisional,
        reused,
        licenseKey,
        expiresAt,
        packageTitle: selected.title,
        priceTl: selected.priceTl,
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
