import { dbQueryOne } from './query'

type CountRow = {
  computers?: number | bigint
  firms?: number | bigint
}

function asNumber(value: number | bigint | undefined): number {
  if (typeof value === 'bigint') return Number(value)
  return Number(value ?? 0)
}

export async function activeTrialSummary(): Promise<{ computers: number; firms: number }> {
  const row = await dbQueryOne<CountRow>(
    'trialClaims.activeSummary',
    `
    SELECT COUNT(DISTINCT first_hwid) AS computers, COUNT(*) AS firms
    FROM trial_claims
    WHERE expires_at > ?
  `,
    [new Date().toISOString()],
  )
  return {
    computers: asNumber(row?.computers),
    firms: asNumber(row?.firms),
  }
}
