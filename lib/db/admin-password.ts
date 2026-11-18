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

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

export function databaseConfigured(): boolean {
  return Boolean(process.env.TURSO_DATABASE_URL?.trim())
}

export async function readAdminPasswordOverride(): Promise<string | null> {
  if (!databaseConfigured()) {
    return null
  }

  const row = await dbQueryOne<OverrideRow>(
    'adminPassword.readOverride',
    'SELECT password_hash FROM admin_password_overrides WHERE id = 1',
  )
  return row?.password_hash ?? null
}

export async function createAdminResetTokenAndCode(now = new Date()): Promise<{ token: string; code: string }> {
  const token = randomBytes(32).toString('base64url')
  const code = Math.floor(100000 + Math.random() * 900000).toString()
  const createdAt = now.toISOString()
  const expiresAt = new Date(now.getTime() + ADMIN_RESET_TTL_MS).toISOString()

  await dbRun(
    'adminPassword.invalidateResets',
    'UPDATE admin_password_resets SET used_at = ? WHERE used_at IS NULL',
    [createdAt],
  )
  await dbRun(
    'adminPassword.insertResetToken',
    'INSERT INTO admin_password_resets (token_hash, expires_at, used_at, created_at) VALUES (?, ?, NULL, ?)',
    [hashToken(token), expiresAt, createdAt],
  )
  await dbRun(
    'adminPassword.insertResetCode',
    'INSERT INTO admin_password_resets (token_hash, expires_at, used_at, created_at) VALUES (?, ?, NULL, ?)',
    [hashToken(code), expiresAt, createdAt],
  )

  return { token, code }
}

export async function createAdminResetToken(now = new Date()): Promise<string> {
  const { token } = await createAdminResetTokenAndCode(now)
  return token
}

export async function consumeAdminResetToken(tokenOrCode: string, now = new Date()): Promise<boolean> {
  const trimmed = tokenOrCode.trim()
  if (!trimmed) return false

  // Acil durum kurtarma kodu desteği (Vercel env'de ADMIN_RECOVERY_CODE veya ADMIN_RESET_CODE tanımlıysa)
  const recoveryCode = process.env.ADMIN_RECOVERY_CODE?.trim() || process.env.ADMIN_RESET_CODE?.trim()
  if (recoveryCode && trimmed === recoveryCode) {
    return true
  }

  const row = await dbQueryOne<ResetRow>(
    'adminPassword.readReset',
    'SELECT token_hash, expires_at, used_at FROM admin_password_resets WHERE token_hash = ?',
    [hashToken(trimmed)],
  )
  if (!row || row.used_at || row.expires_at <= now.toISOString()) {
    return false
  }

  const usedAt = now.toISOString()
  const result = await dbRun(
    'adminPassword.consumeReset',
    'UPDATE admin_password_resets SET used_at = ? WHERE token_hash = ? AND used_at IS NULL AND expires_at > ?',
    [usedAt, row.token_hash, usedAt],
  )
  return Number(result.rowsAffected) === 1
}

export async function saveAdminPasswordOverride(passwordHash: string, now = new Date()): Promise<void> {
  await dbRun(
    'adminPassword.saveOverride',
    `INSERT INTO admin_password_overrides (id, password_hash, updated_at) VALUES (1, ?, ?)
     ON CONFLICT(id) DO UPDATE SET password_hash = excluded.password_hash, updated_at = excluded.updated_at`,
    [passwordHash, now.toISOString()],
  )
}
