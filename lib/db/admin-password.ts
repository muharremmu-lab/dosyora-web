import { createHash, randomBytes } from 'node:crypto'

import { ADMIN_RESET_TTL_MS } from '@/lib/admin-password'

import { dbQueryOne, dbRun } from './query'

type ResetRow = {
  token_hash: string
  expires_at: string
  used_at: string | null
}

type OverrideRow = {
  password_hash: string
}

type ResetRowWithEmail = ResetRow & {
  admin_email: string | null
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function databaseConfigured(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL?.trim())
}

export async function readAdminPasswordOverride(email: string): Promise<string | null> {
  if (!databaseConfigured()) {
    return null
  }

  const row = await dbQueryOne<OverrideRow>(
    'adminPassword.readOverride',
    'SELECT password_hash FROM admin_passwords WHERE email = ?',
    [email],
  )
  return row?.password_hash ?? null
}

export async function createAdminResetTokenAndCode(
  adminEmail: string,
  now = new Date(),
): Promise<{ token: string; code: string }> {
  const token = randomBytes(32).toString('base64url')
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const createdAt = now.toISOString()
  const expiresAt = new Date(now.getTime() + ADMIN_RESET_TTL_MS).toISOString()

  await dbRun(
    'adminPassword.invalidateResets',
    'UPDATE admin_password_resets SET used_at = ? WHERE used_at IS NULL AND admin_email = ?',
    [createdAt, adminEmail],
  )
  await dbRun(
    'adminPassword.insertResetToken',
    'INSERT INTO admin_password_resets (token_hash, expires_at, used_at, created_at, admin_email) VALUES (?, ?, NULL, ?, ?)',
    [hashToken(token), expiresAt, createdAt, adminEmail],
  )
  await dbRun(
    'adminPassword.insertResetCode',
    'INSERT INTO admin_password_resets (token_hash, expires_at, used_at, created_at, admin_email) VALUES (?, ?, NULL, ?, ?)',
    [hashToken(code), expiresAt, createdAt, adminEmail],
  )

  return { token, code }
}

export async function consumeAdminResetToken(
  tokenOrCode: string,
  now = new Date(),
): Promise<{ email: string } | null> {
  const trimmed = tokenOrCode.trim()
  if (!trimmed) return null

  const row = await dbQueryOne<ResetRowWithEmail>(
    'adminPassword.readReset',
    'SELECT token_hash, expires_at, used_at, admin_email FROM admin_password_resets WHERE token_hash = ?',
    [hashToken(trimmed)],
  )
  if (!row || row.used_at || row.expires_at <= now.toISOString() || !row.admin_email) {
    return null
  }

  const usedAt = now.toISOString()
  const result = await dbRun(
    'adminPassword.consumeReset',
    'UPDATE admin_password_resets SET used_at = ? WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?',
    [usedAt, row.token_hash, usedAt],
  )
  if (Number(result.rowsAffected) !== 1) {
    return null
  }

  return { email: row.admin_email }
}

export async function saveAdminPasswordOverride(
  email: string,
  passwordHash: string,
  now = new Date(),
): Promise<void> {
  await dbRun(
    'adminPassword.saveOverride',
    `INSERT INTO admin_passwords (email, password_hash, updated_at) VALUES (?, ?, ?)
     ON CONFLICT(email) DO UPDATE SET password_hash = excluded.password_hash, updated_at = excluded.updated_at`,
    [email, passwordHash, now.toISOString()],
  )
}
