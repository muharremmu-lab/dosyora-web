export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

import type { NextRequest } from 'next/server'

import { jsonError, jsonOk } from '@/lib/api-response'
import { listTebligatCompanies } from '@/lib/db/tebligat-companies'
import { isWorkerAuthorized } from '@/lib/worker-auth'

export async function GET(request: NextRequest) {
  if (!process.env.WORKER_API_KEY?.trim()) {
    return jsonError('Worker anahtarı sunucuda tanımlı değil.', 503)
  }
  if (!isWorkerAuthorized(request)) {
    return jsonError('Worker yetkisi geçersiz.', 401)
  }

  const companies = await listTebligatCompanies({ status: 'active' })
  return jsonOk({
    companies: companies.map((company) => ({
      company_name: company.company_name,
      vkn: company.vkn,
      phone: company.phone,
      whatsapp: company.whatsapp,
      email: company.email,
      query_time: company.query_time,
      status: company.status,
    })),
  })
}
