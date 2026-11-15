import { dbInsertReturningId, dbQueryAll, dbQueryOne, dbRun } from './query'
import type {
  CreateLicenseNotificationInput,
  LicenseNotification,
  LicenseNotificationStatus,
} from './types'

export async function createLicenseNotification(
  input: CreateLicenseNotificationInput,
  now = new Date(),
): Promise<LicenseNotification> {
  const timestamp = now.toISOString()
  const id = await dbInsertReturningId(
    'createLicenseNotification',
    `INSERT INTO license_notifications (
      full_name, email, tax_number, tax_office, address, status, created_at, updated_at, source, hardware_id, license_plan
    ) VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?, ?, ?, ?)
    RETURNING id`,
    [
      input.full_name,
      input.email,
      input.tax_number,
      input.tax_office,
      input.address,
      timestamp,
      timestamp,
      input.source ?? null,
      input.hardware_id ?? null,
      input.license_plan ?? null,
    ],
  )

  await dbRun(
    'setLicenseNotificationPaymentCode',
    'UPDATE license_notifications SET payment_code = ? WHERE id = ?',
    [`GT-${id}`, id],
  )

  const created = await getLicenseNotificationById(id)
  if (!created) {
    throw new Error('Havale bildirimi kaydedilemedi.')
  }
  return created
}

export async function getLicenseNotificationById(id: number): Promise<LicenseNotification | null> {
  return dbQueryOne<LicenseNotification>(
    'getLicenseNotificationById',
    `SELECT id, full_name, email, tax_number, tax_office, address, status, source, hardware_id, license_plan, payment_code, license_key, created_at, updated_at
     FROM license_notifications WHERE id = ?`,
    [id],
  )
}

export async function listLicenseNotifications(limit = 100): Promise<LicenseNotification[]> {
  return dbQueryAll<LicenseNotification>(
    'listLicenseNotifications',
    `SELECT id, full_name, email, tax_number, tax_office, address, status, source, hardware_id, license_plan, payment_code, license_key, created_at, updated_at
     FROM license_notifications
     ORDER BY created_at DESC
     LIMIT ?`,
    [limit],
  )
}

export async function updateLicenseNotificationStatus(
  id: number,
  status: LicenseNotificationStatus,
  now = new Date(),
): Promise<LicenseNotification | null> {
  const existing = await getLicenseNotificationById(id)
  if (!existing) return null

  await dbRun(
    'updateLicenseNotificationStatus',
    'UPDATE license_notifications SET status = ?, updated_at = ? WHERE id = ?',
    [status, now.toISOString(), id],
  )

  return getLicenseNotificationById(id)
}

export async function listPendingDesktopLicenseNotifications(): Promise<LicenseNotification[]> {
  return dbQueryAll<LicenseNotification>(
    'listPendingDesktopLicenseNotifications',
    `SELECT id, full_name, email, tax_number, tax_office, address, status, source, hardware_id, license_plan, payment_code, license_key, created_at, updated_at
     FROM license_notifications
     WHERE status = 'PENDING' AND source = 'desktop_app'
     ORDER BY created_at DESC
     LIMIT 100`,
  )
}

export async function saveDesktopLicenseDecision(
  id: number,
  status: 'APPROVED' | 'REJECTED',
  licenseKey: string | null,
  now = new Date(),
): Promise<LicenseNotification | null> {
  await dbRun(
    'saveDesktopLicenseDecision',
    `UPDATE license_notifications
     SET status = ?, license_key = ?, updated_at = ?
     WHERE id = ? AND status = 'PENDING' AND source = 'desktop_app'`,
    [status, licenseKey, now.toISOString(), id],
  )
  return getLicenseNotificationById(id)
}
