import { dbQueryAll, dbRun } from './query'

const STATUSES = new Set(['Demo', 'Provisional', 'Approved'])

export type HeartbeatInput = {
  hwid: string
  version: string
  licenseStatus: string
  osUser: string
}

export type HeartbeatView = {
  hwid: string
  appVersion: string
  licenseStatus: string
  osUser: string
  firstSeenAt: string
  lastSeenAt: string
  seenCount: number
}

type HeartbeatRow = {
  hwid: string
  app_version: string
  license_status: string
  os_user: string
  first_seen_at: string
  last_seen_at: string
  seen_count: number | bigint
}

function asNumber(value: number | bigint | undefined): number {
  if (typeof value === 'bigint') return Number(value)
  return Number(value ?? 0)
}

export function readHeartbeatPayload(body: unknown): HeartbeatInput | null {
  if (!body || typeof body !== 'object') return null
  const record = body as Record<string, unknown>
  const hwid = typeof record.hwid === 'string' ? record.hwid.trim() : ''
  const version = typeof record.version === 'string' ? record.version.trim() : ''
  const licenseStatus = typeof record.licenseStatus === 'string' ? record.licenseStatus.trim() : ''
  const osUser = typeof record.osUser === 'string' ? record.osUser.trim() : ''

  if (!/^[A-F0-9]{64}$/i.test(hwid)) return null
  if (!/^\d+\.\d+\.\d+$/.test(version) || version.length > 20) return null
  if (!STATUSES.has(licenseStatus)) return null
  if (osUser.length < 1 || osUser.length > 80 || /[\u0000-\u001F]/.test(osUser)) return null

  return { hwid: hwid.toUpperCase(), version, licenseStatus, osUser }
}

export async function upsertHeartbeat(input: HeartbeatInput): Promise<void> {
  const now = new Date().toISOString()
  await dbRun(
    'heartbeat.upsert',
    `
    INSERT INTO device_heartbeats (
      hwid, app_version, license_status, os_user, first_seen_at, last_seen_at, seen_count
    ) VALUES (?, ?, ?, ?, ?, ?, 1)
    ON CONFLICT(hwid) DO UPDATE SET
      app_version = excluded.app_version,
      license_status = excluded.license_status,
      os_user = excluded.os_user,
      last_seen_at = excluded.last_seen_at,
      seen_count = device_heartbeats.seen_count + 1
  `,
    [input.hwid, input.version, input.licenseStatus, input.osUser, now, now],
  )
}

export async function listRecentHeartbeats(limit = 50): Promise<HeartbeatView[]> {
  const rows = await dbQueryAll<HeartbeatRow>(
    'heartbeat.listRecent',
    `
    SELECT hwid, app_version, license_status, os_user, first_seen_at, last_seen_at, seen_count
    FROM device_heartbeats
    ORDER BY last_seen_at DESC
    LIMIT ?
  `,
    [limit],
  )
  return rows.map((row) => ({
    hwid: row.hwid,
    appVersion: row.app_version,
    licenseStatus: row.license_status,
    osUser: row.os_user,
    firstSeenAt: row.first_seen_at,
    lastSeenAt: row.last_seen_at,
    seenCount: asNumber(row.seen_count),
  }))
}
