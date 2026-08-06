import { dbQueryOne, dbRun } from './query'
import type { IpDemoQuota } from './types'

const WINDOW_DAYS = 30

function addDaysIso(days: number): string {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() <= Date.now()
}

export async function getIpDemoQuota(ipAddress: string): Promise<IpDemoQuota> {
  const row = await dbQueryOne<IpDemoQuota>(
    'getIpDemoQuota.select',
    'SELECT * FROM ip_demo_quota WHERE ip_address = ?',
    [ipAddress],
  )

  if (!row || isExpired(row.window_expires_at)) {
    const now = new Date().toISOString()
    const quota: IpDemoQuota = {
      ip_address: ipAddress,
      demo_count: 0,
      window_started_at: now,
      window_expires_at: addDaysIso(WINDOW_DAYS),
    }

    await dbRun(
      'getIpDemoQuota.upsert',
      `
      INSERT INTO ip_demo_quota (ip_address, demo_count, window_started_at, window_expires_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(ip_address) DO UPDATE SET
        demo_count = excluded.demo_count,
        window_started_at = excluded.window_started_at,
        window_expires_at = excluded.window_expires_at
    `,
      [quota.ip_address, quota.demo_count, quota.window_started_at, quota.window_expires_at],
    )

    return quota
  }

  return row
}

export async function incrementIpDemoQuota(ipAddress: string): Promise<IpDemoQuota> {
  const quota = await getIpDemoQuota(ipAddress)

  await dbRun(
    'incrementIpDemoQuota',
    `
    UPDATE ip_demo_quota
    SET demo_count = ?
    WHERE ip_address = ?
  `,
    [quota.demo_count + 1, ipAddress],
  )

  return {
    ...quota,
    demo_count: quota.demo_count + 1,
  }
}

export const IP_DOCUMENT_LIMITS = [100, 75, 50, 25] as const
export const IP_MAX_FREE_DEMOS = IP_DOCUMENT_LIMITS.length

export function getDocumentLimitForIpCount(demoCount: number): number | null {
  if (demoCount >= IP_MAX_FREE_DEMOS) {
    return null
  }

  return IP_DOCUMENT_LIMITS[demoCount] ?? null
}

export function isIpQuotaExceeded(demoCount: number): boolean {
  return demoCount >= IP_MAX_FREE_DEMOS
}
