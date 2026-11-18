import { randomUUID } from 'node:crypto'

import { hashAdminPassword, verifyAdminPasswordHash } from '@/lib/admin-password'
import { dbQueryAll, dbQueryOne, dbRun } from './query'

export type UserRole = 'admin' | 'user'
export type UserStatus = 'active' | 'inactive' | 'suspended'

export type UserRecord = {
  id: string
  email: string
  password_hash: string
  full_name: string
  role: UserRole
  status: UserStatus
  created_at: string
  updated_at: string
}

export type SafeUser = Omit<UserRecord, 'password_hash'>

export type CreateUserInput = {
  email: string
  password: string
  full_name: string
  role?: UserRole
  status?: UserStatus
}

export function toSafeUser(user: UserRecord): SafeUser {
  return {
    id: user.id,
    email: user.email,
    full_name: user.full_name,
    role: user.role,
    status: user.status,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }
}

export async function getUserByEmail(email: string): Promise<UserRecord | null> {
  const normalized = email.trim().toLowerCase()
  return dbQueryOne<UserRecord>(
    'users.getByEmail',
    'SELECT * FROM users WHERE LOWER(email) = ?',
    [normalized],
  )
}

export async function getUserById(id: string): Promise<UserRecord | null> {
  return dbQueryOne<UserRecord>(
    'users.getById',
    'SELECT * FROM users WHERE id = ?',
    [id],
  )
}

export async function listUsers(): Promise<SafeUser[]> {
  const rows = await dbQueryAll<UserRecord>(
    'users.listAll',
    'SELECT * FROM users ORDER BY created_at DESC',
  )
  return rows.map(toSafeUser)
}

export async function createUser(input: CreateUserInput): Promise<SafeUser> {
  const id = `usr_${randomUUID()}`
  const normalizedEmail = input.email.trim().toLowerCase()
  const passwordHash = await hashAdminPassword(input.password)
  const role = input.role ?? 'user'
  const status = input.status ?? 'active'
  const now = new Date().toISOString()

  await dbRun(
    'users.create',
    `INSERT INTO users (id, email, password_hash, full_name, role, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, normalizedEmail, passwordHash, input.full_name.trim(), role, status, now, now],
  )

  const created = await getUserById(id)
  if (!created) {
    throw new Error('Kullanıcı oluşturuldu ancak getirilemedi.')
  }
  return toSafeUser(created)
}

export async function updateUser(
  id: string,
  updates: Partial<Pick<UserRecord, 'full_name' | 'role' | 'status'>>,
): Promise<SafeUser | null> {
  const existing = await getUserById(id)
  if (!existing) return null

  const fullName = updates.full_name !== undefined ? updates.full_name.trim() : existing.full_name
  const role = updates.role !== undefined ? updates.role : existing.role
  const status = updates.status !== undefined ? updates.status : existing.status
  const now = new Date().toISOString()

  await dbRun(
    'users.update',
    `UPDATE users SET full_name = ?, role = ?, status = ?, updated_at = ? WHERE id = ?`,
    [fullName, role, status, now, id],
  )

  const updated = await getUserById(id)
  return updated ? toSafeUser(updated) : null
}

export async function updateUserPassword(id: string, newPassword: string): Promise<boolean> {
  const passwordHash = await hashAdminPassword(newPassword)
  const now = new Date().toISOString()
  const result = await dbRun(
    'users.updatePassword',
    `UPDATE users SET password_hash = ?, updated_at = ? WHERE id = ?`,
    [passwordHash, now, id],
  )
  return (result.rowsAffected ?? 0) > 0
}

export async function deleteUser(id: string): Promise<boolean> {
  // Kullanıcıya ait paketleri de temizle
  await dbRun('user_packages.deleteByUserId', 'DELETE FROM user_packages WHERE user_id = ?', [id])
  const result = await dbRun('users.delete', 'DELETE FROM users WHERE id = ?', [id])
  return (result.rowsAffected ?? 0) > 0
}

export async function verifyUserCredentials(
  email: string,
  plainPassword: string,
): Promise<SafeUser | null> {
  const user = await getUserByEmail(email)
  if (!user || user.status !== 'active') {
    return null
  }

  const valid = await verifyAdminPasswordHash(plainPassword, user.password_hash)
  if (!valid) {
    return null
  }

  return toSafeUser(user)
}
