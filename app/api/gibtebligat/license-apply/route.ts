export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

import { createLicenseNotification } from '@/lib/db/license-notifications'
import { jsonError, jsonOk } from '@/lib/api-response'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { applyForLicense, getBankSettings } from '@/lib/licensing/orders'
import { notificationService } from '@/lib/notifications/service'
import { isLicensePackage, LICENSE_PACKAGES, normalizeHardwareId } from '@/lib/licensing/offline-key'
import { checkRateLimit } from '@/lib/rate-limit'
import { getClientIp } from '@/lib/request-meta'

const APPLY_LIMIT = { limit: 8, windowMs: 10 * 60 * 1000 }

function text(value: unknown, max: number): string {
  if (typeof value !== 'string') return ''
  return value.trim().slice(0, max)
}

export async function POST(request: NextRequest) {
  const rateLimit = checkRateLimit(`license-apply:${getClientIp(request)}`, APPLY_LIMIT)
  if (!rateLimit.allowed) {
    return jsonError('Çok fazla başvuru gönderildi. Biraz sonra yeniden deneyin.', 429)
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return jsonError('Geçersiz istek gövdesi.', 400)
  }

  if (!body || typeof body !== 'object') {
    return jsonError('Geçersiz istek gövdesi.', 400)
  }

  const record = body as Record<string, unknown>
  const hwid = normalizeHardwareId(record.hwid)
  const packageCode = text(record.packageCode, 8).toUpperCase()
  const fullName = text(record.fullName, 120)
  const vkn = text(record.vkn, 11).replace(/\D/g, '')
  const email = text(record.email, 160).toLowerCase()
  const phone = text(record.phone, 24)

  if (!hwid) {
    return jsonError('Donanım kimliği 64 haneli onaltılık kod olmalıdır.', 400)
  }
  if (!isLicensePackage(packageCode)) {
    return jsonError('Paket seçin.', 400)
  }
  if (fullName.length < 2) {
    return jsonError('Ad soyad veya unvan gerekli.', 400)
  }
  if (!/^\d{10}$|^\d{11}$/.test(vkn)) {
    return jsonError('VKN veya TCKN 10 ya da 11 hane olmalıdır.', 400)
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonError('Geçerli bir e-posta girin.', 400)
  }
  if (phone.replace(/\D/g, '').length < 10) {
    return jsonError('Geçerli bir telefon girin.', 400)
  }

  try {
    const [{ order, reused }, bank] = await Promise.all([
      applyForLicense({ hwid, packageCode, fullName, vkn, email, phone, clientIp: getClientIp(request) }),
      getBankSettings(),
    ])
    if (!reused) {
      try {
        await createLicenseNotification({
          full_name: order.fullName,
          email: order.email,
          tax_number: order.vkn,
          tax_office: '',
          address: '',
          source: 'desktop_app',
          hardware_id: order.hwid,
          license_plan: order.packageCode,
        })
      } catch (error) {
        logDbRouteError('gibtebligat_license_apply_notification_failed', error, { operation: 'licenseApplyNotification' })
      }
    }

    const granted = order.status === 'provisional' && !reused
    try {
      await notificationService.notifyLicenseApplicant({
        fullName: order.fullName,
        email: order.email,
        taxNumber: order.vkn,
        packageTitle: LICENSE_PACKAGES[order.packageCode].title,
        priceTl: order.priceTl,
        outcome: granted ? 'granted' : 'blocked',
      })
    } catch (error) {
      logDbRouteError('gibtebligat_license_apply_email_failed', error, { operation: 'licenseApplyEmail' })
    }
    return jsonOk({
      status: order.status,
      reused,
      orderId: order.id,
      package: order.packageCode,
      packageTitle: LICENSE_PACKAGES[order.packageCode].title,
      priceTl: order.priceTl,
      licenseKey: order.licenseKey,
      expiresAt: order.expiresAt,
      paymentDueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      createdAt: order.createdAt,
      paymentCode: order.paymentCode,
      bank: {
        iban: bank.iban,
        accountName: bank.accountName,
        descriptionCode: `${fullName} - ${vkn}`,
      },
    })
  } catch (error) {
    logDbRouteError('gibtebligat_license_apply_failed', error, { operation: 'licenseApply' })
    return jsonError('Başvuru kaydedilemedi.', 500)
  }
}
