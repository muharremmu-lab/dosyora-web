import { getDb } from './client'
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

export function getIpDemoQuota(ipAddress: string): IpDemoQuota {
  const db = getDb()
  const existing = db
    .prepare('SELECT * FROM ip_demo_quota WHERE ip_address = ?')
    .get(ipAddress) as IpDemoQuota | undefined

  if (!existing || isExpired(existing.window_expires_at)) {
    const now = new Date().toISOString()
    const quota: IpDemoQuota = {
      ip_address: ipAddress,
      demo_count: 0,
      window_started_at: now,
      window_expires_at: addDaysIso(WINDOW_DAYS),
    }

    db.prepare(
      `
      INSERT INTO ip_demo_quota (ip_address, demo_count, window_started_at, window_expires_at)
      VALUES (@ip_address, @demo_count, @window_started_at, @window_expires_at)
      ON CONFLICT(ip_address) DO UPDATE SET
        demo_count = excluded.demo_count,
        window_started_at = excluded.window_started_at,
        window_expires_at = excluded.window_expires_at
    `,
    ).run(quota)

    return quota
  }

  return existing
}

export function incrementIpDemoQuota(ipAddress: string): IpDemoQuota {
  const quota = getIpDemoQuota(ipAddress)
  const db = getDb()

  db.prepare(
    `
    UPDATE ip_demo_quota
    SET demo_count = @demo_count
    WHERE ip_address = @ip_address
  `,
  ).run({
    ip_address: ipAddress,
    demo_count: quota.demo_count + 1,
  })

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
