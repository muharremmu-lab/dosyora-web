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
      full_name, email, tax_number, tax_office, address, status, created_at, updated_at
    ) VALUES (?, ?, ?, ?, ?, 'PENDING', ?, ?)
    RETURNING id`,
    [
      input.full_name,
      input.email,
      input.tax_number,
      input.tax_office,
      input.address,
      timestamp,
      timestamp,
    ],
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
    `SELECT id, full_name, email, tax_number, tax_office, address, status, created_at, updated_at
     FROM license_notifications WHERE id = ?`,
    [id],
  )
}

export async function listLicenseNotifications(limit = 100): Promise<LicenseNotification[]> {
  return dbQueryAll<LicenseNotification>(
    'listLicenseNotifications',
    `SELECT id, full_name, email, tax_number, tax_office, address, status, created_at, updated_at
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
