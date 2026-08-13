import type { Client } from '@libsql/client/web'

import {
  getDocumentLimitForAttemptCount,
  isDemoRepeatQuotaExceeded,
  resolveEffectiveDemoAttemptCount,
} from '@/lib/demo-policy/repeat-policy'

import { ensureDbReady, getDbClient } from './client'
import { executeWithClient } from './execute'
import { normalizeEmail } from './types'

const WINDOW_DAYS = 30

type QuotaCountRow = {
  demo_count: number | bigint | null
  window_expires_at: string | null
}

export type DemoQuotaReservationResult =
  | { reserved: true; documentLimit: number }
  | { reserved: false; reason: 'exceeded' }

function addDaysIso(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}

function isExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return true
  return new Date(expiresAt).getTime() <= Date.now()
}

function readDemoCount(row: QuotaCountRow | undefined): number {
  if (!row || isExpired(row.window_expires_at)) {
    return 0
  }

  return Number(row.demo_count ?? 0)
}

async function ensureEmailQuotaRow(client: Client, email: string): Promise<void> {
  const now = new Date().toISOString()
  await executeWithClient(
    client,
    'reserveDemoQuota.ensureEmail',
    `
      INSERT INTO email_demo_quota (email, demo_count, window_started_at, window_expires_at)
      VALUES (?, 0, ?, ?)
      ON CONFLICT(email) DO NOTHING
    `,
    [email, now, addDaysIso(WINDOW_DAYS)],
  )
}

async function ensureIpQuotaRow(client: Client, ipAddress: string): Promise<void> {
  const now = new Date().toISOString()
  await executeWithClient(
    client,
    'reserveDemoQuota.ensureIp',
    `
      INSERT INTO ip_demo_quota (ip_address, demo_count, window_started_at, window_expires_at)
      VALUES (?, 0, ?, ?)
      ON CONFLICT(ip_address) DO NOTHING
    `,
    [ipAddress, now, addDaysIso(WINDOW_DAYS)],
  )
}

async function resetExpiredEmailWindow(client: Client, email: string): Promise<void> {
  const row = await executeWithClient(
    client,
    'reserveDemoQuota.readEmailWindow',
    'SELECT window_expires_at FROM email_demo_quota WHERE email = ?',
    [email],
  )
  const expiresAt = row.rows[0]?.window_expires_at as string | undefined
  if (!expiresAt || !isExpired(expiresAt)) {
    return
  }

  const now = new Date().toISOString()
  await executeWithClient(
    client,
    'reserveDemoQuota.resetEmailWindow',
    `
      UPDATE email_demo_quota
      SET demo_count = 0,
          window_started_at = ?,
          window_expires_at = ?
      WHERE email = ?
    `,
    [now, addDaysIso(WINDOW_DAYS), email],
  )
}

async function resetExpiredIpWindow(client: Client, ipAddress: string): Promise<void> {
  const row = await executeWithClient(
    client,
    'reserveDemoQuota.readIpWindow',
    'SELECT window_expires_at FROM ip_demo_quota WHERE ip_address = ?',
    [ipAddress],
  )
  const expiresAt = row.rows[0]?.window_expires_at as string | undefined
  if (!expiresAt || !isExpired(expiresAt)) {
    return
  }

  const now = new Date().toISOString()
  await executeWithClient(
    client,
    'reserveDemoQuota.resetIpWindow',
    `
      UPDATE ip_demo_quota
      SET demo_count = 0,
          window_started_at = ?,
          window_expires_at = ?
      WHERE ip_address = ?
    `,
    [now, addDaysIso(WINDOW_DAYS), ipAddress],
  )
}

async function readEmailDemoCount(client: Client, email: string): Promise<number> {
  const result = await executeWithClient(
    client,
    'reserveDemoQuota.readEmailCount',
    'SELECT demo_count, window_expires_at FROM email_demo_quota WHERE email = ?',
    [email],
  )

  return readDemoCount(result.rows[0] as QuotaCountRow | undefined)
}

async function readIpDemoCount(client: Client, ipAddress: string): Promise<number> {
  const result = await executeWithClient(
    client,
    'reserveDemoQuota.readIpCount',
    'SELECT demo_count, window_expires_at FROM ip_demo_quota WHERE ip_address = ?',
    [ipAddress],
  )

  return readDemoCount(result.rows[0] as QuotaCountRow | undefined)
}

export async function reserveDemoAttemptQuota(
  email: string,
  ipAddress: string,
): Promise<DemoQuotaReservationResult> {
  await ensureDbReady()
  const normalizedEmail = normalizeEmail(email)
  const client = getDbClient()
  const txn = await client.transaction('write')

  try {
    await ensureEmailQuotaRow(txn, normalizedEmail)
    await ensureIpQuotaRow(txn, ipAddress)
    await resetExpiredEmailWindow(txn, normalizedEmail)
    await resetExpiredIpWindow(txn, ipAddress)

    const emailCount = await readEmailDemoCount(txn, normalizedEmail)
    const ipCount = await readIpDemoCount(txn, ipAddress)

    if (isDemoRepeatQuotaExceeded(emailCount, ipCount)) {
      await txn.rollback()
      return { reserved: false, reason: 'exceeded' }
    }

    const documentLimit = getDocumentLimitForAttemptCount(
      resolveEffectiveDemoAttemptCount(emailCount, ipCount),
    )
    if (documentLimit == null) {
      await txn.rollback()
      return { reserved: false, reason: 'exceeded' }
    }

    await executeWithClient(
      txn,
      'reserveDemoQuota.incrementEmail',
      `
        UPDATE email_demo_quota
        SET demo_count = demo_count + 1
        WHERE email = ?
      `,
      [normalizedEmail],
    )
    await executeWithClient(
      txn,
      'reserveDemoQuota.incrementIp',
      `
        UPDATE ip_demo_quota
        SET demo_count = demo_count + 1
        WHERE ip_address = ?
      `,
      [ipAddress],
    )

    await txn.commit()
    return { reserved: true, documentLimit }
  } catch (error) {
    await txn.rollback()
    throw error
  }
}

export async function releaseDemoAttemptQuota(email: string, ipAddress: string): Promise<void> {
  await ensureDbReady()
  const normalizedEmail = normalizeEmail(email)
  const client = getDbClient()
  const txn = await client.transaction('write')

  try {
    await executeWithClient(
      txn,
      'releaseDemoQuota.decrementEmail',
      `
        UPDATE email_demo_quota
        SET demo_count = demo_count - 1
        WHERE email = ? AND demo_count > 0
      `,
      [normalizedEmail],
    )
    await executeWithClient(
      txn,
      'releaseDemoQuota.decrementIp',
      `
        UPDATE ip_demo_quota
        SET demo_count = demo_count - 1
        WHERE ip_address = ? AND demo_count > 0
      `,
      [ipAddress],
    )
    await txn.commit()
  } catch (error) {
    await txn.rollback()
    throw error
  }
}
