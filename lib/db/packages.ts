import { randomUUID } from 'node:crypto'

import { dbQueryAll, dbQueryOne, dbRun } from './query'
import { KNOWN_PACKAGES, type PackageCode } from '@/lib/packages-config'

export { KNOWN_PACKAGES, type PackageCode }

export type PackageRecord = {
  id: string
  code: string
  name: string
  description: string | null
  is_active: number
  created_at: string
}

export type UserPackageRecord = {
  id: string
  user_id: string
  package_code: string
  status: 'active' | 'inactive' | 'expired'
  start_date: string
  end_date: string | null
  created_at: string
  updated_at: string
  package_name?: string
  package_description?: string | null
}

export async function listPackages(): Promise<PackageRecord[]> {
  return dbQueryAll<PackageRecord>(
    'packages.listAll',
    'SELECT * FROM packages ORDER BY created_at ASC',
  )
}

export async function getPackageByCode(code: string): Promise<PackageRecord | null> {
  return dbQueryOne<PackageRecord>(
    'packages.getByCode',
    'SELECT * FROM packages WHERE code = ?',
    [code],
  )
}

export async function getUserPackages(userId: string): Promise<UserPackageRecord[]> {
  return dbQueryAll<UserPackageRecord>(
    'user_packages.getByUserId',
    `SELECT up.*, p.name as package_name, p.description as package_description
     FROM user_packages up
     LEFT JOIN packages p ON up.package_code = p.code
     WHERE up.user_id = ?
     ORDER BY up.created_at DESC`,
    [userId],
  )
}

export async function getUserActivePackageCodes(userId: string): Promise<string[]> {
  const now = new Date().toISOString()
  const rows = await dbQueryAll<{ package_code: string }>(
    'user_packages.getActiveCodes',
    `SELECT DISTINCT package_code
     FROM user_packages
     WHERE user_id = ?
       AND status = 'active'
       AND (end_date IS NULL OR end_date > ?)`,
    [userId, now],
  )
  return rows.map((r) => r.package_code)
}

export async function userHasPackage(userId: string, packageCode: string): Promise<boolean> {
  const now = new Date().toISOString()
  const row = await dbQueryOne<{ id: string }>(
    'user_packages.checkAccess',
    `SELECT id FROM user_packages
     WHERE user_id = ?
       AND package_code = ?
       AND status = 'active'
       AND (end_date IS NULL OR end_date > ?)
     LIMIT 1`,
    [userId, packageCode, now],
  )
  return row !== null
}

export async function assignPackageToUser(
  userId: string,
  packageCode: string,
  endDate?: string | null,
): Promise<UserPackageRecord> {
  const existing = await dbQueryOne<UserPackageRecord>(
    'user_packages.findExisting',
    'SELECT * FROM user_packages WHERE user_id = ? AND package_code = ?',
    [userId, packageCode],
  )

  const now = new Date().toISOString()

  if (existing) {
    await dbRun(
      'user_packages.reactivate',
      `UPDATE user_packages
       SET status = 'active', start_date = ?, end_date = ?, updated_at = ?
       WHERE id = ?`,
      [now, endDate ?? null, now, existing.id],
    )
    const updated = await dbQueryOne<UserPackageRecord>(
      'user_packages.getById',
      'SELECT * FROM user_packages WHERE id = ?',
      [existing.id],
    )
    return updated!
  }

  const id = `upk_${randomUUID()}`
  await dbRun(
    'user_packages.insert',
    `INSERT INTO user_packages (id, user_id, package_code, status, start_date, end_date, created_at, updated_at)
     VALUES (?, ?, ?, 'active', ?, ?, ?, ?)`,
    [id, userId, packageCode, now, endDate ?? null, now, now],
  )

  const created = await dbQueryOne<UserPackageRecord>(
    'user_packages.getById',
    'SELECT * FROM user_packages WHERE id = ?',
    [id],
  )
  return created!
}

export async function revokePackageFromUser(
  userId: string,
  packageCode: string,
): Promise<boolean> {
  const now = new Date().toISOString()
  const result = await dbRun(
    'user_packages.revoke',
    `UPDATE user_packages SET status = 'inactive', updated_at = ? WHERE user_id = ? AND package_code = ?`,
    [now, userId, packageCode],
  )
  return (result.rowsAffected ?? 0) > 0
}
