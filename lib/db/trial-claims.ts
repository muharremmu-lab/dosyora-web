import { dbQueryOne, dbRun } from './query'

const TRIAL_DAYS = 14
const DAY_MS = 24 * 60 * 60 * 1000

export const TRIAL_ALREADY_USED_REASON =
  'Bu vergi/TC kimlik numarası için 14 günlük ücretsiz deneme hakkı daha önce kullanılmıştır.'

export type TrialClaimRow = {
  vkn_hash: string
  first_hwid: string
  created_at: string
  expires_at: string
}

export type TrialCheckResult =
  | { allowed: true; remainingDays: number }
  | { allowed: false; remainingDays: number }
  | { allowed: false; reason: string }

export function remainingTrialDays(expiresAt: string, now = Date.now()): number {
  const remainingMs = new Date(expiresAt).getTime() - now
  if (remainingMs <= 0) return 0
  return Math.ceil(remainingMs / DAY_MS)
}

function decide(row: TrialClaimRow, hwid: string, now = Date.now()): TrialCheckResult {
  if (row.first_hwid !== hwid) {
    return { allowed: false, reason: TRIAL_ALREADY_USED_REASON }
  }

  const remainingDays = remainingTrialDays(row.expires_at, now)
  if (remainingDays > 0) {
    return { allowed: true, remainingDays }
  }

  return { allowed: false, remainingDays }
}

export async function checkTrialClaim(vknHash: string, hwid: string): Promise<TrialCheckResult> {
  const existing = await dbQueryOne<TrialClaimRow>(
    'trialClaims.select',
    'SELECT vkn_hash, first_hwid, created_at, expires_at FROM trial_claims WHERE vkn_hash = ?',
    [vknHash],
  )

  if (existing) {
    return decide(existing, hwid)
  }

  const createdAt = new Date()
  const expiresAt = new Date(createdAt.getTime() + TRIAL_DAYS * DAY_MS)

  await dbRun(
    'trialClaims.insert',
    `
    INSERT INTO trial_claims (vkn_hash, first_hwid, created_at, expires_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(vkn_hash) DO NOTHING
  `,
    [vknHash, hwid, createdAt.toISOString(), expiresAt.toISOString()],
  )

  const row = await dbQueryOne<TrialClaimRow>(
    'trialClaims.selectAfterInsert',
    'SELECT vkn_hash, first_hwid, created_at, expires_at FROM trial_claims WHERE vkn_hash = ?',
    [vknHash],
  )

  if (!row) {
    throw new Error('Deneme kaydı oluşturulamadı.')
  }

  return decide(row, hwid)
}
