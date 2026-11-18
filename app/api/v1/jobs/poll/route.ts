export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

import { jsonError, jsonOk } from '@/lib/api-response'
import { jobCompanyPayload, pollTebligatJob } from '@/lib/db/tebligat-jobs'
import { isHardwareId, isWorkerAuthorized, readHardwareId } from '@/lib/worker-auth'

export async function GET(request: NextRequest) {
  if (!process.env.WORKER_API_KEY?.trim()) {
    return jsonError('Worker anahtarı sunucuda tanımlı değil.', 503)
  }
  if (!isWorkerAuthorized(request)) {
    return jsonError('Worker yetkisi geçersiz.', 401)
  }

  const hardwareId = readHardwareId(request)
  if (!isHardwareId(hardwareId)) {
    return jsonError('Donanım kimliği gerekli.', 400)
  }

  const job = await pollTebligatJob(hardwareId)
  if (!job) {
    return new Response(null, { status: 204 })
  }

  return jsonOk({
    job_id: job.id,
    job_type: job.job_type,
    company: jobCompanyPayload(job),
  })
}
