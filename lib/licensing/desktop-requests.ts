import { dbInsertReturningId, dbQueryOne, dbRun } from '@/lib/db/query'
import {
  getLicenseNotificationById,
  listPendingDesktopLicenseNotifications,
  saveDesktopLicenseDecision,
} from '@/lib/db/license-notifications'
import type { LicenseNotification } from '@/lib/db/types'

import { addIstanbulDays, createOfflineLicenseKey, endOfIstanbulDayIso, isLicensePackage, LICENSE_PACKAGES, normalizeHardwareId, type LicensePackageCode } from './offline-key'

const PLAN_PRICES: Record<LicensePackageCode | 'UNLIMITED', number> = {
  F1: LICENSE_PACKAGES.F1.priceTl,
  MM50: LICENSE_PACKAGES.MM50.priceTl,
  MM100: LICENSE_PACKAGES.MM100.priceTl,
  MM200: LICENSE_PACKAGES.MM200.priceTl,
  UNLIMITED: 5988,
}

export type PendingDesktopLicense = {
  id: number
  fullName: string
  taxNumber: string
  email: string
  taxOffice: string
  licensePlan: string | null
  hardwareId: string | null
  createdAt: string
}

export function toPendingDesktopLicense(row: LicenseNotification): PendingDesktopLicense {
  return {
    id: row.id,
    fullName: row.full_name,
    taxNumber: row.tax_number,
    email: row.email,
    taxOffice: row.tax_office,
    licensePlan: row.license_plan,
    hardwareId: row.hardware_id,
    createdAt: row.created_at,
  }
}

export async function listPendingDesktopLicenses(): Promise<PendingDesktopLicense[]> {
  const rows = await listPendingDesktopLicenseNotifications()
  return rows.map(toPendingDesktopLicense)
}

export async function approveDesktopLicense(id: number): Promise<
  | { ok: true; hardwareId: string; licenseKey: string; expiresAt: string }
  | { ok: false; error: string; status: number }
> {
  const current = await getLicenseNotificationById(id)
  if (!current || current.source !== 'desktop_app') {
    return { ok: false, error: 'Masaüstü lisans talebi bulunamadı.', status: 404 }
  }
  if (current.status !== 'PENDING') {
    return { ok: false, error: 'Yalnızca bekleyen talepler onaylanabilir.', status: 409 }
  }

  const hardwareId = normalizeHardwareId(current.hardware_id)
  if (!hardwareId) {
    return { ok: false, error: 'Talepte geçerli bir donanım kimliği yok.', status: 400 }
  }

  const stamp = addIstanbulDays(365)
  const selected = current.license_plan === 'UNLIMITED' || isLicensePackage(current.license_plan ?? '')
    ? (current.license_plan as LicensePackageCode | 'UNLIMITED')
    : 'UNLIMITED'
  const licenseKey = createOfflineLicenseKey(hardwareId, selected, stamp)
  const expiresAt = endOfIstanbulDayIso(stamp)
  const now = new Date().toISOString()

  await dbInsertReturningId(
    'licenseOrders.insertApprovedDesktop',
    `INSERT INTO license_orders (
      created_at, updated_at, hwid, package_code, full_name, vkn, email, phone,
      status, license_key, expires_at, payment_code, price_tl
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'approved', ?, ?, NULL, ?)
    RETURNING id`,
    [
      now,
      now,
      hardwareId,
      selected,
      current.full_name,
      current.tax_number,
      current.email,
      '',
      licenseKey,
      expiresAt,
      PLAN_PRICES[selected],
    ],
  )

  const saved = await saveDesktopLicenseDecision(id, 'APPROVED', licenseKey)
  if (!saved || saved.status !== 'APPROVED') {
    return { ok: false, error: 'Talep onaylanamadı.', status: 409 }
  }

  return { ok: true, hardwareId, licenseKey, expiresAt }
}

export async function rejectDesktopLicense(id: number): Promise<{ ok: true } | { ok: false; error: string; status: number }> {
  const current = await getLicenseNotificationById(id)
  if (!current || current.source !== 'desktop_app') {
    return { ok: false, error: 'Masaüstü lisans talebi bulunamadı.', status: 404 }
  }
  if (current.status !== 'PENDING') {
    return { ok: false, error: 'Yalnızca bekleyen talepler reddedilebilir.', status: 409 }
  }

  const saved = await saveDesktopLicenseDecision(id, 'REJECTED', null)
  if (!saved || saved.status !== 'REJECTED') {
    return { ok: false, error: 'Talep reddedilemedi.', status: 409 }
  }

  return { ok: true }
}

export async function setDesktopLicenseDemo(input: {
  notificationId?: number
  hardwareId?: string
}): Promise<{ ok: true; hardwareId: string; status: 'DEMO' } | { ok: false; error: string; status: number }> {
  const notification = input.notificationId ? await getLicenseNotificationById(input.notificationId) : null
  if (input.notificationId && !notification) {
    return { ok: false, error: 'Masaüstü lisans talebi bulunamadı.', status: 404 }
  }

  const hardwareId = normalizeHardwareId(input.hardwareId) ?? normalizeHardwareId(notification?.hardware_id)
  if (!hardwareId) {
    return { ok: false, error: 'Geçerli bir donanım kimliği yok.', status: 400 }
  }

  const now = new Date().toISOString()
  const updated = await dbRun(
    'licenseOrders.setDemo',
    `UPDATE license_orders
     SET status = 'demo', license_key = NULL, updated_at = ?
     WHERE hwid = ? AND status IN ('approved', 'provisional', 'pending')`,
    [now, hardwareId],
  )

  const existingDemo = await dbQueryOne<{ id: number }>(
    'licenseOrders.demoByHwid',
    `SELECT id FROM license_orders WHERE hwid = ? AND status = 'demo' LIMIT 1`,
    [hardwareId],
  )

  if (Number(updated.rowsAffected ?? 0) === 0 && !existingDemo) {
    if (!notification) {
      return { ok: false, error: 'Bu donanım kimliği için lisans kaydı bulunamadı.', status: 404 }
    }

    await dbInsertReturningId(
      'licenseOrders.insertDemo',
      `INSERT INTO license_orders (
        created_at, updated_at, hwid, package_code, full_name, vkn, email, phone,
        status, license_key, expires_at, payment_code, price_tl
      ) VALUES (?, ?, ?, 'UNLIMITED', ?, ?, ?, '', 'demo', NULL, NULL, NULL, 0)
      RETURNING id`,
      [now, now, hardwareId, notification.full_name, notification.tax_number, notification.email],
    )
  }

  await dbRun(
    'licenseNotifications.setDemo',
    `UPDATE license_notifications
     SET status = 'DEMO', license_key = NULL, updated_at = ?
     WHERE hardware_id = ? AND status IN ('PENDING', 'APPROVED')`,
    [now, hardwareId],
  )

  return { ok: true, hardwareId, status: 'DEMO' }
}
