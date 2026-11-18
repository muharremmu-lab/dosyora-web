export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

import { jsonError, jsonOk } from '@/lib/api-response'
import { updateTebligatJob } from '@/lib/db/tebligat-jobs'
import { isHardwareId, isWorkerAuthorized, readHardwareId } from '@/lib/worker-auth'

type Props = {
  params: Promise<{ id: string }>
}

export async function POST(request: NextRequest, { params }: Props) {
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

  const body = (await request.json().catch(() => null)) as { status?: string; summary?: string } | null
  const status = body?.status?.trim().toUpperCase()
  if (status !== 'COMPLETED' && status !== 'FAILED') {
    return jsonError('Durum COMPLETED veya FAILED olmalıdır.', 400)
  }

  const { id } = await params
  const updated = await updateTebligatJob(id, hardwareId, status, body?.summary?.trim() || '')
  if (!updated) {
    return jsonError('İş bulunamadı veya bu cihaza ait değil.', 404)
  }

  return jsonOk({ status: 'updated' })
}
