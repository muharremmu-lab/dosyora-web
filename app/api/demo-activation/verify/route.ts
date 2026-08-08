export const runtime = 'nodejs'

import type { NextRequest } from 'next/server'

import { verifyActivationTokenAsync } from '@/lib/activation/service'
import { jsonError, jsonOk } from '@/lib/api-response'

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token')
  const verification = await verifyActivationTokenAsync(token)

  if (!verification.valid) {
    return jsonError('Geçersiz veya süresi dolmuş aktivasyon bağlantısı.', 400)
  }

  return jsonOk({
    email: verification.lead.email,
    company_name: verification.lead.company_name,
    contact_name: verification.lead.contact_name,
  })
}
