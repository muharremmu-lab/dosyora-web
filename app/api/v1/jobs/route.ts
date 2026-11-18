export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

import { jsonError, jsonOk } from '@/lib/api-response'
import { createTebligatJob, listTebligatJobs } from '@/lib/db/tebligat-jobs'
import { isWorkerAuthorized } from '@/lib/worker-auth'

export async function GET(request: NextRequest) {
  if (!process.env.WORKER_API_KEY?.trim()) {
    return jsonError('Worker anahtarı sunucuda tanımlı değil.', 503)
  }
  if (!isWorkerAuthorized(request)) {
    return jsonError('Worker yetkisi geçersiz.', 401)
  }

  const jobs = await listTebligatJobs()
  return jsonOk({ jobs })
}

export async function POST(request: NextRequest) {
  if (!process.env.WORKER_API_KEY?.trim()) {
    return jsonError('Worker anahtarı sunucuda tanımlı değil.', 503)
  }
  if (!isWorkerAuthorized(request)) {
    return jsonError('Worker yetkisi geçersiz.', 401)
  }

  const body = (await request.json().catch(() => null)) as { companyId?: string; jobType?: string } | null
  const companyId = body?.companyId?.trim() ?? ''
  if (!companyId) {
    return jsonError('Firma numarası gerekli.', 400)
  }

  const job = await createTebligatJob(companyId, body?.jobType?.trim() || 'COMPANY_SCAN')
  if (!job) {
    return jsonError('Firma bulunamadı veya pasif.', 404)
  }

  return jsonOk({ job_id: job.id, status: job.status }, { status: 201 })
}
