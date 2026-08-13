import { dbQueryOne, dbRun } from './query'
import { normalizeEmail } from './types'

export type EmailDemoQuota = {
  email: string
  demo_count: number
  window_started_at: string
  window_expires_at: string
}

const WINDOW_DAYS = 30

function addDaysIso(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now()
}

export async function getEmailDemoQuota(email: string): Promise<EmailDemoQuota> {
  const normalizedEmail = normalizeEmail(email)

  const row = await dbQueryOne<EmailDemoQuota>(
    'getEmailDemoQuota.select',
    'SELECT * FROM email_demo_quota WHERE email = ?',
    [normalizedEmail],
  )

  if (!row || isExpired(row.window_expires_at)) {
    const now = new Date().toISOString()
    const quota: EmailDemoQuota = {
      email: normalizedEmail,
      demo_count: 0,
      window_started_at: now,
      window_expires_at: addDaysIso(WINDOW_DAYS),
    }

    await dbRun(
      'getEmailDemoQuota.upsert',
      `
      INSERT INTO email_demo_quota (email, demo_count, window_started_at, window_expires_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(email) DO UPDATE SET
        demo_count = excluded.demo_count,
        window_started_at = excluded.window_started_at,
        window_expires_at = excluded.window_expires_at
    `,
      [quota.email, quota.demo_count, quota.window_started_at, quota.window_expires_at],
    )

    return quota
  }

  return row
}

export async function incrementEmailDemoQuota(email: string): Promise<EmailDemoQuota> {
  const normalizedEmail = normalizeEmail(email)
  await getEmailDemoQuota(normalizedEmail)

  await dbRun(
    'incrementEmailDemoQuota',
    `
    UPDATE email_demo_quota
    SET demo_count = demo_count + 1
    WHERE email = ?
  `,
    [normalizedEmail],
  )

  const row = await dbQueryOne<EmailDemoQuota>(
    'incrementEmailDemoQuota.select',
    'SELECT * FROM email_demo_quota WHERE email = ?',
    [normalizedEmail],
  )

  if (!row) {
    throw new Error('Email demo quota row missing after increment.')
  }

  return row
}
