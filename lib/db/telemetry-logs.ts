import { hasAlertChannel, sendPortalChangeAlert } from '@/lib/telemetry/alert'
import type { TelemetryPayload } from '@/lib/telemetry/payload'

import { dbInsertReturningId, dbQueryAll, dbQueryOne, dbRun } from './query'

const WINDOW_MS = 60 * 60 * 1000

type TelemetryLogRow = {
  id: number | bigint
  created_at: string
  app_version: string
  hwid_hash: string
  error_code: string
  step: string
  detail: string
  os_version: string | null
  critical_alert: number | bigint
}

type CountRow = {
  machine_count?: number | bigint
  count?: number | bigint
  error_code?: string
}

export type TelemetryLogView = {
  id: number
  createdAt: string
  appVersion: string
  hwidHash: string
  errorCode: string
  step: string
  detail: string
  osVersion: string | null
  criticalAlert: boolean
}

export type TelemetryDistribution = {
  errorCode: string
  count: number
}

function asNumber(value: number | bigint | undefined): number {
  if (value === undefined) return 0
  return typeof value === 'bigint' ? Number(value) : Number(value)
}

function toView(row: TelemetryLogRow): TelemetryLogView {
  return {
    id: asNumber(row.id),
    createdAt: row.created_at,
    appVersion: row.app_version,
    hwidHash: row.hwid_hash,
    errorCode: row.error_code,
    step: row.step,
    detail: row.detail,
    osVersion: row.os_version,
    criticalAlert: asNumber(row.critical_alert) === 1,
  }
}

async function distinctMachines(errorCode: string, since: string): Promise<number> {
  const row = await dbQueryOne<CountRow>(
    'telemetry.distinctMachines',
    `
    SELECT COUNT(DISTINCT hwid_hash) AS machine_count
    FROM telemetry_logs
    WHERE error_code = ? AND created_at >= ?
  `,
    [errorCode, since],
  )
  return asNumber(row?.machine_count)
}

async function alertAlreadySent(errorCode: string, since: string): Promise<boolean> {
  const row = await dbQueryOne<{ id: number | bigint }>(
    'telemetry.alertAlreadySent',
    `
    SELECT id
    FROM telemetry_logs
    WHERE error_code = ? AND created_at >= ? AND alert_sent = 1
    LIMIT 1
  `,
    [errorCode, since],
  )
  return Boolean(row)
}

export async function recordTelemetry(payload: TelemetryPayload): Promise<{ criticalAlert: boolean }> {
  const createdAt = new Date().toISOString()
  const id = await dbInsertReturningId(
    'telemetry.insert',
    `
    INSERT INTO telemetry_logs (
      created_at, app_version, hwid_hash, error_code, step, detail, os_version
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
    RETURNING id
  `,
    [
      createdAt,
      payload.appVersion,
      payload.hwidHash,
      payload.errorCode,
      payload.step,
      payload.detail,
      payload.osVersion,
    ],
  )

  const since = new Date(Date.now() - WINDOW_MS).toISOString()
  const machineCount = await distinctMachines(payload.errorCode, since)
  if (machineCount < 3 || (await alertAlreadySent(payload.errorCode, since))) {
    return { criticalAlert: false }
  }

  const sent = hasAlertChannel()
    ? await sendPortalChangeAlert({
        errorCode: payload.errorCode,
        step: payload.step,
        appVersion: payload.appVersion,
        osVersion: payload.osVersion,
        detail: payload.detail,
        machineCount,
      })
    : false

  const criticalAlert = sent ? 0 : 1
  await dbRun(
    'telemetry.markAlert',
    'UPDATE telemetry_logs SET critical_alert = ?, alert_sent = 1 WHERE id = ?',
    [criticalAlert, id],
  )

  return { criticalAlert: criticalAlert === 1 }
}

export async function listRecentTelemetry(limit = 50): Promise<TelemetryLogView[]> {
  const rows = await dbQueryAll<TelemetryLogRow>(
    'telemetry.recent',
    `
    SELECT id, created_at, app_version, hwid_hash, error_code, step, detail, os_version, critical_alert
    FROM telemetry_logs
    ORDER BY critical_alert DESC, id DESC
    LIMIT ?
  `,
    [limit],
  )
  return rows.map(toView)
}

export async function telemetryDistribution(): Promise<TelemetryDistribution[]> {
  const rows = await dbQueryAll<CountRow>(
    'telemetry.distribution',
    `
    SELECT error_code, COUNT(*) AS count
    FROM telemetry_logs
    GROUP BY error_code
    ORDER BY count DESC, error_code ASC
  `,
  )
  return rows.map((row) => ({
    errorCode: row.error_code ?? '',
    count: asNumber(row.count),
  }))
}
