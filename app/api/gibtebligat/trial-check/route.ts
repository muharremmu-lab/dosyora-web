export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { jsonError, jsonOk } from '@/lib/api-response'
import { logDbRouteError } from '@/lib/db/libsql-log'
import { checkTrialClaim } from '@/lib/db/trial-claims'

const SHA256_HEX = /^[a-f0-9]{64}$/
const HWID = /^[a-z0-9]{8,128}$/

type TrialCheckBody = {
  vknHash: string
  hwid: string
}

function readTrialCheckBody(body: unknown): TrialCheckBody | null {
  if (!body || typeof body !== 'object') return null

  const record = body as Record<string, unknown>
  if (typeof record.vknHash !== 'string' || typeof record.hwid !== 'string') return null

  const vknHash = record.vknHash.trim().toLowerCase()
  const hwid = record.hwid.trim().toLowerCase()

  if (!SHA256_HEX.test(vknHash) || !HWID.test(hwid)) return null

  return { vknHash, hwid }
}

export async function POST(request: NextRequest) {
  let body: unknown

  try {
    body = await request.json()
  } catch {
    return jsonError('Geçersiz istek gövdesi.', 400)
  }

  const parsed = readTrialCheckBody(body)
  if (!parsed) {
    return jsonError('vknHash SHA-256 ve hwid zorunludur.', 400)
  }

  try {
    const result = await checkTrialClaim(parsed.vknHash, parsed.hwid)
    return jsonOk(result)
  } catch (error) {
    logDbRouteError('gibtebligat_trial_check_failed', error, {
      operation: 'checkTrialClaim',
    })
    return jsonError('Deneme kontrolü tamamlanamadı.', 500)
  }
}
